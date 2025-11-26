import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./routes/index.routes";
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
app.use("/api", router);



// ✅ use ES export:
export default app;
