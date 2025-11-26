"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const register = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        // normalize all fields to lowercase for consistency and trim spaces
        const usernameLower = username.trim().toLowerCase();
        const fullNameLower = fullName.trim().toLowerCase();
        const emailLower = email.trim().toLowerCase();
        // check if user with the same email already exists
        const existingUserEmail = await user_model_1.default.findOne({ email: emailLower });
        if (existingUserEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }
        ;
        // create new user
        await user_model_1.default.create({
            username: usernameLower,
            fullName: fullNameLower,
            email: emailLower,
            password
        });
        return res.status(201).json({ message: "User created" });
    }
    catch (err) {
        // ✅ Mongoose validation error
        if (err instanceof mongoose_1.default.Error.ValidationError) {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }
        // ✅ Duplicate email (unique index error)
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }
        console.error("Register error:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.register = register;
