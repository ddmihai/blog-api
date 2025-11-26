import { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "API is up and running",
        timestamp: new Date().toISOString(),
    });
};
