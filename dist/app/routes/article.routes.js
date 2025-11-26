"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_cloudinary_middleware_1 = require("../middlewares/upload-cloudinary.middleware");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const createArticle_controller_1 = require("../controllers/articles/createArticle.controller");
const requireAdmin_middleware_1 = require("../middlewares/requireAdmin.middleware");
const requireAuth_middleware_1 = require("../middlewares/requireAuth.middleware");
const getLastTenArticles_controller_1 = require("../controllers/articles/getLastTenArticles.controller");
const getUnpublishedArticles_controller_1 = require("../controllers/articles/getUnpublishedArticles.controller");
const getFeaturedArticles_controller_1 = require("../controllers/articles/getFeaturedArticles.controller");
const getAllPublishedArticles_controller_1 = require("../controllers/articles/getAllPublishedArticles.controller");
const articleRouter = (0, express_1.Router)();
// route
articleRouter.post("/articles", requireAuth_middleware_1.requireAuth, requireAdmin_middleware_1.requireAdmin, rateLimiter_middleware_1.doubleClickLimiter, upload_cloudinary_middleware_1.upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), createArticle_controller_1.createArticle);
// get last 10 published articles
articleRouter.get("/latest", getLastTenArticles_controller_1.getLatestArticles);
// get featured articles
articleRouter.get("/featured", getFeaturedArticles_controller_1.getFeaturedArticles);
// get all published articles
articleRouter.get("/published", getAllPublishedArticles_controller_1.getPublishedArticles);
// get all unpublished articles - admin only
articleRouter.get("/unpublished", requireAuth_middleware_1.requireAuth, requireAdmin_middleware_1.requireAdmin, getUnpublishedArticles_controller_1.getUnpublishedArticles);
exports.default = articleRouter;
