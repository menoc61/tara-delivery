import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { broadcastOrderUpdate } from "../../config/supabase";
import {
  AppError, NotFoundError, ForbiddenError,
} from "../../middleware/error.middleware";
import {
  calculateDeliveryFee, calculateDistance,
  estimateDeliveryTime, generateOrderNumber,
} from "../../utils/delivery.utils";
import { notificationService } from "../notifications/notification.service";
import { CreateOrderInput, OrderFilters } from "@tara/zod-schemas";
import { OrderStatus, OrderType } from "@tara/types";
import { buildPaginationMeta } from "../../utils/response.utils";

export const orderService = {
  // ── Create Order ──────────────────────────────────────
  async createOrder(userId: string, input: CreateOrderInput) {
    const { pickupAddress, deliveryAddress, items, paymentMethod, notes, type } = input;

    // Calculate distance and fee
    let distance = 2; // default km if no coordinates
    if (
      pickupAddress.coordinates && deliveryAddress.coordinates
    ) {
      distance = calculateDistance(
        pickupAddress.coordinates.lat, pickupAddress.coordinates.lng,
        deliveryAddress.coordinates.lat, deliveryAddress.coordinates.lng
      );
    }

    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
    const { total: deliveryFee } = calculateDeliveryFee({ distance, orderType: type as OrderType, weight: totalWeight });
    const estimatedDuration = estimateDeliveryTime(distance);
    const itemsTotal = 0; // In a real app, items would have prices
    const totalAmount = deliveryFee + itemsTotal;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        type: type as OrderType,
        status: OrderStatus.PENDING,
        pickupStreet: pickupAddress.street,
        pickupNeighborhood: pickupAddress.neighborhood,
        pickupCity: pickupAddress.city || "Yaoundé",
        pickupLandmark: pickupAddress.landmark,
        pickupLat: pickupAddress.coordinates?.lat,
        pickupLng: pickupAddress.coordinates?.lng,
        pickupLabel: pickupAddress.label,
        deliveryStreet: deliveryAddress.street,
        deliveryNeighborhood: deliveryAddress.neighborhood,
        deliveryCity: deliveryAddress.city || "Yaoundé",
        deliveryLandmark: deliveryAddress.landmark,
        deliveryLat: deliveryAddress.coordinates?.lat,
        deliveryLng: deliveryAddress.coordinates?.lng,
        deliveryLabel: deliveryAddress.label,
        totalAmount,
        deliveryFee,
        distance,
        estimatedDuration,
        notes,
        items: { create: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          weight: item.weight,
          description: item.description,
          imageUrl: item.imageUrl,
        }))},
        statusLogs: { create: { status: OrderStatus.PENDING, notes: "Order created" } },
        payment: { create: {
          method: paymentMethod,
          status: "PENDING",
          amount: totalAmount,
          currency: "XAF",
          phoneNumber: input.phoneNumber,
        }},
      },
      include: { items: true, payment: true },
    });

    // Notify admins of new order (non-blocking)
    notificationService.notifyAdminsNewOrder(order).catch(() => {});

    return order;
  },

  // ── Get Orders (with filters) ─────────────────────────
  async getOrders(filters: OrderFilters, userId?: string, forAdmin = false) {
    const { page, limit, status, type, riderId, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (!forAdmin && userId) where.userId = userId;
    if (filters.userId && forAdmin) where.userId = filters.userId;
    if (status) where.status = status as OrderStatus;
    if (type) where.type = type as OrderType;
    if (riderId) where.riderId = riderId;
    if (dateFrom || dateTo) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (dateFrom) createdAt.gte = dateFrom;
      if (dateTo) createdAt.lte = dateTo;
      where.createdAt = createdAt;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          payment: { select: { method: true, status: true, amount: true } },
          rider: { include: { user: { select: { name: true, phone: true, avatar: true } } } },
          user: { select: { name: true, email: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items: orders, meta: buildPaginationMeta(total, page, limit) };
  },

  // ── Get single order ──────────────────────────────────
  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        statusLogs: { orderBy: { timestamp: "asc" } },
        rider: { include: { user: { select: { name: true, phone: true, avatar: true } } } },
        user: { select: { name: true, email: true, phone: true, avatar: true } },
        rating: true,
      },
    });
    if (!order) throw new NotFoundError("Order");
    if (userId && order.userId !== userId && order.rider?.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }
    return order;
  },

  // ── Update order status ───────────────────────────────
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    actorId: string,
    notes?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { rider: true, user: true },
    });
    if (!order) throw new NotFoundError("Order");

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.FAILED]: [],
    };

    if (!validTransitions[order.status as OrderStatus]?.includes(status)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${status}`, 400
      );
    }

    const updateData: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.ASSIGNED) updateData.assignedAt = new Date();
    if (status === OrderStatus.PICKED_UP) updateData.pickedUpAt = new Date();
    if (status === OrderStatus.DELIVERED) updateData.deliveredAt = new Date();

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        statusLogs: { create: { status, notes, riderId: order.riderId } },
      },
    });

    // Broadcast to Supabase Realtime for live updates
    await broadcastOrderUpdate(orderId, { status, message: notes });

    // Notifications
    notificationService.notifyOrderStatusChange(order, status).catch(() => {});

    return updated;
  },

  // ── Assign rider to order ─────────────────────────────
  async assignRider(orderId: string, riderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError("Order");
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new AppError("Order must be confirmed before assigning a rider", 400);
    }

    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { user: true },
    });
    if (!rider) throw new NotFoundError("Rider");
    if (!rider.isVerified) throw new AppError("Rider is not verified", 400);
    if (rider.status === "OFFLINE") throw new AppError("Rider is not available", 400);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId,
        status: OrderStatus.ASSIGNED,
        assignedAt: new Date(),
        statusLogs: { create: { status: OrderStatus.ASSIGNED, riderId } },
      },
      include: { rider: { include: { user: true } } },
    });

    await prisma.rider.update({
      where: { id: riderId },
      data: { status: "BUSY" },
    });

    notificationService.notifyRiderAssigned(updated).catch(() => {});
    return updated;
  },

  // ── Cancel order ──────────────────────────────────────
  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError("Order");
    if (order.userId !== userId) throw new ForbiddenError();

    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      throw new AppError("Order cannot be cancelled at this stage", 400);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelReason: reason,
        statusLogs: { create: { status: OrderStatus.CANCELLED, notes: reason } },
      },
    });
  },

  // ── Get available orders for rider ────────────────────
  async getAvailableOrdersForRider() {
    return prisma.order.findMany({
      where: { status: OrderStatus.CONFIRMED, riderId: null },
      orderBy: { createdAt: "asc" },
      include: { items: true, user: { select: { name: true } } },
    });
  },
};
