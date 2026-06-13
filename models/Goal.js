import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
