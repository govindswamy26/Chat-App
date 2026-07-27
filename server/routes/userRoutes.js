import express from "express";
import { checkAuth, forgotPassword, login, resetPassword, signup, updateProfile, verifyEmail } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import { authLimiter, verificationLimiter } from "../middleware/rateLimit.js";

const userRouter = express.Router();

userRouter.post("/signup", authLimiter, signup);
userRouter.post("/verify-email", verificationLimiter, verifyEmail);
userRouter.post("/forgot-password", authLimiter, forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/login", authLimiter, login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
