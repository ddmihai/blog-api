import { Request, Response, Router } from "express";
import { healthCheck } from "../controllers/health.controller";



const router = Router();

router.get("/health", healthCheck);

// 404 route
router.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

export default router;
