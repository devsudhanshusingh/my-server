import Pomodoro from "../models/Pomodoro.js";

// Create a new Pomodoro session
export const createPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.create(req.body);
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
    const pomodoros = await Pomodoro.find().sort({ createdAt: -1 });
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
    const pomodoro = await Pomodoro.findById(req.params.id);
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
    const pomodoro = await Pomodoro.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
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

// Start a Pomodoro session
export const startPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findByIdAndUpdate(
      req.params.id,
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
    const pomodoro = await Pomodoro.findByIdAndUpdate(
      req.params.id,
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
    const pomodoro = await Pomodoro.findByIdAndUpdate(
      req.params.id,
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
    const pomodoro = await Pomodoro.findByIdAndUpdate(
      req.params.id,
      {
        completed: true,
        completedAt: new Date(),
        sessions: (await Pomodoro.findById(req.params.id)).sessions + 1,
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
    const pomodoro = await Pomodoro.findByIdAndDelete(req.params.id);
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
    const total = await Pomodoro.countDocuments();
    const completed = await Pomodoro.countDocuments({ completed: true });
    const totalSessions = await Pomodoro.aggregate([
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
