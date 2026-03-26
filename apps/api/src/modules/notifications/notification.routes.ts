import { Router, Response } from "express";
import { notificationService } from "./notification.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { fcmTokenSchema } from "@tara/zod-schemas";
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

router.post("/fcm-token", validate(fcmTokenSchema), async (req: AuthRequest, res: Response) => {
  await notificationService.updateFcmToken(req.user!.id, req.body.token);
  sendSuccess(res, null, "FCM token updated");
});

export default router;
