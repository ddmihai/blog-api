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
import { uploadSingleImage } from "../controllers/articles/uploadSingleImage.controller";



const articleRouter = Router();


// route
articleRouter.post(
    "/articles",
    requireAuth,
    requireAdmin,
    doubleClickLimiter,
    createArticle
);


// get last 10 published articlessss
articleRouter.get("/latest", getLatestArticles);

// get featured articles
articleRouter.get("/featured", getFeaturedArticles);

// get all published articles
articleRouter.get("/published", getPublishedArticles);

// get all unpublished articles - admin only
articleRouter.get("/unpublished", requireAuth, requireAdmin, getUnpublishedArticles);


// single image upload route for articles - admin only
articleRouter.post('/image',
    requireAuth,
    requireAdmin,
    doubleClickLimiter,
    upload.single('image'),
    uploadSingleImage
);


export default articleRouter;
