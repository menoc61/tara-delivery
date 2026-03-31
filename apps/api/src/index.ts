import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notfound.middleware";
import { prisma } from "./config/database";
import { logger } from "./config/logger";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import orderRoutes from "./modules/orders/order.routes";
import riderRoutes from "./modules/riders/rider.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import adminRoutes from "./modules/admin/admin.routes";
import webhookRoutes from "./modules/payments/webhook.routes";
import chatRoutes from "./modules/chat/chat.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security Middleware ───────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: "Trop de requêtes. Veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased from 10 to 100 for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error:
      "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
});

app.use(limiter);
app.use(compression());

// ── Body Parsing ──────────────────────────────────────────
// Webhooks need raw body
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );
}

// ── Health Check ──────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "TARA Delivery API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// ── API Routes ────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/riders", riderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/chat", chatRoutes);

// ── Error Handlers ────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`🚀 TARA Delivery API running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
