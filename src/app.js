import express from "express";
import cors from "cors";

import todoRoutes from "../routes/todoRoutes.js";
import pomodoroRoutes from "../routes/pomodoroRoutes.js";
import drinkWaterRoutes from "../routes/drinkWaterRoutes.js";
import goalRoutes from "../routes/goalRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/todos", todoRoutes);

app.use("/api/pomodoros", pomodoroRoutes);
app.use("/api/drink-water", drinkWaterRoutes);
app.use("/api/goals", goalRoutes);


export default app;
