import express from "express";
import { login, resetPassword } from "../controllers/authController.js";
import protectRoute from "../middleware/protectRoute.js";

const authRouter = express.Router();
authRouter.post("/login", login);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
