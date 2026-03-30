import { z } from "zod";
import { OrderType, PaymentMethod, VehicleType, UserRole } from "@tara/types";

// ── Common ────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^(\+237|237)?[6-9][0-9]{8}$/, "Invalid Cameroonian phone number")
  .transform((val) => val.replace(/^\+?237/, "237"));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const deliveryAddressSchema = z.object({
  label: z.string().max(100).optional(),
  street: z.string().min(1, "Street is required").max(255),
  neighborhood: z.string().min(1, "Neighborhood is required").max(100),
  city: z.string().min(1).max(100).default("Yaoundé"),
  landmark: z.string().max(255).optional(),
  coordinates: geoLocationSchema.optional(),
});

// ── Auth Schemas ──────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema.optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const googleCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ── User Schemas ──────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Order Schemas ─────────────────────────────────────────

export const orderItemSchema = z.object({
  name: z.string().min(1).max(255),
  quantity: z.number().int().min(1).max(100),
  weight: z.number().min(0).max(1000).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
});

export const createOrderSchema = z.object({
  type: z.nativeEnum(OrderType),
  pickupAddress: deliveryAddressSchema,
  deliveryAddress: deliveryAddressSchema,
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  phoneNumber: phoneSchema.optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.string(),
  notes: z.string().max(500).optional(),
});

export const assignRiderSchema = z.object({
  riderId: z.string().uuid("Invalid rider ID"),
});

export const orderFiltersSchema = paginationSchema.extend({
  status: z.string().optional(),
  type: z.string().optional(), // Changed from nativeEnum to string to avoid validation errors on empty params
  riderId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// ── Rider Schemas ─────────────────────────────────────────

export const riderRegistrationSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType),
  vehiclePlate: z
    .string()
    .min(4, "Invalid vehicle plate")
    .max(20)
    .transform((v) => v.toUpperCase()),
  licenseNumber: z
    .string()
    .min(4, "Invalid license number")
    .max(50)
    .transform((v) => v.toUpperCase()),
});

export const updateRiderStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});

export const updateRiderLocationSchema = z.object({
  location: geoLocationSchema,
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
});

export const riderFiltersSchema = paginationSchema.extend({
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  isVerified: z.coerce.boolean().optional(),
});

// ── Payment Schemas ───────────────────────────────────────

export const initiatePaymentSchema = z
  .object({
    orderId: z.string().uuid(),
    method: z.nativeEnum(PaymentMethod),
    phoneNumber: phoneSchema.optional(),
  })
  .refine(
    (data) =>
      data.method === PaymentMethod.CASH_ON_DELIVERY ||
      data.phoneNumber !== undefined,
    {
      message: "Phone number is required for mobile money payments",
      path: ["phoneNumber"],
    },
  );

export const momoWebhookSchema = z.object({
  financialTransactionId: z.string().optional(),
  externalId: z.string(),
  amount: z.string(),
  currency: z.string(),
  payer: z.object({
    partyIdType: z.string(),
    partyId: z.string(),
  }),
  payerMessage: z.string().optional(),
  payeeNote: z.string().optional(),
  status: z.string(),
  reason: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export const orangeWebhookSchema = z.object({
  status: z.string(),
  txnid: z.string().optional(),
  txnmode: z.string().optional(),
  amount: z.string(),
  currency: z.string(),
  order_id: z.string(),
  notif_token: z.string(),
  message: z.string().optional(),
});

// ── Rating Schemas ────────────────────────────────────────

export const createRatingSchema = z.object({
  orderId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ── Admin Schemas ─────────────────────────────────────────

export const adminCreateUserSchema = registerSchema.extend({
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  isActive: z.boolean().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const verifyRiderSchema = z.object({
  isVerified: z.boolean(),
  notes: z.string().optional(),
});

// ── Notification Schemas ──────────────────────────────────

export const fcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token is required"),
});

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.string().optional(),
  data: z.record(z.string()).optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  imageUrl: z.string().url().optional().nullable(),
  actionUrl: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const sendBulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  type: z.string().min(1),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  imageUrl: z.string().url().optional().nullable(),
  actionUrl: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const notificationFiltersSchema = paginationSchema.extend({
  type: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  category: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
});

// ── Inferred Types ────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RiderRegistrationInput = z.infer<typeof riderRegistrationSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;
