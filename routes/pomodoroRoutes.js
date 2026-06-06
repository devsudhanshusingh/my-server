import express from "express";
import {
  createPomodoro,
  getPomodoros,
  getPomodoroById,
  updatePomodoro,
  startPomodoro,
  pausePomodoro,
  resetPomodoro,
  completePomodoro,
  deletePomodoro,
  getStatistics,
} from "../controllers/pomodoroController.js";

const router = express.Router();

// Get all pomodoros and statistics
router.get("/", getPomodoros);
router.get("/stats", getStatistics);

// Create a new pomodoro
router.post("/", createPomodoro);

// Get, update, delete a single pomodoro
router.get("/:id", getPomodoroById);
router.put("/:id", updatePomodoro);
router.delete("/:id", deletePomodoro);

// Pomodoro actions
router.patch("/:id/start", startPomodoro);
router.patch("/:id/pause", pausePomodoro);
router.patch("/:id/reset", resetPomodoro);
router.patch("/:id/complete", completePomodoro);

export default router;
