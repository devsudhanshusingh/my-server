import express from "express";
import cors from "cors";

import todoRoutes from "../routes/todoRoutes.js";
import pomodoroRoutes from "../routes/pomodoroRoutes.js";
import drinkWaterRoutes from "../routes/drinkWaterRoutes.js";
import goalRoutes from "../routes/goalRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import journalRoutes from "../routes/journalRoutes.js";
import englishRoutineRoutes from "../routes/englishRoutineRoutes.js";
import englishDashboardRoutes from "../routes/englishDashboardRoutes.js";
import spellingRoutes from "../routes/spellingRoutes.js";
import englishAnalyticsRoutes from "../routes/englishAnalyticsRoutes.js";
import englishAchievementsRoutes from "../routes/englishAchievementsRoutes.js";

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

// English Learning Module Routes
app.use("/api/english/journal", authMiddleware, journalRoutes);
app.use("/api/english/routine", authMiddleware, englishRoutineRoutes);
app.use("/api/english/dashboard", authMiddleware, englishDashboardRoutes);
app.use("/api/english/spelling", authMiddleware, spellingRoutes);
app.use("/api/english/analytics", authMiddleware, englishAnalyticsRoutes);
app.use("/api/english/achievements", authMiddleware, englishAchievementsRoutes);

export default app;




