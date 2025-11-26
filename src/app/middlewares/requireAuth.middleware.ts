// requireAuth.middleware.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";

interface DecodedToken extends JwtPayload {
    _id: string;
    email: string;
    role: "user" | "admin" | "collaborator";
}

export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

        // Find user in DB
        const existingUser = await User.findById(decoded._id);

        if (!existingUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Optional: invalidate tokens if email/role changed
        if (
            existingUser.role !== decoded.role ||
            existingUser.email !== decoded.email
        ) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Attach the user to the request
        (req as any).user = existingUser;

        return next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
