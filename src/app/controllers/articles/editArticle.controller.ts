// src/app/controllers/articles/editArticle.controller.ts
import { Request, Response } from "express"
import Article from "../../models/articles.model"
import { cloudinary } from "../../config/cloudinary.config"

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

interface ArticleImage {
    url: string
    publicId: string
}

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

        const normalizedTags = normalizeTags(tags)

        const published =
            typeof isPublished === "string"
                ? isPublished === "true"
                : Boolean(isPublished)

        const featured =
            typeof isFeatured === "string"
                ? isFeatured === "true"
                : Boolean(isFeatured)

        // ---- images + track which ones were removed ----
        const prevImages: ArticleImage[] = ((existing.images as any) || []).map(
            (img: any) => ({
                url: img.url,
                publicId: img.publicId || "",
            })
        )

        let nextImages: ArticleImage[] = prevImages
        let removedImages: ArticleImage[] = []

        if (Array.isArray(images)) {
            nextImages = images.map((img: any) => {
                if (typeof img === "string") {
                    return { url: img, publicId: "" }
                }
                return {
                    url: img.url,
                    publicId: img.publicId || "",
                }
            })

            // which images existed before but are not in nextImages anymore?
            removedImages = prevImages.filter(
                (oldImg) =>
                    !nextImages.some(
                        (newImg) =>
                            (newImg.publicId &&
                                newImg.publicId === oldImg.publicId) ||
                            (!newImg.publicId &&
                                !oldImg.publicId &&
                                newImg.url === oldImg.url)
                    )
            )

            const removedPublicIds = removedImages
                .map((img) => img.publicId)
                .filter(Boolean)

            if (removedPublicIds.length > 0) {
                try {
                    await cloudinary.api.delete_resources(removedPublicIds)
                } catch (cloudErr) {
                    console.error("Cloudinary delete error (update):", cloudErr)
                }
            }

            existing.images = nextImages as any
        }

        // ---- remove deleted images from HTML content too ----
        let updatedContent: string = content

        if (removedImages.length > 0) {
            for (const img of removedImages) {
                if (!img.url) continue
                // escape regex special chars in URL
                const escapedUrl = img.url.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )
                // remove any <img ... src="that-url" ...>
                const imgTagRegex = new RegExp(
                    `<img[^>]+src=["']${escapedUrl}["'][^>]*>`,
                    "g"
                )
                updatedContent = updatedContent.replace(imgTagRegex, "")
            }
        }

        // ---- coverImage optional removal ----
        if (coverImage) {
            const prevCover: any = (existing as any).coverImage
            const newCover: ArticleImage = {
                url: coverImage.url,
                publicId: coverImage.publicId,
            }

            if (
                prevCover &&
                prevCover.publicId &&
                prevCover.publicId !== newCover.publicId
            ) {
                try {
                    await cloudinary.api.delete_resources([prevCover.publicId])
                } catch (cloudErr) {
                    console.error("Cloudinary cover delete error:", cloudErr)
                }
            }

            existing.coverImage = newCover as any
        }

        // ---- apply other fields ----
        existing.title = title.trim()
        existing.subtitle = subtitle?.trim() || undefined
        existing.content = updatedContent              // ⬅ use cleaned HTML
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
