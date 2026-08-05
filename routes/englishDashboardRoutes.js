import express from "express";
import { getEnglishDashboard } from "../controllers/englishDashboardController.js";

const router = express.Router();

router.get("/", getEnglishDashboard);

export default router;
