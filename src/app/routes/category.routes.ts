import { Router } from "express";
import { globalRateLimiter } from "../middlewares/rateLimiter.middleware";
import { createCategory } from "../controllers/categories/create.controller";
import { getAllCategories } from "../controllers/categories/getAllCategories.controller";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { updateCategory } from "../controllers/categories/editCategory.controller";



const categoryRouter = Router();

categoryRouter.post("/create", globalRateLimiter, createCategory);
categoryRouter.get("/categories", getAllCategories);

// edit category
categoryRouter.put("/categories/:id", globalRateLimiter, requireAuth, requireAdmin, updateCategory);




export default categoryRouter;
