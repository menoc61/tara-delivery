"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Package,
  ChevronLeft,
  CheckCircle,
  Navigation,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: {
    label: "En attente",
    class: "badge bg-yellow-100 text-yellow-800",
  },
  CONFIRMED: { label: "Confirmée", class: "badge bg-blue-100 text-blue-800" },
  ASSIGNED: { label: "Assignée", class: "badge bg-purple-100 text-purple-800" },
  PICKED_UP: {
    label: "Collectée",
    class: "badge bg-indigo-100 text-indigo-800",
  },
  IN_TRANSIT: {
    label: "En route",
    class: "badge bg-orange-100 text-orange-800",
  },
  DELIVERED: { label: "Livrée", class: "badge bg-green-100 text-green-800" },
  CANCELLED: { label: "Annulée", class: "badge bg-red-100 text-red-800" },
  FAILED: { label: "Échouée", class: "badge bg-red-100 text-red-800" },
};

const statusActions: Record<string, string> = {
  ASSIGNED: "pickup",
  PICKED_UP: "deliver",
  IN_TRANSIT: "complete",
};

export default function RiderOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await ordersApi.getById(orderId);
      setOrder(res.data.data);
    } catch (err) {
      toast.error("Commande non trouvée");
      router.push("/rider/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success("Statut mis à jour");
      loadOrder();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = order.status as string;
  const statusInfo = statusLabels[status] || {
    label: status,
    class: "badge bg-gray-100",
  };
  const nextAction = statusActions[status];

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
            <Link href="/rider/orders" className="text-white">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-bold text-white">
                {order.orderNumber as string}
              </h1>
              <p className="text-white/70 text-sm">{statusInfo.label}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Map placeholder */}
        <div className="card p-0 overflow-hidden">
          <div className="h-48 bg-sur-low flex items-center justify-center">
            <MapPin className="w-8 h-8 text-on-sur-var" />
          </div>
        </div>

        {/* Addresses */}
        <div className="card p-4">
          <h2 className="font-bold text-on-surface mb-4">Itinéraire</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-primary mt-1" />
              <div className="flex-1">
                <p className="text-xs text-on-sur-var">Point de ramassage</p>
                <p className="text-sm text-on-surface">
                  {order.pickupStreet as string}
                </p>
                <p className="text-xs text-on-sur-var">
                  {order.pickupNeighborhood as string}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary-container mt-1" />
              <div className="flex-1">
                <p className="text-xs text-on-sur-var">Point de livraison</p>
                <p className="text-sm text-on-surface">
                  {order.deliveryStreet as string}
                </p>
                <p className="text-xs text-on-sur-var">
                  {order.deliveryNeighborhood as string}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="card p-4">
          <h2 className="font-bold text-on-surface mb-4">Détails</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-on-sur-var">Type</span>
              <span className="text-sm text-on-surface capitalize">
                {order.type as string}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-sur-var">Montant</span>
              <span className="text-sm font-bold text-primary">
                {formatCFA(order.totalAmount as number)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-on-sur-var">Créé le</span>
              <span className="text-sm text-on-surface">
                {new Date(order.createdAt as string).toLocaleDateString(
                  "fr-CM",
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Contact */}
        {(status === "ASSIGNED" ||
          status === "PICKED_UP" ||
          status === "IN_TRANSIT") && (
          <div className="card p-4">
            <h2 className="font-bold text-on-surface mb-4">Contact client</h2>
            <a
              href={`tel:${(order.user as Record<string, unknown>)?.phone}`}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Appeler le client
            </a>
          </div>
        )}

        {/* Action Button */}
        {nextAction && (
          <button
            onClick={() => {
              const actions: Record<string, string> = {
                pickup: "PICKED_UP",
                deliver: "IN_TRANSIT",
                complete: "DELIVERED",
              };
              handleStatusUpdate(actions[nextAction]);
            }}
            disabled={updating}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {nextAction === "pickup" && <Package className="w-5 h-5" />}
            {nextAction === "deliver" && <Navigation className="w-5 h-5" />}
            {nextAction === "complete" && <CheckCircle className="w-5 h-5" />}
            {nextAction === "pickup" && "Confirmer le retrait"}
            {nextAction === "deliver" && "Démarrer la livraison"}
            {nextAction === "complete" && "Confirmer la livraison"}
          </button>
        )}
      </div>
    </div>
  );
}
