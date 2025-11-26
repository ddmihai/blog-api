import { Request, Response } from "express";
import Article from "../../models/articles.model";



export const createArticle = async (req: Request, res: Response) => {
    try {
        const { title, subtitle, content, category, tags, isPublished, isFeatured } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }

        if (!(req as any).user?._id) {
            return res.status(401).json({ message: "Not authenticated." });
        }

        // ---- files from multer-cloudinary ----
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        } | undefined;



        const coverImageFile = files?.coverImage?.[0];
        const imagesFiles = files?.images || [];

        // Cloudinary stores the URL in the 'path' property
        const coverImage = coverImageFile?.path;
        const images = imagesFiles.map(f => f.path).filter(Boolean);



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

        const articleData = {
            title: title.trim(),
            subtitle: subtitle?.trim(),
            content,
            category: category || undefined,
            author: (req as any).user._id,
            tags: normalizedTags,
            ...(coverImage && { coverImage }), // Only include if exists
            ...(images.length > 0 && { images }), // Only include if exists
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
                error: error.message
            });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};