"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  ASSIGNED: "En cours",
  PICKED_UP: "Récupération",
  IN_TRANSIT: "En livraison",
  DELIVERED: "Livré",
  CANCELLED: "Annulé",
  FAILED: "Échoué",
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => setOrders(r.data.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
  );
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  const getDay = (d: string) => new Date(d).getDate();
  const getMonth = (d: string) =>
    new Date(d).toLocaleString("fr-CM", { month: "short" }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto pb-28 md:pb-24">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Welcome Card - 2 cols */}
            <div className="md:col-span-2 lg:col-span-2 bg-[#00503a] text-white p-6 md:p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-extrabold mb-1">
                  Bienvenue, {user?.name?.split(" ")[0] || "Client"}
                </h3>
                <p className="text-[#92e7c3] text-sm font-medium max-w-[240px]">
                  Vous avez {activeOrders.length} livraison
                  {activeOrders.length > 1 ? "s" : ""} active
                  {activeOrders.length > 1 ? "s" : ""} aujourd&apos;hui.
                </p>
              </div>
              <Link
                href="/customer/new-order"
                className="relative z-10 mt-6 bg-[#feb700] text-[#271900] px-6 py-3 rounded-lg font-bold text-sm w-fit active:scale-95 transition-all"
              >
                NOUVEL ENVOI
              </Link>
              <div className="absolute -right-12 -bottom-12 opacity-10">
                <Package className="text-[200px]" />
              </div>
            </div>

            {/* Total Deliveries */}
            <div className="bg-[#f2f4f2] p-5 md:p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Total Livraisons
                  </span>
                  <Package className="w-5 h-5 text-[#00503a]" />
                </div>
                <p className="text-3xl md:text-4xl font-black text-[#191c1b]">
                  {orders.length}
                </p>
              </div>
              <p className="text-xs text-emerald-700 font-semibold">
                +{Math.floor(deliveredCount / 2)}% ce mois
              </p>
            </div>

            {/* Savings */}
            <div className="bg-[#f2f4f2] p-5 md:p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Économies
                  </span>
                  <CheckCircle className="w-5 h-5 text-[#7c5800]" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-[#191c1b]">
                  {formatCFA(orders.length * 500)}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Grâce au programme fidélité
              </p>
            </div>
          </div>

          {/* Active Deliveries Section */}
          <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[#191c1b]">
                Suivi en Direct
              </h2>
              <Link
                href="/customer/orders"
                className="flex items-center gap-1 text-sm text-[#00503a] font-bold hover:underline"
              >
                Voir tout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-80 h-48 bg-[#e1e3e1] rounded-xl animate-pulse shrink-0"
                  />
                ))}
              </div>
            ) : activeOrders.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                {activeOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id as string}
                    href={`/customer/orders/${order.id}`}
                    className="w-80 bg-white border border-slate-100 p-5 rounded-xl shadow-sm shrink-0 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#9ef4d0] flex items-center justify-center text-emerald-900">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-[#191c1b]">
                            #{order.orderNumber as string}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(order.type as string) === "FOOD"
                              ? "Repas"
                              : (order.type as string) === "GROCERY"
                                ? "Courses"
                                : "Colis"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#00503a]/10 text-[#00503a] text-[10px] font-bold rounded-full uppercase">
                        {statusLabels[order.status as string] ||
                          (order.status as string)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-[#6f7a73]" />
                      <p className="text-sm text-[#191c1b] truncate">
                        {(order.deliveryNeighborhood as string) || "Yaoundé"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#6f7a73]">
                        <Clock className="w-4 h-4" />
                        {order.createdAt
                          ? new Date(
                              order.createdAt as string,
                            ).toLocaleTimeString("fr-CM", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                      <span className="font-bold text-sm text-[#191c1b]">
                        {formatCFA((order.totalAmount as number) || 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Aucune livraison active</p>
                <Link
                  href="/customer/new-order"
                  className="inline-block bg-[#00503a] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#006a4e] transition-colors"
                >
                  Créer une livraison
                </Link>
              </div>
            )}
          </section>

          {/* Recent History Section */}
          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[#191c1b]">
                Historique Récent
              </h2>
              <Link
                href="/customer/orders"
                className="flex items-center gap-1 text-sm text-[#00503a] font-bold hover:underline"
              >
                Voir tout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-[#e1e3e1] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : orders.filter((o) => o.status === "DELIVERED").length > 0 ? (
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === "DELIVERED")
                  .slice(0, 5)
                  .map((order) => (
                    <Link
                      key={order.id as string}
                      href={`/customer/orders/${order.id}`}
                      className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#f2f4f2] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-[#3f4944]">
                          {getMonth(order.createdAt as string)}
                        </span>
                        <span className="text-lg font-black text-[#191c1b] leading-none">
                          {getDay(order.createdAt as string)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-sm font-bold text-[#191c1b]">
                            #{order.orderNumber as string}
                          </span>
                          <span className="px-2 py-0.5 bg-[#83d7b4] text-[#002116] text-[10px] font-bold rounded-full uppercase">
                            Livré
                          </span>
                        </div>
                        <p className="text-sm text-[#6f7a73] truncate">
                          {(order.deliveryStreet as string) || "Yaoundé"},{" "}
                          {(order.deliveryNeighborhood as string) || ""}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-[#191c1b]">
                        {formatCFA((order.totalAmount as number) || 0)}
                      </span>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune livraison terminée</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
