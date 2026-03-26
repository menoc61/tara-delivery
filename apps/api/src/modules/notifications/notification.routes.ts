import { Router, Response } from "express";
import { notificationService } from "./notification.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess } from "../../utils/response.utils";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await notificationService.getUserNotifications(req.user!.id, page, limit);
  sendSuccess(res, result);
});

router.get("/unread-count", async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, { count });
});

router.patch("/:id/read", async (req: AuthRequest, res: Response) => {
  await notificationService.markAsRead(req.params.id, req.user!.id);
  sendSuccess(res, null, "Marked as read");
});

router.patch("/mark-all-read", async (req: AuthRequest, res: Response) => {
  await notificationService.markAllAsRead(req.user!.id);
  sendSuccess(res, null, "All notifications marked as read");
});

// Replaces FCM token with Web Push subscription
router.post("/subscribe", async (req: AuthRequest, res: Response) => {
  await notificationService.updatePushSubscription(req.user!.id, JSON.stringify(req.body));
  sendSuccess(res, null, "Push subscription updated");
});

router.post("/unsubscribe", async (req: AuthRequest, res: Response) => {
  await notificationService.unsubscribePush(req.user!.id, req.body.endpoint);
  sendSuccess(res, null, "Push subscription removed");
});

export default router;
