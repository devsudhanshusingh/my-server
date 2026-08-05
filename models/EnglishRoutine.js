import mongoose from "mongoose";

const taskItemSchema = new mongoose.Schema(
  {
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const englishRoutineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reading: {
      type: taskItemSchema,
      default: () => ({ completed: false, timeSpent: 0 }),
    },
    vocabulary: {
      type: taskItemSchema,
      default: () => ({ completed: false, timeSpent: 0 }),
    },
    spelling: {
      type: taskItemSchema,
      default: () => ({ completed: false, timeSpent: 0 }),
    },
    writing: {
      type: taskItemSchema,
      default: () => ({ completed: false, timeSpent: 0 }),
    },
    speaking: {
      type: taskItemSchema,
      default: () => ({ completed: false, timeSpent: 0 }),
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

englishRoutineSchema.index({ user: 1, date: 1 }, { unique: true });

const EnglishRoutine = mongoose.model("EnglishRoutine", englishRoutineSchema);

export default EnglishRoutine;
