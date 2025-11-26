"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "Modern API",
        version: "1.0.0",
        description: "Comprehensive reference for the Modern API service, including middleware behavior, status codes, and data contracts.",
        contact: {
            name: "Modern API",
        },
    },
    servers: [
        {
            url: process.env.API_BASE_URL || "http://localhost:3000",
            description: "Default server",
        },
    ],
    tags: [
        { name: "Health", description: "Service heartbeat and diagnostics." },
        { name: "Auth", description: "Authentication and user identity." },
        { name: "Categories", description: "Category management endpoints." },
        { name: "Articles", description: "Article publishing endpoints." },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "token",
                description: "JWT issued by the login route and stored as an HTTP-only cookie.",
            },
        },
        schemas: {
            HealthResponse: {
                type: "object",
                properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "API is up and running" },
                    timestamp: { type: "string", format: "date-time" },
                },
            },
            User: {
                type: "object",
                properties: {
                    _id: { type: "string", example: "65f2c2431b5d8f2c4ad4e6e1" },
                    username: { type: "string" },
                    fullName: { type: "string" },
                    email: { type: "string", format: "email" },
                    avatar: { type: "string", nullable: true },
                    role: { type: "string", enum: ["user", "admin"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            Category: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            Article: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    title: { type: "string" },
                    subtitle: { type: "string", nullable: true },
                    content: { type: "string" },
                    category: { type: "string", nullable: true },
                    author: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    coverImage: { type: "string", nullable: true },
                    images: { type: "array", items: { type: "string" } },
                    readingTime: { type: "integer" },
                    isPublished: { type: "boolean" },
                    isFeatured: { type: "boolean" },
                    slug: { type: "string" },
                    excerpt: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                },
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    status: { type: "integer", nullable: true },
                    error: { type: "string", nullable: true },
                },
            },
        },
    },
    paths: {
        "/api/health": {
            get: {
                tags: ["Health"],
                summary: "Health check",
                description: "Returns API health metadata. No middleware required.",
                responses: {
                    200: {
                        description: "Service is up",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/HealthResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/api/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login (authRateLimiter)",
                description: "Authenticates a user and issues the JWT cookie. Protected by `authRateLimiter` (10 requests / 15 minutes).",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", minLength: 6 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Login successful; token cookie set",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Login successful" },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: "Invalid credentials",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    429: {
                        description: "Too many login attempts (authRateLimiter)",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Server configuration or unexpected error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register (authRateLimiter + registration guard)",
                description: "Creates a user account. Runs through `authRateLimiter` and `checkRegistrationAllowed` (admin bypass via ADMIN_EMAIL/ADMIN_PASSWORD).",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["username", "fullName", "email", "password"],
                                properties: {
                                    username: { type: "string", minLength: 3 },
                                    fullName: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", minLength: 6 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "User created",
                        content: {
                            "application/json": {
                                schema: { type: "object", properties: { message: { type: "string" } } },
                            },
                        },
                    },
                    400: {
                        description: "Mongoose validation errors",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Validation failed" },
                                        errors: {
                                            type: "array",
                                            items: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: {
                        description: "Registration disabled by administrator",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    409: {
                        description: "Email already exists",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    429: {
                        description: "Too many registration attempts",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    503: {
                        description: "Registration settings unavailable",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Unexpected server error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Get current user (requireAuth)",
                description: "Requires `requireAuth` (JWT cookie). Returns the hydrated Mongo user document.",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: {
                        description: "Authenticated user",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        user: { $ref: "#/components/schemas/User" },
                                        status: { type: "integer", example: 200 },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: "Missing / invalid token",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    404: {
                        description: "User not attached to request",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Unexpected server error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/categories/create": {
            post: {
                tags: ["Categories"],
                summary: "Create category (globalRateLimiter)",
                description: "Creates a category after normalizing the name. Rate limited by `globalRateLimiter` (100 requests / 15 minutes).",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Category created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { message: { type: "string", example: "Category created" } },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Request body missing",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    409: {
                        description: "Category already exists",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    429: {
                        description: "Global rate limiter triggered",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Unexpected server error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/categories/categories": {
            get: {
                tags: ["Categories"],
                summary: "List categories",
                description: "Fetches all categories. No authentication required.",
                responses: {
                    200: {
                        description: "List of categories",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        categories: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Category" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Unexpected server error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/articles/articles": {
            post: {
                tags: ["Articles"],
                summary: "Create article (requireAuth, requireAdmin, doubleClickLimiter, multer-cloudinary)",
                description: "Creates an article with optional images. Requires an authenticated admin, is throttled by `doubleClickLimiter` (1 request / 5 seconds), and leverages the Cloudinary upload middleware.",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["title", "content"],
                                properties: {
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    content: { type: "string" },
                                    category: { type: "string", description: "Category ObjectId" },
                                    tags: {
                                        type: "string",
                                        description: "Comma-separated tags or repeated array entries",
                                    },
                                    isPublished: { type: "string", enum: ["true", "false"] },
                                    isFeatured: { type: "string", enum: ["true", "false"] },
                                    coverImage: {
                                        type: "string",
                                        format: "binary",
                                        description: "Single cover image file",
                                    },
                                    images: {
                                        type: "array",
                                        items: { type: "string", format: "binary" },
                                        description: "Up to 10 gallery images",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Article created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Article created successfully" },
                                        article: { $ref: "#/components/schemas/Article" },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: "Title/content missing or multer validation error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    401: {
                        description: "Missing authentication",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    403: {
                        description: "Authenticated but not admin (`requireAdmin`)",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    429: {
                        description: "Double-click limiter triggered",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Unexpected server / Cloudinary error",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/articles/latest": {
            get: {
                tags: ["Articles"],
                summary: "Latest published articles",
                description: "Returns the 10 most recent published articles (public).",
                responses: {
                    200: {
                        description: "Latest articles returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        ok: { type: "boolean", example: true },
                                        count: { type: "integer", example: 10 },
                                        articles: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Article" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Failed to fetch latest articles",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/articles/featured": {
            get: {
                tags: ["Articles"],
                summary: "Featured articles",
                description: "Lists up to 10 featured + published articles (public).",
                responses: {
                    200: {
                        description: "Featured articles returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        ok: { type: "boolean", example: true },
                                        count: { type: "integer", example: 5 },
                                        articles: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Article" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Failed to fetch featured articles",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/articles/published": {
            get: {
                tags: ["Articles"],
                summary: "All published articles",
                description: "Returns all published articles sorted by creation date (public).",
                responses: {
                    200: {
                        description: "Published articles returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        ok: { type: "boolean", example: true },
                                        count: { type: "integer", example: 42 },
                                        articles: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Article" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Failed to fetch published articles",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
        "/api/articles/unpublished": {
            get: {
                tags: ["Articles"],
                summary: "Unpublished drafts (requireAuth + requireAdmin)",
                description: "Admin-only listing of unpublished articles. Requires JWT cookie and admin role.",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: {
                        description: "Draft articles returned",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        ok: { type: "boolean", example: true },
                                        count: { type: "integer", example: 3 },
                                        articles: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Article" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: "Missing or invalid token",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    403: {
                        description: "Authenticated but not admin",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                    500: {
                        description: "Failed to fetch drafts",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
                        },
                    },
                },
            },
        },
    },
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: swaggerDefinition,
    apis: [],
});
