import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import PendingSignup from "../models/PendingSignup.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "../lib/email.js";

// Start registration. A User is only created after their email is verified.
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }
        if (password.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (await User.findOne({ email: normalizedEmail })) {
            return res.json({ success: false, message: "Account already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const verificationToken = crypto.createHash("sha256").update(token).digest("hex");

        await PendingSignup.findOneAndUpdate({ email: normalizedEmail }, {
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            bio,
            verificationToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }, { upsert: true, new: true, setDefaultsOnInsert: true });

        await sendVerificationEmail({ email: normalizedEmail, fullName, token });
        res.json({ success: true, message: "Verification link sent. Check your email to create your account." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Create the real account after a valid one-time verification link is opened.
export const verifyEmail = async (req, res) => {
    try {
        const { email, token } = req.body;
        if (!email || !token) return res.json({ success: false, message: "Invalid verification link" });

        const normalizedEmail = email.toLowerCase().trim();
        const verificationToken = crypto.createHash("sha256").update(token).digest("hex");
        // Atomically consume the token. A second click cannot create a second account.
        const pendingSignup = await PendingSignup.findOneAndDelete({
            email: normalizedEmail,
            verificationToken,
            expiresAt: { $gt: new Date() },
        });

        if (!pendingSignup) {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.json({ success: true, message: "Email is already verified. You can log in." });
            }
            return res.json({ success: false, message: "This verification link is invalid or has expired" });
        }
        if (await User.findOne({ email: normalizedEmail })) {
            return res.json({ success: true, message: "Email is already verified. You can log in." });
        }

        try {
            await User.create({
                fullName: pendingSignup.fullName,
                email: pendingSignup.email,
                password: pendingSignup.password,
                bio: pendingSignup.bio,
            });
        } catch (error) {
            if (error?.code !== 11000) throw error;
        }
        res.json({ success: true, message: "Email verified. Your account has been created." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send a one-time password reset link. The generic response prevents email enumeration.
export const forgotPassword = async (req, res) => {
    try {
        const normalizedEmail = req.body.email?.toLowerCase().trim();
        const successMessage = "If an account exists for this email, a password reset link has been sent.";
        if (!normalizedEmail) return res.json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.json({ success: true, message: successMessage });

        const token = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail({ email: user.email, fullName: user.fullName, token });
        res.json({ success: true, message: successMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Accept a valid reset token and replace the stored password hash.
export const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;
        if (!email || !token || !password) {
            return res.json({ success: false, message: "Invalid password reset request" });
        }
        if (password.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters" });
        }

        const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            passwordResetToken,
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.json({ success: false, message: "This password reset link is invalid or has expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        res.json({ success: true, message: "Password updated successfully. You can now log in." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email?.toLowerCase().trim() });
        if (!userData || !(await bcrypt.compare(password, userData.password))) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Login successful" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
