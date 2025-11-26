// src/app/controllers/articles/getPublishedArticles.controller.ts
import { Request, Response } from "express";
import Article from "../../models/articles.model";


export const getPublishedArticles = async (_req: Request, res: Response) => {
    try {
        const articles = await Article.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .select(
                "title subtitle coverImage slug category createdAt author readingTime isFeatured"
            )
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
