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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
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
        const { tokens } = stored ? JSON.parse(stored).state : {};

        if (tokens?.refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          const newTokens = data.data;
          const current = JSON.parse(localStorage.getItem("tara-auth") || "{}");
          current.state.tokens = newTokens;
          localStorage.setItem("tara-auth", JSON.stringify(current));

          refreshQueue.forEach((cb) => cb(newTokens.accessToken));
          refreshQueue = [];
          original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(original);
        }
      } catch {
        localStorage.removeItem("tara-auth");
        window.location.href = "/auth/login";
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
  getMyOrders: (params?: unknown) => apiClient.get("/orders/my", { params }),
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
  verify: (orderId: string) =>
    apiClient.get(`/payments/order/${orderId}/verify`),
};

export const ridersApi = {
  register: (data: unknown) => apiClient.post("/riders/register", data),
  getMe: () => apiClient.get("/riders/me"),
  updateStatus: (status: unknown) =>
    apiClient.patch("/riders/me/status", status),
  updateLocation: (location: unknown) =>
    apiClient.post("/riders/me/location", location),
  getAll: (params?: unknown) => apiClient.get("/riders", { params }),
  getById: (id: string) => apiClient.get(`/riders/${id}`),
  verify: (id: string, isVerified: boolean) =>
    apiClient.patch(`/riders/${id}/verify`, { isVerified }),
  rate: (data: unknown) => apiClient.post("/riders/rate", data),
};

export const usersApi = {
  getMe: () => apiClient.get("/users/me"),
  updateProfile: (data: unknown) => apiClient.patch("/users/me", data),
  getAddresses: () => apiClient.get("/users/me/addresses"),
  addAddress: (data: unknown) => apiClient.post("/users/me/addresses", data),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
};

export const notificationsApi = {
  getAll: (params?: unknown) => apiClient.get("/notifications", { params }),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/mark-all-read"),
  updateFcmToken: (token: string) =>
    apiClient.post("/notifications/fcm-token", { token }),
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
  getUsers: (params?: unknown) => apiClient.get("/admin/users", { params }),
  updateUser: (id: string, data: unknown) =>
    apiClient.patch(`/admin/users/${id}`, data),
};
