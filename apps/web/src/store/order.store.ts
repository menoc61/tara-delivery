import { create } from "zustand";
import { Order, OrderStatus } from "@tara/types";

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  setOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  setOrders: (orders) => set({ orders }),

  setActiveOrder: (activeOrder) => set({ activeOrder }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status }
          : state.activeOrder,
    })),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
