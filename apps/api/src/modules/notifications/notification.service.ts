import { prisma } from "../../config/database";
import { sendPushNotification } from "../../config/web-push";
import { emailService } from "./email.service";
import { logger } from "../../config/logger";
import {
  NotificationType,
  OrderStatus,
  NotificationPriority,
} from "@tara/types";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType | string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority | string;
  imageUrl?: string | null;
  actionUrl?: string | null;
  category?: string | null;
  expiresAt?: Date | null;
  isDeletable?: boolean;
}

export const notificationService = {
  // ── CRUD Operations ─────────────────────────────────────

  async create(input: CreateNotificationInput) {
    const { isDeletable, ...data } = input;
    return prisma.notification.create({
      data: {
        ...data,
        isDeletable: isDeletable ?? true,
        priority:
          (data.priority as NotificationPriority) ||
          NotificationPriority.NORMAL,
      },
    });
  },

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 10,
    filters?: {
      type?: string;
      isRead?: boolean;
      category?: string;
      priority?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Record<string, unknown> = {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };

    if (filters?.type) where.type = filters.type;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      this.getUnreadCount(userId),
    ]);

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total,
      },
      unreadCount,
    };
  },

  async getUnreadCount(userId: string) {
    const now = new Date();
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
  },

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (!notification.isDeletable) {
      throw new Error("This notification cannot be deleted");
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  // ── Push Notification Sending ───────────────────────────

  async sendToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      type: NotificationType | string;
      data?: Record<string, unknown>;
      priority?: NotificationPriority | string;
      imageUrl?: string | null;
      actionUrl?: string | null;
      category?: string | null;
      expiresAt?: Date | null;
      isDeletable?: boolean;
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    // Save in DB
    const created = await this.create({ userId, ...notification });

    // Send push if subscription exists
    if (user?.pushSubscription) {
      try {
        const subscription = JSON.parse(user.pushSubscription);
        await sendPushNotification(subscription, {
          title: notification.title,
          body: notification.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          tag: `${notification.type}-${created.id}`,
          data: {
            notificationId: created.id,
            type: notification.type,
            ...notification.data,
          },
          requireInteraction: notification.priority === "HIGH",
        });
      } catch (err) {
        logger.warn("Web Push notification failed:", err);
      }
    }

    return created;
  },

  async sendToUsers(
    userIds: string[],
    notification: {
      title: string;
      body: string;
      type: NotificationType | string;
      data?: Record<string, unknown>;
      priority?: NotificationPriority | string;
      imageUrl?: string | null;
      actionUrl?: string | null;
      category?: string | null;
      expiresAt?: Date | null;
      isDeletable?: boolean;
    },
  ) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendToUser(userId, notification)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logger.info(
      `Bulk notification sent: ${successful} successful, ${failed} failed`,
    );
    return { successful, failed, total: userIds.length };
  },

  // ── Order Status Notifications ──────────────────────────

  async notifyOrderStatusChange(
    order: {
      id: string;
      userId: string;
      orderNumber?: string;
      riderId?: string | null;
      user?: { email: string; name: string } | null;
    },
    newStatus: OrderStatus,
  ) {
    const messages: Partial<
      Record<OrderStatus, { title: string; body: string; category: string }>
    > = {
      [OrderStatus.CONFIRMED]: {
        title: "Commande confirmée",
        body: `Votre commande ${order.orderNumber || ""} est confirmée et en cours d'attribution.`,
        category: "orders",
      },
      [OrderStatus.ASSIGNED]: {
        title: "Livreur assigné",
        body: `Un livreur a été assigné à votre commande ${order.orderNumber || ""}.`,
        category: "orders",
      },
      [OrderStatus.PICKED_UP]: {
        title: "Colis récupéré",
        body: `Votre colis pour la commande ${order.orderNumber || ""} a été récupéré par le livreur.`,
        category: "orders",
      },
      [OrderStatus.IN_TRANSIT]: {
        title: "En route!",
        body: `Votre livraison ${order.orderNumber || ""} est en route.`,
        category: "orders",
        // actionUrl: `/customer/orders/track?orderId=${order.id}`,
      },
      [OrderStatus.DELIVERED]: {
        title: "Livré!",
        body: `Votre commande ${order.orderNumber || ""} a été livrée avec succès.`,
        category: "orders",
      },
      [OrderStatus.CANCELLED]: {
        title: "Commande annulée",
        body: `Votre commande ${order.orderNumber || ""} a été annulée.`,
        category: "orders",
      },
      [OrderStatus.FAILED]: {
        title: "Échec de livraison",
        body: `La livraison de la commande ${order.orderNumber || ""} a échoué.`,
        category: "orders",
      },
    };

    const msg = messages[newStatus];
    if (msg) {
      await this.sendToUser(order.userId, {
        ...msg,
        type: `ORDER_${newStatus}` as NotificationType,
        data: { orderId: order.id },
        priority:
          newStatus === OrderStatus.DELIVERED
            ? NotificationPriority.HIGH
            : NotificationPriority.NORMAL,
        actionUrl: `/customer/orders/${order.id}`,
      }).catch(() => {});
    }

    // Email for delivered
    if (newStatus === OrderStatus.DELIVERED && order.user) {
      emailService
        .sendOrderDelivered(
          order.user.email,
          order.user.name,
          order.orderNumber || order.id,
        )
        .catch(() => {});

      // Rating reminder after 30 minutes
      setTimeout(
        async () => {
          await this.sendToUser(order.userId, {
            title: "Évaluez votre livraison",
            body: `Comment s'est passée votre livraison ${order.orderNumber || ""}? Votre avis nous aide à améliorer le service.`,
            type: NotificationType.RATING_REMINDER,
            data: { orderId: order.id },
            category: "orders",
            priority: NotificationPriority.LOW,
            actionUrl: `/customer/orders/${order.id}?tab=rating`,
            isDeletable: true,
          }).catch(() => {});
        },
        30 * 60 * 1000,
      ); // 30 minutes
    }
  },

  async notifyAdminsNewOrder(order: {
    id: string;
    orderNumber: string;
    type: string;
  }) {
    const admins = await prisma.admin.findMany({ include: { user: true } });
    await Promise.allSettled(
      admins.map((admin) =>
        this.sendToUser(admin.userId, {
          title: "Nouvelle commande",
          body: `Commande ${order.orderNumber} (${order.type}) en attente de confirmation.`,
          type: NotificationType.ORDER_CREATED,
          data: { orderId: order.id },
          category: "admin",
          priority: NotificationPriority.HIGH,
          actionUrl: `/admin/orders/${order.id}`,
          isDeletable: true,
        }),
      ),
    );
  },

  async notifyRiderAssigned(order: {
    id: string;
    orderNumber?: string;
    rider?: {
      userId: string;
      user?: { email: string; name: string } | null;
    } | null;
  }) {
    if (!order.rider) return;
    await this.sendToUser(order.rider.userId, {
      title: "Nouvelle livraison assignée",
      body: `La commande ${order.orderNumber || order.id} vous a été assignée.`,
      type: NotificationType.RIDER_ASSIGNED,
      data: { orderId: order.id },
      category: "orders",
      priority: NotificationPriority.HIGH,
      actionUrl: `/rider/orders/${order.id}`,
      isDeletable: true,
    }).catch(() => {});

    if (order.rider.user) {
      emailService
        .sendRiderNewOrderAlert(
          order.rider.user.email,
          order.rider.user.name,
          order.orderNumber || order.id,
        )
        .catch(() => {});
    }
  },

  async notifyPaymentSuccess(order: {
    id: string;
    userId: string;
    orderNumber: string;
    totalAmount: number;
    user?: { email: string; name: string } | null;
  }) {
    await this.sendToUser(order.userId, {
      title: "Paiement confirmé",
      body: `Paiement de ${order.totalAmount.toLocaleString()} XAF reçu pour la commande ${order.orderNumber}.`,
      type: NotificationType.PAYMENT_SUCCESS,
      data: { orderId: order.id },
      category: "payments",
      priority: NotificationPriority.NORMAL,
      actionUrl: `/customer/orders/${order.id}`,
      isDeletable: true,
    }).catch(() => {});
  },

  async notifyPaymentFailed(order: {
    id: string;
    userId: string;
    orderNumber: string;
  }) {
    await this.sendToUser(order.userId, {
      title: "Échec du paiement",
      body: `Le paiement pour la commande ${order.orderNumber} a échoué. Veuillez réessayer.`,
      type: NotificationType.PAYMENT_FAILED,
      data: { orderId: order.id },
      category: "payments",
      priority: NotificationPriority.HIGH,
      actionUrl: `/customer/orders/${order.id}`,
      isDeletable: true,
    }).catch(() => {});
  },

  // ── User Event Notifications ────────────────────────────

  async notifyWelcome(userId: string, userName: string) {
    await this.sendToUser(userId, {
      title: "Bienvenue sur TARA DELIVERY!",
      body: `Bonjour ${userName}! Bienvenue sur la plateforme de livraison la plus fiable de Yaoundé. Créez votre première livraison et profitez de nos services.`,
      type: NotificationType.WELCOME,
      category: "system",
      priority: NotificationPriority.NORMAL,
      actionUrl: "/customer/new-order",
      isDeletable: true,
    }).catch(() => {});
  },

  // ── Promotion Notifications ─────────────────────────────

  async notifyPromotion(
    userIds: string[],
    promotion: {
      title: string;
      body: string;
      imageUrl?: string;
      actionUrl?: string;
      expiresAt?: Date;
    },
  ) {
    return this.sendToUsers(userIds, {
      title: promotion.title,
      body: promotion.body,
      type: NotificationType.PROMOTION,
      category: "promotions",
      priority: NotificationPriority.LOW,
      imageUrl: promotion.imageUrl,
      actionUrl: promotion.actionUrl,
      expiresAt: promotion.expiresAt,
      isDeletable: true,
    });
  },

  // ── Chat Notifications ──────────────────────────────────

  async notifyChatMessage(data: {
    userId: string;
    conversationId: string;
    senderName: string;
    messagePreview: string;
    senderAvatar?: string;
  }) {
    await this.sendToUser(data.userId, {
      title: `Nouveau message de ${data.senderName}`,
      body:
        data.messagePreview.length > 100
          ? data.messagePreview.substring(0, 100) + "..."
          : data.messagePreview,
      type: NotificationType.CHAT_MESSAGE,
      data: {
        conversationId: data.conversationId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
      },
      category: "chat",
      priority: NotificationPriority.NORMAL,
      imageUrl: data.senderAvatar,
      actionUrl: `/customer/messages/${data.conversationId}`,
      isDeletable: true,
    }).catch(() => {});
  },

  // ── Admin/System Notifications ──────────────────────────

  async notifyAdminAnnouncement(data: {
    title: string;
    body: string;
    targetUserIds?: string[]; // If empty, sends to all active users
    imageUrl?: string;
    actionUrl?: string;
    expiresAt?: Date;
  }) {
    let userIds = data.targetUserIds;

    if (!userIds || userIds.length === 0) {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    return this.sendToUsers(userIds, {
      title: data.title,
      body: data.body,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: "admin",
      priority: NotificationPriority.HIGH,
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      expiresAt: data.expiresAt,
      isDeletable: true,
    });
  },

  async notifyMaintenance(data: {
    title: string;
    body: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    targetUserIds?: string[];
  }) {
    let userIds = data.targetUserIds;

    if (!userIds || userIds.length === 0) {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    const duration = Math.round(
      (data.scheduledEnd.getTime() - data.scheduledStart.getTime()) /
        (1000 * 60),
    );
    const startTime = data.scheduledStart.toLocaleString("fr-CM", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    return this.sendToUsers(userIds, {
      title: data.title || "Maintenance planifiée",
      body:
        data.body ||
        `Maintenance prévue le ${startTime}. Durée estimée: ${duration} minutes. Le service sera temporairement indisponible.`,
      type: NotificationType.MAINTENANCE,
      category: "system",
      priority: NotificationPriority.HIGH,
      expiresAt: data.scheduledEnd,
      isDeletable: false, // Maintenance notifications cannot be deleted
    });
  },

  // ── Delivery In Progress (Real-time) ────────────────────

  async notifyDeliveryInProgress(data: {
    userId: string;
    orderId: string;
    orderNumber: string;
    riderName: string;
    eta: string;
    currentLocation?: { lat: number; lng: number };
  }) {
    await this.sendToUser(data.userId, {
      title: `Livraison en cours - ${data.orderNumber}`,
      body: `${data.riderName} est en route. Arrivée estimée: ${data.eta}.`,
      type: NotificationType.DELIVERY_IN_PROGRESS,
      data: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        riderName: data.riderName,
        eta: data.eta,
        currentLocation: data.currentLocation,
      },
      category: "orders",
      priority: NotificationPriority.HIGH,
      actionUrl: `/customer/orders/track?orderId=${data.orderId}`,
      isDeletable: true,
    }).catch(() => {});
  },

  // ── System Notifications ────────────────────────────────

  async notifySystem(data: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    priority?: NotificationPriority;
  }) {
    return this.sendToUser(data.userId, {
      title: data.title,
      body: data.body,
      type: NotificationType.SYSTEM,
      data: data.data,
      category: "system",
      priority: data.priority || NotificationPriority.NORMAL,
      isDeletable: true,
    });
  },

  // ── Push Subscription Management ────────────────────────

  async updatePushSubscription(userId: string, subscription: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: subscription },
    });
  },

  // ── Cleanup Expired Notifications ───────────────────────

  async cleanupExpired() {
    const now = new Date();
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: { not: null, lte: now },
      },
    });
    logger.info(`Cleaned up ${result.count} expired notifications`);
    return result;
  },
};
