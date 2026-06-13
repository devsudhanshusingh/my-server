import DrinkWater from "../models/DrinkWater.js";

// Create a new drink water goal
export const createDrinkWater = async (req, res) => {
  try {
    const { goalLiters } = req.body;

    if (!goalLiters || goalLiters <= 0) {
      return res.status(400).json({
        message: "Goal liters must be greater than 0",
      });
    }

    const goalML = goalLiters * 1000;

    const drinkWater = await DrinkWater.create({
      user: req.user._id,
      goalLiters,
      goalML,
      cupSize: 250,
      selectedCups: [],
      filledAmount: 0,
      percentage: 0,
      remained: goalLiters,
    });

    res.status(201).json(drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all drink water logs
export const getDrinkWaters = async (req, res) => {
  try {
    const drinkWaters = await DrinkWater.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(drinkWaters);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get today's drink water log
export const getTodayDrinkWater = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const drinkWater = await DrinkWater.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (!drinkWater) {
      return res.status(404).json({
        message: "No drink water log for today",
      });
    }

    res.json(drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get a single drink water log by ID
export const getDrinkWaterById = async (req, res) => {
  try {
    const drinkWater = await DrinkWater.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!drinkWater) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    res.json(drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Toggle a cup (add or remove)
export const toggleCup = async (req, res) => {
  try {
    const { cupIndex } = req.body;

    const drinkWater = await DrinkWater.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!drinkWater) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    let updated = [...drinkWater.selectedCups];

    if (updated.includes(cupIndex)) {
      updated = updated.filter((cup) => cup !== cupIndex);
    } else {
      updated.push(cupIndex);
    }

    const filledAmount = updated.length * drinkWater.cupSize;
    const percentage = ((filledAmount / drinkWater.goalML) * 100).toFixed(1);
    const remained = ((drinkWater.goalML - filledAmount) / 1000).toFixed(2);
    const completed = filledAmount >= drinkWater.goalML;

    const updated_drinkWater = await DrinkWater.findByIdAndUpdate(
      req.params.id,
      {
        selectedCups: updated,
        filledAmount,
        percentage,
        remained,
        completed,
        completedAt: completed ? new Date() : null,
      },
      { new: true },
    );

    res.json(updated_drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reset drink water log
export const resetDrinkWater = async (req, res) => {
  try {
    const current = await DrinkWater.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!current) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    const drinkWater = await DrinkWater.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        selectedCups: [],
        filledAmount: 0,
        percentage: 0,
        remained: current.goalLiters,
        completed: false,
        completedAt: null,
      },
      { new: true },
    );

    if (!drinkWater) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    res.json(drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const { goalLiters } = req.body;

    if (!goalLiters || goalLiters <= 0) {
      return res.status(400).json({
        message: "Goal liters must be greater than 0",
      });
    }

    const goalML = goalLiters * 1000;

    const drinkWater = await DrinkWater.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        goalLiters,
        goalML,
        selectedCups: [],
        filledAmount: 0,
        percentage: 0,
        remained: goalLiters,
        completed: false,
        completedAt: null,
      },
      { new: true },
    );

    if (!drinkWater) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    res.json(drinkWater);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete drink water log
export const deleteDrinkWater = async (req, res) => {
  try {
    const drinkWater = await DrinkWater.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!drinkWater) {
      return res.status(404).json({
        message: "Drink water log not found",
      });
    }

    res.json({
      message: "Drink water log deleted",
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
    const total = await DrinkWater.countDocuments({ user: req.user._id });
    const completed = await DrinkWater.countDocuments({
      user: req.user._id,
      completed: true,
    });

    const avgGoal = await DrinkWater.aggregate([
      {
        $match: { user: req.user._id },
      },
      {
        $group: {
          _id: null,
          averageGoal: { $avg: "$goalLiters" },
        },
      },
    ]);

    const totalWater = await DrinkWater.aggregate([
      {
        $group: {
          _id: null,
          totalWaterML: { $sum: "$filledAmount" },
        },
      },
    ]);

    res.json({
      total,
      completed,
      averageGoal: (avgGoal[0]?.averageGoal || 0).toFixed(2),
      totalWaterML: totalWater[0]?.totalWaterML || 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
