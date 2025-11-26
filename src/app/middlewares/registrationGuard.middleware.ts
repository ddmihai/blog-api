import { Request, Response, NextFunction } from "express";
import RegistrationSettings from "../models/permission.model";
import dotenv from "dotenv";

dotenv.config();




export const checkRegistrationAllowed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admin env credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const { email, password } = req.body;

        // 🔥 ALWAYS allow admin registration regardless of settings
        if (email === adminEmail && password === adminPassword) {
            console.log("Admin registration bypass active.");
            return next();
        };

        // Fetch registration settings
        const settings = await RegistrationSettings.findOne();

        // If no settings exist → default allow
        if (!settings || settings.allowRegistration) {
            return next();
        };

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
