import EnglishRoutine from "../models/EnglishRoutine.js";

// Helper to normalize date to UTC Midnight (00:00:00.000)
const getNormalizedDate = (dateString) => {
  const d = dateString ? new Date(dateString) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper function to calculate current and longest streak
export const calculateStreaks = async (userId) => {
  const routines = await EnglishRoutine.find({
    user: userId,
    timeSpent: { $gt: 0 },
  })
    .sort({ date: -1 })
    .select("date completionPercentage completed");

  if (!routines.length) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique dates in YYYY-MM-DD
  const dateSet = new Set(
    routines.map((r) => new Date(r.date).toISOString().split("T")[0])
  );

  const todayStr = getNormalizedDate().toISOString().split("T")[0];
  const yesterday = getNormalizedDate();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate = getNormalizedDate();

  if (!dateSet.has(todayStr) && dateSet.has(yesterdayStr)) {
    checkDate = yesterday;
  }

  while (true) {
    const checkStr = checkDate.toISOString().split("T")[0];
    if (dateSet.has(checkStr)) {
      currentStreak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Longest Streak
  const sortedDates = Array.from(dateSet)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let longestStreak = 0;
  let tempStreak = 0;
  let prevTime = null;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const time of sortedDates) {
    if (prevTime === null) {
      tempStreak = 1;
    } else if (time - prevTime === ONE_DAY_MS) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevTime = time;
  }

  return { currentStreak, longestStreak };
};

// CREATE OR UPDATE DAILY ROUTINE
export const upsertDailyRoutine = async (req, res) => {
  try {
    const targetDate = getNormalizedDate(req.body.date);
    const { reading, vocabulary, spelling, writing, speaking } = req.body;

    let routine = await EnglishRoutine.findOne({
      user: req.user._id,
      date: targetDate,
    });

    if (!routine) {
      routine = new EnglishRoutine({
        user: req.user._id,
        date: targetDate,
      });
    }

    const tasks = ["reading", "vocabulary", "spelling", "writing", "speaking"];

    tasks.forEach((taskName) => {
      if (req.body[taskName] !== undefined) {
        if (req.body[taskName].completed !== undefined) {
          routine[taskName].completed = req.body[taskName].completed;
        }
        if (req.body[taskName].timeSpent !== undefined) {
          routine[taskName].timeSpent = Math.max(0, req.body[taskName].timeSpent);
        }
      }
    });

    // Recalculate totals
    let completedCount = 0;
    let totalTime = 0;

    tasks.forEach((t) => {
      if (routine[t].completed) completedCount += 1;
      totalTime += routine[t].timeSpent || 0;
    });

    routine.timeSpent = totalTime;
    routine.completionPercentage = Math.round((completedCount / tasks.length) * 100);
    routine.completed = completedCount === tasks.length;

    await routine.save();

    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ROUTINE BY DATE
export const getRoutineByDate = async (req, res) => {
  try {
    const targetDate = getNormalizedDate(req.params.date || req.query.date);

    let routine = await EnglishRoutine.findOne({
      user: req.user._id,
      date: targetDate,
    });

    if (!routine) {
      routine = {
        user: req.user._id,
        date: targetDate,
        reading: { completed: false, timeSpent: 0 },
        vocabulary: { completed: false, timeSpent: 0 },
        spelling: { completed: false, timeSpent: 0 },
        writing: { completed: false, timeSpent: 0 },
        speaking: { completed: false, timeSpent: 0 },
        completed: false,
        timeSpent: 0,
        completionPercentage: 0,
      };
    }

    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ROUTINE STATS (Streaks, Weekly, Monthly)
export const getRoutineStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Streaks
    const { currentStreak, longestStreak } = await calculateStreaks(userId);

    // Weekly progress (Current Week Monday - Sunday)
    const now = getNormalizedDate();
    const dayOfWeek = now.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + mondayOffset);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

    const weeklyRoutines = await EnglishRoutine.find({
      user: userId,
      date: { $gte: weekStart, $lt: weekEnd },
    }).sort({ date: 1 });

    const totalWeeklyTime = weeklyRoutines.reduce((acc, r) => acc + r.timeSpent, 0);
    const avgWeeklyCompletion = weeklyRoutines.length
      ? Math.round(
          weeklyRoutines.reduce((acc, r) => acc + r.completionPercentage, 0) / 7
        )
      : 0;

    // Monthly progress (Current Month)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const monthlyRoutines = await EnglishRoutine.find({
      user: userId,
      date: { $gte: monthStart, $lt: monthEnd },
    });

    const totalMonthlyTime = monthlyRoutines.reduce((acc, r) => acc + r.timeSpent, 0);
    const avgMonthlyCompletion = monthlyRoutines.length
      ? Math.round(
          monthlyRoutines.reduce((acc, r) => acc + r.completionPercentage, 0) /
            monthlyRoutines.length
        )
      : 0;

    res.json({
      currentStreak,
      longestStreak,
      weeklyProgress: {
        totalTimeSpent: totalWeeklyTime,
        averageCompletion: avgWeeklyCompletion,
        daysTracked: weeklyRoutines.length,
        routines: weeklyRoutines,
      },
      monthlyProgress: {
        totalTimeSpent: totalMonthlyTime,
        averageCompletion: avgMonthlyCompletion,
        daysTracked: monthlyRoutines.length,
        routines: monthlyRoutines,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
