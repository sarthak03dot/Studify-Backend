import mongoose from "mongoose";
import { env } from "../utils/env";
import logger from "../utils/logger";

export const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("✅ MongoDB connected");
    } catch (error) {
        logger.error("❌ MongoDB connection failed");
        process.exit(1);
    }
};
