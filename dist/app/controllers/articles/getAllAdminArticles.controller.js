"use strict";
// GET /api/articles/admin
// Query params:
// ?page=1&limit=20
// ?published=true|false
// ?featured=true|false
// ?category=<id>
// ?q=search term
// ?sort=asc|desc
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllArticlesAdmin = void 0;
const articles_model_1 = __importDefault(require("../../models/articles.model"));
const getAllArticlesAdmin = async (req, res) => {
    try {
        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const skip = (page - 1) * limit;
        // filters
        const query = {};
        // filter: published / unpublished
        if (req.query.published === "true")
            query.isPublished = true;
        if (req.query.published === "false")
            query.isPublished = false;
        // filter: featured
        if (req.query.featured === "true")
            query.isFeatured = true;
        if (req.query.featured === "false")
            query.isFeatured = false;
        // filter: category
        if (req.query.category)
            query.category = req.query.category;
        // search
        if (req.query.q) {
            const search = String(req.query.q).trim();
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { subtitle: { $regex: search, $options: "i" } },
            ];
        }
        // sorting
        let sortOption = { createdAt: -1 }; // default newest
        if (req.query.sort === "asc")
            sortOption = { createdAt: 1 };
        if (req.query.sort === "title")
            sortOption = { title: 1 };
        if (req.query.sort === "title-desc")
            sortOption = { title: -1 };
        const [articles, total] = await Promise.all([
            articles_model_1.default.find(query)
                .populate("category", "name")
                .populate("author", "fullName email")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            articles_model_1.default.countDocuments(query),
        ]);
        return res.status(200).json({
            articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: query,
        });
    }
    catch (err) {
        console.error("getAllArticlesAdmin error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllArticlesAdmin = getAllArticlesAdmin;
