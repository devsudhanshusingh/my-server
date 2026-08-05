import Journal from "../models/Journal.js";
import EnglishRoutine from "../models/EnglishRoutine.js";
import { calculateStreaks } from "./englishRoutineController.js";

export const getEnglishDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);

    // Current Week Range (Mon-Sun)
    const dayOfWeek = todayDate.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(todayDate);
    weekStart.setUTCDate(todayDate.getUTCDate() + mondayOffset);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

    // Current Month Range
    const monthStart = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + 1, 1));

    const [
      todaysRoutine,
      streaks,
      weeklyRoutines,
      monthlyRoutines,
      totalStudyTimeResult,
      journalCount,
    ] = await Promise.all([
      // Today's Routine
      EnglishRoutine.findOne({ user: userId, date: todayDate }),

      // Streaks
      calculateStreaks(userId),

      // Weekly Routines
      EnglishRoutine.find({
        user: userId,
        date: { $gte: weekStart, $lt: weekEnd },
      }),

      // Monthly Routines
      EnglishRoutine.find({
        user: userId,
        date: { $gte: monthStart, $lt: monthEnd },
      }),

      // Total Overall Study Time (Sum of all timeSpent)
      EnglishRoutine.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalMinutes: { $sum: "$timeSpent" } } },
      ]),

      // Journal Count
      Journal.countDocuments({ user: userId }),
    ]);

    // Today's Progress calculation
    const todayProgress = {
      completed: todaysRoutine ? todaysRoutine.completed : false,
      completionPercentage: todaysRoutine ? todaysRoutine.completionPercentage : 0,
      timeSpent: todaysRoutine ? todaysRoutine.timeSpent : 0,
    };

    // Weekly Progress calculation
    const weeklyTimeSpent = weeklyRoutines.reduce((acc, r) => acc + r.timeSpent, 0);
    const weeklyAvgCompletion = weeklyRoutines.length
      ? Math.round(weeklyRoutines.reduce((acc, r) => acc + r.completionPercentage, 0) / 7)
      : 0;

    // Monthly Progress calculation
    const monthlyTimeSpent = monthlyRoutines.reduce((acc, r) => acc + r.timeSpent, 0);
    const monthlyAvgCompletion = monthlyRoutines.length
      ? Math.round(
          monthlyRoutines.reduce((acc, r) => acc + r.completionPercentage, 0) /
            monthlyRoutines.length
        )
      : 0;

    const totalStudyMinutes = totalStudyTimeResult[0]?.totalMinutes || 0;

    res.json({
      todaysRoutine: todaysRoutine || {
        date: todayDate,
        reading: { completed: false, timeSpent: 0 },
        vocabulary: { completed: false, timeSpent: 0 },
        spelling: { completed: false, timeSpent: 0 },
        writing: { completed: false, timeSpent: 0 },
        speaking: { completed: false, timeSpent: 0 },
        completed: false,
        timeSpent: 0,
        completionPercentage: 0,
      },
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      todaysProgress: todayProgress,
      weeklyProgress: {
        totalTimeSpent: weeklyTimeSpent,
        averageCompletionPercentage: weeklyAvgCompletion,
        routinesTracked: weeklyRoutines.length,
      },
      monthlyProgress: {
        totalTimeSpent: monthlyTimeSpent,
        averageCompletionPercentage: monthlyAvgCompletion,
        routinesTracked: monthlyRoutines.length,
      },
      studyTime: {
        todayMinutes: todayProgress.timeSpent,
        weeklyMinutes: weeklyTimeSpent,
        totalMinutes: totalStudyMinutes,
      },
      journalCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
