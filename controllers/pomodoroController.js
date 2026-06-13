import Pomodoro from "../models/Pomodoro.js";

// Create a new Pomodoro session
export const createPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all Pomodoro sessions
export const getPomodoros = async (req, res) => {
  try {
    const pomodoros = await Pomodoro.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(pomodoros);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get a single Pomodoro session by ID
export const getPomodoroById = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a Pomodoro session
export const updatePomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
      },
    );
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Start a Pomodoro session
export const startPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { isRunning: true },
      { new: true },
    );
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Pause a Pomodoro session
export const pausePomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { isRunning: false },
      { new: true },
    );
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reset a Pomodoro session
export const resetPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        timeLeft: 1500,
        isRunning: false,
        completed: false,
      },
      { new: true },
    );
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Complete a Pomodoro session
export const completePomodoro = async (req, res) => {
  try {
    const existingPomodoro = await Pomodoro.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existingPomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }

    const pomodoro = await Pomodoro.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        completed: true,
        completedAt: new Date(),
        sessions: existingPomodoro.sessions + 1,
        isRunning: false,
      },
      { new: true },
    );
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json(pomodoro);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a Pomodoro session
export const deletePomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!pomodoro) {
      return res.status(404).json({
        message: "Pomodoro session not found",
      });
    }
    res.json({
      message: "Pomodoro session deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get statistics
export const getStatistics = async (req, res) => {
  try {
    const total = await Pomodoro.countDocuments({ user: req.user._id });
    const completed = await Pomodoro.countDocuments({
      user: req.user._id,
      completed: true,
    });
    const totalSessions = await Pomodoro.aggregate([
      {
        $match: { user: req.user._id },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: "$sessions" },
        },
      },
    ]);

    res.json({
      total,
      completed,
      totalSessions: totalSessions[0]?.totalSessions || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
