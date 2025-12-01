import { Request, Response } from "express"
import Article from "../../models/articles.model"

// helper to normalize tags (same logic as createArticle)
const normalizeTags = (tags: any): string[] | undefined => {
    if (Array.isArray(tags)) {
        return tags
            .flatMap((t) => String(t).split(","))
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
    } else if (typeof tags === "string") {
        return tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
    }
    return undefined
}

// PUT /api/articles/articles/:id
export const updateArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const existing = await Article.findById(id)
        if (!existing) {
            return res.status(404).json({ message: "Article not found" })
        }

        const {
            title,
            subtitle,
            content,
            category,
            tags,
            isPublished,
            isFeatured,
            images,
            coverImage,
            slug,
            excerpt,
            readingTime,
        } = req.body

        if (!title || !content) {
            return res
                .status(400)
                .json({ message: "Title and content are required." })
        }

        // ---- tags ----
        const normalizedTags = normalizeTags(tags)

        // ---- published / featured ----
        const published =
            typeof isPublished === "string"
                ? isPublished === "true"
                : Boolean(isPublished)


        const featured =
            typeof isFeatured === "string"
                ? isFeatured === "true"
                : Boolean(isFeatured)

        // ---- images: store ONLY URLs (string[]) ----
        // handle cases:
        // - images: string[]
        // - images: { url: string; publicId?: string }[]
        // ---- images: store full objects { url, publicId }[] ----
        if (Array.isArray(images)) {
            existing.images = images.map((img: any) => ({
                url: typeof img === "string" ? img : img.url,
                publicId:
                    typeof img === "string"
                        ? ""                     // or derive from URL if you want
                        : img.publicId || "",
            }))
        }


        // ---- apply changes ----
        existing.title = title.trim()
        existing.subtitle = subtitle?.trim() || undefined
        existing.content = content
        existing.category = category || undefined
        existing.tags = normalizedTags
        existing.isPublished = published
        existing.isFeatured = featured
        existing.slug = slug || existing.slug
        existing.excerpt = excerpt || existing.excerpt

        if (typeof readingTime !== "undefined") {
            existing.readingTime = readingTime
        }

        await existing.save()

        return res.status(200).json({
            message: "Article updated successfully",
            article: existing,
        })
    } catch (error) {
        console.error("Update article error:", error)
        if (error instanceof Error) {
            return res.status(500).json({
                message: "Internal server error",
                error: error.message,
            })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
