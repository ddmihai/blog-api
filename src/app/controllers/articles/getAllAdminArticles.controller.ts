// GET /api/articles/admin
// Query params:
// ?page=1&limit=20
// ?published=true|false
// ?featured=true|false
// ?category=<id>
// ?q=search term
// ?sort=asc|desc

import { Request, Response } from "express"
import Article from "../../models/articles.model"

export const getAllArticlesAdmin = async (req: Request, res: Response) => {
    try {
        // pagination
        const page = parseInt(req.query.page as string, 10) || 1
        const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100)
        const skip = (page - 1) * limit

        // filters
        const query: any = {}

        // filter: published / unpublished
        if (req.query.published === "true") query.isPublished = true
        if (req.query.published === "false") query.isPublished = false

        // filter: featured
        if (req.query.featured === "true") query.isFeatured = true
        if (req.query.featured === "false") query.isFeatured = false

        // filter: category
        if (req.query.category) query.category = req.query.category

        // search
        if (req.query.q) {
            const search = String(req.query.q).trim()
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { subtitle: { $regex: search, $options: "i" } },
            ]
        }

        // sorting
        let sortOption: any = { createdAt: -1 } // default newest

        if (req.query.sort === "asc") sortOption = { createdAt: 1 }
        if (req.query.sort === "title") sortOption = { title: 1 }
        if (req.query.sort === "title-desc") sortOption = { title: -1 }

        const [articles, total] = await Promise.all([
            Article.find(query)
                .populate("category", "name")
                .populate("author", "fullName email")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Article.countDocuments(query),
        ])

        return res.status(200).json({
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: query,
        })
    } catch (err) {
        console.error("getAllArticlesAdmin error:", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
