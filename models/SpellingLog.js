import mongoose from "mongoose";

const spellingLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
    },
    repetitionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    wpm: {
      type: Number,
      default: 0,
      min: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

spellingLogSchema.index({ user: 1, createdAt: -1 });

const SpellingLog = mongoose.model("SpellingLog", spellingLogSchema);

export default SpellingLog;
