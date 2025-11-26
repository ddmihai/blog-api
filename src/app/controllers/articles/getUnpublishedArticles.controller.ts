// src/app/controllers/articles/getUnpublishedArticles.controller.ts
import { Request, Response } from "express";
import Article from "../../models/articles.model";


export const getUnpublishedArticles = async (req: Request, res: Response) => {
    try {
        if (!(req as any).user?._id) {
            return res.status(401).json({ ok: false, message: "Not authenticated" });
        }

        // base filter: only drafts
        const filter: Record<string, unknown> = {
            isPublished: false,
        };

        // if NOT admin -> only see own drafts
        if ((req as any).user.role !== "admin") {
            filter.author = (req as any).user._id;
        }

        const articles = await Article.find(filter)
            .sort({ updatedAt: -1 }) // most recently edited first
            .select(
                "title subtitle coverImage slug category createdAt updatedAt author readingTime isFeatured"
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
        console.error("Error fetching unpublished articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch unpublished articles",
        });
    }
};
