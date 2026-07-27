import express from "express";
import { polishMessage } from "../controllers/aiController.js";
import { protectRoute } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimit.js";

const aiRouter = express.Router();

aiRouter.post("/polish-message", protectRoute, aiLimiter, polishMessage);

export default aiRouter;
