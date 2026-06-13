import mongoose from "mongoose";

const pomodoroSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: true,
      enum: ["Work", "Study", "Break", "Custom"],
    },

    customLabel: {
      type: String,
      trim: true,
    },

    timeLeft: {
      type: Number,
      required: true,
      default: 1500,
    },

    duration: {
      type: Number,
      required: true,
      default: 1500,
    },

    isRunning: {
      type: Boolean,
      default: false,
    },

    sessions: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Pomodoro = mongoose.model("Pomodoro", pomodoroSchema);

export default Pomodoro;
