"use client";

import { create } from "zustand";
import { notificationsApi } from "@/lib/api-client";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isDeletable: boolean;
  priority: string;
  imageUrl?: string | null;
  actionUrl?: string | null;
  category?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface NotificationState {
  notifications: Notification[];
  meta: NotificationMeta;
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: {
    type?: string;
    isRead?: boolean;
    category?: string;
    priority?: string;
  };
  lastFetch: number | null;
}

interface NotificationActions {
  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setFilters: (filters: NotificationState["filters"]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  resetState: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false },
  unreadCount: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  filters: {},
  lastFetch: null,
};

export const useNotificationStore = create<
  NotificationState & NotificationActions
>((set, get) => ({
  ...initialState,

  fetchNotifications: async (reset = false) => {
    const state = get();
    const page = reset ? 1 : state.meta.page;

    if (reset) {
      set({ isLoading: true, error: null });
    } else if (!reset && state.isLoading) {
      return;
    }

    try {
      const response = await notificationsApi.getAll({
        page,
        limit: state.meta.limit,
        ...state.filters,
      });

      const data = response.data.data;
      const notifications = data?.notifications || [];
      const meta = data?.meta || initialState.meta;

      set({
        notifications: reset
          ? notifications
          : [...state.notifications, ...notifications],
        meta: meta,
        unreadCount: data?.unreadCount ?? state.unreadCount,
        isLoading: false,
        lastFetch: Date.now(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications";
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadMore: async () => {
    const state = get();
    if (!state.meta.hasMore || state.isLoadingMore) return;

    set({ isLoadingMore: true });

    try {
      const nextPage = state.meta.page + 1;
      const response = await notificationsApi.getAll({
        page: nextPage,
        limit: state.meta.limit,
        ...state.filters,
      });

      const data = response.data.data;
      const newNotifications = data?.notifications || [];

      set({
        notifications: [...state.notifications, ...newNotifications],
        meta: data?.meta || state.meta,
        isLoadingMore: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load more";
      set({ error: errorMessage, isLoadingMore: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationsApi.delete(id);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          meta: {
            ...state.meta,
            total: state.meta.total - 1,
          },
          unreadCount:
            notification && !notification.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
        };
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      if (message.includes("cannot be deleted")) {
        throw new Error("Cette notification ne peut pas être supprimée");
      }
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.data.data?.count ?? 0 });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchNotifications(true);
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead
        ? state.unreadCount
        : state.unreadCount + 1,
      meta: { ...state.meta, total: state.meta.total + 1 },
    }));
  },

  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...updates } : n,
      ),
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount:
          notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        meta: { ...state.meta, total: state.meta.total - 1 },
      };
    });
  },

  resetState: () => {
    set(initialState);
  },
}));

export type { Notification, NotificationMeta };
