import express from "express";
import { logSpellingSession } from "../controllers/spellingController.js";

const router = express.Router();

router.post("/log", logSpellingSession);

export default router;
