import express from "express";

import {
  createTodo,
  getTodos,
  completeTodo,
  deleteTodo,
} from "../controllers/todoController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTodo);

router.get("/", protect, getTodos);

router.put("/complete/:id", protect, completeTodo);

router.delete("/:id", protect, deleteTodo);

export default router;
