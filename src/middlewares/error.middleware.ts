import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Standardized log
    logger.error(`[${req.method}] ${req.url} - ${statusCode} - ${message}`);
    if (statusCode === 500) {
        logger.error(err.stack);
    }

    res.status(statusCode).json({
        status: "error",
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};
