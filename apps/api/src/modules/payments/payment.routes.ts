import { Router, Request, Response } from "express";
import { paymentService } from "./payment.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { initiatePaymentSchema } from "@tara/zod-schemas";
import { sendSuccess } from "../../utils/response.utils";

const router = Router();
router.use(authenticate);

/** POST /api/payments/initiate — Start MTN MoMo or Orange Money payment */
router.post(
  "/initiate",
  validate(initiatePaymentSchema),
  async (req: AuthRequest, res: Response) => {
    const result = await paymentService.initiatePayment(req.user!.id, req.body);
    sendSuccess(res, result, "Payment initiated");
  }
);

/** GET /api/payments/order/:orderId — Get payment details for an order */
router.get("/order/:orderId", async (req: AuthRequest, res: Response) => {
  const payment = await paymentService.getPaymentByOrder(req.params.orderId);
  sendSuccess(res, payment);
});

/** GET /api/payments/order/:orderId/poll — Poll MoMo status (frontend calls this) */
router.get("/order/:orderId/poll", async (req: AuthRequest, res: Response) => {
  const result = await paymentService.pollMomoStatus(req.params.orderId);
  sendSuccess(res, result);
});

export default router;
