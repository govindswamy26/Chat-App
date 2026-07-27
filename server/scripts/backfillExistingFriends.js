import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
const users = await User.find().select("_id");

await Promise.all(users.map(user => User.updateOne(
    { _id: user._id },
    { $set: { friends: users.filter(other => other._id.toString() !== user._id.toString()).map(other => other._id) } }
)));

console.log(`Marked ${users.length} existing accounts as mutual friends.`);
await mongoose.disconnect();
