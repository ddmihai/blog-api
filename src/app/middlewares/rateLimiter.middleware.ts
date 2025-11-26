import rateLimit from "express-rate-limit";

// 🔐 Auth-related limiter (login/register)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                  // limit each IP to 10 requests per window
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
    message: {
        message: "Too many auth attempts, please try again later.",
    },
});

// 🧾 Generic global limiter (optional, for all routes)
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});

// 🖱️ “Double click” limiter – 1 request / 5s per IP+route
export const doubleClickLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Please wait a moment before submitting again.",
    },
});
