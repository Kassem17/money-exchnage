import http from "http";
import express from "express";
import { Server } from "socket.io";
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
const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: allowedOrigin !== "*",
  })
);

app.use(express.json({ limit: "512kb" }));

app.get("/", (req, res) => {
  res.send("Backend API is running on Vercel 🚀");
});

app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/admin", adminRouter);

/** Socket.IO – set when running a real server; null on Vercel so controllers don't crash. */
export let io = null;

// When running locally, create HTTP server and attach Socket.IO so the frontend can connect.
if (process.env.VERCEL !== "1") {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: { origin: allowedOrigin },
    transports: ["websocket", "polling"],
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
