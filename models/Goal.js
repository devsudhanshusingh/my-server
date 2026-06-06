import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    countdown: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
