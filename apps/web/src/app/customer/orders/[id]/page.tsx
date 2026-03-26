"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  User,
  ChevronLeft,
  Navigation,
  Star,
  MessageCircle,
  Bike,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { OrderStatus } from "@tara/types";

const statusSteps = [
  { status: "PENDING", label: "En attente", icon: Clock },
  { status: "CONFIRMED", label: "Confirmée", icon: CheckCircle },
  { status: "ASSIGNED", label: "Livreur assigné", icon: User },
  { status: "PICKED_UP", label: "Collecté", icon: Package },
  { status: "IN_TRANSIT", label: "En route", icon: Bike },
  { status: "DELIVERED", label: "Livrée", icon: CheckCircle },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "badge-pending" },
  CONFIRMED: { label: "Confirmée", className: "badge-confirmed" },
  ASSIGNED: { label: "Livreur assigné", className: "badge-assigned" },
  PICKED_UP: { label: "Collecté", className: "badge-picked-up" },
  IN_TRANSIT: { label: "En route", className: "badge-in-transit" },
  DELIVERED: { label: "Livré", className: "badge-delivered" },
  CANCELLED: { label: "Annulé", className: "badge-cancelled" },
  FAILED: { label: "Échoué", className: "badge-failed" },
};

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  pickupAddress: { street: string; neighborhood: string; city: string };
  deliveryAddress: { street: string; neighborhood: string; city: string };
  rider?: { name: string; phone: string; rating: number };
  items: { name: string; quantity: number }[];
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch(() => {
        toast.error("Commande non trouvée");
        router.push("/customer");
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.status === order?.status,
  );
  const isActive = (stepStatus: string) => {
    const idx = statusSteps.findIndex((s) => s.status === stepStatus);
    return idx <= currentStepIndex && idx >= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-sur-low"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-on-sur-var">Commande</p>
            <h1 className="font-display font-bold text-on-surface">
              {order.orderNumber}
            </h1>
          </div>
          <span className={`badge ${statusConfig[order.status]?.className}`}>
            {statusConfig[order.status]?.label}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Timeline */}
        <div className="card p-6">
          <h2 className="text-base font-display font-bold text-on-surface mb-6">
            Suivi de commande
          </h2>
          <div className="relative">
            {statusSteps.map((step, idx) => {
              const completed = isActive(step.status);
              const current = order.status === step.status;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.status}
                  className="flex items-start gap-4 relative"
                >
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-12 -translate-x-1/2 ${
                        completed ? "bg-primary" : "bg-sur-high"
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                      completed ? "bg-primary" : "bg-sur-high"
                    }`}
                  >
                    <StepIcon
                      className={`w-4 h-4 ${completed ? "text-white" : "text-on-sur-var"}`}
                    />
                  </div>
                  <div className="flex-1 pb-6">
                    <p
                      className={`text-sm font-semibold ${current ? "text-primary" : completed ? "text-on-surface" : "text-on-sur-var"}`}
                    >
                      {step.label}
                    </p>
                    {current && (
                      <p className="text-xs text-on-sur-var mt-1">
                        En cours...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map placeholder - would integrate with MapLibre */}
        <div className="card p-4 h-48 flex items-center justify-center bg-sur-low">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-on-sur-var mx-auto mb-2" />
            <p className="text-sm text-on-sur-var">
              Carte de suivi en temps réel
            </p>
            <p className="text-xs text-on-sur-var">
              Intégration MapLibre à venir
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <h2 className="text-base font-display font-bold text-on-surface mb-4">
            Itinéraire
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-on-sur-var uppercase tracking-wide">
                  Collecte
                </p>
                <p className="text-sm text-on-surface">
                  {order.pickupAddress.street}
                </p>
                <p className="text-xs text-on-sur-var">
                  {order.pickupAddress.neighborhood}, {order.pickupAddress.city}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary-container mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-on-sur-var uppercase tracking-wide">
                  Livraison
                </p>
                <p className="text-sm text-on-surface">
                  {order.deliveryAddress.street}
                </p>
                <p className="text-xs text-on-sur-var">
                  {order.deliveryAddress.neighborhood},{" "}
                  {order.deliveryAddress.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rider Info */}
        {order.rider && (
          <div className="card p-6">
            <h2 className="text-base font-display font-bold text-on-surface mb-4">
              Livreur
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">{order.rider.name}</p>
                <div className="flex items-center gap-1 text-sm text-on-sur-var">
                  <Star className="w-4 h-4 text-secondary-container fill-current" />
                  {order.rider.rating.toFixed(1)}
                </div>
              </div>
              <a href={`tel:${order.rider.phone}`} className="btn-primary p-3">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-6">
          <h2 className="text-base font-display font-bold text-on-surface mb-4">
            Articles
          </h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sur-low flex items-center justify-center">
                    <Package className="w-4 h-4 text-on-sur-var" />
                  </div>
                  <span className="text-sm text-on-surface">{item.name}</span>
                </div>
                <span className="text-xs text-on-sur-var">
                  x{item.quantity}
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-sur-low">
              <p className="text-xs text-on-sur-var mb-1">Notes</p>
              <p className="text-sm text-on-surface">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="card p-6">
          <h2 className="text-base font-display font-bold text-on-surface mb-4">
            Paiement
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-sur-var">Total</span>
              <span className="font-bold text-on-surface">
                {formatCFA(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {order.status === "DELIVERED" && (
            <button className="btn-primary flex-1">
              <Star className="w-4 h-4" /> Noter la livraison
            </button>
          )}
          <button className="btn-secondary flex-1">
            <MessageCircle className="w-4 h-4" /> Assistance
          </button>
        </div>
      </div>
    </div>
  );
}
