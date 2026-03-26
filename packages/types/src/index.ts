// ============================================================
// TARA DELIVERY - Shared TypeScript Types
// ============================================================

// ── Enums ────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  RIDER = "RIDER",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum OrderType {
  PARCEL = "PARCEL",
  FOOD = "FOOD",
  COURIER = "COURIER",
  GROCERY = "GROCERY",
}

export enum PaymentMethod {
  MTN_MOMO = "MTN_MOMO",
  ORANGE_MONEY = "ORANGE_MONEY",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  INITIATED = "INITIATED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum RiderStatus {
  AVAILABLE = "AVAILABLE",
  BUSY = "BUSY",
  OFFLINE = "OFFLINE",
}

export enum NotificationType {
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_ASSIGNED = "ORDER_ASSIGNED",
  ORDER_PICKED_UP = "ORDER_PICKED_UP",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  RIDER_ASSIGNED = "RIDER_ASSIGNED",
  NEW_ORDER_ALERT = "NEW_ORDER_ALERT",
}

export enum VehicleType {
  MOTORCYCLE = "MOTORCYCLE",
  BICYCLE = "BICYCLE",
  CAR = "CAR",
  TRUCK = "TRUCK",
}

// ── User Types ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  role: UserRole.CUSTOMER;
  addresses?: DeliveryAddress[];
  orders?: Order[];
}

export interface Rider {
  id: string;
  userId: string;
  user: User;
  vehicleType: VehicleType;
  vehiclePlate: string;
  licenseNumber: string;
  status: RiderStatus;
  isVerified: boolean;
  rating: number;
  totalDeliveries: number;
  currentLocation?: GeoLocation | null;
  fcmToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  userId: string;
  user: User;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Order Types ───────────────────────────────────────────

export interface DeliveryAddress {
  id?: string;
  label?: string;
  street: string;
  neighborhood: string;
  city: string;
  landmark?: string;
  coordinates?: GeoLocation;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  weight?: number | null;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  riderId?: string | null;
  rider?: Rider | null;
  type: OrderType;
  status: OrderStatus;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  items?: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  notes?: string | null;
  estimatedDuration?: number | null;
  distance?: number | null;
  payment?: Payment | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string | null;
  timestamp: Date;
}

// ── Payment Types ─────────────────────────────────────────

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  externalRef?: string | null;
  phoneNumber?: string | null;
  transactionId?: string | null;
  failureReason?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  paymentId: string;
  type: "DEBIT" | "CREDIT" | "REFUND";
  amount: number;
  status: PaymentStatus;
  reference: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ── Notification Types ────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// ── Real-Time / Firebase Types ─────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface RiderLocationUpdate {
  riderId: string;
  location: GeoLocation;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus;
  riderLocation?: GeoLocation;
  message?: string;
  timestamp: number;
}

// ── Rating Types ──────────────────────────────────────────

export interface Rating {
  id: string;
  orderId: string;
  userId: string;
  riderId: string;
  score: number;
  comment?: string | null;
  createdAt: Date;
}

// ── API Response Types ────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ── Auth Types ────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends User {
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ── Dashboard / Analytics Types ───────────────────────────

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalRiders: number;
  activeRiders: number;
  totalCustomers: number;
  averageDeliveryTime: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

// ── Delivery Fee Calculation ──────────────────────────────

export interface DeliveryFeeInput {
  distance: number; // in km
  orderType: OrderType;
  weight?: number; // in kg
}

export interface DeliveryFeeResult {
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  total: number;
}
