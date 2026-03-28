"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Package,
  MapPin,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bike,
} from "lucide-react";
import { ordersApi, adminApi } from "@/lib/api-client";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "badge-pending" },
  CONFIRMED: { label: "Confirmée", className: "badge-confirmed" },
  ASSIGNED: { label: "Assigné", className: "badge-assigned" },
  PICKED_UP: { label: "Collecté", className: "badge-picked-up" },
  IN_TRANSIT: { label: "En route", className: "badge-in-transit" },
  DELIVERED: { label: "Livré", className: "badge-delivered" },
  CANCELLED: { label: "Annulé", className: "badge-cancelled" },
  FAILED: { label: "Échoué", className: "badge-failed" },
};

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getOrders({ id: params.id })
      .then((r) => {
        const items = r.data.data?.items || [];
        setOrder(
          items.find((i: Record<string, unknown>) => i.id === params.id) ||
            items[0] ||
            null,
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-on-sur-var hover:text-primary"
          >
            <ChevronLeft className="w-5 h-5" /> Retour aux commandes
          </Link>
          <div className="card p-10 text-center mt-6">
            <Package className="w-12 h-12 text-outline-var mx-auto mb-3" />
            <h2 className="text-lg font-bold text-on-surface">
              Commande non trouvée
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">
              Commande {order.orderNumber as string}
            </h1>
            <p className="text-sm text-on-sur-var">
              Créée le{" "}
              {new Date(order.createdAt as string).toLocaleString("fr-CM")}
            </p>
          </div>
          <span
            className={`badge ml-auto ${statusConfig[order.status as string]?.className}`}
          >
            {statusConfig[order.status as string]?.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="card p-5">
              <h3 className="font-bold text-on-surface mb-4">Articles</h3>
              <div className="space-y-3">
                {((order.items as Record<string, unknown>[]) || []).map(
                  (item: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-sur-low rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-on-surface">
                          {item.name as string}
                        </span>
                      </div>
                      <span className="text-on-sur-var">
                        x{item.quantity as number}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-on-surface mb-4">Adresses</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-sur-low rounded-xl">
                  <p className="text-xs text-on-sur-var mb-2 font-medium">
                    Collecte
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {order.pickupNeighborhood as string}
                      </p>
                      <p className="text-xs text-on-sur-var">
                        {order.pickupStreet as string}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-sur-low rounded-xl">
                  <p className="text-xs text-on-sur-var mb-2 font-medium">
                    Livraison
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-secondary-container mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {order.deliveryNeighborhood as string}
                      </p>
                      <p className="text-xs text-on-sur-var">
                        {order.deliveryStreet as string}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {order.notes ? (
              <div className="card p-5">
                <h3 className="font-bold text-on-surface mb-2">Notes</h3>
                <p className="text-sm text-on-sur-var">{String(order.notes)}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-bold text-on-surface mb-4">Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">
                    {((order.user as Record<string, unknown>)
                      ?.name as string) || "Client"}
                  </p>
                  <p className="text-xs text-on-sur-var">
                    {((order.user as Record<string, unknown>)
                      ?.email as string) || ""}
                  </p>
                </div>
              </div>
            </div>

            {order.rider ? (
              <div className="card p-5">
                <h3 className="font-bold text-on-surface mb-4">Livreur</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
                    <Bike className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">
                      {(order.rider as Record<string, unknown>)?.name as string}
                    </p>
                    <p className="text-xs text-on-sur-var">
                      Note:{" "}
                      {((order.rider as Record<string, unknown>)
                        ?.rating as number) || "N/A"}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${(order.rider as Record<string, unknown>)?.phone}`}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <Phone className="w-4 h-4" />{" "}
                  {String(
                    (order.rider as Record<string, unknown>)?.phone || "",
                  )}
                </a>
              </div>
            ) : null}

            <div className="card p-5">
              <h3 className="font-bold text-on-surface mb-4">Paiement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-sur-var">Méthode</span>
                  <span className="text-on-surface">
                    {order.paymentMethod as string}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-sur-var">Statut</span>
                  <span
                    className={`badge ${order.paymentStatus === "SUCCESS" ? "badge-delivered" : "badge-pending"}`}
                  >
                    {order.paymentStatus as string}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-sur-low">
                  <span className="font-medium text-on-surface">Total</span>
                  <span className="font-bold text-on-surface">
                    {formatCFA(order.totalAmount as number)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
