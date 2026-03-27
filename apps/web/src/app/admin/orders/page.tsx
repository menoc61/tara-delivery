"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { adminApi } from "@/lib/api-client";
import { OrderStatus } from "@tara/types";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "badge-pending" },
  CONFIRMED: { label: "Confirmée", className: "badge-confirmed" },
  ASSIGNED: { label: "Assignée", className: "badge-assigned" },
  PICKED_UP: { label: "Collecté", className: "badge-picked-up" },
  IN_TRANSIT: { label: "En route", className: "badge-in-transit" },
  DELIVERED: { label: "Livrée", className: "badge-delivered" },
  CANCELLED: { label: "Annulée", className: "badge-cancelled" },
  FAILED: { label: "Échouée", className: "badge-failed" },
};

export default function AdminOrdersPage() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      const res = await adminApi.getOrders({ page, limit: 20 });
      setOrders(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    clearAuth();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Commandes
          </h1>
          <p className="text-sm text-gray-500">{total} commandes au total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  N° Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id as string} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                    {order.orderNumber as string}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(order.user as Record<string, unknown>)?.name as string}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.type as string}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCFA(order.totalAmount as number)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge ${statusConfig[order.status as string]?.className}`}
                    >
                      {statusConfig[order.status as string]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt as string).toLocaleDateString(
                      "fr-CM",
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="btn-secondary py-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
