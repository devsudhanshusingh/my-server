import express from "express";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  completeGoal,
  deleteGoal,
  getStatistics,
  getUpcomingGoals,
} from "../controllers/goalController.js";

const router = express.Router();

// Get all goals and statistics
router.get("/", getGoals);
router.get("/stats", getStatistics);
router.get("/upcoming", getUpcomingGoals);

// Create a new goal
router.post("/", createGoal);

// Get, update, delete a single goal
router.get("/:id", getGoalById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

// Mark goal as completed
router.patch("/:id/complete", completeGoal);

export default router;
