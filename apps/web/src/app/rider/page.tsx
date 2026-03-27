"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Wallet,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Activity,
  User,
  Star,
  ShoppingCart,
  Utensils,
  Pill,
  Filter,
  LogOut,
  Phone,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, ridersApi, authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { RiderStatus } from "@tara/types";
import Map from "@/components/Map";

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
      const [activeRes, availableRes, riderRes] = await Promise.all([
        ordersApi.getMyOrders({ limit: 10 }),
        ordersApi.getAvailable(),
        ridersApi.getMe(),
      ]);

      const active =
        activeRes.data.data.items?.filter(
          (o: Record<string, unknown>) =>
            !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
        ) || [];

      setActiveOrders(active);
      setAvailableOrders(availableRes.data.data.items || []);

      if (riderRes.data.data) {
        setStatus(riderRes.data.data.status as RiderStatus);
      }
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
      await ridersApi.updateStatus({ status: newStatus });
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

  const todayDeliveries = 8;
  const todayEarnings = 12500;
  const rating = 4.98;

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg shadow-primary/20 h-16 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <Menu className="text-secondary" />
          <span className="text-lg font-extrabold tracking-widest text-white">
            TARA RIDER
          </span>
        </div>
        <button
          onClick={handleStatusToggle}
          disabled={updating}
          className="flex items-center gap-2 bg-primary-container px-3 py-1.5 rounded-full border border-primary-container/30"
        >
          <span className="text-xs font-bold text-emerald-100/70 tracking-wider">
            {status === RiderStatus.AVAILABLE ? "EN LIGNE" : "HORS LIGNE"}
          </span>
          <div
            className={`w-10 h-5 bg-secondary-container rounded-full relative flex items-center px-1`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${
                status === RiderStatus.AVAILABLE ? "ml-auto" : "mr-auto"
              }`}
            />
          </div>
        </button>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {/* Status & Welcome Section */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary leading-tight">
                Bonjour, {user?.name?.split(" ")[0] || "Rider"}
              </h1>
              <p className="text-on-surface-variant font-medium">
                {status === RiderStatus.AVAILABLE
                  ? "Vous êtes prêt pour de nouvelles livraisons."
                  : "Vous êtes actuellement hors ligne."}
              </p>
            </div>
            <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              {rating.toFixed(2)} ★
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between h-28">
              <Wallet className="text-primary w-5 h-5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Gains du jour
                </p>
                <p className="text-xl font-bold">{formatCFA(todayEarnings)}</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between h-28">
              <Package className="text-secondary w-5 h-5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Livraisons
                </p>
                <p className="text-xl font-bold">
                  {todayDeliveries.toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Map/Area Preview */}
        <section className="mb-8 relative h-48 rounded-2xl overflow-hidden bg-surface-container-highest">
          {activeOrders.length > 0 ? (
            <Map
              center={[
                (activeOrders[0].pickupLng as number) || 11.5023,
                (activeOrders[0].pickupLat as number) || 3.848,
              ]}
              zoom={13}
              markers={[
                {
                  id: "pickup",
                  lat: (activeOrders[0].pickupLat as number) || 3.848,
                  lng: (activeOrders[0].pickupLng as number) || 11.5023,
                  label: "Ramassage",
                  color: "#00503a",
                },
                ...(activeOrders[0].deliveryLat
                  ? [
                      {
                        id: "delivery",
                        lat: activeOrders[0].deliveryLat as number,
                        lng: activeOrders[0].deliveryLng as number,
                        label: "Livraison",
                        color: "#7c5800",
                      },
                    ]
                  : []),
              ]}
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary/40 to-transparent" />
          )}
          <div className="absolute bottom-4 left-4 right-4 z-20 backdrop-blur-md bg-white/70 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
              <span className="text-sm font-bold text-on-surface">
                Zone de forte demande : Bastos
              </span>
            </div>
            <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
              +15% Prime
            </span>
          </div>
        </section>

        {/* Requests List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Demandes Proches
              {availableOrders.length > 0 && (
                <span className="inline-flex items-center justify-center bg-primary text-white text-[10px] w-5 h-5 rounded-full">
                  {Math.min(availableOrders.length, 9)}
                </span>
              )}
            </h2>
            <button className="text-xs font-bold text-primary flex items-center gap-1">
              FILTRER <Filter className="text-sm" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-2xl text-center">
              <p className="text-on-surface-variant">
                Aucune demande disponible
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableOrders.slice(0, 5).map((order, idx) => {
                const type = order.type as string;
                const icons: Record<string, React.ReactNode> = {
                  FOOD: <Utensils className="text-2xl text-primary" />,
                  GROCERY: <ShoppingCart className="text-2xl text-primary" />,
                  PARCEL: <Package className="text-2xl text-primary" />,
                  COURIER: <Pill className="text-2xl text-primary" />,
                };

                return (
                  <div
                    key={order.id as string}
                    className={`bg-surface-container-low p-5 rounded-2xl transition-all ${
                      idx === 0 ? "active:scale-[0.98]" : "opacity-100"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          {icons[type] || (
                            <Package className="text-2xl text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface">
                            {(order.pickupStreet as string) ||
                              "Point de ramassage"}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-medium">
                            {order.pickupNeighborhood as string}, Yaoundé
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">
                          {formatCFA(order.totalAmount as number)}
                        </p>
                        <p className="text-[10px] font-bold text-secondary tracking-wide uppercase">
                          {type === "FOOD"
                            ? "Livraison Express"
                            : type === "GROCERY"
                              ? "Courses"
                              : type === "COURIER"
                                ? "Urgence"
                                : "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-outline text-lg w-4 h-4" />
                        <span className="text-sm font-bold">
                          {(Math.random() * 4 + 0.5).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-outline text-lg w-4 h-4" />
                        <span className="text-sm font-bold">
                          {Math.floor(Math.random() * 10 + 5)} min
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order.id as string)}
                      disabled={updating || status !== RiderStatus.AVAILABLE}
                      className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity ${
                        idx === 0
                          ? "bg-secondary-container text-on-secondary-container hover:opacity-90"
                          : "bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {idx === 0 ? (
                        <>
                          ACCEPTER LA COURSE
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        "VOIR LES DÉTAILS"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-3xl border-none">
        <Link
          href="/rider"
          className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-5 py-1.5"
        >
          <Package className="mb-0.5 w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Requests
          </span>
        </Link>
        <Link
          href="/rider/orders"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 hover:bg-zinc-100 rounded-xl transition-all"
        >
          <Activity className="mb-0.5 w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Active
          </span>
        </Link>
        <Link
          href="/rider/earnings"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 hover:bg-zinc-100 rounded-xl transition-all"
        >
          <Wallet className="mb-0.5 w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Earnings
          </span>
        </Link>
        <Link
          href="/rider/profile"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 hover:bg-zinc-100 rounded-xl transition-all"
        >
          <User className="mb-0.5 w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
