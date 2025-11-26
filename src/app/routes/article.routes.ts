import { Router } from "express";
import { upload } from "../middlewares/upload-cloudinary.middleware";
import { doubleClickLimiter } from "../middlewares/rateLimiter.middleware";
import { createArticle } from "../controllers/articles/createArticle.controller";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { requireAuth } from "../middlewares/requireAuth.middleware";
import { getLatestArticles } from "../controllers/articles/getLastTenArticles.controller";
import { getUnpublishedArticles } from "../controllers/articles/getUnpublishedArticles.controller";
import { getFeaturedArticles } from "../controllers/articles/getFeaturedArticles.controller";
import { getPublishedArticles } from "../controllers/articles/getAllPublishedArticles.controller";



const articleRouter = Router();


// route
articleRouter.post(
    "/articles",
    requireAuth,
    requireAdmin,
    doubleClickLimiter,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    createArticle
);


// get last 10 published articles
articleRouter.get("/latest", getLatestArticles);

// get featured articles
articleRouter.get("/featured", getFeaturedArticles);

// get all published articles
articleRouter.get("/published", getPublishedArticles);

// get all unpublished articles - admin only
articleRouter.get("/unpublished", requireAuth, requireAdmin, getUnpublishedArticles);

export default articleRouter;
