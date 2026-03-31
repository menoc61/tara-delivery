"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  MapPin,
  CheckCircle,
  Phone,
  Star,
  ChevronRight,
  ArrowLeft,
  Truck,
  Clock,
  User,
  Share2,
  AlertCircle,
  Download,
  XCircle,
  Navigation,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, ridersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type * as L from "leaflet";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import { DetailSkeleton } from "@/components/shared/Skeleton";
import toast from "react-hot-toast";

interface OrderForDetail {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  createdAt: string;
  pickupStreet?: string;
  pickupNeighborhood?: string;
  pickupCity?: string;
  deliveryStreet?: string;
  deliveryNeighborhood?: string;
  deliveryCity?: string;
  items: {
    name: string;
    quantity: number;
    weight?: number;
    description?: string;
  }[];
  rider?: {
    id?: string;
    userId?: string;
    lat?: number;
    lng?: number;
    user?: { name: string; phone: string; avatar?: string };
    rating?: number;
  };
  payment?: { status: string; method: string; amount: number };
  statusLogs?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    notes?: string;
  }>;
}

const statusSteps = [
  { key: "PENDING", label: "En attente", icon: Clock },
  { key: "CONFIRMED", label: "Confirmée", icon: CheckCircle },
  { key: "ASSIGNED", label: "Assigné", icon: User },
  { key: "PICKED_UP", label: "Ramassé", icon: Package },
  { key: "IN_TRANSIT", label: "Transit", icon: Truck },
  { key: "DELIVERED", label: "Livré", icon: CheckCircle },
];

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const getMethodName = (method?: string) => {
  const names: Record<string, string> = {
    MTN_MOMO: "MTN MoMo",
    ORANGE_MONEY: "Orange Money",
    CASH_ON_DELIVERY: "Espèces",
  };
  return names[method || ""] || method || "N/A";
};

const yaoundeCoords: Record<string, { lat: number; lng: number }> = {
  Bastos: { lat: 3.8667, lng: 11.5167 },
  Nlongkak: { lat: 3.8583, lng: 11.5083 },
  "Biyem-Assi": { lat: 3.825, lng: 11.4833 },
  Mokolo: { lat: 3.8583, lng: 11.4917 },
  Odza: { lat: 3.8083, lng: 11.5083 },
  Mvan: { lat: 3.8333, lng: 11.5083 },
  Ekounou: { lat: 3.8417, lng: 11.525 },
  Default: { lat: 3.8667, lng: 11.5167 },
};

