"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticle = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const createArticle = async (req, res) => {
    try {
        const { title, subtitle, content, category, tags, isPublished, isFeatured, images, coverImage, // optional: { url, publicId } if you support it
         } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }
        if (!req.user?._id) {
            return res.status(401).json({ message: "Not authenticated." });
        }
        // ---- normalize tags ----
        let normalizedTags;
        if (Array.isArray(tags)) {
            normalizedTags = tags
                .flatMap((t) => t.split(","))
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
        }
        else if (typeof tags === "string") {
            normalizedTags = tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
        }
        const published = typeof isPublished === "string" ? isPublished === "true" : Boolean(isPublished);
        const featured = typeof isFeatured === "string" ? isFeatured === "true" : Boolean(isFeatured);
        // images from body – we expect [{ url, publicId }, ...]
        const bodyImages = Array.isArray(images) ? images : [];
        const mappedImages = bodyImages.map((img) => ({
            url: img.url,
            publicId: img.publicId,
        }));
        const articleData = {
            title: title.trim(),
            subtitle: subtitle?.trim(),
            content,
            category: category || undefined,
            author: req.user._id,
            tags: normalizedTags,
            // if your schema supports these as objects:
            ...(coverImage && { coverImage }),
            ...(mappedImages.length > 0 && { images: mappedImages }),
            isPublished: published,
            isFeatured: featured,
        };
        const article = await articles_model_1.default.create(articleData);
        return res.status(201).json({
            message: "Article created successfully",
            status: 201
        });
    }
    catch (error) {
        console.error("Create article error:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createArticle = createArticle;
