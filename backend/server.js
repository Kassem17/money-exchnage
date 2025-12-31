import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongoDB from "./database/connectToDB.js";

import authRouter from "./routes/authRouter.js";
import employeeRouter from "./routes/employeeRouter.js";
import adminRouter from "./routes/adminRouter.js";

dotenv.config();

// ⚠️ Connect DB ONCE (safe for Vercel)
await connectToMongoDB();

const app = express();

app.use(
  cors({
    origin: "*", // ✅ Change later for frontend URL
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running on Vercel 🚀");
});

app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/admin", adminRouter);

// ✅ THIS IS THE KEY FIX
export default app;
