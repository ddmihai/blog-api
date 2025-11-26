"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedArticles = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const getFeaturedArticles = async (_req, res) => {
    try {
        const articles = await articles_model_1.default.find({
            isPublished: true,
            isFeatured: true,
        })
            .sort({ createdAt: -1 }) // newest featured first
            .limit(10) // adjust if you want fewer/more
            .select("title subtitle coverImage slug category createdAt author readingTime")
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
        console.error("Error fetching featured articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch featured articles",
        });
    }
};
exports.getFeaturedArticles = getFeaturedArticles;
