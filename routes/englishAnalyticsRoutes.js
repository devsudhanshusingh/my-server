import express from "express";
import { getEnglishAnalytics } from "../controllers/englishAnalyticsController.js";

const router = express.Router();

router.get("/", getEnglishAnalytics);

export default router;
