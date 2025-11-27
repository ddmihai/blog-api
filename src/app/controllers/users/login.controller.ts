import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../../models/user.model';

dotenv.config();



export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' });
        };

        // normaize email and check if the user exists in the database
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail }).select("+password");


        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        };

        // check password mathch
        const isPasswordValid = await existingUser.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        };

        // generate auth token
        const token = jwt.sign(
            { _id: existingUser._id, email: existingUser.email, role: existingUser.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        res.cookie("token", token, {
            httpOnly: true,
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
}