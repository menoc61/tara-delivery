"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: { label: "En attente", class: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmée", class: "bg-blue-100 text-blue-800" },
  ASSIGNED: { label: "Assignée", class: "bg-purple-100 text-purple-800" },
  PICKED_UP: { label: "Collectée", class: "bg-indigo-100 text-indigo-800" },
  IN_TRANSIT: { label: "En route", class: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Livrée", class: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", class: "bg-red-100 text-red-800" },
  FAILED: { label: "Échouée", class: "bg-red-100 text-red-800" },
};

function RiderOrdersContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "active";
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [tab]);

  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const statusFilter =
        tab === "active"
          ? "PENDING,CONFIRMED,ASSIGNED,PICKED_UP,IN_TRANSIT"
          : "DELIVERED,CANCELLED,FAILED";
      const res = await ordersApi.getMyOrders({
        status: statusFilter,
        limit: 50,
      });
      setOrders(res.data.data.items || []);
    } catch (err) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => loadOrders(true);

  return (
    <div className="min-h-screen bg-surface">
      <header
        className="sticky top-0 z-40"
        style={{
          background:
            "linear-gradient(135deg, var(--primary), var(--primary-container))",
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/rider" className="text-white">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-display font-bold text-white">
              Mes commandes
            </h1>
          </div>
        </div>

        <div className="flex px-4 pb-4">
          <Link
            href="/rider/orders?tab=active"
            className={`flex-1 text-center py-2 rounded-lg font-medium text-sm ${
              tab === "active"
                ? "bg-white text-primary"
                : "text-white/70 bg-white/10"
            }`}
          >
            En cours
          </Link>
          <Link
            href="/rider/orders?tab=completed"
            className={`flex-1 text-center py-2 rounded-lg font-medium text-sm ml-2 ${
              tab === "completed"
                ? "bg-white text-primary"
                : "text-white/70 bg-white/10"
            }`}
          >
            Terminées
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">
            {tab === "active" ? "Commandes en cours" : "Historique"}
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <Package className="w-10 h-10 text-outline-var mx-auto mb-3" />
            <p className="text-sm text-on-sur-var">
              {tab === "active"
                ? "Aucune commande en cours"
                : "Aucune commande terminée"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = order.status as string;
              const statusInfo = statusLabels[status] || {
                label: status,
                class: "bg-gray-100 text-gray-800",
              };

              return (
                <Link
                  key={order.id as string}
                  href={`/rider/orders/${order.id}`}
                  className="card p-4 block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono font-bold text-on-surface">
                      {order.orderNumber as string}
                    </span>
                    <span className={`badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-on-sur-var mb-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="truncate">
                      {order.pickupNeighborhood as string}
                    </span>
                    <span>→</span>
                    <span className="truncate">
                      {order.deliveryNeighborhood as string}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-sur-low">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-on-sur-var" />
                      <span className="text-xs text-on-sur-var">
                        {new Date(order.createdAt as string).toLocaleDateString(
                          "fr-CM",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-primary">
                      {formatCFA(order.totalAmount as number)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiderOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <RiderOrdersContent />
    </Suspense>
  );
}
