import { rateLimit } from "express-rate-limit";

const rateLimitMessage =
  "Too many requests. Please wait a moment and try again.";

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({ success: false, message: rateLimitMessage }),
    ...options,
  });

// Broad protection for every API route.
export const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

// Sensitive endpoints have smaller, separate quotas.
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: rateLimitMessage,
});

export const verificationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 8,
});

// AI requests incur an external API cost, so keep a separate, modest quota.
export const aiLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 10,
});
