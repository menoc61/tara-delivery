import { Router, Response } from "express";
import {
  authenticate,
  requireAdmin,
  AuthRequest,
} from "../../middleware/auth.middleware";
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
  const {
    page = 1,
    limit = 20,
    role,
    search,
  } = req.query as Record<string, string>;
  const result = await adminService.getAllUsers(
    Number(page),
    Number(limit),
    role,
    search,
  );
  sendPaginated(res, result.items, result.meta);
});

router.patch(
  "/users/:id",
  validate(adminUpdateUserSchema),
  async (req: AuthRequest, res: Response) => {
    const user = await adminService.updateUser(req.params.id, req.body);
    sendSuccess(res, user, "User updated");
  },
);

router.patch(
  "/riders/:id/verify",
  validate(verifyRiderSchema),
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.verifyRider(
      req.params.id,
      req.body.isVerified,
    );
    sendSuccess(res, rider, "Rider verification updated");
  },
);

// Zone management (basic CRUD - zones stored in config)
router.get("/zones", async (_req: AuthRequest, res: Response) => {
  const zones = [
    {
      id: "1",
      name: "Centre-Ville",
      neighborhoods: ["Bastos", "Nlongkak", "Mfoundi"],
      baseFee: 500,
      perKmFee: 150,
      status: "active",
    },
    {
      id: "2",
      name: "Nord",
      neighborhoods: ["Ekounou", "Mvan", "Nkolbisson"],
      baseFee: 600,
      perKmFee: 180,
      status: "active",
    },
    {
      id: "3",
      name: "Est",
      neighborhoods: ["Melen", "Biyem-Assi", "Mvog-Ada"],
      baseFee: 550,
      perKmFee: 160,
      status: "active",
    },
    {
      id: "4",
      name: "Ouest",
      neighborhoods: ["Mbankolo", "Nkol-Yaoundé"],
      baseFee: 700,
      perKmFee: 200,
      status: "inactive",
    },
  ];
  sendSuccess(res, zones);
});

// Rider document verification (KYC)
router.get(
  "/riders/pending-verification",
  async (_req: AuthRequest, res: Response) => {
    const riders = await adminService.getRidersPendingVerification();
    sendSuccess(res, riders);
  },
);

// Payouts
router.get("/payouts", async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const payouts = await adminService.getPayouts(status);
  sendSuccess(res, payouts);
});

// Promo codes
router.get("/promos", async (_req: AuthRequest, res: Response) => {
  const promos = await adminService.getPromos();
  sendSuccess(res, promos);
});

router.post("/promos", async (req: AuthRequest, res: Response) => {
  const promo = await adminService.createPromo(req.body);
  sendSuccess(res, promo, "Promo code created");
});

// Notifications
router.get("/notifications", async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query as Record<string, string>;
  const result = await adminService.getNotificationHistory(
    Number(page),
    Number(limit),
  );
  sendPaginated(res, result.items, result.meta);
});

router.post("/notifications", async (req: AuthRequest, res: Response) => {
  const { title, body, type, target } = req.body;
  await adminService.sendNotification(title, body, type, target);
  sendSuccess(res, null, "Notification sent");
});

// Audit logs
router.get("/audit-logs", async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 50,
    role,
    action,
  } = req.query as Record<string, string>;
  const result = await adminService.getAuditLogs(
    Number(page),
    Number(limit),
    role,
    action,
  );
  sendPaginated(res, result.items, result.meta);
});

// Support tickets
router.get("/support-tickets", async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const tickets = await adminService.getSupportTickets(status);
  sendSuccess(res, tickets);
});

router.patch(
  "/support-tickets/:id",
  async (req: AuthRequest, res: Response) => {
    const ticket = await adminService.updateSupportTicket(
      req.params.id,
      req.body,
    );
    sendSuccess(res, ticket, "Ticket updated");
  },
);

// Fleet performance
router.get("/fleet-stats", async (_req: AuthRequest, res: Response) => {
  const stats = await adminService.getFleetStats();
  sendSuccess(res, stats);
});

// Live rider locations
router.get("/riders/locations", async (_req: AuthRequest, res: Response) => {
  const locations = await adminService.getRiderLocations();
  sendSuccess(res, locations);
});

// Settings
router.get("/settings", async (_req: AuthRequest, res: Response) => {
  const settings = await adminService.getSettings();
  sendSuccess(res, settings);
});

router.patch("/settings", async (req: AuthRequest, res: Response) => {
  const settings = await adminService.updateSettings(req.body);
  sendSuccess(res, settings, "Settings updated");
});

export default router;
