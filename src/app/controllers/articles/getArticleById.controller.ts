import { Request, Response } from "express"
import Article from "../../models/articles.model"


// GET /api/articles/articles/:id
export const getArticleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const article = await Article.findById(id)
            .populate("category") // if category is a ref; remove if not
            .populate("author", "fullName email") // optional

        if (!article) {
            return res.status(404).json({ message: "Article not found" })
        }

        return res.status(200).json({ article })
    } catch (error) {
        console.error("Get article error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
