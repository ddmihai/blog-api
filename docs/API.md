# Modern API — HTTP Reference

Base URL (development): `http://localhost:3000`

All responses are JSON. Failure responses typically follow `{ "message": string, ... }`. Errors thrown by middleware inherit status codes listed below.

---

## Global Behavior
- **Authentication:** JWT signed with `JWT_SECRET`, returned as a `token` cookie (HTTP-only, `sameSite=lax`, `secure` toggled by `NODE_ENV`). Attach `Cookie: token=<jwt>` to authenticated requests.
- **Content Type:** Controllers expect `application/json` unless noted; article creation uses `multipart/form-data`.
- **Rate Limiting:** Triggering any limiter returns `429` with `{ "message": "…", "status": 429 }`.
- **Error Middleware:** Centralized error handler is not yet wired; controllers emit status codes directly.

---

## Health

### `GET /api/health`
- **Purpose:** Heartbeat endpoint.
- **Middlewares:** none.
- **Request Body:** _None_
- **Responses:**
  | Status | Meaning |
  | --- | --- |
  | `200` | `{ status: "ok", message: "API is up and running", timestamp: ISO-8601 }`

---

## Authentication Routes

### `POST /api/auth/login`
- **Middlewares:** `authRateLimiter`
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "plaintext"
  }
  ```
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `201` | `{ "message": "Login successful" }` and `token` cookie issued (7-day expiry). |
  | `401` | `{ "message": "Invalid email or password" }` when user missing or password mismatch. |
  | `500` | `{ "message": "Server configuration error" }` if `JWT_SECRET` absent, or `{ "error": "<details>" }` on unexpected failures. |
- **Rate-limit failure:** `429` with `"Too many auth attempts..."`.

### `POST /api/auth/register`
- **Middlewares:** `authRateLimiter` → `checkRegistrationAllowed`
- **Body (JSON):**
  ```json
  {
    "username": "handle",
    "fullName": "Full Name",
    "email": "user@example.com",
    "password": "plaintext"
  }
  ```
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `201` | `{ "message": "User created" }`. |
  | `400` | `{ "message": "Validation failed", "errors": [...] }` for mongoose validation errors. |
  | `409` | `{ "message": "Email already in use" }` (pre-check) or `{ "message": "Email already exists" }` (duplicate index). |
  | `403` | `{ "message": "New user registrations are currently disabled..." }` when registration guard blocks the attempt. Admin bypass requires body credentials to match `ADMIN_EMAIL` + `ADMIN_PASSWORD`. |
  | `503` | `{ "message": "Service temporarily unavailable. Please try again later." }` when the guard cannot read settings. |
  | `429` | Too many attempts. |

### `GET /api/auth/me`
- **Middlewares:** `requireAuth`
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "user": { ...mongoose document... }, "status": 200 }`. |
  | `401` | `{ "message": "Unauthorized" }` when token missing/invalid (from middleware). |
  | `404` | `{ "message": "User not found", "status": 404 }` if controller cannot read `req.user`. |
  | `500` | `{ "message": "Internal server error" }` on unexpected issues. |

---

## Category Routes

### `POST /api/categories/create`
- **Middlewares:** `globalRateLimiter`
- **Body (JSON):**
  ```json
  {
    "name": "Frontend",
    "description": "Articles about UI engineering"
  }
  ```
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `201` | `{ "message": "Category created" }`. |
  | `400` | `{ "message": "Request body is missing" }` (empty payload). |
  | `409` | `{ "message": "Category already exists" }`. |
  | `500` | `{ "error": "<message>" }` (logged as "Create Category error"). |
  | `429` | Global limiter triggered. |

### `GET /api/categories/categories`
- **Middlewares:** _None_ (other than global app middleware).
- **Query Params:** _None_
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "categories": [ ... ] }`. |
  | `500` | `{ "error": "<message>" }` on database errors. |

> **Note:** Because this router is mounted at `/api/categories`, the final path includes a double `categories` segment (`/api/categories/categories`).

---

## Article Routes

All article endpoints are mounted under `/api/articles`. The POST route includes `/articles` twice because the router also namespaces the resource path.

### `POST /api/articles/articles`
- **Middlewares:** `requireAuth` → `requireAdmin` → `doubleClickLimiter` → `upload.fields(...)`
- **Body:** `multipart/form-data`
  - Text fields: `title` (required), `subtitle`, `content` (required), `category` (ObjectId), `tags` (string or array), `isPublished`, `isFeatured`.
  - Files: `coverImage` (max 1 file), `images` (max 10 files). Files are uploaded to Cloudinary folder `BlogAPI`; URLs stored in `article`.
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `201` | `{ "message": "Article created successfully", "article": { ... } }`. |
  | `400` | `{ "message": "Title and content are required." }` OR multer validation errors (file too large, wrong field names). |
  | `401` | `{ "message": "Not authenticated." }` if controller cannot see `req.user` (should be precluded by `requireAuth`). |
  | `403` | `{ "message": "Forbiddendd" }` when `requireAdmin` blocks non-admins. |
  | `429` | Returned by `doubleClickLimiter`. |
  | `500` | `{ "message": "Internal server error", "error": "<details>" }` for unexpected issues or Cloudinary/Mongo failures. |

### `GET /api/articles/latest`
- **Purpose:** Fetch the 10 most recent published articles.
- **Middlewares:** none (public).
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "ok": true, "count": <number>, "articles": [ ... minimal projection ... ] }`. |
  | `500` | `{ "ok": false, "message": "Failed to fetch latest articles" }`. |

