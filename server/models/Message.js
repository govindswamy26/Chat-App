import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: { type: String, },
    image: { type: String, },
    audio: { type: String, },
    audioDuration: { type: Number, },
    documentUrl: { type: String, },
    documentName: { type: String, },
    documentType: { type: String, },
    documentSize: { type: Number, },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    seen: {type: Boolean, default: false}
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;
