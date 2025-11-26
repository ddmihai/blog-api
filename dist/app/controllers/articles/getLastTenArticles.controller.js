"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestArticles = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const getLatestArticles = async (_req, res) => {
    try {
        const articles = await articles_model_1.default.find({ isPublished: true })
            .sort({ createdAt: -1 }) // newest first
            .limit(10)
            .select("title subtitle coverImage category createdAt author") // only needed fields
            .populate("author", "fullName avatar") // return minimal safe author data
            .populate("category", "name") // just the name of category
            .lean(); // faster, plain JS objects
        return res.status(200).json({
            ok: true,
            count: articles.length,
            articles,
        });
    }
    catch (error) {
        console.error("Error fetching latest articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch latest articles",
        });
    }
};
exports.getLatestArticles = getLatestArticles;
