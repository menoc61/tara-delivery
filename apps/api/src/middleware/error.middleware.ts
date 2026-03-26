import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
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

  // Our custom errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as { code?: string; meta?: { field_name?: string } };
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        success: false,
        message: `Duplicate value for field: ${prismaErr.meta?.field_name || "unknown"}`,
        code: "DUPLICATE",
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired" });
    return;
  }

  // Unknown errors
  logger.error("Unhandled error:", { message: err.message, stack: err.stack, url: req.url });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
};
