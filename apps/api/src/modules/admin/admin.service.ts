import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../middleware/error.middleware";
import { buildPaginationMeta } from "../../utils/response.utils";
import { OrderStatus, UserRole } from "@tara/types";

export const adminService = {
  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.ASSIGNED,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
    ];

    const [
      totalOrders, activeOrders, completedOrders, cancelledOrders,
      totalRiders, availableRiders, totalCustomers,
      revenueResult, todayOrders, todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: activeStatuses } } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      prisma.rider.count(),
      prisma.rider.count({ where: { status: "AVAILABLE" } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
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
      }))
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

  async getAllUsers(page: number, limit: number, role?: string, search?: string) {
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
        where, skip, take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, isActive: true, createdAt: true, avatar: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { items: users, meta: buildPaginationMeta(total, page, limit) };
  },

  async updateUser(userId: string, data: { name?: string; phone?: string; isActive?: boolean; role?: string }) {
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
};
