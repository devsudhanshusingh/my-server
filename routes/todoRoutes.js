import express from "express";

import {
  createTodo,
  getTodos,
  completeTodo,
  deleteTodo,
  copyTasks,
  updateTodo,
} from "../controllers/todoController.js";

const router = express.Router();

router.post("/", createTodo);

router.get("/", getTodos);

router.post("/copy", copyTasks);

router.put("/complete/:id", completeTodo);

router.put("/edit/:id", updateTodo);

router.put("/:id", updateTodo);

router.delete("/:id", deleteTodo);

export default router;
