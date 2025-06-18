import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongoDB from "./database/connectToDB.js";

import authRouter from "./routes/authRouter.js";
import employeeRouter from "./routes/employeeRouter.js";
import adminRouter from "./routes/adminRouter.js";

import { Server } from "socket.io";
import http from "http";

dotenv.config();

connectToMongoDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
); // Don't forget CORS middleware
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change for production
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Optional: You can export `io` to use in routes
export { io };

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
