import { prisma } from "../../config/database";
import { sendPushNotification } from "../../config/web-push";
import { emailService } from "./email.service";
import { logger } from "../../config/logger";
import { NotificationType, OrderStatus } from "@tara/types";

export const notificationService = {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    return prisma.notification.create({
      data: {
        ...data,
        data: data.data as any,
      },
    });
  },

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total, unreadCount: await this.getUnreadCount(userId) };
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
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

  async sendToUser(
    userId: string,
    notification: { title: string; body: string; type: NotificationType; data?: Record<string, unknown> }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    // Save in DB
    await this.create({ userId, ...notification });

    // Send push if subscription exists
    if (user?.pushSubscription) {
      try {
        const subscription = JSON.parse(user.pushSubscription);
        await sendPushNotification(subscription, {
          title: notification.title,
          body: notification.body,
          data: notification.data as Record<string, string>,
        });
      } catch (err) {
        logger.warn("Web Push notification failed:", err);
      }
    }
  },

  async notifyOrderStatusChange(
    order: { id: string; userId: string; orderNumber?: string; riderId?: string | null; user?: { email: string; name: string } | null },
    newStatus: OrderStatus
  ) {
    const messages: Partial<Record<OrderStatus, { title: string; body: string }>> = {
      [OrderStatus.CONFIRMED]: { title: "Commande confirmée ✅", body: `Votre commande est confirmée et en cours d'attribution.` },
      [OrderStatus.ASSIGNED]: { title: "Livreur assigné 🛵", body: `Un livreur a été assigné à votre commande.` },
      [OrderStatus.PICKED_UP]: { title: "Colis récupéré 📦", body: `Votre colis a été récupéré par le livreur.` },
      [OrderStatus.IN_TRANSIT]: { title: "En route! 🏃", body: `Votre livraison est en route.` },
      [OrderStatus.DELIVERED]: { title: "Livré! 🎉", body: `Votre commande a été livrée avec succès.` },
      [OrderStatus.CANCELLED]: { title: "Commande annulée ❌", body: `Votre commande a été annulée.` },
    };

    const msg = messages[newStatus];
    if (msg) {
      await this.sendToUser(order.userId, {
        ...msg,
        type: `ORDER_${newStatus}` as NotificationType,
        data: { orderId: order.id },
      }).catch(() => {});
    }

    // Email for delivered
    if (newStatus === OrderStatus.DELIVERED && order.user) {
      emailService.sendOrderDelivered(
        order.user.email, order.user.name, order.orderNumber || order.id
      ).catch(() => {});
    }
  },

  async notifyAdminsNewOrder(order: { id: string; orderNumber: string; type: string }) {
    const admins = await prisma.admin.findMany({ include: { user: true } });
    await Promise.allSettled(
      admins.map((admin) =>
        this.sendToUser(admin.userId, {
          title: "Nouvelle commande 📦",
          body: `Commande ${order.orderNumber} (${order.type}) en attente`,
          type: NotificationType.ORDER_CREATED,
          data: { orderId: order.id },
        })
      )
    );
  },

  async notifyRiderAssigned(order: {
    id: string; orderNumber?: string;
    rider?: { userId: string; user?: { email: string; name: string } | null } | null;
  }) {
    if (!order.rider) return;
    await this.sendToUser(order.rider.userId, {
      title: "Nouvelle livraison assignée 🛵",
      body: `La commande ${order.orderNumber || order.id} vous a été assignée.`,
      type: NotificationType.RIDER_ASSIGNED,
      data: { orderId: order.id },
    }).catch(() => {});

    if (order.rider.user) {
      emailService.sendRiderNewOrderAlert(
        order.rider.user.email, order.rider.user.name, order.orderNumber || order.id
      ).catch(() => {});
    }
  },

  async notifyPaymentSuccess(order: {
    id: string; userId: string; orderNumber: string; totalAmount: number;
    user?: { email: string; name: string } | null;
  }) {
    await this.sendToUser(order.userId, {
      title: "Paiement confirmé ✅",
      body: `Paiement de ${order.totalAmount} XAF reçu pour ${order.orderNumber}.`,
      type: NotificationType.PAYMENT_SUCCESS,
      data: { orderId: order.id },
    }).catch(() => {});
  },

  async notifyPaymentFailed(order: {
    id: string; userId: string; orderNumber: string;
  }) {
    await this.sendToUser(order.userId, {
      title: "Échec du paiement ❌",
      body: `Le paiement pour la commande ${order.orderNumber} a échoué. Réessayez.`,
      type: NotificationType.PAYMENT_FAILED,
      data: { orderId: order.id },
    }).catch(() => {});
  },

  async updatePushSubscription(userId: string, subscription: string | null) {
    return prisma.user.update({ where: { id: userId }, data: { pushSubscription: subscription } });
  },

  async unsubscribePush(userId: string, endpoint: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (user?.pushSubscription) {
      try {
        const currentSub = JSON.parse(user.pushSubscription);
        if (currentSub.endpoint === endpoint) {
          return prisma.user.update({
            where: { id: userId },
            data: { pushSubscription: null },
          });
        }
      } catch (err) {
        logger.error("Failed to parse push subscription during unsubscribe:", err);
      }
    }
  },
};
