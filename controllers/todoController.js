import Todo from "../models/Todo.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getPeriodRange = (type, date = new Date()) => {
  const now = new Date(date);

  if (type === "Daily") {
    const targetStart = new Date(now);
    targetStart.setHours(0, 0, 0, 0);

    const targetEnd = new Date(targetStart.getTime() + DAY_IN_MS);
    const sourceStart = new Date(targetStart.getTime() - DAY_IN_MS);
    const sourceEnd = new Date(targetStart.getTime());

    return { sourceStart, sourceEnd, targetStart, targetEnd };
  }

  if (type === "Weekly") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const targetStart = new Date(now);
    targetStart.setDate(now.getDate() + mondayOffset);
    targetStart.setHours(0, 0, 0, 0);

    const targetEnd = new Date(targetStart.getTime() + DAY_IN_MS * 7);
    const sourceStart = new Date(targetStart.getTime() - DAY_IN_MS * 7);
    const sourceEnd = new Date(targetStart);

    return { sourceStart, sourceEnd, targetStart, targetEnd };
  }

  if (type === "Monthly") {
    const targetStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const targetEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const sourceStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sourceEnd = new Date(targetStart);

    return { sourceStart, sourceEnd, targetStart, targetEnd };
  }

  if (type === "Yearly") {
    const targetStart = new Date(now.getFullYear(), 0, 1);
    const targetEnd = new Date(now.getFullYear() + 1, 0, 1);
    const sourceStart = new Date(now.getFullYear() - 1, 0, 1);
    const sourceEnd = new Date(targetStart);

    return { sourceStart, sourceEnd, targetStart, targetEnd };
  }

  return null;
};

// CREATE TASK
export const createTodo = async (req, res) => {
  try {
    const task = await Todo.create({
      user: req.user._id,
      type: req.body.type,
      text: req.body.text,
      completed: false,
      completionDate: req.body.completionDate || new Date(),
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// COPY TASKS
export const copyTasks = async (req, res) => {
  try {
    const { type } = req.body;

    const period = getPeriodRange(type);

    if (!period) {
      return res.status(400).json({
        message: "Invalid task type",
      });
    }

    // Get previous tasks
    const previousTasks = await Todo.find({
      user: req.user._id,
      type,
      deleted: false,
      completionDate: {
        $gte: period.sourceStart,
        $lt: period.sourceEnd,
      },
    });

    if (!previousTasks.length) {
      return res.status(400).json({
        message: "No previous tasks found",
      });
    }

    const existingTasks = await Todo.find({
      user: req.user._id,
      type,
      deleted: false,
      completionDate: {
        $gte: period.targetStart,
        $lt: period.targetEnd,
      },
    }).select("text");

    const existingTaskTexts = new Set(existingTasks.map((task) => task.text));
    const copiedTaskTexts = new Set();

    // Copy tasks
    const copiedTasks = previousTasks
      .filter((task) => {
        if (existingTaskTexts.has(task.text) || copiedTaskTexts.has(task.text)) {
          return false;
        }

        copiedTaskTexts.add(task.text);
        return true;
      })
      .map((task) => ({
        user: req.user._id,
        type: task.type,
        text: task.text,
        completed: false,
        completionDate: new Date(period.targetStart),
      }));

    if (!copiedTasks.length) {
      return res.json({
        message: "Tasks already exist",
      });
    }

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

// UPDATE TASK
export const updateTodo = async (req, res) => {
  try {
    const { text } = req.body;

    if (text === undefined) {
      return res.status(400).json({
        message: "Task text is required",
      });
    }

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

    todo.text = text;

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
