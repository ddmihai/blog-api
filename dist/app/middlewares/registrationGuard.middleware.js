"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRegistrationAllowed = void 0;
const permission_model_1 = __importDefault(require("../models/permission.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkRegistrationAllowed = async (req, res, next) => {
    try {
        // Admin env credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const { email, password } = req.body;
        // 🔥 ALWAYS allow admin registration regardless of settings
        if (email === adminEmail && password === adminPassword) {
            console.log("Admin registration bypass active.");
            return next();
        }
        ;
        // Fetch registration settings
        const settings = await permission_model_1.default.findOne();
        // If no settings exist → default allow
        if (!settings || settings.allowRegistration) {
            return next();
        }
        ;
        if (email && email !== adminEmail || password && password !== adminPassword) {
            return res.status(403).json({
                message: "New user registrations are currently disabled by the administrator.",
            });
        }
        // Otherwise, block normal users
        return res.status(403).json({
            message: "New user registrations are currently disabled by the administrator.",
        });
    }
    catch (err) {
        console.error("Registration settings check error:", err);
        return res.status(503).json({
            message: "Service temporarily unavailable. Please try again later.",
        });
    }
};
exports.checkRegistrationAllowed = checkRegistrationAllowed;
