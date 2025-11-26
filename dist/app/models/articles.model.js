"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app/models/article.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
// --- helpers -------------------------------------------------
function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");
}
function makeExcerpt(content, max = 200) {
    const plain = content
        .replace(/<[^>]*>/g, "") // strip HTML tags
        .replace(/[*_`#>\-\[\]()]/g, "") // strip common md chars
        .trim();
    return plain.length > max
        ? plain.slice(0, max).trimEnd() + "…"
        : plain;
}
function calcReadingTime(content) {
    // ~200 words per minute
    const plain = content
        .replace(/<[^>]*>/g, "")
        .replace(/[*_`#>\-\[\]()]/g, "")
        .trim();
    const words = plain.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return minutes;
}
// --- schema --------------------------------------------------
const articleSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    subtitle: {
        type: String,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    excerpt: {
        type: String,
        trim: true,
    },
    coverImage: {
        type: String,
        trim: true,
    },
    images: [
        {
            type: String,
            trim: true,
        },
    ],
    readingTime: {
        type: Number,
        min: 1,
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true, // createdAt / updatedAt
});
// --- pre-save hooks ------------------------------------------
articleSchema.pre("save", async function () {
    // slug
    if (!this.slug && this.isModified("title")) {
        let base = slugify(this.title);
        if (!base)
            base = `article-${Date.now()}`;
        let candidate = base;
        let i = 0;
        // ensure unique slug
        while (await mongoose_1.default.models.Article.exists({ slug: candidate })) {
            i += 1;
            candidate = `${base}-${i}`;
        }
        this.slug = candidate;
    }
    // excerpt
    if (!this.excerpt && this.isModified("content")) {
        this.excerpt = makeExcerpt(this.content);
    }
    // reading time
    if (this.isModified("content")) {
        this.readingTime = calcReadingTime(this.content);
    }
});
const Article = mongoose_1.default.model("Article", articleSchema);
exports.default = Article;
