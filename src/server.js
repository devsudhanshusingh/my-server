import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

/* TEST ROUTE */

app.get("/", (req, res) => {
  res.send("API Running");
});

/* PORT */

const PORT = process.env.PORT || 5000;

/* START SERVER */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on ${PORT}`,
  );
});

/* DB CONNECTION */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error(
      "MongoDB Error:",
      err.message,
    );
  });
