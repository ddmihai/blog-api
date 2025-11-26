// requireAdmin.middleware.ts
import { Response, NextFunction, Request } from "express";



export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdminRole = (req as any).user.role === "admin";
    const isEnvAdmin = process.env.ADMIN_EMAIL
        ? (req as any).user.email === process.env.ADMIN_EMAIL
        : true; // if you don't set ADMIN_EMAIL, just rely on role

    if (!isAdminRole || !isEnvAdmin) {
        return res.status(403).json({ message: "Forbiddendd" }); // 403 = authenticated but not allowed
    }

    return next();
};
