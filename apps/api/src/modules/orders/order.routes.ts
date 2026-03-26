import { Response, Router } from "express";
import { orderService } from "./order.service";
import { AuthRequest, authenticate, requireAdmin, requireAdminOrRider } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createOrderSchema, orderFiltersSchema,
  updateOrderStatusSchema, assignRiderSchema,
} from "@tara/zod-schemas";
import { sendSuccess, sendCreated, sendPaginated } from "../../utils/response.utils";
import { UserRole, OrderStatus } from "@tara/types";

// ── Controller ────────────────────────────────────────────
const orderController = {
  async create(req: AuthRequest, res: Response) {
    const order = await orderService.createOrder(req.user!.id, req.body);
    sendCreated(res, order, "Order created successfully");
  },

  async getMyOrders(req: AuthRequest, res: Response) {
    const filters = req.query as unknown as import("@tara/zod-schemas").OrderFilters;
    const result = await orderService.getOrders(filters, req.user!.id);
    sendPaginated(res, result.items, result.meta);
  },

  async getAllOrders(req: AuthRequest, res: Response) {
    const filters = req.query as unknown as import("@tara/zod-schemas").OrderFilters;
    const result = await orderService.getOrders(filters, undefined, true);
    sendPaginated(res, result.items, result.meta);
  },

  async getRiderOrders(req: AuthRequest, res: Response) {
    const { prisma } = await import("../../config/database");
    const rider = await prisma.rider.findFirst({ where: { userId: req.user!.id } });
    const filters = req.query as unknown as import("@tara/zod-schemas").OrderFilters;
    const result = await orderService.getOrders(
      { ...filters, riderId: rider?.id },
      undefined, true
    );
    sendPaginated(res, result.items, result.meta);
  },

  async getById(req: AuthRequest, res: Response) {
    const userId = req.user!.role === UserRole.ADMIN ? undefined : req.user!.id;
    const order = await orderService.getOrderById(req.params.id, userId);
    sendSuccess(res, order);
  },

  async updateStatus(req: AuthRequest, res: Response) {
    const { status, notes } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id, status as OrderStatus, req.user!.id, notes
    );
    sendSuccess(res, order, "Order status updated");
  },

  async assignRider(req: AuthRequest, res: Response) {
    const order = await orderService.assignRider(req.params.id, req.body.riderId);
    sendSuccess(res, order, "Rider assigned successfully");
  },

  async cancelOrder(req: AuthRequest, res: Response) {
    const order = await orderService.cancelOrder(
      req.params.id, req.user!.id, req.body.reason || "Cancelled by customer"
    );
    sendSuccess(res, order, "Order cancelled");
  },

  async getAvailableOrders(req: AuthRequest, res: Response) {
    const orders = await orderService.getAvailableOrdersForRider();
    sendSuccess(res, orders);
  },
};

// ── Router ────────────────────────────────────────────────
const router = Router();

router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.create);
router.get("/my", validate(orderFiltersSchema, "query"), orderController.getMyOrders);
router.get("/available", requireAdminOrRider, orderController.getAvailableOrders);
router.get("/rider/mine", requireAdminOrRider, orderController.getRiderOrders);
router.get("/", requireAdmin, validate(orderFiltersSchema, "query"), orderController.getAllOrders);
router.get("/:id", orderController.getById);
router.patch("/:id/status", requireAdminOrRider, validate(updateOrderStatusSchema), orderController.updateStatus);
router.post("/:id/assign", requireAdmin, validate(assignRiderSchema), orderController.assignRider);
router.post("/:id/cancel", orderController.cancelOrder);

export default router;
