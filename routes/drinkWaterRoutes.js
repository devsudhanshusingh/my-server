import express from "express";
import {
  createDrinkWater,
  getDrinkWaters,
  getTodayDrinkWater,
  getDrinkWaterById,
  toggleCup,
  resetDrinkWater,
  updateGoal,
  deleteDrinkWater,
  getStatistics,
} from "../controllers/drinkWaterController.js";

const router = express.Router();

// Get all and statistics
router.get("/", getDrinkWaters);
router.get("/stats", getStatistics);
router.get("/today", getTodayDrinkWater);

// Create a new drink water log
router.post("/", createDrinkWater);

// Get, delete a single log
router.get("/:id", getDrinkWaterById);
router.delete("/:id", deleteDrinkWater);

// Drink water actions
router.patch("/:id/toggle-cup", toggleCup);
router.patch("/:id/reset", resetDrinkWater);
router.patch("/:id/update-goal", updateGoal);

export default router;
