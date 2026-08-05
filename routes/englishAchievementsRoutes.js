import express from "express";
import { getEnglishAchievements } from "../controllers/englishAchievementsController.js";

const router = express.Router();

router.get("/", getEnglishAchievements);

export default router;
