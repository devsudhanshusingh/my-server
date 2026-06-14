import Todo from "../models/Todo.js";

// CREATE TASK

export const createTodo = async (req, res) => {
  try {
    const today = new Date();

    const template = await Todo.create({
      user: req.user._id,

      type: req.body.type,

      text: req.body.text,

      completionDate: today,

      isTemplate: true,
    });

    const task = await Todo.create({
      user: req.user._id,

      type: req.body.type,

      text: req.body.text,

      completionDate: today,

      parentTask: template._id,

      isTemplate: false,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE NEXT OCCURRENCE

const createNextTasks = async (userId) => {
  const templates = await Todo.find({
    user: userId,

    isTemplate: true,

    deleted: false,
  });

  for (const template of templates) {
    let lastTask = await Todo.findOne({
      parentTask: template._id,
    }).sort({
      completionDate: -1,
    });

    let nextDate = new Date(lastTask.completionDate);

    if (template.type === "Daily") {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    if (template.type === "Weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    }

    if (template.type === "Monthly") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    if (template.type === "Yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const alreadyExist = await Todo.findOne({
      parentTask: template._id,

      completionDate: nextDate,
    });

    if (!alreadyExist) {
      await Todo.create({
        user: userId,

        type: template.type,

        text: template.text,

        completionDate: nextDate,

        parentTask: template._id,

        isTemplate: false,
      });
    }
  }
};

// GET ALL TASKS

export const getTodos = async (req, res) => {
  try {
    await createNextTasks(req.user._id);

    const todos = await Todo.find({
      user: req.user._id,

      isTemplate: false,

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
