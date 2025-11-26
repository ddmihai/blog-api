"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedArticles = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const getPublishedArticles = async (_req, res) => {
    try {
        const articles = await articles_model_1.default.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .select("title subtitle coverImage slug category createdAt author readingTime isFeatured")
            .populate("author", "fullName avatar")
            .populate("category", "name")
            .lean();
        return res.status(200).json({
            ok: true,
            count: articles.length,
            articles,
        });
    }
    catch (error) {
        console.error("Error fetching published articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch published articles",
        });
    }
};
exports.getPublishedArticles = getPublishedArticles;
