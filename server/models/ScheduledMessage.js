import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },
    image: { type: String },
    audio: { type: String },
    audioDuration: { type: Number },
    documentUrl: { type: String },
    documentName: { type: String },
    documentType: { type: String },
    documentSize: { type: Number },
    aiOriginal: { type: String },
    aiGenerated: { type: String },
    status: {
      type: String,
      enum: ["Scheduled", "Sent", "Cancelled", "Failed"],
      default: "Scheduled",
    },
    scheduledFor: { type: Date, required: true },
    deliveredAt: { type: Date },
    failedReason: { type: String },
  },
  { timestamps: true },
);

scheduledMessageSchema.index({ scheduledFor: 1, status: 1 });

const ScheduledMessage = mongoose.model(
  "ScheduledMessage",
  scheduledMessageSchema,
);

export default ScheduledMessage;
