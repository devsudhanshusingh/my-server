import express from "express";
import {
  upsertDailyRoutine,
  getRoutineByDate,
  getRoutineStats,
} from "../controllers/englishRoutineController.js";

const router = express.Router();

router.post("/", upsertDailyRoutine);
router.get("/stats", getRoutineStats);
router.get("/today", getRoutineByDate);
router.get("/:date", getRoutineByDate);

export default router;
