import cron from "node-cron";
import ScheduledMessage from "../models/ScheduledMessage.js";
import { deliverScheduledMessage } from "../controllers/scheduledMessageController.js";

const startScheduler = () => {
  cron.schedule(
    "*/1 * * * *",
    async () => {
      const now = new Date();
      const dueMessages = await ScheduledMessage.find({
        status: "Scheduled",
        scheduledFor: { $lte: now },
      }).limit(50);

      if (!dueMessages.length) return;

      for (const scheduledMessage of dueMessages) {
        await deliverScheduledMessage(scheduledMessage);
      }
    },
    {
      timezone: "UTC",
    },
  );
};

export default startScheduler;
