import mongoose from "mongoose";

const drinkWaterSchema = new mongoose.Schema(
  {
    goalLiters: {
      type: Number,
      required: true,
      min: 0.1,
    },

    goalML: {
      type: Number,
      required: true,
      min: 100,
    },

    cupSize: {
      type: Number,
      default: 250,
    },

    selectedCups: {
      type: [Number],
      default: [],
    },

    filledAmount: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    remained: {
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

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const DrinkWater = mongoose.model("DrinkWater", drinkWaterSchema);

export default DrinkWater;
