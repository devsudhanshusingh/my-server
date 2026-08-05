import express from "express";
import {
  createJournal,
  getJournals,
  getJournalHistory,
  getJournalById,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";

const router = express.Router();

router.post("/", createJournal);
router.get("/", getJournals);
router.get("/history", getJournalHistory);
router.get("/:id", getJournalById);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

export default router;
