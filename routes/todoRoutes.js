import express from "express";

import {
  createTodo,
  getTodos,
  completeTodo,
  deleteTodo,
} from "../controllers/todoController.js";

const router = express.Router();

router.post("/", createTodo);

router.get("/", getTodos);

router.post("/copy", copyTasks);

router.put("/complete/:id", completeTodo);

router.delete("/:id", deleteTodo);

export default router;
