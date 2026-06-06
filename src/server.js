import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app.js";

dotenv.config();

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
