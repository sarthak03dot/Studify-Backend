import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import resourceRoutes from "./routes/resource.routes";
import updateRoutes from "./routes/update.routes";
import questionRoutes from "./routes/question.routes";
import { errorHandler } from "./middlewares/error.middleware";
import logger from "./utils/logger";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Logging
app.use(
    morgan("combined", {
        stream: {
            write: (message: string) => logger.info(message.trim()),
        },
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auth Backend API - Running");
});


// Routes
import analyticsRoutes from "./routes/analytics.routes";

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
