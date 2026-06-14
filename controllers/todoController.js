import Todo from "../models/Todo.js";

// CREATE TASK

export const createTodo = async (req, res) => {
  try {
    const task = await Todo.create({
      user: req.user._id,
      type: req.body.type,
      text: req.body.text,
      completionDate: req.body.completionDate || new Date(),
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const copyTasks = async (req, res) => {
  try {
    const { type } = req.body;

    const now = new Date();

    let sourceStart = new Date();
    let sourceEnd = new Date();

    let targetDate = new Date();

    // DAILY: yesterday -> today
    if (type === "Daily") {
      sourceStart.setDate(now.getDate() - 1);
      sourceEnd.setDate(now.getDate() - 1);

      sourceStart.setHours(0, 0, 0, 0);
      sourceEnd.setHours(23, 59, 59, 999);

      targetDate.setHours(0, 0, 0, 0);
    }

    // WEEKLY: last monday-sunday -> this monday-sunday
    if (type === "Weekly") {
      const day = now.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      // current week monday
      const currentMonday = new Date(now);
      currentMonday.setDate(now.getDate() + mondayOffset);
      currentMonday.setHours(0, 0, 0, 0);

      // previous week monday
      sourceStart = new Date(currentMonday);
      sourceStart.setDate(currentMonday.getDate() - 7);

      sourceEnd = new Date(sourceStart);
      sourceEnd.setDate(sourceStart.getDate() + 6);
      sourceEnd.setHours(23, 59, 59, 999);

      targetDate = currentMonday;
    }

    // MONTHLY: last month -> current month
    if (type === "Monthly") {
      sourceStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      sourceEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

      targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // YEARLY: last year -> current year
    if (type === "Yearly") {
      sourceStart = new Date(now.getFullYear() - 1, 0, 1);

      sourceEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

      targetDate = new Date(now.getFullYear(), 0, 1);
    }

    // prevent duplicate copy
    const existingTasks = await Todo.find({
      user: req.user._id,
      type,
      deleted: false,
      completionDate: {
        $gte: targetDate,
        $lt: new Date(
          targetDate.getTime() +
            (type === "Daily"
              ? 86400000
              : type === "Weekly"
                ? 86400000 * 7
                : type === "Monthly"
                  ? 86400000 * 31
                  : 86400000 * 365),
        ),
      },
    });

    if (existingTasks.length > 0) {
      return res.status(400).json({
        message: "Tasks already exist",
      });
    }

    // fetch previous tasks
    const previousTasks = await Todo.find({
      user: req.user._id,
      type,
      deleted: false,
      completionDate: {
        $gte: sourceStart,
        $lte: sourceEnd,
      },
    });

    if (!previousTasks.length) {
      return res.status(400).json({
        message: "No previous tasks found",
      });
    }

    // copy tasks
    const copiedTasks = previousTasks.map((task) => ({
      user: req.user._id,
      type: task.type,
      text: task.text,
      completed: false,
      completionDate: targetDate,
    }));

    await Todo.insertMany(copiedTasks);

    res.json({
      message: "Tasks copied successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL TASKS

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.user._id,
      deleted: false,
    }).sort({
      completionDate: 1,
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// COMPLETE TASK

export const completeTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    todo.completed = !todo.completed;

    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE SINGLE TASK
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    todo.deleted = true;

    await todo.save();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE TASK
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
      deleted: false,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    todo.text = req.body.text || todo.text;

    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};