"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  ChevronLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  PENDING: { label: "En attente", className: "badge-pending", icon: Clock },
  CONFIRMED: {
    label: "Confirmée",
    className: "badge-confirmed",
    icon: CheckCircle,
  },
  ASSIGNED: {
    label: "Livreur assigné",
    className: "badge-assigned",
    icon: CheckCircle,
  },
  PICKED_UP: { label: "Collecté", className: "badge-assigned", icon: Package },
  IN_TRANSIT: {
    label: "En route",
    className: "badge-in-transit",
    icon: MapPin,
  },
  DELIVERED: {
    label: "Livré",
    className: "badge-delivered",
    icon: CheckCircle,
  },
  CANCELLED: { label: "Annulé", className: "badge-cancelled", icon: XCircle },
  FAILED: { label: "Échoué", className: "badge-failed", icon: AlertCircle },
};

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 50 })
      .then((r) => setOrders(r.data.data.items || []))
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch =
      !search ||
      (o.orderNumber as string)?.toLowerCase().includes(search.toLowerCase()) ||
      (o.deliveryNeighborhood as string)
        ?.toLowerCase()
        .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { v: "all", label: "Tout" },
    { v: "PENDING", label: "En attente" },
    { v: "IN_TRANSIT", label: "En cours" },
    { v: "DELIVERED", label: "Livrées" },
    { v: "CANCELLED", label: "Annulées" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/customer"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Mes commandes
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-sur-var" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.v
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-sur-low"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-10 text-center">
            <Package className="w-12 h-12 text-outline-var mx-auto mb-3" />
            <h3 className="text-base font-bold text-on-surface mb-1">
              Aucune commande
            </h3>
            <p className="text-sm text-on-sur-var">
              {search || filter !== "all"
                ? "Essayez d'autres filtres"
                : "Créez votre première livraison"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const StatusIcon =
                statusConfig[order.status as string]?.icon || Clock;
              return (
                <Link
                  key={order.id as string}
                  href={`/customer/orders/${order.id}`}
                  className="card p-4 block hover:shadow-float transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-mono font-semibold text-on-surface">
                          {order.orderNumber as string}
                        </span>
                        <span
                          className={`badge ${statusConfig[order.status as string]?.className}`}
                        >
                          {statusConfig[order.status as string]?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-sur-var mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {order.deliveryNeighborhood as string}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-on-surface">
                          {formatCFA(order.totalAmount as number)}
                        </span>
                        <span className="text-xs text-on-sur-var">
                          {new Date(
                            order.createdAt as string,
                          ).toLocaleDateString("fr-CM")}
                        </span>
                      </div>
                    </div>
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
