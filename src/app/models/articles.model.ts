// src/app/models/article.model.ts
import mongoose, { Document, Model } from "mongoose";
interface ArticleImage {
    url: string;
    publicId: string;
}

export interface IArticle extends Document {
    // Core content
    title: string;
    subtitle?: string;
    content: string;

    // Relations
    category?: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;

    // Metadata
    tags?: string[];
    slug?: string;
    excerpt?: string;
    coverImage?: ArticleImage;
    images?: ArticleImage[];
    readingTime?: number;
    isPublished: boolean;
    isFeatured: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface IArticleDoc extends Document {
    title: string
    // ...other fields...
    coverImage?: ArticleImage
    images: ArticleImage[]
}

const imageSchema = new mongoose.Schema<ArticleImage>(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    },
    { _id: false } // no separate _id for each image
)


// --- helpers -------------------------------------------------

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");
}

function makeExcerpt(content: string, max = 200) {
    const plain = content
        .replace(/<[^>]*>/g, "")            // strip HTML tags
        .replace(/[*_`#>\-\[\]()]/g, "")    // strip common md chars
        .trim();

    return plain.length > max
        ? plain.slice(0, max).trimEnd() + "…"
        : plain;
}

function calcReadingTime(content: string) {
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

const articleSchema = new mongoose.Schema<IArticle>(
    {
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
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

        coverImage: imageSchema,
        images: [imageSchema],

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
    },
    {
        timestamps: true, // createdAt / updatedAt
    }
);

// --- pre-save hooks ------------------------------------------

articleSchema.pre("save", async function () {
    // slug
    if (!this.slug && this.isModified("title")) {
        let base = slugify(this.title);
        if (!base) base = `article-${Date.now()}`;

        let candidate = base;
        let i = 0;

        // ensure unique slug
        while (await mongoose.models.Article.exists({ slug: candidate })) {
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

const Article: Model<IArticle> = mongoose.model<IArticle>(
    "Article",
    articleSchema
);

export default Article;
