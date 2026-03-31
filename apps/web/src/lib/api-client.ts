import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach token ─────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tara-auth");
        if (stored) {
          const { tokens } = JSON.parse(stored).state || {};
          if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        }
      } catch {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: auto-refresh on 401 ────────────
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

// Paths that should NOT trigger redirect on 401
const publicPaths = ["/auth/login", "/auth/register", "/auth/forgot-password"];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip refresh logic for public paths
    const isPublicPath = publicPaths.some(
      (p) =>
        typeof window !== "undefined" && window.location.pathname.startsWith(p),
    );

    if (error.response?.status === 401 && !original._retry && !isPublicPath) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem("tara-auth");
        const parsed = stored ? JSON.parse(stored) : {};
        const tokens = parsed?.state?.tokens;

        if (tokens?.refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          const newTokens = data.data;
          const current = JSON.parse(localStorage.getItem("tara-auth") || "{}");
          if (current.state) {
            current.state.tokens = newTokens;
            localStorage.setItem("tara-auth", JSON.stringify(current));
          }

          refreshQueue.forEach((cb) => cb(newTokens.accessToken));
          refreshQueue = [];
          original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(original);
        }
      } catch {
        // Only redirect if we actually had a token to refresh
        const stored = localStorage.getItem("tara-auth");
        if (stored) {
          localStorage.removeItem("tara-auth");
          window.location.href = "/auth/login";
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── API modules ───────────────────────────────────────────
export const authApi = {
  register: (data: unknown) => apiClient.post("/auth/register", data),
  login: (data: unknown) => apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  refreshTokens: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),
  getMe: () => apiClient.get("/auth/me"),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (data: unknown) =>
    apiClient.post("/auth/reset-password", data),
};

export const ordersApi = {
  create: (data: unknown) => apiClient.post("/orders", data),
  getMyOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => apiClient.get("/orders/my", { params }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  cancel: (id: string, reason: string) =>
    apiClient.post(`/orders/${id}/cancel`, { reason }),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.patch(`/orders/${id}/status`, { status, notes }),
  getAvailable: () => apiClient.get("/orders/available"),
  getRiderOrders: (params?: unknown) =>
    apiClient.get("/orders/rider/mine", { params }),
  assignToMe: (id: string) => apiClient.post(`/orders/${id}/accept`),
  // Admin
  getAll: (params?: unknown) => apiClient.get("/orders", { params }),
  assignRider: (id: string, riderId: string) =>
    apiClient.post(`/orders/${id}/assign`, { riderId }),
};

export const paymentsApi = {
  initiate: (data: unknown) => apiClient.post("/payments/initiate", data),
  getByOrder: (orderId: string) => apiClient.get(`/payments/order/${orderId}`),
  getById: (id: string) => apiClient.get(`/payments/${id}`),
  getMyPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => apiClient.get("/payments/my", { params }),
  pollStatus: (orderId: string) =>
    apiClient.get(`/payments/order/${orderId}/poll`),
};

export const ridersApi = {
  getMe: () => apiClient.get("/riders/me"),
  updateStatus: (status: string) =>
    apiClient.patch("/riders/me/status", { status }),
  updateProfile: (data: unknown) => apiClient.patch("/riders/me", data),
  updateLocation: (location: Record<string, unknown>) =>
    apiClient.post("/riders/me/location", { location }),
  verify: (id: string, isVerified: boolean) =>
    apiClient.patch(`/riders/${id}/verify`, { isVerified }),
  rate: (data: unknown) => apiClient.post("/riders/rate", data),
};

export const usersApi = {
  getMe: () => apiClient.get("/users/me"),
  updateProfile: (data: unknown) => apiClient.patch("/users/me", data),
  uploadAvatar: (avatar: string) =>
    apiClient.post("/users/me/avatar", { avatar }),
  deleteAvatar: () => apiClient.delete("/users/me/avatar"),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post("/users/me/change-password", data),
  updatePreferences: (data: {
    smsAlerts: boolean;
    emailInvoices: boolean;
    promotions: boolean;
    pushEnabled?: boolean;
  }) => apiClient.patch("/users/me/preferences", data),
  updatePaymentMethod: (defaultPaymentMethod: string) =>
    apiClient.patch("/users/me/payment-method", { defaultPaymentMethod }),
  deactivateAccount: (reason?: string) =>
    apiClient.post("/users/me/deactivate", { reason }),
  getAddresses: () => apiClient.get("/users/me/addresses"),
  addAddress: (data: unknown) => apiClient.post("/users/me/addresses", data),
  updateAddress: (id: string, data: unknown) =>
    apiClient.patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id: string) =>
    apiClient.post(`/users/me/addresses/${id}/default`),
};

export const notificationsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    category?: string;
    priority?: string;
  }) => apiClient.get("/notifications", { params }),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/mark-all-read"),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  subscribe: (token: string) =>
    apiClient.post("/notifications/subscribe", { token }),
  unsubscribe: () => apiClient.post("/notifications/unsubscribe"),
};

