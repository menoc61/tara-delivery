import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[source]);
      req[source] = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        res.status(422).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }
      next(err);
    }
  };
