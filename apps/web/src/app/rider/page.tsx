"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Navigation, Package, CheckCircle, XCircle,
  MapPin, Clock, DollarSign, ToggleLeft, ToggleRight, LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ridersApi, ordersApi, authApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formatCFA = (v: number) => new Intl.NumberFormat("fr-CM").format(v) + " XAF";

type RiderStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export default function RiderDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [riderProfile, setRiderProfile] = useState<Record<string, unknown> | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Record<string, unknown>[]>([]);
  const [myOrders, setMyOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, availRes, myRes] = await Promise.all([
        ridersApi.getMe(),
        ordersApi.getAvailable(),
        ordersApi.getRiderOrders({ limit: 5, status: "ASSIGNED,PICKED_UP,IN_TRANSIT" }),
      ]);
      setRiderProfile(profileRes.data.data);
      setAvailableOrders(availRes.data.data || []);
      setMyOrders(myRes.data.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Send GPS location every 30s when available
  useEffect(() => {
    if (!navigator.geolocation) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          ridersApi.updateLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading || undefined,
            speed: pos.coords.speed || undefined,
          }).catch(() => {});
        },
        () => {}
      );
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async () => {
    const current = riderProfile?.status as RiderStatus;
    const next: RiderStatus = current === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
    setStatusUpdating(true);
    try {
      await ridersApi.updateStatus(next);
      setRiderProfile((p) => p ? { ...p, status: next } : p);
      toast.success(next === "AVAILABLE" ? "Vous êtes maintenant disponible 🟢" : "Vous êtes hors ligne 🔴");
    } catch {
      toast.error("Erreur lors du changement de statut");
    } finally {
      setStatusUpdating(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, "PICKED_UP");
      toast.success("Commande acceptée!");
      loadData();
    } catch {
      toast.error("Impossible d'accepter cette commande");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      toast.success("Statut mis à jour");
      loadData();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const isOnline = riderProfile?.status === "AVAILABLE";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner scale-150" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.name}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-gray-500"}`} />
                <span className="text-xs text-gray-400">{isOnline ? "En ligne" : "Hors ligne"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleStatus}
              disabled={statusUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
            >
              {isOnline
                ? <><ToggleRight className="w-4 h-4" /> Disponible</>
                : <><ToggleLeft className="w-4 h-4" /> Hors ligne</>
              }
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-gray-800 text-gray-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Livraisons", value: (riderProfile as any)?._count?.orders || 0, icon: Package, color: "bg-blue-50 text-blue-600" },
            { label: "Note", value: `${((riderProfile?.rating as number) || 0).toFixed(1)}★`, icon: CheckCircle, color: "bg-amber-50 text-amber-600", raw: true },
            { label: "Revenus (XAF)", value: "—", icon: DollarSign, color: "bg-emerald-50 text-emerald-600", raw: true },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-display text-gray-900">{s.raw ? s.value : Number(s.value).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        {myOrders.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3 font-display">Mes livraisons actives</h2>
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div key={order.id as string} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-mono font-semibold text-gray-900">{order.orderNumber as string}</span>
                      <span className={`badge ml-2 badge-${(order.status as string).toLowerCase().replace("_","-")}`}>
                        {order.status as string}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCFA(order.deliveryFee as number)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Collecte</p>
                        <p className="text-gray-700">{order.pickupNeighborhood as string}, {order.pickupCity as string}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Livraison</p>
                        <p className="text-gray-700">{order.deliveryNeighborhood as string}, {order.deliveryCity as string}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "ASSIGNED" && (
                      <button
                        onClick={() => updateOrderStatus(order.id as string, "PICKED_UP")}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Colis collecté
                      </button>
                    )}
                    {order.status === "PICKED_UP" && (
                      <button
                        onClick={() => updateOrderStatus(order.id as string, "IN_TRANSIT")}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        <Navigation className="w-4 h-4" /> En route
                      </button>
                    )}
                    {order.status === "IN_TRANSIT" && (
                      <button
                        onClick={() => updateOrderStatus(order.id as string, "DELIVERED")}
                        className="btn-primary flex-1 py-2 text-sm bg-emerald-500 hover:bg-emerald-600"
                      >
                        <CheckCircle className="w-4 h-4" /> Livré!
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 font-display">
              Commandes disponibles
              {availableOrders.length > 0 && (
                <span className="ml-2 badge bg-brand-500/10 text-brand-600">{availableOrders.length}</span>
              )}
            </h2>
          </div>

          {!isOnline ? (
            <div className="card p-8 text-center">
              <ToggleLeft className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Passez en ligne pour voir les commandes disponibles</p>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Aucune commande disponible pour l'instant</p>
              <p className="text-xs text-gray-400 mt-1">Restez en ligne pour recevoir des alertes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <div key={order.id as string} className="card p-4 border-l-4 border-brand-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-mono font-semibold text-gray-900">{order.orderNumber as string}</span>
                      <span className="ml-2 text-xs text-gray-500">{order.type as string}</span>
                    </div>
                    <span className="text-base font-bold text-brand-600">{formatCFA(order.deliveryFee as number)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {!!order.distance && (
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {(order.distance as number).toFixed(1)} km
                      </span>
                    )}
                    {!!order.estimatedDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{order.estimatedDuration as number} min
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      <span className="text-gray-600 text-xs">{order.pickupNeighborhood as string}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-gray-600 text-xs">{order.deliveryNeighborhood as string}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptOrder(order.id as string)}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Accepter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