### `GET /api/articles/featured`
- **Purpose:** Fetch up to 10 featured + published articles.
- **Middlewares:** none (public).
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "ok": true, "count": <number>, "articles": [ ... ] }`. |
  | `500` | `{ "ok": false, "message": "Failed to fetch featured articles" }`. |

### `GET /api/articles/published`
- **Purpose:** Fetch all published articles, newest first.
- **Middlewares:** none (public).
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "ok": true, "count": <number>, "articles": [ ... ] }`. |
  | `500` | `{ "ok": false, "message": "Failed to fetch published articles" }`. |

### `GET /api/articles/unpublished`
- **Purpose:** List unpublished drafts. Restricted to admins via router-level middleware.
- **Middlewares:** `requireAuth` → `requireAdmin`
- **Responses:**
  | Status | Body / Notes |
  | --- | --- |
  | `200` | `{ "ok": true, "count": <number>, "articles": [ ... ] }`. |
  | `401` | `{ "message": "Unauthorized" }` when auth missing (from middleware). |
  | `403` | `{ "message": "Forbiddendd" }` when user lacks admin privileges. |
  | `500` | `{ "ok": false, "message": "Failed to fetch unpublished articles" }`. |

---

## Middleware Error Reference

| Middleware | Status | Body |
| --- | --- | --- |
| `authRateLimiter` | `429` | `{ "message": "Too many auth attempts, please try again later." }` |
| `globalRateLimiter` | `429` | `{ "message": "Too many requests from this IP, please try again later." }` |
| `doubleClickLimiter` | `429` | `{ "message": "Please wait a moment before submitting again." }` |
| `requireAuth` | `401` | `{ "message": "Unauthorized" }` or `{ "message": "Invalid or expired token" }`; logs detailed error server-side. |
| `requireAdmin` | `401` / `403` | `{ "message": "Unauthorized" }` when `req.user` missing, `{ "message": "Forbiddendd" }` when role/email mismatch. |
| `checkRegistrationAllowed` | `403` / `503` | `{ "message": "New user registrations are currently disabled by the administrator." }` or service unavailable message. |
| `upload` (`multer`) | `400` | Standard multer error messages (file size exceeded, unexpected field, etc.). |

---

## Status Code Summary

| Status | Used In | Meaning |
| --- | --- | --- |
| `200` | Health, `GET /me`, `GET /categories/categories`, article listing routes | Successful read operations. |
| `201` | Login, Register, Create Category, Create Article | Resource created / action completed (login uses 201 to indicate token issued). |
| `400` | Register (validation), Create Category (missing body), Create Article (missing title/content), multer errors | Client input invalid. |
| `401` | Login (invalid credentials), `requireAuth`, create article, unpublished articles | Authentication failure. |
| `403` | Registration guard, `requireAdmin` (article creation & unpublished listing) | Authenticated but insufficient permission. |
| `404` | `GET /me` when `req.user` missing | Resource not found. |
| `409` | Register (duplicate email), Create Category (duplicate name) | Conflict with existing resource. |
| `429` | All rate limiters | Too many requests. |
| `500` | Generic controller catches, missing env secrets | Server-side failure. |
| `503` | Registration guard when Mongo unavailable | Temporary service outage. |

---

## Cookies & Headers
- `Set-Cookie: token=<jwt>; HttpOnly=<bool>; Secure=<bool>; SameSite=lax; Max-Age=604800`
- Send `Cookie: token=<jwt>` to hit protected routes.
- Enable `withCredentials` on front-end requests because CORS is configured with `credentials: true` for `http://localhost:5173`.

---

Use this reference together with `docs/README.md` to understand the workflow, responsibilities, and expectations for every endpoint and middleware.
