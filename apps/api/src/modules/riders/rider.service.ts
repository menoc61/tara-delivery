import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { broadcastRiderLocation } from "../../config/supabase";
import { AppError, NotFoundError } from "../../middleware/error.middleware";
import { buildPaginationMeta } from "../../utils/response.utils";
import { UserRole, RiderStatus, VehicleType } from "@tara/types";

export const riderService = {
  async register(userId: string, input: {
    vehicleType: string; vehiclePlate: string; licenseNumber: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    const existing = await prisma.rider.findUnique({ where: { userId } });
    if (existing) throw new AppError("You are already registered as a rider", 409);

    const rider = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { role: UserRole.RIDER } });
      return tx.rider.create({
        data: {
          userId,
          vehicleType: input.vehicleType as VehicleType,
          vehiclePlate: input.vehiclePlate,
          licenseNumber: input.licenseNumber,
        },
        include: { user: { select: { name: true, email: true, phone: true } } },
      });
    });
    return rider;
  },

  async getMyProfile(userId: string) {
    const rider = await prisma.rider.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar: true } },
        _count: { select: { orders: true } },
      },
    });
    if (!rider) throw new NotFoundError("Rider profile");
    return rider;
  },

  async updateStatus(userId: string, status: string) {
    const rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundError("Rider");
    return prisma.rider.update({
      where: { id: rider.id },
      data: { status: status as RiderStatus },
    });
  },

  async updateLocation(userId: string, location: { lat: number; lng: number; heading?: number; speed?: number }) {
    const rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundError("Rider");

    await prisma.rider.update({
      where: { id: rider.id },
      data: { currentLat: location.lat, currentLng: location.lng, lastLocationAt: new Date() },
    });

    // Broadcast to Supabase Realtime for live tracking
    await broadcastRiderLocation(rider.id, location);

    return { updated: true };
  },

  async getAllRiders(filters: { page: number; limit: number; status?: string; vehicleType?: string; isVerified?: boolean }) {
    const { page, limit, status, vehicleType, isVerified } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.RiderWhereInput = {};
    if (status) where.status = status as RiderStatus;
    if (vehicleType) where.vehicleType = vehicleType as VehicleType;
    if (isVerified !== undefined) where.isVerified = isVerified;

    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, phone: true, avatar: true } } },
      }),
      prisma.rider.count({ where }),
    ]);
    return { items: riders, meta: buildPaginationMeta(total, page, limit) };
  },

  async getRiderById(id: string) {
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, phone: true, avatar: true } } },
    });
    if (!rider) throw new NotFoundError("Rider");
    return rider;
  },

  async verifyRider(id: string, isVerified: boolean) {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) throw new NotFoundError("Rider");
    return prisma.rider.update({ where: { id }, data: { isVerified } });
  },

  async submitRating(data: { orderId: string; userId: string; score: number; comment?: string }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId, userId: data.userId, status: "DELIVERED" },
    });
    if (!order || !order.riderId) throw new AppError("Order not found or not eligible for rating", 400);

    const existing = await prisma.rating.findUnique({ where: { orderId: data.orderId } });
    if (existing) throw new AppError("Already rated this order", 409);

    const rating = await prisma.rating.create({
      data: { orderId: data.orderId, userId: data.userId, riderId: order.riderId, score: data.score, comment: data.comment },
    });

    // Recalculate rider average
    const avg = await prisma.rating.aggregate({
      where: { riderId: order.riderId },
      _avg: { score: true },
    });
    await prisma.rider.update({
      where: { id: order.riderId },
      data: { rating: avg._avg.score || 0 },
    });

    return rating;
  },
};
