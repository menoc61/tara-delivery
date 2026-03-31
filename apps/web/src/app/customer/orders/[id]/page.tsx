"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import type * as L from "leaflet";
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
  ArrowLeft,
  Truck,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DetailSkeleton } from "@/components/shared/Skeleton";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";

const statusSteps = [
  { status: "PENDING", label: "En attente", icon: Clock },
  { status: "CONFIRMED", label: "Confirmée", icon: CheckCircle },
  { status: "ASSIGNED", label: "Livreur assigné", icon: User },
  { status: "PICKED_UP", label: "Collecté", icon: Package },
  { status: "IN_TRANSIT", label: "En route", icon: Bike },
  { status: "DELIVERED", label: "Livrée", icon: CheckCircle },
];

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

interface OrderDetails {
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
  rider?: {
    user?: { name: string; phone: string; avatar?: string };
    rating?: number;
  };
  items: { name: string; quantity: number; weight?: number }[];
  payment?: { status: string; method: string; amount: number };
}

// Map component using Leaflet
function TrackingMap({
  pickup,
  delivery,
  status,
}: {
  pickup?: { lat: number; lng: number };
  delivery?: { lat: number; lng: number };
  status: string;
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const loadMap = async () => {
      const L = await import("leaflet");

      // Check if CSS already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Destroy existing map if any
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Clear container
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = "";
      }

      const map = L.map(mapContainerRef.current!).setView(
        [3.8667, 11.5167],
        13,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Pickup marker (green)
      const pickupIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#00503a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">P</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Delivery marker (red)
      const deliveryIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#ba1a1a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">D</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Yaoundé actual coordinates
      const pickupCoords = pickup || { lat: 3.8667, lng: 11.5167 };
      const deliveryCoords = delivery || { lat: 3.8333, lng: 11.5 };

      L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup("Point de collecte");

      L.marker([deliveryCoords.lat, deliveryCoords.lng], {
        icon: deliveryIcon,
      })
        .addTo(map)
        .bindPopup("Point de livraison");

      // Draw route line
      L.polyline(
        [
          [pickupCoords.lat, pickupCoords.lng],
          [deliveryCoords.lat, deliveryCoords.lng],
        ],
        { color: "#00503a", weight: 3, dashArray: "10,10" },
      ).addTo(map);

      // Fit bounds
      map.fitBounds(
        [
          [pickupCoords.lat, pickupCoords.lng],
          [deliveryCoords.lat, deliveryCoords.lng],
        ],
        { padding: [50, 50] },
      );

      setMapLoaded(true);
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickup, delivery]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00503a] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Chargement de la carte...</p>
          </div>
        </div>
      )}
      {/* Status overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "IN_TRANSIT" || status === "PICKED_UP"
                ? "bg-emerald-500 animate-pulse"
                : status === "DELIVERED"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-medium text-slate-700">
            {status === "IN_TRANSIT"
              ? "En route vers vous"
              : status === "PICKED_UP"
                ? "Colis récupéré"
                : status === "DELIVERED"
                  ? "Livré"
                  : "En attente"}
          </span>
        </div>
      </div>
    </div>
  );
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
      .catch((err) => {
        toast.error(getErrorMessage(err));
        router.push("/customer/orders");
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

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#00503a] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux commandes
          </Link>

          {loading ? (
            <DetailSkeleton />
          ) : !order ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Commande non trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Commande
                    </p>
                    <h1 className="text-2xl font-extrabold text-[#00503a]">
                      {order.orderNumber}
                    </h1>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("fr-CM", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>
                    {new Date(order.createdAt).toLocaleTimeString("fr-CM", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-sm text-[#191c1b] mb-6">
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
                              completed ? "bg-[#00503a]" : "bg-slate-200"
                            }`}
                          />
                        )}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${
                            completed ? "bg-[#00503a]" : "bg-slate-100"
                          }`}
                        >
                          <StepIcon
                            className={`w-4 h-4 ${completed ? "text-white" : "text-slate-400"}`}
                          />
                        </div>
                        <div className="flex-1 pb-6">
                          <p
                            className={`text-sm font-semibold ${
                              current
                                ? "text-[#00503a]"
                                : completed
                                  ? "text-[#191c1b]"
                                  : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          {current && (
                            <p className="text-xs text-slate-500 mt-1">
                              En cours...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Map */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-sm text-[#191c1b] mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00503a]" />
                  Carte de suivi en temps réel
                </h2>
                <TrackingMap status={order.status} />
              </div>

              {/* Addresses */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-sm text-[#191c1b] mb-4">
                  Itinéraire
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00503a]/10 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[#00503a]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Collecte
                      </p>
                      <p className="text-sm font-medium text-[#191c1b]">
                        {order.pickupStreet || "Adresse de collecte"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.pickupNeighborhood || "Quartier"},{" "}
                        {order.pickupCity || "Yaoundé"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <div className="w-px h-8 bg-slate-200" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#ba1a1a]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Livraison
                      </p>
                      <p className="text-sm font-medium text-[#191c1b]">
                        {order.deliveryStreet || "Adresse de livraison"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.deliveryNeighborhood || "Quartier"},{" "}
                        {order.deliveryCity || "Yaoundé"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rider Info */}
              {order.rider && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h2 className="font-bold text-sm text-[#191c1b] mb-4">
                    Livreur
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#00503a]/10 flex items-center justify-center">
                      {order.rider.user?.avatar ? (
                        <img
                          src={order.rider.user.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-[#00503a]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#191c1b]">
                        {order.rider.user?.name || "Livreur"}
                      </p>
                      {order.rider.rating && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Star className="w-4 h-4 text-[#feb700] fill-[#feb700]" />
                          {order.rider.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {order.rider.user?.phone && (
                      <a
                        href={`tel:${order.rider.user.phone}`}
                        className="w-10 h-10 rounded-full bg-[#00503a] flex items-center justify-center text-white hover:bg-[#006a4e] transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-sm text-[#191c1b] mb-4">
                  Articles
                </h2>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#00503a]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#191c1b]">
                            {item.name}
                          </p>
                          {item.weight && (
                            <p className="text-xs text-slate-500">
                              {item.weight} kg
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                    <p className="text-sm text-[#191c1b]">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-sm text-[#191c1b] mb-4">
                  Récapitulatif
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Frais de livraison</span>
                    <span className="font-medium">
                      {formatCFA(order.deliveryFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="font-bold text-[#191c1b]">Total</span>
                    <span className="font-bold text-[#00503a]">
                      {formatCFA(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {order.status === "DELIVERED" && (
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00503a] text-white rounded-xl text-sm font-bold hover:bg-[#006a4e] transition-colors">
                    <Star className="w-4 h-4" />
                    Noter la livraison
                  </button>
                )}
                <Link
                  href={`/customer/messages/${order.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Assistance
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
