import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "./cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const areFriends = async (senderId, receiverId) => {
  const sender = await User.findById(senderId);
  if (!sender) return false;
  return sender.friends?.some(
    (friendId) => friendId.toString() === receiverId.toString(),
  );
};

export const uploadAudio = (dataUri) => {
  const base64Audio = dataUri.split(",")[1];
  const audioBuffer = Buffer.from(base64Audio, "base64");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "quickchat/voice-messages",
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    uploadStream.end(audioBuffer);
  });
};

export const uploadDocument = (dataUri) => {
  const base64Document = dataUri.split(",")[1];
  const documentBuffer = Buffer.from(base64Document, "base64");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "quickchat/documents",
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    uploadStream.end(documentBuffer);
  });
};

export const deliverMessage = async ({
  senderId,
  receiverId,
  text,
  image,
  audio,
  audioDuration,
  documentUrl,
  documentName,
  documentType,
  documentSize,
}) => {
  const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image,
    audio,
    audioDuration,
    documentUrl,
    documentName,
    documentType,
    documentSize,
  });

  const receiverSocketId = userSocketMap[receiverId.toString()];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  const senderSocketId = userSocketMap[senderId.toString()];
  if (senderSocketId && senderSocketId !== receiverSocketId) {
    io.to(senderSocketId).emit("newMessage", newMessage);
  }

  return newMessage;
};
