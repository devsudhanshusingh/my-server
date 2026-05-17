import express from "express";
import cors from "cors";

import todoRoutes from "../routes/todoRoutes.js";
// import goalRoutes from "./routes/goalRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/todos", todoRoutes);

// app.use("/api/goals", goalRoutes);

export default app;
