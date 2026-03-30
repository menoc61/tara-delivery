import { Router, Request, Response } from "express";
import { paymentService } from "./payment.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { initiatePaymentSchema } from "@tara/zod-schemas";
import { sendSuccess } from "../../utils/response.utils";
import { prisma } from "../../config/database";

const router = Router();
router.use(authenticate);

/** GET /api/payments/my — Get user's payment history */
router.get("/my", async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    order: { userId: req.user!.id },
  };

  if (req.query.status) {
    where.status = req.query.status as string;
  }
  if (req.query.method) {
    where.method = req.query.method as string;
  }
  if (req.query.dateFrom || req.query.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (req.query.dateFrom) {
      dateFilter.gte = new Date(req.query.dateFrom as string);
    }
    if (req.query.dateTo) {
      dateFilter.lte = new Date(req.query.dateTo as string);
    }
    where.createdAt = dateFilter;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            type: true,
            totalAmount: true,
            deliveryFee: true,
            deliveryStreet: true,
            deliveryNeighborhood: true,
            pickupStreet: true,
            pickupNeighborhood: true,
            status: true,
            createdAt: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  sendSuccess(res, {
    items: payments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/** GET /api/payments/:id — Get payment details */
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: req.params.id,
      order: { userId: req.user!.id },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          type: true,
          totalAmount: true,
          deliveryFee: true,
          deliveryStreet: true,
          deliveryNeighborhood: true,
          pickupStreet: true,
          pickupNeighborhood: true,
          status: true,
          createdAt: true,
          items: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({ success: false, error: "Payment not found" });
  }

  sendSuccess(res, payment);
});

/** POST /api/payments/initiate — Start MTN MoMo or Orange Money payment */
router.post(
  "/initiate",
  validate(initiatePaymentSchema),
  async (req: AuthRequest, res: Response) => {
    const result = await paymentService.initiatePayment(req.user!.id, req.body);
    sendSuccess(res, result, "Payment initiated");
  },
);

/** GET /api/payments/order/:orderId — Get payment details for an order */
router.get("/order/:orderId", async (req: AuthRequest, res: Response) => {
  const payment = await paymentService.getPaymentByOrder(req.params.orderId);
  sendSuccess(res, payment);
});

/** GET /api/payments/order/:orderId/poll — Poll MoMo status */
router.get("/order/:orderId/poll", async (req: AuthRequest, res: Response) => {
  const result = await paymentService.pollMomoStatus(req.params.orderId);
  sendSuccess(res, result);
});

export default router;
