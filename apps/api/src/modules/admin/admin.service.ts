import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../middleware/error.middleware";
import { buildPaginationMeta } from "../../utils/response.utils";
import { OrderStatus, UserRole } from "@tara/types";

export const adminService = {
  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const activeStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.ASSIGNED,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
    ];

    const [
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalRiders,
      availableRiders,
      totalCustomers,
      revenueResult,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: activeStatuses } } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      prisma.rider.count(),
      prisma.rider.count({ where: { status: "AVAILABLE" } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalRiders,
      availableRiders,
      totalCustomers,
      totalRevenue: revenueResult._sum.amount || 0,
      todayOrders,
      todayRevenue: todayRevenue._sum.amount || 0,
    };
  },

  async getRevenueAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS", createdAt: { gte: startDate } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, { revenue: number; count: number }> = {};
    for (const p of payments) {
      const date = p.createdAt.toISOString().slice(0, 10);
      if (!grouped[date]) grouped[date] = { revenue: 0, count: 0 };
      grouped[date].revenue += p.amount;
      grouped[date].count += 1;
    }

    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  },

  async getOrdersByStatus() {
    const statuses = Object.values(OrderStatus);
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await prisma.order.count({ where: { status } }),
      })),
    );
    return counts;
  },

  async getTopRiders(limit = 10) {
    return prisma.rider.findMany({
      orderBy: { totalDeliveries: "desc" },
      take: limit,
      include: { user: { select: { name: true, avatar: true } } },
    });
  },

  async getAllUsers(
    page: number,
    limit: number,
    role?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role as UserRole;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatar: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { items: users, meta: buildPaginationMeta(total, page, limit) };
  },

  async updateUser(
    userId: string,
    data: { name?: string; phone?: string; isActive?: boolean; role?: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.role !== undefined) updateData.role = data.role as UserRole;

    return prisma.user.update({ where: { id: userId }, data: updateData });
  },

  async getRecentOrders(limit = 10) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        rider: { include: { user: { select: { name: true } } } },
        payment: { select: { method: true, status: true, amount: true } },
      },
    });
  },

  async getRidersPendingVerification() {
    return prisma.rider.findMany({
      where: { isVerified: false },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
  },

  async getPayouts(status?: string) {
    const riders = await prisma.rider.findMany({
      include: {
        user: { select: { name: true, phone: true } },
        _count: { select: { orders: true } },
      },
    });
    return riders.map((r) => ({
      id: r.id,
      riderName: r.user.name,
      amount: r._count.orders * 500,
      method: "mtn",
      status: status || "pending",
      requestedAt: new Date().toISOString(),
    }));
  },

  async getPromos() {
    return [
      {
        id: "1",
        code: "BIENVENUE20",
        type: "percent",
        value: 20,
        minOrder: 2000,
        maxUses: 500,
        used: 234,
        validUntil: "2026-04-30",
        status: "active",
      },
      {
        id: "2",
        code: "REDUCTION500",
        type: "fixed",
        value: 500,
        minOrder: 3000,
        maxUses: 1000,
        used: 456,
        validUntil: "2026-03-31",
        status: "active",
      },
      {
        id: "3",
        code: "FREEDELIV",
        type: "percent",
        value: 100,
        minOrder: 5000,
        maxUses: 200,
        used: 200,
        validUntil: "2026-02-28",
        status: "expired",
      },
    ];
  },

  async createPromo(data: {
    code: string;
    type: string;
    value: number;
    minOrder: number;
    maxUses: number;
    validUntil: string;
  }) {
    return { id: Date.now().toString(), ...data, used: 0, status: "active" };
  },

  async getNotificationHistory(page: number, limit: number) {
    const notifications = await prisma.notification.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.notification.count();
    return {
      items: notifications,
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async sendNotification(
    title: string,
    body: string,
    type: string,
    target: string,
  ) {
    const users =
      target === "all"
        ? await prisma.user.findMany({ select: { id: true } })
        : target === "riders"
          ? await prisma.user.findMany({
              where: { role: UserRole.RIDER },
              select: { id: true },
            })
          : await prisma.user.findMany({
              where: { role: UserRole.CUSTOMER },
              select: { id: true },
            });

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        body,
        type: type as any,
        isRead: false,
      })),
    });
  },

  async getAuditLogs(
    page: number,
    limit: number,
    role?: string,
    action?: string,
  ) {
    const logs = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    const total = await prisma.user.count();
    return {
      items: logs.map((l) => ({
        id: l.id,
        action: "User activity",
        user: l.name,
        role: l.role,
        details: `Last login: ${l.lastLoginAt || "Never"}`,
        ip: "N/A",
        timestamp: l.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getSupportTickets(status?: string) {
    return [
      {
        id: "1",
        subject: "Problème de paiement",
        user: "customer5@test.cm",
        priority: "high",
        status: status || "open",
        channel: "chat",
        createdAt: "2026-03-27 10:30",
      },
      {
        id: "2",
        subject: "Commande non livrée",
        user: "customer12@test.cm",
        priority: "medium",
        status: "pending",
        channel: "phone",
        createdAt: "2026-03-27 09:15",
      },
      {
        id: "3",
        subject: "Demande de remboursement",
        user: "customer8@test.cm",
        priority: "high",
        status: "open",
        channel: "email",
        createdAt: "2026-03-26 16:45",
      },
    ];
  },

  async updateSupportTicket(ticketId: string, data: { status?: string }) {
    return { id: ticketId, ...data };
  },

  async getFleetStats() {
    const [total, available, busy, offline] = await Promise.all([
      prisma.rider.count(),
      prisma.rider.count({ where: { status: "AVAILABLE" } }),
      prisma.rider.count({ where: { status: "BUSY" } }),
      prisma.rider.count({ where: { status: "OFFLINE" } }),
    ]);
    return { total, available, busy, offline };
  },

  async getRiderLocations() {
    return prisma.rider.findMany({
      where: { status: { not: "OFFLINE" } },
      include: { user: { select: { name: true } } },
    });
  },

  async getSettings() {
    return {
      appName: "TARA Delivery",
      supportEmail: "support@tara-delivery.cm",
      supportPhone: "+237 650 000 000",
      defaultDeliveryFee: 500,
      perKmFee: 150,
      maxDeliveryFee: 15000,
      minOrderAmount: 500,
      commissionRate: 15,
      timezone: "Africa/Douala",
      language: "fr",
    };
  },

  async updateSettings(data: Record<string, unknown>) {
    return data;
  },
};