export const adminApi = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  getDashboardStats: () => apiClient.get("/admin/dashboard/stats"),
  getRevenueAnalytics: (days?: number) =>
    apiClient.get("/admin/analytics/revenue", { params: { days } }),
  getOrdersByStatus: () => apiClient.get("/admin/analytics/orders"),
  getTopRiders: (limit?: number) =>
    apiClient.get("/admin/analytics/top-riders", { params: { limit } }),
  getRecentOrders: () => apiClient.get("/admin/orders/recent"),
  getOrders: (params?: unknown) => apiClient.get("/admin/orders", { params }),
  getUsers: (params?: unknown) => apiClient.get("/admin/users", { params }),
  getRiders: (params?: unknown) => apiClient.get("/admin/riders", { params }),
  updateUser: (id: string, data: unknown) =>
    apiClient.patch(`/admin/users/${id}`, data),
  updateRider: (id: string, data: unknown) =>
    apiClient.patch(`/admin/riders/${id}`, data),
  // Zones
  getZones: () => apiClient.get("/admin/zones"),
  // KYC
  getPendingVerifications: () =>
    apiClient.get("/admin/riders/pending-verification"),
  verifyRider: (id: string, isVerified: boolean) =>
    apiClient.patch(`/admin/riders/${id}/verify`, { isVerified }),
  // Payouts
  getPayouts: (status?: string) =>
    apiClient.get("/admin/payouts", { params: { status } }),
  // Promos
  getPromos: () => apiClient.get("/admin/promos"),
  createPromo: (data: unknown) => apiClient.post("/admin/promos", data),
  // Notifications
  getNotifications: (params?: unknown) =>
    apiClient.get("/admin/notifications", { params }),
  sendNotification: (data: unknown) =>
    apiClient.post("/admin/notifications", data),
  // Audit logs
  getAuditLogs: (params?: unknown) =>
    apiClient.get("/admin/audit-logs", { params }),
  // Support
  getSupportTickets: (status?: string) =>
    apiClient.get("/admin/support-tickets", { params: { status } }),
  updateSupportTicket: (id: string, data: unknown) =>
    apiClient.patch(`/admin/support-tickets/${id}`, data),
  // Fleet
  getFleetStats: () => apiClient.get("/admin/fleet-stats"),
  // Live map
  getRiderLocations: () => apiClient.get("/admin/riders/locations"),
  // Settings
  getSettings: () => apiClient.get("/admin/settings"),
  updateSettings: (data: unknown) => apiClient.patch("/admin/settings", data),
};

export const chatApi = {
  getConversations: () => apiClient.get("/chat/conversations"),
  getSupportConversation: () => apiClient.get("/chat/support"),
  getMessages: (
    conversationId: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (
    conversationId: string,
    data: {
      content: string;
      type?: string;
      imageUrl?: string;
      locationLat?: number;
      locationLng?: number;
    },
  ) => apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId: string) =>
    apiClient.patch(`/chat/conversations/${conversationId}/read`),
  getUnreadCount: () => apiClient.get("/chat/unread"),
  getRiderConversation: (orderId: string) =>
    apiClient.post(`/chat/conversations/rider/${orderId}`),
};
