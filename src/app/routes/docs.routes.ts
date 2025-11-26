import { Router } from "express";
import path from "path";
import { promises as fs } from "fs";
import { marked } from "marked";

const docsRouter = Router();

const DOCS_DIR = path.resolve(process.cwd(), "docs");

async function renderMarkdownFile(fileName: string) {
    const filePath = path.join(DOCS_DIR, fileName);
    const markdown = await fs.readFile(filePath, "utf-8");
    return marked.parse(markdown);
}

function layoutTemplate(title: string, body: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem auto; max-width: 900px; line-height: 1.6; color: #1f2a37; padding: 0 1rem; }
    nav { margin-bottom: 2rem; display: flex; gap: 1rem; }
    nav a { color: #2563eb; text-decoration: none; font-weight: 600; }
    nav a:hover { text-decoration: underline; }
    pre { background: #111827; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
    th { background: #f9fafb; }
</style>
</head>
<body>
    <nav>
        <a href="/project-docs">Project Handbook</a>
        <a href="/project-docs/api">API Reference</a>
        <a href="/docs">Swagger UI</a>
    </nav>
    ${body}
</body>
</html>`;
}

docsRouter.get("/", async (_req, res) => {
    try {
        const html = await renderMarkdownFile("README.md");
        res.send(layoutTemplate("Project Handbook", html));
    } catch (error) {
        console.error("Error rendering README.md:", error);
        res.status(500).json({ message: "Failed to render documentation" });
    }
});

docsRouter.get("/api", async (_req, res) => {
    try {
        const html = await renderMarkdownFile("API.md");
        res.send(layoutTemplate("API Reference", html));
    } catch (error) {
        console.error("Error rendering API.md:", error);
        res.status(500).json({ message: "Failed to render documentation" });
    }
});

export default docsRouter;
