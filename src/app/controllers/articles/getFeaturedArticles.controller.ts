// src/app/controllers/articles/getFeaturedArticles.controller.ts
import { Request, Response } from "express";
import Article from "../../models/articles.model";


export const getFeaturedArticles = async (_req: Request, res: Response) => {
    try {
        const articles = await Article.find({
            isPublished: true,
            isFeatured: true,
        })
            .sort({ createdAt: -1 })      // newest featured first
            .limit(10)                    // adjust if you want fewer/more
            .select(
                "title subtitle coverImage slug category createdAt author readingTime"
            )
            .populate("author", "fullName avatar")
            .populate("category", "name")
            .lean();

        return res.status(200).json({
            ok: true,
            count: articles.length,
            articles,
        });
    } catch (error) {
        console.error("Error fetching featured articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch featured articles",
        });
    }
};
