"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Plus, MapPin, Clock, CheckCircle,
  ChevronRight, Bell, LogOut, User
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, authApi } from "@/lib/api-client";
import { OrderStatus } from "@tara/types";
import toast from "react-hot-toast";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "En attente",  className: "badge-pending" },
  CONFIRMED:  { label: "Confirmée",  className: "badge-confirmed" },
  ASSIGNED:   { label: "Livreur assigné", className: "badge-assigned" },
  PICKED_UP:  { label: "Collecté",   className: "badge-assigned" },
  IN_TRANSIT: { label: "En route",   className: "badge-in-transit" },
  DELIVERED:  { label: "Livré",      className: "badge-delivered" },
  CANCELLED:  { label: "Annulé",     className: "badge-cancelled" },
  FAILED:     { label: "Échoué",     className: "badge-failed" },
};

const formatCFA = (v: number) => new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function CustomerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getMyOrders({ limit: 10 })
      .then((r) => setOrders(r.data.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const activeOrders = orders.filter((o) =>
    !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string)
  );

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-gray-900">TARA</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <User className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome + CTA */}
        <div className="bg-gradient-to-r from-brand-500 to-orange-500 rounded-3xl p-6 text-white">
          <p className="text-white/80 text-sm mb-1">Bonjour,</p>
          <h1 className="text-2xl font-bold font-display mb-4">{user?.name} 👋</h1>
          <Link
            href="/customer/new-order"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvelle livraison
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: orders.length, icon: Package, color: "text-blue-600 bg-blue-50" },
            { label: "Actives", value: activeOrders.length, icon: Clock, color: "text-orange-600 bg-orange-50" },
            { label: "Livrées", value: orders.filter((o) => o.status === "DELIVERED").length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold font-display text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3 font-display">Commandes actives</h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Link
                  key={order.id as string}
                  href={`/customer/orders/${order.id}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 font-mono">
                        {order.orderNumber as string}
                      </span>
                      <span className={`badge ${statusConfig[order.status as string]?.className}`}>
                        {statusConfig[order.status as string]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{order.deliveryNeighborhood as string}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatCFA(order.totalAmount as number)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 font-display">Historique</h2>
            <Link href="/customer/orders" className="text-sm text-brand-500 font-medium hover:text-brand-600">
              Tout voir
            </Link>
          </div>

          {loading ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Pas encore de commandes</h3>
              <p className="text-xs text-gray-400 mb-4">Créez votre première livraison</p>
              <Link href="/customer/new-order" className="btn-primary text-sm px-5 py-2.5">
                <Plus className="w-4 h-4" /> Commander
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-gray-50">
              {orders.slice(0, 8).map((order) => (
                <Link
                  key={order.id as string}
                  href={`/customer/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0`}
                    style={{ background: { DELIVERED: "#10B981", CANCELLED: "#EF4444", FAILED: "#6B7280", PENDING: "#F59E0B" }[order.status as string] || "#FF6B2C" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-gray-700">{order.orderNumber as string}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCFA(order.totalAmount as number)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`badge text-xs ${statusConfig[order.status as string]?.className}`}>
                        {statusConfig[order.status as string]?.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt as string).toLocaleDateString("fr-CM")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
