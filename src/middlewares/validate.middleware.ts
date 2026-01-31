import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

export const validate = (schema: ZodObject<any> | ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues
                    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                    .join(", ");
                next(new AppError(message, 400));
            } else {
                next(error);
            }
        }
    };
