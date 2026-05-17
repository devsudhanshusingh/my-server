import express from "express";

import { createTodo, getTodos } from "../controllers/todoController.js";

const router = express.Router();

router.post("/", createTodo);

router.get("/", getTodos);

export default router;
