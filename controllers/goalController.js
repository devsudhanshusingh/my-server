import Goal from "../models/Goal.js";

// Helper function to calculate countdown
const getCountdown = (targetDate) => {
  if (!targetDate) return "";

  const diff = new Date(targetDate) - new Date();

  if (diff <= 0) {
    return "Completed 🎉";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { text, date } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Goal text is required",
      });
    }

    const newGoal = await Goal.create({
      text: text.trim(),
      date: date || null,
      countdown: date ? getCountdown(date) : "",
    });

    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });

    const goalsWithCountdown = goals.map((goal) => ({
      ...goal.toObject(),
      countdown: goal.date ? getCountdown(goal.date) : "",
    }));

    res.json(goalsWithCountdown);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get a single goal by ID
export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const goalWithCountdown = {
      ...goal.toObject(),
      countdown: goal.date ? getCountdown(goal.date) : "",
    };

    res.json(goalWithCountdown);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const { text, date } = req.body;

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        text: text || undefined,
        date: date || undefined,
      },
      { new: true },
    );

    if (!updatedGoal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const goalWithCountdown = {
      ...updatedGoal.toObject(),
      countdown: updatedGoal.date ? getCountdown(updatedGoal.date) : "",
    };

    res.json(goalWithCountdown);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Mark goal as completed
export const completeGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        completed: true,
        completedAt: new Date(),
      },
      { new: true },
    );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const goalWithCountdown = {
      ...goal.toObject(),
      countdown: "Completed 🎉",
    };

    res.json(goalWithCountdown);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get goals statistics
export const getStatistics = async (req, res) => {
  try {
    const total = await Goal.countDocuments();
    const completed = await Goal.countDocuments({ completed: true });
    const pending = total - completed;

    const goalsWithDates = await Goal.countDocuments({
      date: { $exists: true, $ne: null },
    });

    res.json({
      total,
      completed,
      pending,
      goalsWithDates,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get upcoming goals (sorted by date)
export const getUpcomingGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      date: { $exists: true, $ne: null },
      completed: false,
    }).sort({ date: 1 });

    const goalsWithCountdown = goals.map((goal) => ({
      ...goal.toObject(),
      countdown: getCountdown(goal.date),
    }));

    res.json(goalsWithCountdown);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