// Safe Leaflet Map Component
function OrderMap({ order }: { order: OrderForDetail }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Only init once the container has dimensions
    const container = mapContainerRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) return;

    const initMap = async () => {
      const L = await import("leaflet");

      // Load CSS once
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Destroy existing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear container
      container.innerHTML = "";

      // Get coords
      const pickup =
        yaoundeCoords[order.pickupNeighborhood || "Default"] ||
        yaoundeCoords.Default;
      const delivery =
        yaoundeCoords[order.deliveryNeighborhood || "Default"] ||
        yaoundeCoords.Default;
      const center: [number, number] = [
        (pickup.lat + delivery.lat) / 2,
        (pickup.lng + delivery.lng) / 2,
      ];

      // Create map with proper options
      const map = L.map(container, {
        center,
        zoom: 13,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      // Markers
      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="background:#00503a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">P</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const deliveryIcon = L.divIcon({
        className: "",
        html: `<div style="background:#ba1a1a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">D</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      L.marker([delivery.lat, delivery.lng], { icon: deliveryIcon }).addTo(map);

      const line = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [delivery.lat, delivery.lng],
        ],
        { color: "#00503a", weight: 3, dashArray: "8,8" },
      ).addTo(map);

      map.fitBounds(line.getBounds(), { padding: [40, 40] });
      setMapReady(true);
    };

    // Use requestAnimationFrame to ensure container is ready
    const timer = requestAnimationFrame(() => initMap());

    return () => {
      cancelAnimationFrame(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00503a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Rating Modal
function RatingModal({
  order,
  onClose,
  onSubmit,
}: {
  order: OrderForDetail;
  onClose: () => void;
  onSubmit: (score: number, comment: string) => void;
}) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }
    setSubmitting(true);
    await onSubmit(score, comment);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#00503a]">
            Évaluer le livreur
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#00503a]/10 flex items-center justify-center mx-auto mb-3">
            {order.rider?.user?.avatar ? (
              <img
                src={order.rider.user.avatar}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-[#00503a]" />
            )}
          </div>
          <p className="font-bold">{order.rider?.user?.name || "Livreur"}</p>
          <p className="text-xs text-slate-500">
            Commande #{order.orderNumber}
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              onClick={() => setScore(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoverScore || score)
                    ? "text-[#feb700] fill-[#feb700]"
                    : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mb-4">
          {["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"][score]}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Commentaire (optionnel)"
          rows={3}
          maxLength={500}
          className="w-full bg-[#f2f4f2] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || score === 0}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            submitting || score === 0
              ? "bg-slate-200 text-slate-400"
              : "bg-[#00503a] text-white hover:bg-[#006a4e]"
          }`}
        >
          {submitting ? "Envoi..." : "Envoyer l'évaluation"}
        </button>
      </div>
    </div>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderForDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/customer/orders");
      return;
    }

    ordersApi
      .getById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        router.push("/customer/orders");
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const handleRate = async (score: number, comment: string) => {
    if (!order?.rider) return;
    try {
      await ridersApi.rate({ orderId: order.id, score, comment });
      toast.success("Merci pour votre évaluation!");
      setShowRatingModal(false);
      // Refresh order
      const res = await ordersApi.getById(order.id);
      setOrder(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/customer/orders/track?orderId=${order?.id}`;
    if (navigator.share) {
      navigator.share({ title: `Suivi commande #${order?.orderNumber}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié!");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 p-8 text-center">
        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">Commande non trouvée</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "DELIVERED";
  const isActive = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(
    order.status,
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 md:pb-24">
      {/* Back + Breadcrumb */}
      <Link
        href="/customer/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#00503a] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00503a]">
            Détails de la Livraison
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commande #{order.orderNumber}
          </p>
        </div>
        <div className="flex gap-3">
          {isDelivered && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#feb700] text-[#271900] font-bold rounded-xl text-sm hover:opacity-90 transition-all"
            >
              <Star className="w-4 h-4" />
              Noter
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e7e9e6] text-[#191c1b] font-medium rounded-xl text-sm hover:bg-[#e1e3e1] transition-all"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#9ef4d0] rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#00503a]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">
                    Statut de la livraison
                  </p>
                  <p className="text-lg font-bold text-[#00503a]">
                    {statusSteps[currentStepIndex]?.label || order.status}
                  </p>
                </div>
              </div>
              {isActive && (
                <div className="bg-[#006a4e] text-[#9ef4d0] px-4 py-2 rounded-full text-xs font-bold">
                  En cours
                </div>
              )}
            </div>

            {/* Visual Timeline */}
            <div className="relative">
              <div className="flex justify-between relative z-10">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const StepIcon = step.icon;
                  const log = order.statusLogs?.find(
                    (l) => l.toStatus === step.key,
                  );
                  const time = log
                    ? new Date(log.timestamp).toLocaleTimeString("fr-CM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--";

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-[#83d7b4] text-[#00503a] shadow-lg border-2 border-[#00503a]"
                            : isCompleted
                              ? "bg-[#00503a] text-white"
                              : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                          isCurrent
                            ? "text-[#00503a]"
                            : isCompleted
                              ? "text-[#191c1b]"
                              : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{time}</span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-[#00503a] transition-all"
                  style={{
                    width: `${Math.min(100, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Map & Route */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map */}
            <div className="relative">
              <OrderMap order={order} />
              {isActive && order.rider && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl flex items-center gap-3 shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-[#feb700] flex items-center justify-center overflow-hidden">
                    {order.rider.user?.avatar ? (
                      <img
                        src={order.rider.user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#271900]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Votre Livreur
                    </p>
                    <p className="font-bold text-sm">
                      {order.rider.user?.name || "Livreur"}
                    </p>
                  </div>
                  <a
                    href={`tel:${order.rider.user?.phone}`}
                    className="w-10 h-10 bg-[#00503a] text-white rounded-full flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Route Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-[#00503a] bg-white" />
                    <div className="w-0.5 h-12 bg-slate-200 my-1" />
                    <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        Départ
                      </p>
                      <p className="font-bold text-sm">
                        {order.pickupStreet || "Adresse"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.pickupNeighborhood}, Yaoundé
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        Arrivée
                      </p>
                      <p className="font-bold text-sm">
                        {order.deliveryStreet || "Adresse"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.deliveryNeighborhood}, Yaoundé
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                    Type de Colis
                  </p>
                  <p className="font-bold text-[#00503a]">
                    {order.type === "FOOD"
                      ? "Repas"
                      : order.type === "GROCERY"
                        ? "Courses"
                        : order.type === "COURIER"
                          ? "Express"
                          : "Colis"}
                    {order.items?.[0]?.weight
                      ? ` (${order.items[0].weight}kg)`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Items Section */}
          <section className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Contenu de l&apos;envoi</h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[#f2f4f2] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Package className="w-5 h-5 text-[#00503a]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold">{item.quantity}x</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <section className="bg-[#00503a] text-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Récapitulatif</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-white/70 text-sm">
                <span>Frais de livraison</span>
                <span>{formatCFA(order.deliveryFee)}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-black">
                  {formatCFA(order.totalAmount)}
                </span>
              </div>
            </div>
            {order.payment && (
              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#00503a]">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/60 uppercase font-bold">
                    Paiement
                  </p>
                  <p className="font-bold text-sm">
                    {getMethodName(order.payment.method)}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </section>

          {/* Notes & Actions */}
          <section className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            {order.notes && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                  Notes
                </p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}

            {isActive && (
              <>
                <div className="h-px bg-slate-100" />
                <Link
                  href={`/customer/messages/${order.id}`}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f2f4f2] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Navigation className="w-4 h-4 text-[#00503a]" />
                    <span className="font-medium text-sm">
                      Contacter le livreur
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </>
            )}

            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
              <button
                onClick={() => {
                  if (confirm("Voulez-vous annuler cette commande?")) {
                    ordersApi
                      .cancel(order.id, "Annulée par le client")
                      .then(() => {
                        toast.success("Commande annulée");
                        router.push("/customer/orders");
                      });
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    Annuler la commande
                  </span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </section>

          {/* Rating Section (for delivered) */}
          {isDelivered && (
            <section className="bg-[#feb700]/20 rounded-3xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#feb700]/30 rounded-full flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#7c5800]" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">
                    Évaluez votre expérience
                  </p>
                  <p className="text-xs text-slate-600 mb-3">
                    Votre avis aide à améliorer le service.
                  </p>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="flex items-center gap-1 bg-[#feb700] text-[#271900] px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    <Star className="w-3 h-3" />
                    Noter maintenant
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          order={order}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRate}
        />
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />
      <div className="flex pt-20">
        <Sidebar />
        <Suspense
          fallback={
            <div className="flex-1 p-8">
              <DetailSkeleton />
            </div>
          }
        >
          <OrderDetailContent />
        </Suspense>
      </div>
      <PageFooter />
      <MobileNav />
    </div>
  );
}
