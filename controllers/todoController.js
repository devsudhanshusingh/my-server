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

    let sourceDate = new Date(now);
    let targetDate = new Date(now);

    if (type === "Daily") {
      sourceDate.setDate(now.getDate());
      targetDate.setDate(now.getDate() + 1);
    }

    if (type === "Weekly") {
      targetDate.setDate(now.getDate() + 7);
    }

    if (type === "Monthly") {
      targetDate.setMonth(now.getMonth() + 1);
    }

    if (type === "Yearly") {
      targetDate.setFullYear(now.getFullYear() + 1);
    }

    sourceDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const nextDayExists = await Todo.find({
      user: req.user._id,
      type,
      completionDate: targetDate,
      deleted: false,
    });

    if (nextDayExists.length > 0) {
      return res.status(400).json({
        message: "Tasks already copied",
      });
    }

    const tasks = await Todo.find({
      user: req.user._id,
      type,
      deleted: false,
      completionDate: {
        $gte: sourceDate,
        $lt: new Date(sourceDate.getTime() + 86400000),
      },
    });

    const copiedTasks = tasks.map((task) => ({
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

    todo.completed = true;

    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE COMPLETE SERIES

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    let rootId = todo.isTemplate ? todo._id : todo.parentTask;

    await Todo.updateMany(
      {
        $or: [
          {
            _id: rootId,
          },

          {
            parentTask: rootId,
          },
        ],
      },

      {
        deleted: true,
      },
    );

    res.json({
      message: "Task removed permanently",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
