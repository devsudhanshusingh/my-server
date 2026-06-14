import express from "express";
import cors from "cors";

import todoRoutes from "../routes/todoRoutes.js";
import pomodoroRoutes from "../routes/pomodoroRoutes.js";
import drinkWaterRoutes from "../routes/drinkWaterRoutes.js";
import goalRoutes from "../routes/goalRoutes.js";
import authRoutes from "../routes/authRoutes.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/todos", authMiddleware, todoRoutes);

app.use("/api/pomodoros", authMiddleware, pomodoroRoutes);

app.use("/api/drink-water", authMiddleware, drinkWaterRoutes);

app.use("/api/goals", authMiddleware, goalRoutes);

export default app;
