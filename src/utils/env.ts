import { z } from "zod";
import logger from "./logger";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default(5000 as any),
    MONGO_URI: z.string().url(),
    JWT_SECRET: z.string().min(1),
});

export const validateEnv = () => {
    try {
        const env = envSchema.parse(process.env);
        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((err) => err.path.join(".")).join(", ");
            logger.error(`❌ Invalid environment variables: ${missingVars}`);
            process.exit(1);
        }
        throw error;
    }
};

export const env = validateEnv();
