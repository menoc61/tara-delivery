"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Navigation,
  ChevronRight,
  LogOut,
  Bell,
  User,
  Bike,
  Phone,
  Menu,
  CheckCircle,
  AlertCircle,
  Power,
  PowerOff,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, ridersApi, authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { RiderStatus } from "@tara/types";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function RiderDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [status, setStatus] = useState<RiderStatus>(RiderStatus.AVAILABLE);
  const [activeOrders, setActiveOrders] = useState<Record<string, unknown>[]>(
    [],
  );
  const [availableOrders, setAvailableOrders] = useState<
    Record<string, unknown>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [activeRes, availableRes] = await Promise.all([
        ordersApi.getMyOrders({ limit: 10 }),
        ordersApi.getAvailable(),
      ]);
      setActiveOrders(
        activeRes.data.data.items?.filter(
          (o: Record<string, unknown>) =>
            !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
        ) || [],
      );
      setAvailableOrders(availableRes.data.data.items || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setUpdating(true);
    try {
      const newStatus =
        status === RiderStatus.AVAILABLE
          ? RiderStatus.OFFLINE
          : RiderStatus.AVAILABLE;
      await ridersApi.updateStatus(newStatus);
      setStatus(newStatus);
      toast.success(
        newStatus === RiderStatus.AVAILABLE
          ? "Vous êtes maintenant disponible"
          : "Vous êtes hors ligne",
      );
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setUpdating(true);
    try {
      await ordersApi.assignToMe(orderId);
      toast.success("Commande acceptée!");
      loadData();
    } catch (err) {
      toast.error("Erreur lors de l'acceptation");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const stats = {
    deliveries: activeOrders.length,
    earnings: activeOrders.reduce(
      (sum, o) => sum + ((o.totalAmount as number) || 0),
      0,
    ),
    rating: 4.8,
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-outline-var/15"
        style={{ background: "var(--primary)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs">Bienvenue,</p>
                <p className="text-white font-bold">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStatusToggle}
                disabled={updating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  status === RiderStatus.AVAILABLE
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-gray-500/50 text-white hover:bg-gray-500/60"
                }`}
              >
                {status === RiderStatus.AVAILABLE ? (
                  <>
                    <Power className="w-4 h-4" /> En ligne
                  </>
                ) : (
                  <>
                    <PowerOff className="w-4 h-4" /> Hors ligne
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats - 3-col grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <Package className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-on-surface">
              {stats.deliveries}
            </p>
            <p className="text-xs text-on-sur-var">En cours</p>
          </div>
          <div className="card p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-on-surface">
              {formatCFA(stats.earnings)}
            </p>
            <p className="text-xs text-on-sur-var">Revenus</p>
          </div>
          <div className="card p-4 text-center">
            <Star className="w-5 h-5 text-secondary-container mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-on-surface">
              {stats.rating}
            </p>
            <p className="text-xs text-on-sur-var">Note</p>
          </div>
        </div>

        {/* Active Delivery */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-bold text-on-surface mb-4">
              Livraison en cours
            </h2>
            {activeOrders.map((order) => (
              <div key={order.id as string} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono font-bold text-on-surface">
                    {order.orderNumber as string}
                  </span>
                  <span className="badge badge-in-transit">En route</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="text-xs text-on-sur-var">Collecte</p>
                      <p className="text-sm text-on-surface">
                        {order.pickupStreet as string}
                      </p>
                      <p className="text-xs text-on-sur-var">
                        {order.pickupNeighborhood as string}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary-container mt-1.5" />
                    <div>
                      <p className="text-xs text-on-sur-var">Livraison</p>
                      <p className="text-sm text-on-surface">
                        {order.deliveryStreet as string}
                      </p>
                      <p className="text-xs text-on-sur-var">
                        {order.deliveryNeighborhood as string}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-sur-low">
                  <span className="font-bold text-on-surface">
                    {formatCFA(order.totalAmount as number)}
                  </span>
                  <Link
                    href={`/rider/orders/${order.id}`}
                    className="btn-primary text-sm py-2"
                  >
                    <Navigation className="w-4 h-4" /> Navigator
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-on-surface">
              Commandes disponibles
            </h2>
            <span className="text-xs text-on-sur-var">
              {availableOrders.length} disponibles
            </span>
          </div>

          {loading ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <Package className="w-10 h-10 text-outline-var mx-auto mb-3" />
              <p className="text-sm text-on-sur-var">
                Aucune commande disponible
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <div key={order.id as string} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono font-bold text-on-surface">
                      {order.orderNumber as string}
                    </span>
                    <span className="font-bold text-primary">
                      {formatCFA(order.totalAmount as number)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-sur-var mb-3">
                    <MapPin className="w-3 h-3" />
                    {order.pickupNeighborhood as string} →{" "}
                    {order.deliveryNeighborhood as string}
                  </div>
                  <button
                    onClick={() => handleAcceptOrder(order.id as string)}
                    disabled={updating || status !== RiderStatus.AVAILABLE}
                    className="btn-primary w-full text-sm py-2.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Accepter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
