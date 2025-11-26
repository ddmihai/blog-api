"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const isAdminRole = req.user.role === "admin";
    const isEnvAdmin = process.env.ADMIN_EMAIL
        ? req.user.email === process.env.ADMIN_EMAIL
        : true; // if you don't set ADMIN_EMAIL, just rely on role
    if (!isAdminRole || !isEnvAdmin) {
        return res.status(403).json({ message: "Forbiddendd" }); // 403 = authenticated but not allowed
    }
    return next();
};
exports.requireAdmin = requireAdmin;
