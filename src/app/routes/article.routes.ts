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
import { getArticleById } from "../controllers/articles/getArticleById.controller";
import { updateArticle } from "../controllers/articles/editArticle.controller";
import { getAllArticlesAdmin } from "../controllers/articles/getAllAdminArticles.controller";
import { deleteArticle } from "../controllers/articles/deleteArticle.controller";



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


// Update article (admin)
articleRouter.put(
    "/articles/:id",
    requireAuth,
    requireAdmin,
    updateArticle
)



// get all articles for admin use (admin use only)
articleRouter.get(
    "/articles/admin",
    requireAuth,
    requireAdmin,
    getAllArticlesAdmin
);



/* 
    get article by id
*/
articleRouter.get(
    "/articles/:id",
    getArticleById
);


/* 
    Delete article by id
*/
articleRouter.delete('/articles/:id', requireAuth, requireAdmin, deleteArticle);




export default articleRouter;
