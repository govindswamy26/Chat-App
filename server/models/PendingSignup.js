import mongoose from "mongoose";

// Registrations remain pending until the owner confirms their email address.
const pendingSignupSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, required: true, trim: true },
    verificationToken: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

export default mongoose.model("PendingSignup", pendingSignupSchema);
