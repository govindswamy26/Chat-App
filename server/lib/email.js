import nodemailer from "nodemailer";

const getTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error("Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
};

export const sendVerificationEmail = async ({ email, fullName, token }) => {
    // Vite uses this address locally; set CLIENT_URL to the deployed frontend URL in production.
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl.replace(/\/$/, "")}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Verify your Chat App email",
        text: `Hi ${fullName}, verify your email by opening this link: ${verificationUrl}. This link expires in 15 minutes.`,
        html: `<p>Hi ${fullName},</p><p>Click below to verify your email and create your account.</p><p><a href="${verificationUrl}">Verify email</a></p><p>This link expires in 15 minutes.</p>`,
    });
};

export const sendPasswordResetEmail = async ({ email, fullName, token }) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Reset your Chat App password",
        text: `Hi ${fullName}, reset your password by opening this link: ${resetUrl}. This link expires in 15 minutes.`,
        html: `<p>Hi ${fullName},</p><p>Click below to choose a new Chat App password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes.</p>`,
    });
};
