import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/user.model";




export const register = async (req: Request, res: Response) => {
    try {
        const { username, fullName, email, password } = req.body;


        // normalize all fields to lowercase for consistency and trim spaces
        const usernameLower = username.trim().toLowerCase();
        const fullNameLower = fullName.trim().toLowerCase();
        const emailLower = email.trim().toLowerCase();

        // check if user with the same email already exists
        const existingUserEmail = await User.findOne({ email: emailLower });

        if (existingUserEmail) {
            return res.status(409).json({ message: "Email already in use" });
        };

        // create new user
        await User.create({
            username: usernameLower,
            fullName: fullNameLower,
            email: emailLower,
            password
        });

        return res.status(201).json({ message: "User created" });
    }


    catch (err: any) {
        // ✅ Mongoose validation error
        if (err instanceof mongoose.Error.ValidationError) {
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
