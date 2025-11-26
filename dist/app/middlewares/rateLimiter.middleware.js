"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleClickLimiter = exports.globalRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 🔐 Auth-related limiter (login/register)
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: "Too many auth attempts, please try again later.",
    },
});
// 🧾 Generic global limiter (optional, for all routes)
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests from this IP, please try again later.",
    },
});
// 🖱️ “Double click” limiter – 1 request / 5s per IP+route
exports.doubleClickLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 1000, // 5 seconds
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Please wait a moment before submitting again.",
    },
});
