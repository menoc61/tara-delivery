import { Router, Response } from "express";
import { notificationService } from "./notification.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { fcmTokenSchema, notificationFiltersSchema } from "@tara/zod-schemas";
import { sendSuccess, sendError } from "../../utils/response.utils";

const router = Router();
router.use(authenticate);

// GET /notifications - Get user notifications (paginated, with filters)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const filters = {
      type: req.query.type as string | undefined,
      isRead:
        req.query.isRead !== undefined
          ? req.query.isRead === "true"
          : undefined,
      category: req.query.category as string | undefined,
      priority: req.query.priority as string | undefined,
    };

    const result = await notificationService.getUserNotifications(
      req.user!.id,
      page,
      limit,
      filters,
    );
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch notifications", 500);
  }
});

// GET /notifications/unread-count - Get unread notification count
router.get("/unread-count", async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count });
  } catch (error: any) {
    sendError(res, error.message || "Failed to fetch unread count", 500);
  }
});

// PATCH /notifications/:id/read - Mark single notification as read
router.patch("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.id);
    sendSuccess(res, null, "Marked as read");
  } catch (error: any) {
    sendError(res, error.message || "Failed to mark as read", 500);
  }
});

// PATCH /notifications/mark-all-read - Mark all notifications as read
router.patch("/mark-all-read", async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    sendSuccess(
      res,
      { count: result.count },
      "All notifications marked as read",
    );
  } catch (error: any) {
    sendError(res, error.message || "Failed to mark all as read", 500);
  }
});

// DELETE /notifications/:id - Delete a notification (only if deletable)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user!.id);
    sendSuccess(res, null, "Notification deleted");
  } catch (error: any) {
    const status = error.message.includes("cannot be deleted") ? 403 : 500;
    sendError(res, error.message || "Failed to delete notification", status);
  }
});

// POST /notifications/subscribe - Update push subscription
router.post(
  "/subscribe",
  validate(fcmTokenSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      await notificationService.updatePushSubscription(
        req.user!.id,
        req.body.token,
      );
      sendSuccess(res, null, "Push subscription updated");
    } catch (error: any) {
      sendError(res, error.message || "Failed to update subscription", 500);
    }
  },
);

// POST /notifications/unsubscribe - Remove push subscription
router.post("/unsubscribe", async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.updatePushSubscription(req.user!.id, null);
    sendSuccess(res, null, "Push subscription removed");
  } catch (error: any) {
    sendError(res, error.message || "Failed to remove subscription", 500);
  }
});

export default router;
