"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  ShoppingCart,
  Download,
  Calendar,
  Trash2,
  CheckCircle2,
  User,
  MapPin,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Wallet,
  Activity,
  Timer,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-CM", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-CM", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrdersHistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "delivered" | "cancelled" | "last30"
  >("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 50 })
      .then((r) => {
        setOrders(r.data.data.items || []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      // Apply search filter
      if (search) {
        const searchableFields = [
          order.id,
          order.orderNumber,
          (order.deliveryNeighborhood || "") +
            " " +
            (order.deliveryStreet || ""),
          order.status,
        ]
          .join(" ")
          .toLowerCase();
        return searchableFields.includes(search.toLowerCase());
      }

      // Apply status filter
      switch (filter) {
        case "all":
          return true;
        case "active":
          return !["DELIVERED", "CANCELLED", "FAILED"].includes(order.status);
        case "delivered":
          return order.status === "DELIVERED";
        case "cancelled":
          return order.status === "CANCELLED";
        case "last30": {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(order.createdAt) >= thirtyDaysAgo;
        }
        default:
          return true;
      }
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header title="Historique des Livraisons" />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24">
          <div className="max-w-screen-xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight mb-2">
                  Historique des Livraisons
                </h1>
                <p className="text-[#3f4944] max-w-2xl">
                  Consultez l'état de vos envois passés et gérez vos
                  facturations de logistique de précision à travers Yaoundé.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/customer/orders/export"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#f2f4f2] text-[#191c1b] font-semibold rounded-lg hover:bg-[#e7e9e6] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter PDF
                </Link>
              </div>
            </header>

            {/* Search & Filters Bar */}
            <section className="mb-8 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par ID, destination ou destinataire..."
                  className="w-full pl-12 pr-4 py-3 bg-[#f2f4f2] border-none rounded-xl focus:ring-2 focus:ring-[#00503a]/20 text-[#191c1b] placeholder:text-[#6f7a73]"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#f2f4f2] px-2 py-1.5 rounded-xl">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 bg-white shadow-sm rounded-lg text-sm font-semibold text-[#191c1b] ${
                    filter === "all" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "active" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  En cours
                </button>
                <button
                  onClick={() => setFilter("delivered")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "delivered" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  Livré
                </button>
                <button
                  onClick={() => setFilter("cancelled")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "cancelled" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  Annulé
                </button>
              </div>
              <button
                onClick={() => setFilter("last30")}
                className="flex items-center gap-2 px-4 py-3 bg-[#f2f4f2] text-[#3f4944] font-medium rounded-xl"
              >
                <Calendar className="w-4 h-4" /> Derniers 30 jours
              </button>
            </section>

            {/* Data Table */}
            <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f2] border-none">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Destination
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Total
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00503a]/5">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Chargement des historiques...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Aucun historique trouvé
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Aucun historique trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-[#f2f4f2]/50 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-[#191c1b]">
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="text-xs text-[#6f7a73]">
                                {formatTime(order.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono text-sm text-[#00503a] font-bold">
                              #{order.orderNumber}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#00503a]/10 rounded-lg">
                                <MapPin className="w-4 h-4 text-[#00503a]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#191c1b]">
                                  {order.deliveryNeighborhood}, Rue{" "}
                                  {order.deliveryStreet}
                                </p>
                                <p className="text-xs text-[#6f7a73]">
                                  Yaoundé
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                                order.status,
                              )} uppercase tracking-tight`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-[#191c1b]">
                              {formatCFA(Number(order.totalAmount || 0))}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex gap-2">
                              <Link
                                href={`/customer/orders/${order.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#feb700] text-[#271900] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#ffba20] transition-all active:scale-95"
                              >
                                Récommander
                              </Link>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ba1a1a] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#c0392b] transition-all active:scale-95"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Stats Summary Section (Bento Style) */}
            <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#00503a] p-6 rounded-2xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[#92e7c3] text-sm font-bold uppercase tracking-widest mb-2">
                    Total Dépensé
                  </p>
                  <h3 className="text-3xl font-extrabold font-headline">
                    145.200 XAF
                  </h3>
                  <p className="text-xs mt-4 opacity-80 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 mr-1" /> +12% par rapport au
                    mois dernier
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
              <div className="bg-[#feb700] p-6 rounded-2xl text-[#271900] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[#6b4b00] text-sm font-bold uppercase tracking-widest mb-2">
                    Livraisons Réussies
                  </p>
                  <h3 className="text-3xl font-extrabold font-headline">98%</h3>
                  <p className="text-xs mt-4 opacity-80 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 mr-1" /> Excellente
                    fiabilité logistique
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
              <div className="bg-[#e1e3e1] p-6 rounded-2xl text-[#191c1b] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[#3f4944] text-sm font-bold uppercase tracking-widest mb-2">
                    Temps Moyen
                  </p>
                  <h3 className="text-3xl font-extrabold font-headline">
                    28 min
                  </h3>
                  <p className="text-xs mt-4 opacity-80 flex items-center gap-1">
                    <Timer className="w-4 h-4 mr-1" /> Livraison urbaine
                    ultra-rapide
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Zap className="h-8 w-8" />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-[#9ef4d0] text-[#002116]";
    case "PICKED_UP":
    case "IN_TRANSIT":
      return "bg-[#feb700] text-[#271900]";
    case "PENDING":
    case "CONFIRMED":
    case "ASSIGNED":
      return "bg-[#f2f4f2] text-[#3f4944]";
    case "CANCELLED":
    case "FAILED":
      return "bg-[#ba1a1a] text-white";
    default:
      return "bg-[#f2f4f2] text-[#3f4944]";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "CONFIRMED":
      return "Confirmée";
    case "ASSIGNED":
      return "Assigné";
    case "PICKED_UP":
      return "Récupéré";
    case "IN_TRANSIT":
      return "En livraison";
    case "DELIVERED":
      return "Livré";
    case "CANCELLED":
      return "Annulé";
    case "FAILED":
      return "Échoué";
    default:
      return status;
  }
}

function handleDeleteOrder(orderId: string) {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer cet historique ?")) {
    // In a real app, this would call the API
    // ordersApi.deleteOrder(orderId);
    // For now, we'll just show a toast
    // toast.success("Historique supprimé");
    console.log("Would delete order:", orderId);
  }
}
