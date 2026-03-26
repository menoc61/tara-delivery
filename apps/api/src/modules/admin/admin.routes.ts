import { Router, Response } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { adminUpdateUserSchema, verifyRiderSchema } from "@tara/zod-schemas";
import { sendSuccess, sendPaginated } from "../../utils/response.utils";
import { adminService } from "./admin.service";
import { riderService } from "../riders/rider.service";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/dashboard", async (_req: AuthRequest, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

router.get("/analytics/revenue", async (req: AuthRequest, res: Response) => {
  const days = Number(req.query.days) || 30;
  const data = await adminService.getRevenueAnalytics(days);
  sendSuccess(res, data);
});

router.get("/analytics/orders", async (_req: AuthRequest, res: Response) => {
  const data = await adminService.getOrdersByStatus();
  sendSuccess(res, data);
});

router.get("/analytics/top-riders", async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const riders = await adminService.getTopRiders(limit);
  sendSuccess(res, riders);
});

router.get("/orders/recent", async (_req: AuthRequest, res: Response) => {
  const orders = await adminService.getRecentOrders();
  sendSuccess(res, orders);
});

router.get("/users", async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, role, search } = req.query as Record<string, string>;
  const result = await adminService.getAllUsers(Number(page), Number(limit), role, search);
  sendPaginated(res, result.items, result.meta);
});

router.patch("/users/:id", validate(adminUpdateUserSchema), async (req: AuthRequest, res: Response) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  sendSuccess(res, user, "User updated");
});

router.patch("/riders/:id/verify", validate(verifyRiderSchema), async (req: AuthRequest, res: Response) => {
  const rider = await riderService.verifyRider(req.params.id, req.body.isVerified);
  sendSuccess(res, rider, "Rider verification updated");
});

export default router;
