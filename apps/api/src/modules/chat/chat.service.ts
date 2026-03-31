import { prisma } from "../../config/database";
import { ConversationType, MessageType } from "@prisma/client";

export const chatService = {
  // Get or create conversation between two users
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string,
    type: ConversationType = "DELIVERY",
    orderId?: string,
  ) {
    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id, user2Id, ...(orderId ? { orderId } : {}) },
          {
            user1Id: user2Id,
            user2Id: user1Id,
            ...(orderId ? { orderId } : {}),
          },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
          type,
          orderId,
        },
        include: {
          user1: { select: { id: true, name: true, avatar: true } },
          user2: { select: { id: true, name: true, avatar: true } },
          messages: true,
        },
      });
    }

    return conversation;
  },

  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      const unreadCount =
        conv.user1Id === userId ? conv.user1Unread : conv.user2Unread;
      return {
        ...conv,
        otherUser,
        unreadCount,
        lastMessage: conv.messages[0] || null,
      };
    });
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      messages: messages.reverse(),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = "TEXT",
    options?: { imageUrl?: string; locationLat?: number; locationLng?: number },
  ) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
        imageUrl: options?.imageUrl,
        locationLat: options?.locationLat,
        locationLng: options?.locationLng,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (conversation) {
      const isUser1 = conversation.user1Id === senderId;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          user1Unread: isUser1 ? 0 : { increment: 1 },
          user2Unread: isUser1 ? { increment: 1 } : 0,
        },
      });
    }

    return message;
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return;

    // Mark all unread messages from other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Reset unread count for this user
    const isUser1 = conversation.user1Id === userId;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        user1Unread: isUser1 ? 0 : conversation.user1Unread,
        user2Unread: isUser1 ? conversation.user2Unread : 0,
      },
    });
  },

  // Get or create support conversation for customer
  async getSupportConversation(customerId: string) {
    // Find an admin to pair with the customer
    const admin = await prisma.admin.findFirst({
      include: { user: true },
    });

    if (!admin) {
      throw new Error("No admin available for support");
    }

    return this.getOrCreateConversation(customerId, admin.userId, "SUPPORT");
  },

  // Get total unread count for user
  async getTotalUnreadCount(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { user1Id: true, user1Unread: true, user2Unread: true },
    });

    return conversations.reduce((total, conv) => {
      return (
        total + (conv.user1Id === userId ? conv.user1Unread : conv.user2Unread)
      );
    }, 0);
  },
};
