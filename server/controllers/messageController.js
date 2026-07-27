import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js";

const areFriends = (user, otherUserId) => user.friends?.some(friendId => friendId.toString() === otherUserId.toString());

const uploadAudio = (dataUri) => {
    const base64Audio = dataUri.split(",")[1];
    const audioBuffer = Buffer.from(base64Audio, "base64");

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: "video",
            folder: "quickchat/voice-messages",
        }, (error, result) => error ? reject(error) : resolve(result));
        uploadStream.end(audioBuffer);
    });
};

const uploadDocument = (dataUri) => {
    const base64Document = dataUri.split(",")[1];
    const documentBuffer = Buffer.from(base64Document, "base64");

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: "raw",
            folder: "quickchat/documents",
        }, (error, result) => error ? reject(error) : resolve(result));
        uploadStream.end(documentBuffer);
    });
};


// Get all users except the logged in user
export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user._id;
        const currentUser = await User.findById(userId).populate("friends", "fullName email profilePic bio");
        const filteredUsers = currentUser.friends;

        // Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) =>{
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        if (!areFriends(req.user, selectedUserId)) {
            return res.json({ success: false, message: "You can only chat with friends" });
        }

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Delete a sender's message for both participants.
export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findOne({ _id: req.params.id, senderId: req.user._id });
        if (!message) return res.json({ success: false, message: "Message not found or cannot be deleted" });
        if (message.isDeleted) return res.json({ success: true, message: "Message is already deleted" });

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.text = undefined;
        message.image = undefined;
        message.audio = undefined;
        message.audioDuration = undefined;
        message.documentUrl = undefined;
        message.documentName = undefined;
        message.documentType = undefined;
        message.documentSize = undefined;
        await message.save();

        const deletionEvent = { messageId: message._id, senderId: message.senderId, receiverId: message.receiverId };
        [message.senderId, message.receiverId].forEach(userId => {
            const socketId = userSocketMap[userId.toString()];
            if (socketId) io.to(socketId).emit("messageDeleted", deletionEvent);
        });
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send message to selected user
export const sendMessage = async (req, res) =>{
    try {
        const {text, image, audio, audioDuration, document, documentName, documentType, documentSize} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        if (!areFriends(req.user, receiverId)) {
            return res.json({ success: false, message: "You can only chat with friends" });
        }

        if (!text && !image && !audio && !document) {
            return res.json({ success: false, message: "Message content is required" });
        }
        if (audio && (!audio.startsWith("data:audio/") || audio.length > 2.8 * 1024 * 1024)) {
            return res.json({ success: false, message: "Voice messages must be an audio recording under 2 MB" });
        }
        if (document && (!document.startsWith("data:") || document.length > 2.8 * 1024 * 1024 || !documentName)) {
            return res.json({ success: false, message: "Documents must be under 2 MB" });
        }
        if (document) {
            const documentMimeType = document.match(/^data:([^;]+);base64/)?.[1];
            const allowedDocumentTypes = [
                "application/pdf", "text/plain", "text/csv", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ];
            if (!allowedDocumentTypes.includes(documentMimeType)) {
                return res.json({ success: false, message: "Unsupported document type" });
            }
        }

        let imageUrl;
        let audioUrl;
        let documentUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
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
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            audio: audioUrl,
            audioDuration: audioUrl ? Number(audioDuration) || undefined : undefined,
            documentUrl,
            documentName: documentUrl ? documentName : undefined,
            documentType: documentUrl ? documentType : undefined,
            documentSize: documentUrl ? Number(documentSize) || undefined : undefined,
        })

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
