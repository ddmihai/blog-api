"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
// requireAuth.middleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set");
            return res.status(500).json({ message: "Server configuration error" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find user in DB
        const existingUser = await user_model_1.default.findById(decoded._id);
        if (!existingUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Optional: invalidate tokens if email/role changed
        if (existingUser.role !== decoded.role ||
            existingUser.email !== decoded.email) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Attach the user to the request
        req.user = existingUser;
        return next();
    }
    catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
