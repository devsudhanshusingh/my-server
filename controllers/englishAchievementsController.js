import Journal from "../models/Journal.js";
import SpellingLog from "../models/SpellingLog.js";
import { calculateStreaks } from "./englishRoutineController.js";

export const getEnglishAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      streaks,
      journalCount,
      spellingSessionsCount,
      earliestJournal,
    ] = await Promise.all([
      calculateStreaks(userId),
      Journal.countDocuments({ user: userId }),
      SpellingLog.countDocuments({ user: userId }),
      Journal.findOne({ user: userId }).sort({ createdAt: 1 }).select("createdAt"),
    ]);

    const streakProgress = Math.min(streaks.longestStreak || streaks.currentStreak, 7);
    const isStreakUnlocked = streakProgress >= 7;

    const journalProgress = Math.min(journalCount, 1);
    const isJournalUnlocked = journalCount >= 1;

    const spellingProgress = Math.min(spellingSessionsCount, 10);
    const isSpellingUnlocked = spellingSessionsCount >= 10;

    const nowIso = new Date().toISOString();

    const achievements = [
      {
        id: "ach_1",
        title: "7 Day Streak",
        icon: "🔥",
        desc: "Maintain a study streak for 7 consecutive days.",
        progress: streakProgress,
        total: 7,
        unlocked: isStreakUnlocked,
        unlockedDate: isStreakUnlocked ? nowIso : null,
      },
      {
        id: "ach_2",
        title: "First Journal Entry",
        icon: "✍️",
        desc: "Write your first journal entry.",
        progress: journalProgress,
        total: 1,
        unlocked: isJournalUnlocked,
        unlockedDate: isJournalUnlocked ? (earliestJournal?.createdAt?.toISOString() || nowIso) : null,
      },
      {
        id: "ach_3",
        title: "Spelling Champion",
        icon: "⌨️",
        desc: "Log 10 spelling & typing practice sessions.",
        progress: spellingProgress,
        total: 10,
        unlocked: isSpellingUnlocked,
        unlockedDate: isSpellingUnlocked ? nowIso : null,
      },
    ];

    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
