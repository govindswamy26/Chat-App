import ScheduledMessage from "../models/ScheduledMessage.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import {
  areFriends,
  uploadAudio,
  uploadDocument,
  deliverMessage,
} from "../lib/messageUtils.js";

const MAX_BYTES = 2.8 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const validateAttachment = ({
  audio,
  document,
  documentName,
  documentType,
}) => {
  if (audio) {
    if (!audio.startsWith("data:audio/") || audio.length > MAX_BYTES) {
      return "Voice messages must be an audio recording under 2.8 MB.";
    }
  }
  if (document) {
    if (
      !document.startsWith("data:") ||
      document.length > MAX_BYTES ||
      !documentName
    ) {
      return "Documents must be under 2.8 MB and include a filename.";
    }
    const documentMimeType = document.match(/^data:([^;]+);base64/)?.[1];
    if (!ALLOWED_DOCUMENT_TYPES.includes(documentMimeType)) {
      return "Unsupported document type.";
    }
  }
  return null;
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithin24Hours = (date) => {
  const now = new Date();
  const later = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return date > now && date <= later;
};

export const scheduleMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const {
      text,
      image,
      audio,
      document,
      documentName,
      documentType,
      documentSize,
      aiOriginal,
      aiGenerated,
      scheduledFor,
    } = req.body;

    if (!(await areFriends(senderId, receiverId))) {
      return res.json({
        success: false,
        message: "You can only schedule messages for friends.",
      });
    }

    if (!text && !image && !audio && !document) {
      return res.json({
        success: false,
        message: "Message content is required.",
      });
    }

    const scheduledDate = parseDate(scheduledFor);
    if (!scheduledDate) {
      return res.json({ success: false, message: "Invalid scheduling date." });
    }
    if (!isWithin24Hours(scheduledDate)) {
      return res.json({
        success: false,
        message: "Scheduled time must be within the next 24 hours.",
      });
    }

    const attachmentError = validateAttachment({
      audio,
      document,
      documentName,
      documentType,
    });
    if (attachmentError) {
      return res.json({ success: false, message: attachmentError });
    }

    let imageUrl;
    let audioUrl;
    let documentUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    if (audio) {
      const uploadResponse = await uploadAudio(audio);
      audioUrl = uploadResponse.secure_url;
    }
    if (document) {
      const uploadResponse = await uploadDocument(document);
      documentUrl = uploadResponse.secure_url;
    }

    const scheduledMessage = await ScheduledMessage.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      audioDuration: audioUrl
        ? Number(req.body.audioDuration) || undefined
        : undefined,
      documentUrl,
      documentName: documentUrl ? documentName : undefined,
      documentType: documentUrl ? documentType : undefined,
      documentSize: documentUrl ? Number(documentSize) || undefined : undefined,
      aiOriginal,
      aiGenerated,
      scheduledFor: scheduledDate,
    });

    return res.json({ success: true, scheduledMessage });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: "Unable to schedule message." });
  }
};

export const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const scheduledMessages = await ScheduledMessage.find({
      senderId: userId,
      status: "Scheduled",
    })
      .populate("receiverId", "fullName profilePic bio")
      .sort({ scheduledFor: 1 });
    return res.json({ success: true, scheduledMessages });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Unable to load scheduled messages.",
    });
  }
};

export const updateScheduledMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { text, scheduledFor } = req.body;
    const scheduledMessage = await ScheduledMessage.findOne({
      _id: id,
      senderId: userId,
      status: "Scheduled",
    });
    if (!scheduledMessage)
      return res.json({
        success: false,
        message: "Scheduled message not found.",
      });

    const scheduledDate = parseDate(scheduledFor);
    if (!scheduledDate || !isWithin24Hours(scheduledDate)) {
      return res.json({
        success: false,
        message: "Scheduled time must be within the next 24 hours.",
      });
    }

    scheduledMessage.text = text ?? scheduledMessage.text;
    scheduledMessage.scheduledFor = scheduledDate;
    await scheduledMessage.save();

    return res.json({ success: true, scheduledMessage });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Unable to update scheduled message.",
    });
  }
};

export const cancelScheduledMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const scheduledMessage = await ScheduledMessage.findOne({
      _id: id,
      senderId: userId,
      status: "Scheduled",
    });
    if (!scheduledMessage)
      return res.json({
        success: false,
        message: "Scheduled message not found.",
      });

    scheduledMessage.status = "Cancelled";
    await scheduledMessage.save();

    return res.json({ success: true, message: "Scheduled message cancelled." });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Unable to cancel scheduled message.",
    });
  }
};

export const sendScheduledMessageNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const scheduledMessage = await ScheduledMessage.findOne({
      _id: id,
      senderId: userId,
      status: "Scheduled",
    });
    if (!scheduledMessage)
      return res.json({
        success: false,
        message: "Scheduled message not found.",
      });

    const deliveredMessage = await deliverMessage({
      senderId: scheduledMessage.senderId,
      receiverId: scheduledMessage.receiverId,
      text: scheduledMessage.text,
      image: scheduledMessage.image,
      audio: scheduledMessage.audio,
      audioDuration: scheduledMessage.audioDuration,
      documentUrl: scheduledMessage.documentUrl,
      documentName: scheduledMessage.documentName,
      documentType: scheduledMessage.documentType,
      documentSize: scheduledMessage.documentSize,
    });

    scheduledMessage.status = "Sent";
    scheduledMessage.deliveredAt = new Date();
    await scheduledMessage.save();

    return res.json({ success: true, deliveredMessage });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Unable to send scheduled message now.",
    });
  }
};

export const deliverScheduledMessage = async (scheduledMessage) => {
  try {
    if (!scheduledMessage || scheduledMessage.status !== "Scheduled")
      return null;
    const deliveredMessage = await deliverMessage({
      senderId: scheduledMessage.senderId,
      receiverId: scheduledMessage.receiverId,
      text: scheduledMessage.text,
      image: scheduledMessage.image,
      audio: scheduledMessage.audio,
      audioDuration: scheduledMessage.audioDuration,
      documentUrl: scheduledMessage.documentUrl,
      documentName: scheduledMessage.documentName,
      documentType: scheduledMessage.documentType,
      documentSize: scheduledMessage.documentSize,
    });

    scheduledMessage.status = "Sent";
    scheduledMessage.deliveredAt = new Date();
    await scheduledMessage.save();

    return deliveredMessage;
  } catch (error) {
    console.log("Scheduled delivery failed", error.message);
    scheduledMessage.status = "Failed";
    scheduledMessage.failedReason = error.message;
    await scheduledMessage.save();
    return null;
  }
};
