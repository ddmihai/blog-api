import { Router } from "express";
import { globalRateLimiter } from "../middlewares/rateLimiter.middleware";
import { createCategory } from "../controllers/categories/create.controller";
import { getAllCategories } from "../controllers/categories/getAllCategories.controller";



const categoryRouter = Router();

categoryRouter.post("/create", globalRateLimiter, createCategory);
categoryRouter.get("/categories", getAllCategories);






export default categoryRouter;
