import { rateLimit } from "express-rate-limit";

// 1. Auth endpoints – 5 requests / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: "Too many login/register attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Transaction endpoints – 100 requests / hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 100,
  message: {
    success: false,
    message: "Too many transaction requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Analytics endpoints – 50 requests / hour
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 50,
  message: {
    success: false,
    message: "Too many analytics requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
