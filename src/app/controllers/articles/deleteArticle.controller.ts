// src/app/controllers/articles/deleteArticle.controller.ts
import { Request, Response } from "express";
import Article from "../../models/articles.model";
import { cloudinary } from "../../config/cloudinary.config";


export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Find article
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // 2. Collect all Cloudinary publicIds
        const publicIds: string[] = [];

        // coverImage
        if (article.coverImage && (article as any).coverImage.publicId) {
            publicIds.push((article as any).coverImage.publicId);
        }

        // images array
        if (Array.isArray(article.images)) {
            for (const img of article.images as any[]) {
                if (img && img.publicId) {
                    publicIds.push(img.publicId);
                }
            }
        }

        // 3. Delete images from Cloudinary (if any)
        if (publicIds.length > 0) {
            try {
                // bulk delete
                await cloudinary.api.delete_resources(publicIds);
            } catch (cloudErr) {
                console.error("Cloudinary delete error:", cloudErr);
            }
        }

        // 4. Delete article document from Mongo
        await article.deleteOne();

        // 5. Respond
        return res.status(200).json({
            message: "Article and associated images deleted successfully",
        });
    } catch (error) {
        console.error("Delete article error:", error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
