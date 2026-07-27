import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

const publicUserFields = "fullName email profilePic bio";

export const getFriendData = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("friends", publicUserFields);
        const [incomingRequests, outgoingRequests] = await Promise.all([
            FriendRequest.find({ receiver: userId, status: "pending" }).populate("sender", publicUserFields).sort({ createdAt: -1 }),
            FriendRequest.find({ sender: userId, status: "pending" }).populate("receiver", publicUserFields).sort({ createdAt: -1 }),
        ]);

        const excludedIds = [
            userId,
            ...user.friends.map(friend => friend._id),
            ...incomingRequests.map(request => request.sender._id),
            ...outgoingRequests.map(request => request.receiver._id),
        ];
        const discoverUsers = await User.find({ _id: { $nin: excludedIds } }).select(publicUserFields);

        res.json({
            success: true,
            friends: user.friends,
            friendCount: user.friends.length,
            incomingRequests,
            outgoingRequests,
            discoverUsers,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId, message = "" } = req.body;
        if (!receiverId || senderId.toString() === receiverId) {
            return res.json({ success: false, message: "Choose a valid user" });
        }

        const [sender, receiver] = await Promise.all([User.findById(senderId), User.findById(receiverId)]);
        if (!receiver) return res.json({ success: false, message: "User not found" });
        if (sender.friends.some(friendId => friendId.toString() === receiverId)) {
            return res.json({ success: false, message: "You are already friends" });
        }

        const existing = await FriendRequest.findOne({
            $or: [{ sender: senderId, receiver: receiverId }, { sender: receiverId, receiver: senderId }],
            status: "pending",
        });
        if (existing) return res.json({ success: false, message: "A friend request already exists" });

        const previousRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId, status: { $in: ["rejected", "accepted"] } });
        if (previousRequest) {
            previousRequest.status = "pending";
            previousRequest.message = message;
            await previousRequest.save();
        } else {
            await FriendRequest.create({ sender: senderId, receiver: receiverId, message });
        }
        res.json({ success: true, message: "Friend request sent" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message.includes("duplicate key") ? "A friend request already exists" : error.message });
    }
};

export const respondToFriendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (!["accept", "reject"].includes(action)) return res.json({ success: false, message: "Invalid action" });

        const request = await FriendRequest.findOne({ _id: id, receiver: req.user._id, status: "pending" });
        if (!request) return res.json({ success: false, message: "Friend request not found" });

        request.status = action === "accept" ? "accepted" : "rejected";
        await request.save();
        if (action === "accept") {
            await User.updateOne({ _id: request.sender }, { $addToSet: { friends: request.receiver } });
            await User.updateOne({ _id: request.receiver }, { $addToSet: { friends: request.sender } });
        }
        res.json({ success: true, message: action === "accept" ? "Friend request accepted" : "Friend request declined" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
