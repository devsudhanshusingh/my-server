import Todo from "../models/Todo.js";

export const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });

    res.json(todos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
