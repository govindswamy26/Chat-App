import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    aiUsage: {
      date: { type: Date, default: null },
      requests: { type: Number, default: 0 },
      characters: { type: Number, default: 0 },
      tokens: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
