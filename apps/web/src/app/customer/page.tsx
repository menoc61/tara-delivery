"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Phone,
  Mail,
  Star,
  Navigation,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, authApi } from "@/lib/api-client";
import { OrderStatus } from "@tara/types";
import toast from "react-hot-toast";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "badge-pending" },
  CONFIRMED: { label: "Confirmée", className: "badge-confirmed" },
  ASSIGNED: { label: "Livreur assigné", className: "badge-assigned" },
  PICKED_UP: { label: "Collecté", className: "badge-assigned" },
  IN_TRANSIT: { label: "En route", className: "badge-in-transit" },
  DELIVERED: { label: "Livré", className: "badge-delivered" },
  CANCELLED: { label: "Annulé", className: "badge-cancelled" },
  FAILED: { label: "Échoué", className: "badge-failed" },
};

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function CustomerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => setOrders(r.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
  );

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header - Glass effect, sticky */}
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900">TARA</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/customer/notifications"
              className="p-2 rounded-lg hover:bg-sur-low transition-colors"
            >
              <Bell className="w-5 h-5 text-on-sur-var" />
            </Link>
            <Link
              href="/customer/profile"
              className="p-2 rounded-lg hover:bg-sur-low transition-colors"
            >
              <User className="w-5 h-5 text-on-sur-var" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-sur-low transition-colors"
            >
              <LogOut className="w-5 h-5 text-on-sur-var" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Banner - Tonal gradient */}
        <div
          className="card p-6"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-container))",
          }}
        >
          <p className="text-white/80 text-sm mb-1">Bonjour,</p>
          <h1 className="text-2xl font-display font-bold text-white mb-4">
            {user?.name}
          </h1>
          <Link
            href="/customer/new-order"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle livraison
          </Link>
        </div>

        {/* Quick Stats - 3-col grid following DESIGN.md */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total",
              value: orders.length,
              icon: Package,
              color: "bg-primary/10 text-primary",
            },
            {
              label: "Actives",
              value: activeOrders.length,
              icon: Clock,
              color: "bg-secondary-container/20 text-secondary",
            },
            {
              label: "Livrées",
              value: deliveredCount,
              icon: CheckCircle,
              color: "bg-tertiary-fixed/10 text-tertiary-fixed",
            },
          ].map((s) => (
            <div key={s.label} className="card-tonal p-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-on-surface">
                {s.value}
              </p>
              <p className="text-xs text-on-sur-var mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active Orders - No border cards following No-Line rule */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-bold text-on-surface mb-4">
              Commandes actives
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Link
                  key={order.id as string}
                  href={`/customer/orders/${order.id}`}
                  className="block card p-4 hover:shadow-float transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono font-semibold text-on-surface">
                          {order.orderNumber as string}
                        </span>
                        <span
                          className={`badge ${statusConfig[order.status as string]?.className}`}
                        >
                          {statusConfig[order.status as string]?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-sur-var">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {order.deliveryNeighborhood as string}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-on-surface">
                          {formatCFA(order.totalAmount as number)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-on-sur-var" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-on-surface">
              Historique
            </h2>
            <Link
              href="/customer/orders"
              className="text-sm text-primary font-medium hover:underline"
            >
              Tout voir
            </Link>
          </div>

          {loading ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <Package className="w-12 h-12 text-outline-var mx-auto mb-3" />
              <h3 className="text-base font-bold text-on-surface mb-1">
                Pas encore de commandes
              </h3>
              <p className="text-sm text-on-sur-var mb-4">
                Créez votre première livraison
              </p>
              <Link
                href="/customer/new-order"
                className="btn-primary text-sm px-5 py-2.5"
              >
                <Plus className="w-4 h-4" /> Commander
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-sur-low">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id as string}
                  href={`/customer/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-sur-low transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      order.status === "DELIVERED"
                        ? "bg-tertiary-fixed"
                        : order.status === "CANCELLED"
                          ? "bg-error"
                          : order.status === "FAILED"
                            ? "bg-outline-var"
                            : "bg-secondary-container"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-on-surface">
                        {order.orderNumber as string}
                      </span>
                      <span className="text-sm font-bold text-on-surface">
                        {formatCFA(order.totalAmount as number)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`badge text-xs ${statusConfig[order.status as string]?.className}`}
                      >
                        {statusConfig[order.status as string]?.label}
                      </span>
                      <span className="text-xs text-on-sur-var">
                        {new Date(order.createdAt as string).toLocaleDateString(
                          "fr-CM",
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card p-6">
          <h3 className="text-base font-display font-bold text-on-surface mb-4">
            Besoin d'aide?
          </h3>
          <div className="space-y-3">
            <a
              href="tel:+2376XXXXXXX"
              className="flex items-center gap-3 text-sm text-on-sur-var hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              +237 6XX XXX XXX
            </a>
            <a
              href="mailto:support@tara-delivery.cm"
              className="flex items-center gap-3 text-sm text-on-sur-var hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@tara-delivery.cm
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
