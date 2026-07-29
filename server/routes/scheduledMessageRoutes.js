import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  cancelScheduledMessage,
  getScheduledMessages,
  scheduleMessage,
  sendScheduledMessageNow,
  updateScheduledMessage,
} from "../controllers/scheduledMessageController.js";

const router = express.Router();

router.post("/send/:id", protectRoute, scheduleMessage);
router.get("/", protectRoute, getScheduledMessages);
router.put("/:id", protectRoute, updateScheduledMessage);
router.delete("/:id", protectRoute, cancelScheduledMessage);
router.post("/send-now/:id", protectRoute, sendScheduledMessageNow);

export default router;
