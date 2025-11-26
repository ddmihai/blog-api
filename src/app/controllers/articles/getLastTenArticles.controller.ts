import { Request, Response } from "express";
import Article from "../../models/articles.model";


export const getLatestArticles = async (_req: Request, res: Response) => {
    try {
        const articles = await Article.find({ isPublished: true })
            .sort({ createdAt: -1 })  // newest first
            .limit(10)
            .select("title subtitle coverImage category createdAt author") // only needed fields
            .populate("author", "fullName avatar")   // return minimal safe author data
            .populate("category", "name")            // just the name of category
            .lean();                                 // faster, plain JS objects

        return res.status(200).json({
            ok: true,
            count: articles.length,
            articles,
        });

    } catch (error) {
        console.error("Error fetching latest articles:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to fetch latest articles",
        });
    }
};
