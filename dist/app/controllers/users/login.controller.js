"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../../models/user.model"));
dotenv_1.default.config();
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' });
        }
        ;
        // normaize email and check if the user exists in the database
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await user_model_1.default.findOne({ email: normalizedEmail }).select("+password");
        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        ;
        // check password mathch
        const isPasswordValid = await existingUser.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        ;
        // generate auth token
        const token = jsonwebtoken_1.default.sign({ _id: existingUser._id, email: existingUser.email, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV === "production",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(201).json({ message: 'Login successful' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('Login error:', error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
