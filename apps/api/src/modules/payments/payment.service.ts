import axios, { AxiosError } from "axios";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/database";
import { AppError, NotFoundError } from "../../middleware/error.middleware";
import { notificationService } from "../notifications/notification.service";
import { logger } from "../../config/logger";
import { InitiatePaymentInput } from "@tara/zod-schemas";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@tara/types";

// =============================================================
// MTN MoMo Collections API (Cameroon — XAF)
// Docs: https://momodeveloper.mtn.com/docs/services/collection
// =============================================================
const momoService = {
  /** Get OAuth token using API User + API Key */
  async getAccessToken(): Promise<string> {
    const { MOMO_API_USER, MOMO_API_KEY, MOMO_BASE_URL, MOMO_SUBSCRIPTION_KEY } = process.env;
    if (!MOMO_API_USER || !MOMO_API_KEY) {
      throw new AppError("MTN MoMo credentials not configured", 500);
    }

    const credentials = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString("base64");

    const response = await axios.post(
      `${MOMO_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY!,
        },
      }
    );
    return response.data.access_token as string;
  },

  /**
   * Send a "Request to Pay" to the customer's phone.
   * Returns the X-Reference-Id (our tracking ID for status checks).
   *
   * IMPORTANT: In sandbox the amount must be an integer string.
   * Phone format for Cameroon: 237XXXXXXXXX (no +)
   */
  async requestToPay(
    amount: number,
    phoneNumber: string,
    externalId: string,
    payerMessage: string
  ): Promise<string> {
    const { MOMO_BASE_URL, MOMO_SUBSCRIPTION_KEY, MOMO_ENVIRONMENT, MOMO_CALLBACK_HOST } = process.env;

    const token = await this.getAccessToken();
    const referenceId = uuidv4();

    // Normalize phone: strip leading + or 00, ensure 237XXXXXXXXX format
    const normalizedPhone = phoneNumber.replace(/^\+/, "").replace(/^00/, "");

    await axios.post(
      `${MOMO_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: Math.round(amount).toString(), // XAF has no decimals
        currency: "XAF",
        externalId,
        payer: { partyIdType: "MSISDN", partyId: normalizedPhone },
        payerMessage: payerMessage.slice(0, 160),
        payeeNote: `TARA-${externalId.slice(0, 8)}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": MOMO_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY!,
          ...(MOMO_CALLBACK_HOST && {
            "X-Callback-Url": `${MOMO_CALLBACK_HOST}/api/webhooks/momo`,
          }),
          "Content-Type": "application/json",
        },
      }
    );

    return referenceId;
  },

  /**
   * Poll for payment status.
   * Status values: PENDING | SUCCESSFUL | FAILED
   */
  async checkPaymentStatus(referenceId: string): Promise<{
    status: string;
    financialTransactionId?: string;
    reason?: { code: string; message: string };
  }> {
    const { MOMO_BASE_URL, MOMO_SUBSCRIPTION_KEY, MOMO_ENVIRONMENT } = process.env;
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": MOMO_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY!,
        },
      }
    );
    return response.data;
  },
};

// =============================================================
// Orange Money Web Payment API (Cameroon — XAF)
// Docs: https://developer.orange.com/apis/om-webpay-cm
// =============================================================
const orangeService = {
  /** Get OAuth2 access token */
  async getAccessToken(): Promise<string> {
    const { ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET, ORANGE_BASE_URL } = process.env;
    if (!ORANGE_CLIENT_ID || !ORANGE_CLIENT_SECRET) {
      throw new AppError("Orange Money credentials not configured", 500);
    }

    const credentials = Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(
      `${ORANGE_BASE_URL}/oauth/v3/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );
    return response.data.access_token as string;
  },

  /**
   * Initiate a web payment.
   * Orange Money CM Web Pay redirects the customer to a hosted payment page.
   * Returns a payment_url to redirect the user.
   */
  async initiatePayment(
    amount: number,
    orderId: string,
    customerPhone?: string
  ): Promise<{ paymentUrl: string; payToken: string }> {
    const {
      ORANGE_BASE_URL,
      ORANGE_MERCHANT_KEY,
      ORANGE_RETURN_URL,
      ORANGE_CANCEL_URL,
      ORANGE_NOTIF_URL,
    } = process.env;

    const token = await this.getAccessToken();

    const response = await axios.post(
      `${ORANGE_BASE_URL}/orange-money-webpay/cm/v1/webpayment`,
      {
        merchant_key: ORANGE_MERCHANT_KEY,
        currency: "XAF",
        order_id: orderId,
        amount: Math.round(amount),
        return_url: ORANGE_RETURN_URL,
        cancel_url: ORANGE_CANCEL_URL,
        notif_url: ORANGE_NOTIF_URL,
        lang: "fr",
        reference: orderId,
        ...(customerPhone && { customer_phone: customerPhone }),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return {
      paymentUrl: response.data.payment_url as string,
      payToken: response.data.pay_token as string,
    };
  },
};

// =============================================================
// Main Payment Service
// =============================================================
export const paymentService = {
  async initiatePayment(userId: string, input: InitiatePaymentInput) {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId },
      include: { payment: true },
    });

    if (!order) throw new NotFoundError("Order");
    if (!order.payment) throw new AppError("No payment record for this order", 400);
    if (order.payment.status === PaymentStatus.SUCCESS) {
      throw new AppError("Payment already completed", 400);
    }
    if (order.payment.status === PaymentStatus.INITIATED) {
      throw new AppError("Payment already in progress. Check status or wait.", 409);
    }

    const { method, phoneNumber } = input;

    // ── Cash on Delivery ────────────────────────────────
    if (method === PaymentMethod.CASH_ON_DELIVERY) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { method, status: PaymentStatus.INITIATED },
      });
      // Confirm the order immediately for COD
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });
      return {
        method: PaymentMethod.CASH_ON_DELIVERY,
        message: "Paiement à la livraison confirmé",
        orderId: order.id,
      };
    }

    // ── MTN MoMo ────────────────────────────────────────
    let externalRef: string | undefined;
    let paymentUrl: string | undefined;

    if (method === PaymentMethod.MTN_MOMO) {
      if (!phoneNumber) throw new AppError("Numéro de téléphone requis pour MTN MoMo", 400);

      try {
        externalRef = await momoService.requestToPay(
          order.totalAmount,
          phoneNumber,
          order.id,
          `Paiement commande ${order.orderNumber}`
        );
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const errMsg = axiosErr.response?.data?.message || axiosErr.message;
        logger.error("MoMo requestToPay failed:", errMsg);
        throw new AppError(`Erreur MTN MoMo: ${errMsg}`, 502);
      }
    }

    // ── Orange Money ─────────────────────────────────────
    if (method === PaymentMethod.ORANGE_MONEY) {
      try {
        const result = await orangeService.initiatePayment(
          order.totalAmount,
          order.id,
          phoneNumber
        );
        externalRef = result.payToken;
        paymentUrl = result.paymentUrl;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const errMsg = axiosErr.response?.data?.message || axiosErr.message;
        logger.error("Orange Money initiate failed:", errMsg);
        throw new AppError(`Erreur Orange Money: ${errMsg}`, 502);
      }
    }

    // Save to DB
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        method,
        status: PaymentStatus.INITIATED,
        externalRef,
        phoneNumber,
        transactions: {
          create: {
            type: "DEBIT",
            amount: order.totalAmount,
            status: PaymentStatus.INITIATED,
            reference: externalRef || uuidv4(),
            metadata: { method, phoneNumber, orderId: order.id } as Prisma.InputJsonValue,
          },
        },
      },
    });

    return {
      method,
      externalRef,
      paymentUrl,
      amount: order.totalAmount,
      currency: "XAF",
      message:
        method === PaymentMethod.MTN_MOMO
          ? `Une demande de paiement a été envoyée au ${phoneNumber}. Confirmez sur votre téléphone.`
          : "Redirigez-vous vers la page Orange Money pour confirmer.",
    };
  },

  /** Poll MoMo status and update DB — called by frontend or cron */
  async pollMomoStatus(orderId: string) {
    const payment = await prisma.payment.findFirst({
      where: { orderId, method: PaymentMethod.MTN_MOMO },
      include: { order: { include: { user: true } } },
    });

    if (!payment || !payment.externalRef) throw new NotFoundError("Payment");
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return payment;
    }

    const momoStatus = await momoService.checkPaymentStatus(payment.externalRef);
    const newStatus =
      momoStatus.status === "SUCCESSFUL" ? PaymentStatus.SUCCESS :
      momoStatus.status === "FAILED"     ? PaymentStatus.FAILED  :
      null; // PENDING — no update yet

    if (newStatus) {
      await this._finalizePayment(payment.id, orderId, newStatus, momoStatus.financialTransactionId, momoStatus);
    }

    return { ...payment, providerStatus: momoStatus };
  },

  /** Webhook: MTN MoMo calls this when payment resolves */
  async handleMomoWebhook(data: Record<string, unknown>) {
    const { externalId, status, financialTransactionId } = data as {
      externalId: string;
      status: string;
      financialTransactionId?: string;
    };

    const payment = await prisma.payment.findFirst({
      where: { order: { id: externalId } },
      include: { order: { include: { user: true } } },
    });

    if (!payment) {
      logger.warn(`MoMo webhook: payment not found for order ${externalId}`);
      return;
    }

    const newStatus = status === "SUCCESSFUL" ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    await this._finalizePayment(payment.id, externalId, newStatus, financialTransactionId, data);
  },

  /** Webhook: Orange Money calls this when payment resolves */
  async handleOrangeWebhook(data: Record<string, unknown>) {
    const { order_id, status, txnid } = data as {
      order_id: string;
      status: string;
      txnid?: string;
    };

    const payment = await prisma.payment.findFirst({
      where: { order: { id: order_id } },
      include: { order: { include: { user: true } } },
    });

    if (!payment) {
      logger.warn(`Orange webhook: payment not found for order ${order_id}`);
      return;
    }

    // Orange Money uses "SUCCESS" or "FAILED"
    const newStatus = status === "SUCCESS" ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    await this._finalizePayment(payment.id, order_id, newStatus, txnid, data);
  },

  /** Internal: finalize payment and trigger notifications */
  async _finalizePayment(
    paymentId: string,
    orderId: string,
    status: PaymentStatus,
    transactionId?: string,
    rawData?: unknown
  ) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        webhookData: rawData as Prisma.InputJsonValue,
        paidAt: status === PaymentStatus.SUCCESS ? new Date() : undefined,
        failureReason: status === PaymentStatus.FAILED ? "Payment declined or timed out" : undefined,
      },
    });

    if (status === PaymentStatus.SUCCESS) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED },
        include: { user: true },
      });
      notificationService.notifyPaymentSuccess(order).catch(() => {});
      notificationService.notifyAdminsNewOrder(order).catch(() => {});
    } else {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });
      if (order) notificationService.notifyPaymentFailed(order).catch(() => {});
    }
  },

  async getPaymentByOrder(orderId: string) {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });
    if (!payment) throw new NotFoundError("Payment");
    return payment;
  },
};
