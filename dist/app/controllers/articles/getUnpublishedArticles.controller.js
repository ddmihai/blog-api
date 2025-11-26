"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnpublishedArticles = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const getUnpublishedArticles = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ ok: false, message: "Not authenticated" });
        }
        // base filter: only drafts
        const filter = {
            isPublished: false,
        };
        // if NOT admin -> only see own drafts
        if (req.user.role !== "admin") {
            filter.author = req.user._id;
        }
        const articles = await articles_model_1.default.find(filter)
            .sort({ updatedAt: -1 }) // most recently edited first
            .select("title subtitle coverImage slug category createdAt updatedAt author readingTime isFeatured")
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
        console.error("Error fetching unpublished articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch unpublished articles",
        });
    }
};
exports.getUnpublishedArticles = getUnpublishedArticles;
