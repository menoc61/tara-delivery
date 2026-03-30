"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Repeat,
  MoreVertical,
  FileText,
  Star,
  MessageCircle,
  Navigation,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import {
  TableSkeleton,
  StatsSkeleton,
  CardSkeleton,
} from "@/components/shared/Skeleton";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  totalAmount: number;
  deliveryStreet: string;
  deliveryNeighborhood: string;
  pickupStreet: string;
  pickupNeighborhood: string;
  createdAt: string;
  rider?: {
    id?: string;
    user?: { name: string; phone: string; avatar?: string };
  };
}

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-CM", {
    day: "numeric",
    month: "short",
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

const getStatusStyle = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-[#83d7b4] text-[#002116]";
    case "IN_TRANSIT":
    case "PICKED_UP":
      return "bg-[#006a4e] text-[#92e7c3]";
    case "CONFIRMED":
    case "ASSIGNED":
      return "bg-[#006a4e] text-[#9ef4d0]";
    case "PENDING":
      return "bg-[#feb700] text-[#271900]";
    case "CANCELLED":
      return "bg-[#ffdad6] text-[#ba1a1a]";
    case "FAILED":
      return "bg-[#e1e3e1] text-[#6f7a73]";
    default:
      return "bg-[#e1e3e1] text-[#6f7a73]";
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    ASSIGNED: "Assignée",
    PICKED_UP: "Récupérée",
    IN_TRANSIT: "En cours",
    DELIVERED: "Livré",
    CANCELLED: "Annulé",
    FAILED: "Échoué",
  };
  return labels[status] || status;
};

const ACTIVE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
];

