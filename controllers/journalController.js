import Journal from "../models/Journal.js";

// CREATE JOURNAL ENTRY
export const createJournal = async (req, res) => {
  try {
    const {
      title,
      content,
      grammarScore,
      vocabularyScore,
      fluencyScore,
      aiCorrection,
      suggestions,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const journal = await Journal.create({
      user: req.user._id,
      title,
      content,
      grammarScore: grammarScore || 0,
      vocabularyScore: vocabularyScore || 0,
      fluencyScore: fluencyScore || 0,
      aiCorrection: aiCorrection || "",
      suggestions: suggestions || [],
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL JOURNALS (Paginated & Searchable)
export const getJournals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = "createdAt", order = "desc" } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [journals, total] = await Promise.all([
      Journal.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Journal.countDocuments(query),
    ]);

    res.json({
      data: journals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET JOURNAL HISTORY / STATS
export const getJournalHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const historyStats = await Journal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          avgGrammarScore: { $avg: "$grammarScore" },
          avgVocabularyScore: { $avg: "$vocabularyScore" },
          avgFluencyScore: { $avg: "$fluencyScore" },
          latestEntry: { $max: "$createdAt" },
        },
      },
    ]);

    const recentEntries = await Journal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title grammarScore vocabularyScore fluencyScore createdAt");

    res.json({
      stats: historyStats[0] || {
        totalEntries: 0,
        avgGrammarScore: 0,
        avgVocabularyScore: 0,
        avgFluencyScore: 0,
        latestEntry: null,
      },
      recentEntries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE JOURNAL ENTRY
export const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE JOURNAL ENTRY
export const updateJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    const fields = [
      "title",
      "content",
      "grammarScore",
      "vocabularyScore",
      "fluencyScore",
      "aiCorrection",
      "suggestions",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        journal[field] = req.body[field];
      }
    });

    await journal.save();
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE JOURNAL ENTRY
export const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    res.json({ message: "Journal entry deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
