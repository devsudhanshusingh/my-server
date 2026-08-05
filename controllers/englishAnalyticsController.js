import Journal from "../models/Journal.js";
import EnglishRoutine from "../models/EnglishRoutine.js";
import SpellingLog from "../models/SpellingLog.js";

export const getEnglishAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. HEATMAP WEEKS (Past 4 weeks activity levels 0..3)
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const routines = await EnglishRoutine.find({
      user: userId,
      date: { $gte: fourWeeksAgo },
    });

    const routineMap = new Map();
    routines.forEach((r) => {
      const dateStr = new Date(r.date).toISOString().split("T")[0];
      routineMap.set(dateStr, r.completionPercentage || 0);
    });

    const heatmapWeeks = [];
    for (let w = 0; w < 4; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const targetDate = new Date(fourWeeksAgo);
        targetDate.setDate(fourWeeksAgo.getDate() + w * 7 + d);
        const dateStr = targetDate.toISOString().split("T")[0];
        const pct = routineMap.get(dateStr) || 0;

        let level = 0;
        if (pct > 0 && pct <= 33) level = 1;
        else if (pct > 33 && pct <= 75) level = 2;
        else if (pct > 75) level = 3;

        days.push({ day: d, level });
      }
      heatmapWeeks.push({ week: w + 1, days });
    }

    // 2. WRITING TRENDS (From Journal entries)
    const journals = await Journal.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(10);

    const writingTrends = journals.map((j, index) => ({
      entry: `Entry ${index + 1}`,
      grammar: j.grammarScore || 0,
      vocab: j.vocabularyScore || 0,
      fluency: j.fluencyScore || 0,
    }));

    // 3. TIME DISTRIBUTION
    const [routineTimeAgg, spellingTimeAgg] = await Promise.all([
      EnglishRoutine.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            writingTime: { $sum: "$writing.timeSpent" },
            routineTime: { $sum: "$reading.timeSpent" },
            speakingTime: { $sum: "$speaking.timeSpent" },
          },
        },
      ]),
      SpellingLog.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalSeconds: { $sum: "$timeSpentSeconds" } } },
      ]),
    ]);

    const rTime = routineTimeAgg[0] || {};
    const writingMins = rTime.writingTime || 0;
    const routineMins = (rTime.routineTime || 0) + (rTime.speakingTime || 0);
    const spellingMins = Math.round((spellingTimeAgg[0]?.totalSeconds || 0) / 60);

    const totalCalculatedMins = writingMins + routineMins + spellingMins;

    let timeDistribution = [];
    if (totalCalculatedMins > 0) {
      timeDistribution = [
        { label: "Writing Journal", percent: Math.round((writingMins / totalCalculatedMins) * 100) },
        { label: "Daily Routine", percent: Math.round((routineMins / totalCalculatedMins) * 100) },
        { label: "Spelling & Typing", percent: Math.round((spellingMins / totalCalculatedMins) * 100) },
      ];
    } else {
      timeDistribution = [
        { label: "Writing Journal", percent: 50 },
        { label: "Daily Routine", percent: 30 },
        { label: "Spelling & Typing", percent: 20 },
      ];
    }

    res.json({
      heatmapWeeks,
      writingTrends,
      timeDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
