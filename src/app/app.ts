import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/auth.routes";
import categoryRouter from "./routes/category.routes";
import articleRouter from "./routes/article.routes";
import docsRouter from "./routes/docs.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";


const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Modern API Docs",
}));
app.use("/project-docs", docsRouter);


// Routes
app.use('/api/auth', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/articles', articleRouter);



// Root route (move outside of /api router)
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to the Blog API",
        endpoints: {
            docs: "/docs",
            api: "/api",
            health: "/api/health"
        }
    });
});

// 404 catch-all (MUST be last, after all other routes)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: "Route not found",
        path: req.path
    });
});



// ✅ use ES export:
export default app;
