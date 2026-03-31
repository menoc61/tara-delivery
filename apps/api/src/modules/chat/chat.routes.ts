import { Router, Response } from "express";
import { chatService } from "./chat.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendError } from "../../utils/response.utils";

const router = Router();
router.use(authenticate);

// GET /api/chat/conversations - Get all conversations for current user
router.get("/conversations", async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await chatService.getUserConversations(req.user!.id);
    sendSuccess(res, conversations);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// GET /api/chat/support - Get or create support conversation
router.get("/support", async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await chatService.getSupportConversation(req.user!.id);
    sendSuccess(res, conversation);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// GET /api/chat/conversations/:id/messages - Get messages for a conversation
router.get(
  "/conversations/:id/messages",
  async (req: AuthRequest, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = await chatService.getMessages(req.params.id, page, limit);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  },
);

// POST /api/chat/conversations/:id/messages - Send a message
router.post(
  "/conversations/:id/messages",
  async (req: AuthRequest, res: Response) => {
    try {
      const { content, type, imageUrl, locationLat, locationLng } = req.body;
      const message = await chatService.sendMessage(
        req.params.id,
        req.user!.id,
        content,
        type || "TEXT",
        { imageUrl, locationLat, locationLng },
      );
      sendSuccess(res, message, "Message sent");
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  },
);

// PATCH /api/chat/conversations/:id/read - Mark conversation as read
router.patch(
  "/conversations/:id/read",
  async (req: AuthRequest, res: Response) => {
    try {
      await chatService.markAsRead(req.params.id, req.user!.id);
      sendSuccess(res, null, "Marked as read");
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  },
);

// GET /api/chat/unread - Get total unread count
router.get("/unread", async (req: AuthRequest, res: Response) => {
  try {
    const count = await chatService.getTotalUnreadCount(req.user!.id);
    sendSuccess(res, { count });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// POST /api/chat/conversations/rider/:orderId - Get/create rider conversation for order
router.post(
  "/conversations/rider/:orderId",
  async (req: AuthRequest, res: Response) => {
    try {
      const { prisma } = require("../../config/database");
      const order = await prisma.order.findUnique({
        where: { id: req.params.orderId },
        include: { rider: true },
      });

      if (!order || !order.rider) {
        return sendError(res, "No rider assigned to this order", 404);
      }

      const conversation = await chatService.getOrCreateConversation(
        req.user!.id,
        order.rider.userId,
        "DELIVERY",
        order.id,
      );

      sendSuccess(res, conversation);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  },
);

export default router;
