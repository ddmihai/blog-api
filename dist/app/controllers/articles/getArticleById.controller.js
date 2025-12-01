"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticleById = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
// GET /api/articles/articles/:id
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await articles_model_1.default.findById(id)
            .populate("category") // if category is a ref; remove if not
            .populate("author", "fullName email"); // optional
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        return res.status(200).json({ article });
    }
    catch (error) {
        console.error("Get article error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getArticleById = getArticleById;
