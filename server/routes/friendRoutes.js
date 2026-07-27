import express from "express";
import { getFriendData, respondToFriendRequest, sendFriendRequest } from "../controllers/friendController.js";
import { protectRoute } from "../middleware/auth.js";

const friendRouter = express.Router();
friendRouter.get("/", protectRoute, getFriendData);
friendRouter.post("/request", protectRoute, sendFriendRequest);
friendRouter.put("/request/:id", protectRoute, respondToFriendRequest);

export default friendRouter;
