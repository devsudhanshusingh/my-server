import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    grammarScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    vocabularyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fluencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiCorrection: {
      type: String,
      trim: true,
      default: "",
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

journalSchema.index({ user: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