// Mobile card component
function OrderCard({
  order,
  onReorder,
  onDelete,
  openMenu,
  setOpenMenu,
}: {
  order: Order;
  onReorder: (order: Order) => void;
  onDelete: (id: string) => void;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/customer/orders/${order.id}`}
          className="font-mono text-sm text-[#00503a] font-bold hover:underline"
        >
          #{order.orderNumber}
        </Link>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-[#9ef4d0]/20 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-[#00503a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#191c1b] truncate">
            {order.deliveryNeighborhood}
          </p>
          <p className="text-xs text-[#6f7a73] truncate">
            {order.deliveryStreet}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6f7a73]">
            {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
          </p>
        </div>
        <span className="text-sm font-bold text-[#191c1b]">
          {formatCFA(order.totalAmount)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        {ACTIVE_STATUSES.includes(order.status) && (
          <>
            <Link
              href={`/customer/orders/track?orderId=${order.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#9ef4d0]/20 text-[#00503a] rounded-lg text-xs font-medium"
            >
              <Navigation className="w-3.5 h-3.5" />
              Suivre
            </Link>
            {order.rider && (
              <Link
                href={`/customer/messages/${order.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#9ef4d0]/20 text-[#00503a] rounded-lg text-xs font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message
              </Link>
            )}
          </>
        )}
        {order.status === "DELIVERED" && order.rider && (
          <Link
            href={`/customer/orders/${order.id}/rate`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#feb700]/20 text-[#7c5800] rounded-lg text-xs font-medium"
          >
            <Star className="w-3.5 h-3.5" />
            Noter
          </Link>
        )}
        <button
          onClick={() => onReorder(order)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#feb700] text-[#271900] rounded-lg text-xs font-bold"
        >
          <Repeat className="w-3.5 h-3.5" />
          Recommender
        </button>
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const limit = 10;

  const [stats, setStats] = useState({
    totalSpent: 0,
    deliveredCount: 0,
    avgTime: 28,
  });

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params: Record<string, unknown> = { page, limit };
        if (statusFilter) params.status = statusFilter;

        const res = await ordersApi.getMyOrders(
          params as {
            page?: number;
            limit?: number;
            status?: string;
          },
        );
        const data = res.data.data;
        setOrders(data?.items || []);
        setTotalPages(data?.meta?.totalPages || 1);
        setTotal(data?.meta?.total || 0);

        // Stats from all orders
        const allRes = await ordersApi.getMyOrders({ limit: 1000 });
        const allOrders: Order[] = allRes.data.data?.items || [];
        const delivered = allOrders.filter((o) => o.status === "DELIVERED");
        setStats({
          totalSpent: delivered.reduce((s, o) => s + (o.totalAmount || 0), 0),
          deliveredCount: delivered.length,
          avgTime: 28,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const term = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(term) ||
        o.deliveryStreet?.toLowerCase().includes(term) ||
        o.deliveryNeighborhood?.toLowerCase().includes(term),
    );
  }, [orders, search]);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment annuler cette commande?")) return;
    try {
      await ordersApi.cancel(orderId, "Annulée par le client");
      toast.success("Commande annulée");
      fetchOrders(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setOpenMenu(null);
  };

  const handleReorder = (order: Order) => {
    sessionStorage.setItem(
      "orderItems",
      JSON.stringify({
        type: order.type,
        description: "",
        weight: 1,
        isFragile: false,
        isRefrigerated: false,
        isUrgent: false,
      }),
    );
    sessionStorage.setItem(
      "orderAddresses",
      JSON.stringify({
        pickupStreet: order.pickupStreet || "",
        pickupNeighborhood: order.pickupNeighborhood || "",
        deliveryStreet: order.deliveryStreet || "",
        deliveryNeighborhood: order.deliveryNeighborhood || "",
        pickupContactName: "",
        pickupContactPhone: "",
        deliveryContactName: "",
        deliveryContactPhone: "",
        scheduleType: "now",
      }),
    );
    router.push("/customer/new-order/addresses");
    setOpenMenu(null);
  };

  const handleExportCSV = () => {
    const header = "N° Commande,Date,Statut,Montant,Adresse\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `${o.orderNumber},${formatDate(o.createdAt)},${o.status},${o.totalAmount},"${o.deliveryStreet}, ${o.deliveryNeighborhood}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV réussi");
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Commandes TARA</title>
    <style>body{font-family:Arial;padding:20px}h1{color:#00503a}table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#00503a;color:white}</style></head><body>
    <h1>TARA DELIVERY - Historique des Commandes</h1><p>Date: ${new Date().toLocaleDateString("fr-CM")}</p>
    <table><thead><tr><th>N°</th><th>Date</th><th>Statut</th><th>Montant</th><th>Adresse</th></tr></thead>
    <tbody>${filteredOrders
      .map(
        (o) =>
          `<tr><td>${o.orderNumber}</td><td>${formatDate(o.createdAt)}</td><td>${o.status}</td>
      <td>${formatCFA(o.totalAmount)}</td><td>${o.deliveryStreet}, ${o.deliveryNeighborhood}</td></tr>`,
      )
      .join("")}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const pdfUrl = URL.createObjectURL(blob);
    const win = window.open(pdfUrl, "_blank");
    if (win) win.onload = () => win.print();
    toast.success("PDF prêt à imprimer");
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-28 md:pb-24 max-w-7xl mx-auto w-full">
          {/* Header */}
          <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#00503a] tracking-tight mb-1 md:mb-2">
                Historique des Livraisons
              </h1>
              <p className="text-sm md:text-base text-[#3f4944]">
                Consultez vos envois passés et gérez vos livraisons.
              </p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-[#e7e9e6] text-[#191c1b] font-medium rounded-lg hover:bg-[#e1e3e1] transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#e7e9e6] text-[#191c1b] font-semibold rounded-lg hover:bg-[#e1e3e1] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Exporter</span>
                </button>
                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 top-12 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[180px]">
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <Download className="w-4 h-4 text-green-600" />
                        Exporter en CSV
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        Exporter en PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/customer/new-order"
                className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#00503a] text-white font-semibold rounded-lg hover:bg-[#006a4e] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Nouvelle Livraison</span>
              </Link>
            </div>
          </header>

          {/* Search & Filters */}
          <section className="mb-6 md:mb-8 flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex-1 min-w-[200px] md:min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7a73]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-[#f2f4f2] border-none rounded-xl focus:ring-2 focus:ring-[#00503a]/20 text-[#191c1b] placeholder:text-[#6f7a73] text-sm"
                placeholder="Rechercher..."
              />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 bg-[#f2f4f2] px-1.5 md:px-2 py-1 md:py-1.5 rounded-xl overflow-x-auto">
              {[
                { v: "", l: "Tous" },
                { v: "IN_TRANSIT", l: "En cours" },
                { v: "DELIVERED", l: "Livré" },
                { v: "CANCELLED", l: "Annulé" },
              ].map((f) => (
                <button
                  key={f.v}
                  onClick={() => {
                    setStatusFilter(f.v);
                    setPage(1);
                  }}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                    statusFilter === f.v
                      ? "bg-white shadow-sm text-[#00503a] font-bold"
                      : "text-[#3f4944] hover:bg-white/50"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </section>

          {/* Loading */}
          {loading ? (
            <div className="space-y-6 md:space-y-8">
              <StatsSkeleton count={3} />
              {/* Mobile skeleton */}
              <div className="md:hidden space-y-3">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              {/* Desktop skeleton */}
              <div className="hidden md:block">
                <TableSkeleton rows={5} />
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-[#bec9c2]" />
                    <p className="font-medium text-[#6f7a73]">
                      Aucune commande
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onReorder={handleReorder}
                      onDelete={handleDeleteOrder}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                    />
                  ))
                )}
              </div>

              {/* Desktop Table Layout */}
              <section className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f2f4f2] border-none">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Date
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          N° Commande
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Destination
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Total
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00503a]/5">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-16 text-center text-[#6f7a73]"
                          >
                            <Package className="w-12 h-12 mx-auto mb-4 text-[#bec9c2]" />
                            <p className="font-medium">Aucune commande</p>
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
                              <Link
                                href={`/customer/orders/${order.id}`}
                                className="font-mono text-sm text-[#00503a] font-bold hover:underline"
                              >
                                #{order.orderNumber}
                              </Link>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#9ef4d0]/20 rounded-lg">
                                  <MapPin className="w-4 h-4 text-[#00503a]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#191c1b]">
                                    {order.deliveryNeighborhood}
                                  </p>
                                  <p className="text-xs text-[#6f7a73]">
                                    {order.deliveryStreet}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${getStatusStyle(order.status)}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-[#191c1b]">
                                {formatCFA(order.totalAmount)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {ACTIVE_STATUSES.includes(order.status) && (
                                  <>
                                    <Link
                                      href={`/customer/orders/track?orderId=${order.id}`}
                                      className="p-2 rounded-lg bg-[#9ef4d0]/20 text-[#00503a] hover:bg-[#9ef4d0]/40 transition-colors"
                                      title="Suivre"
                                    >
                                      <Navigation className="w-4 h-4" />
                                    </Link>
                                    {order.rider && (
                                      <Link
                                        href={`/customer/messages/${order.id}`}
                                        className="p-2 rounded-lg bg-[#9ef4d0]/20 text-[#00503a] hover:bg-[#9ef4d0]/40 transition-colors"
                                        title="Message"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </Link>
                                    )}
                                  </>
                                )}
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setOpenMenu(
                                        openMenu === order.id ? null : order.id,
                                      )
                                    }
                                    className="p-2 rounded-lg hover:bg-[#f2f4f2] transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4 text-[#6f7a73]" />
                                  </button>
                                  {openMenu === order.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setOpenMenu(null)}
                                      />
                                      <div className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[180px]">
                                        <Link
                                          href={`/customer/orders/${order.id}`}
                                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                          onClick={() => setOpenMenu(null)}
                                        >
                                          <Package className="w-4 h-4" />
                                          Voir détails
                                        </Link>
                                        <button
                                          onClick={() => handleReorder(order)}
                                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                                        >
                                          <Repeat className="w-4 h-4" />
                                          Recommender
                                        </button>
                                        {order.status === "DELIVERED" &&
                                          order.rider && (
                                            <Link
                                              href={`/customer/orders/${order.id}/rate`}
                                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
                                              onClick={() => setOpenMenu(null)}
                                            >
                                              <Star className="w-4 h-4" />
                                              Noter le livreur
                                            </Link>
                                          )}
                                        {(order.status === "PENDING" ||
                                          order.status === "CONFIRMED") && (
                                          <button
                                            onClick={() =>
                                              handleDeleteOrder(order.id)
                                            }
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Annuler
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-[#f2f4f2] flex justify-between items-center">
                  <p className="text-xs font-medium text-[#3f4944]">
                    Affichage {(page - 1) * limit + 1}-
                    {Math.min(page * limit, total)} sur {total} livraisons
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 bg-white rounded-lg shadow-sm text-[#3f4944] disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                            page === p
                              ? "bg-[#00503a] text-white"
                              : "hover:bg-white text-[#3f4944]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="p-2 bg-white rounded-lg shadow-sm text-[#3f4944] disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats Summary (Bento Style) */}
              <section className="mt-8 md:mt-12 grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-[#00503a] p-4 md:p-6 rounded-2xl text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[#92e7c3] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                      Total Dépensé
                    </p>
                    <h3 className="text-lg md:text-3xl font-extrabold">
                      {formatCFA(stats.totalSpent)}
                    </h3>
                  </div>
                </div>
                <div className="bg-[#feb700] p-4 md:p-6 rounded-2xl text-[#271900] relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[#6b4b00] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                      Livraisons
                    </p>
                    <h3 className="text-lg md:text-3xl font-extrabold">
                      {stats.deliveredCount}
                    </h3>
                  </div>
                </div>
                <div className="bg-[#e1e3e1] p-4 md:p-6 rounded-2xl text-[#191c1b] relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[#3f4944] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                      Temps Moyen
                    </p>
                    <h3 className="text-lg md:text-3xl font-extrabold">
                      {stats.avgTime} min
                    </h3>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      <PageFooter />
      <MobileNav />
    </div>
  );
}
