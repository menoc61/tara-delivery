import { Router, Request, Response } from "express";
import { paymentService } from "./payment.service";
import { logger } from "../../config/logger";
import crypto from "crypto";

const router = Router();

// ── MTN MoMo Webhook ────────────────────────────────────────
router.post("/momo", async (req: Request, res: Response) => {
  // Always respond 200 immediately — MoMo retries if it doesn't get 200
  res.status(200).json({ received: true });

  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    logger.info("MoMo webhook received:", { externalId: data.externalId, status: data.status });
    await paymentService.handleMomoWebhook(data);
  } catch (err) {
    logger.error("MoMo webhook processing error:", err);
  }
});

// ── Orange Money Webhook ────────────────────────────────────
router.post("/orange", async (req: Request, res: Response) => {
  // Orange Money expects 200 OK
  res.status(200).json({ received: true });

  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    
    // Validate notif_token if configured (optional but recommended)
    if (process.env.ORANGE_NOTIF_TOKEN && data.notif_token) {
      const expected = crypto
        .createHmac("sha256", process.env.ORANGE_NOTIF_TOKEN)
        .update(data.order_id)
        .digest("hex");
      if (expected !== data.notif_token) {
        logger.warn("Orange webhook: invalid notif_token, ignoring");
        return;
      }
    }

    logger.info("Orange webhook received:", { order_id: data.order_id, status: data.status });
    await paymentService.handleOrangeWebhook(data);
  } catch (err) {
    logger.error("Orange webhook processing error:", err);
  }
});

export default router;
