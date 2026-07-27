import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, maxlength: 300, default: "" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model("FriendRequest", friendRequestSchema);
