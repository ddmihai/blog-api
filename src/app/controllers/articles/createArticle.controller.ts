import { Request, Response } from "express";
import Article from "../../models/articles.model";




export const createArticle = async (req: Request, res: Response) => {
    try {
        const {
            title,
            subtitle,
            content,
            category,
            tags,
            isPublished,
            isFeatured,
            images,
            coverImage, // optional: { url, publicId } if you support it
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        if (!(req as any).user?._id) {
            return res.status(401).json({ message: "Not authenticated." });
        }

        // ---- normalize tags ----
        let normalizedTags: string[] | undefined;

        if (Array.isArray(tags)) {
            normalizedTags = tags
                .flatMap((t) => t.split(","))
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
        } else if (typeof tags === "string") {
            normalizedTags = tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
        }

        const published =
            typeof isPublished === "string" ? isPublished === "true" : Boolean(isPublished);

        const featured =
            typeof isFeatured === "string" ? isFeatured === "true" : Boolean(isFeatured);

        // images from body – we expect [{ url, publicId }, ...]
        const bodyImages = Array.isArray(images) ? images : [];
        const mappedImages = bodyImages.map((img: any) => ({
            url: img.url,
            publicId: img.publicId,
        }));

        const articleData = {
            title: title.trim(),
            subtitle: subtitle?.trim(),
            content,
            category: category || undefined,
            author: (req as any).user._id,
            tags: normalizedTags,
            // if your schema supports these as objects:
            ...(coverImage && { coverImage }),
            ...(mappedImages.length > 0 && { images: mappedImages }),
            isPublished: published,
            isFeatured: featured,
        };

        const article = await Article.create(articleData);

        return res.status(201).json({
            message: "Article created successfully",
            article,
        });
    } catch (error) {
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
