import SpellingLog from "../models/SpellingLog.js";
import EnglishRoutine from "../models/EnglishRoutine.js";

export const logSpellingSession = async (req, res) => {
  try {
    const { word, repetitionsCompleted, wpm, accuracy, timeSpentSeconds } = req.body;

    if (!word) {
      return res.status(400).json({ message: "Word is required." });
    }

    const userId = req.user._id;

    // 1. Create SpellingLog document
    const spellingLog = await SpellingLog.create({
      user: userId,
      word,
      repetitionsCompleted: repetitionsCompleted || 0,
      wpm: wpm || 0,
      accuracy: accuracy || 0,
      timeSpentSeconds: timeSpentSeconds || 0,
    });

    // 2. Update today's EnglishRoutine
    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);

    let routine = await EnglishRoutine.findOne({
      user: userId,
      date: todayDate,
    });

    if (!routine) {
      routine = new EnglishRoutine({
        user: userId,
        date: todayDate,
      });
    }

    const additionalMinutes = Math.max(1, Math.round((timeSpentSeconds || 0) / 60));
    routine.spelling.timeSpent = (routine.spelling.timeSpent || 0) + additionalMinutes;
    routine.spelling.completed = true;

    // Recalculate overall routine totals
    const tasks = ["reading", "vocabulary", "spelling", "writing", "speaking"];
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

    // 3. Calculate statistics for response
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const totalWordsPracticed = await SpellingLog.countDocuments({
      user: userId,
      createdAt: { $gte: todayStart },
    });

    res.status(200).json({
      success: true,
      message: "Spelling session logged successfully",
      stats: {
        todayMinutes: routine.timeSpent,
        totalWordsPracticed,
      },
      log: spellingLog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
