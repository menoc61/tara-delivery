"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  MapPin,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Repeat,
  MoreVertical,
  X,
  FileText,
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton, StatsSkeleton } from "@/components/shared/Skeleton";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryStreet: string;
  deliveryNeighborhood: string;
  deliveryCity: string;
  pickupStreet: string;
  pickupNeighborhood: string;
  createdAt: string;
  deliveredAt?: string;
  items?: OrderItem[];
  payment?: {
    status: string;
    method: string;
    amount: number;
  };
  rider?: {
    user?: {
      name: string;
      phone: string;
      avatar?: string;
    };
  };
}

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "ASSIGNED", label: "Assignée" },
  { value: "PICKED_UP", label: "Récupérée" },
  { value: "IN_TRANSIT", label: "En route" },
  { value: "DELIVERED", label: "Livré" },
  { value: "CANCELLED", label: "Annulé" },
];

const ORDER_TYPE_LABELS: Record<string, string> = {
  PARCEL: "Colis",
  FOOD: "Repas",
  GROCERY: "Courses",
  COURIER: "Course express",
};

const ORDER_TYPE_ICONS: Record<string, React.ReactNode> = {
  PARCEL: <Package className="w-5 h-5" />,
  FOOD: <span className="text-lg">🍔</span>,
  GROCERY: <span className="text-lg">🛒</span>,
  COURIER: <Truck className="w-5 h-5" />,
};

function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("fr-CM", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " XAF"
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-CM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("fr-CM", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const limit = 10;

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    deliveredCount: 0,
    avgTime: 0,
  });

  const hasActiveFilters = useMemo(
    () => !!(search || statusFilter || dateFrom || dateTo),
    [search, statusFilter, dateFrom, dateTo],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params: {
          page?: number;
          limit?: number;
          status?: string;
          type?: string;
          dateFrom?: string;
          dateTo?: string;
        } = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const res = await ordersApi.getMyOrders(params);
        const data = res.data.data;

        setOrders(data?.items || []);
        setTotalPages(data?.meta?.totalPages || 1);
        setTotal(data?.meta?.total || 0);

        // Calculate stats from all orders
        const allRes = await ordersApi.getMyOrders({ limit: 1000 });
        const allOrders: Order[] = allRes.data.data?.items || [];

        const deliveredOrders = allOrders.filter(
          (o) => o.status === "DELIVERED",
        );
        const totalSpent = deliveredOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0,
        );

        setStats({
          totalOrders: allOrders.length,
          totalSpent,
          deliveredCount: deliveredOrders.length,
          avgTime: 28,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Delete order
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

  // Reorder - redirect to Step 2 with pre-filled data
  const handleReorder = (order: Order) => {
    const orderData = {
      type: order.type,
      description: "",
      weight: 1,
      isFragile: false,
      isRefrigerated: false,
      isUrgent: false,
    };

    sessionStorage.setItem("orderItems", JSON.stringify(orderData));

    // Pre-fill addresses
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

  // Client-side search filter
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const term = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(term) ||
        o.deliveryStreet?.toLowerCase().includes(term) ||
        o.deliveryNeighborhood?.toLowerCase().includes(term) ||
        o.pickupStreet?.toLowerCase().includes(term),
    );
  }, [orders, search]);

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
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#00503a;color:white}
    .total{font-weight:bold;color:#00503a}</style></head><body>
    <h1>TARA DELIVERY - Historique des Commandes</h1>
    <p>Date: ${new Date().toLocaleDateString("fr-CM")}</p>
    <table><thead><tr><th>N°</th><th>Date</th><th>Statut</th><th>Montant</th><th>Adresse</th></tr></thead>
    <tbody>${filteredOrders
      .map(
        (o) =>
          `<tr><td>${o.orderNumber}</td><td>${formatDate(o.createdAt)}</td><td>${o.status}</td>
      <td>${formatCurrency(o.totalAmount)}</td><td>${o.deliveryStreet}, ${o.deliveryNeighborhood}</td></tr>`,
      )
      .join("")}</tbody></table>
    <p class="total">Total: ${formatCurrency(stats.totalSpent)}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.onload = () => win.print();
    toast.success("PDF prêt à imprimer");
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#00503a] tracking-tight">
                Mes Commandes
              </h1>
              <p className="text-sm text-[#3f4944] mt-1">
                Historique de vos livraisons TARA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </button>
                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 top-12 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[160px]">
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
                className="flex items-center gap-2 px-4 py-2 bg-[#00503a] text-white rounded-xl text-sm font-bold hover:bg-[#006a4e] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Total Commandes"
              value={stats.totalOrders}
              icon={<Package className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Total Dépensé"
              value={formatCurrency(stats.totalSpent)}
              icon={<Truck className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Livrées"
              value={stats.deliveredCount}
              icon={<Package className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Temps Moyen"
              value={`${stats.avgTime} min`}
              icon={<Clock className="w-5 h-5" />}
              color="amber"
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Rechercher par N°, adresse..."
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              statusOptions={ORDER_STATUS_OPTIONS}
              statusValue={statusFilter}
              onStatusChange={setStatusFilter}
              statusLabel="Statut"
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-6">
              <StatsSkeleton />
              <TableSkeleton rows={5} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "Aucun résultat" : "Aucune commande"}
              description={
                hasActiveFilters
                  ? "Aucune commande ne correspond aux filtres actuels."
                  : "Vous n'avez pas encore passé de commande."
              }
              icon={hasActiveFilters ? "search" : "package"}
              action={
                hasActiveFilters
                  ? { label: "Effacer les filtres", onClick: clearFilters }
                  : {
                      label: "Nouvelle commande",
                      onClick: () =>
                        (window.location.href = "/customer/new-order"),
                    }
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 md:p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Order Type Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#00503a]/5 flex items-center justify-center shrink-0 text-[#00503a]">
                      {ORDER_TYPE_ICONS[order.type] || (
                        <Package className="w-5 h-5" />
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/customer/orders/${order.id}`}>
                          <h3 className="font-bold text-sm text-[#191c1b] hover:text-[#00503a]">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {ORDER_TYPE_LABELS[order.type] || order.type}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenMenu(
                                  openMenu === order.id ? null : order.id,
                                );
                              }}
                              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            {openMenu === order.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenu(null)}
                                />
                                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[160px]">
                                  <Link
                                    href={`/customer/orders/${order.id}`}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <Package className="w-4 h-4" />
                                    Voir détails
                                  </Link>
                                  <button
                                    onClick={() => handleReorder(order)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                  >
                                    <Repeat className="w-4 h-4" />
                                    Recommender
                                  </button>
                                  {(order.status === "PENDING" ||
                                    order.status === "CONFIRMED") && (
                                    <button
                                      onClick={() =>
                                        handleDeleteOrder(order.id)
                                      }
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
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
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {order.deliveryStreet}, {order.deliveryNeighborhood}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400">
                            {formatDate(order.createdAt)} ·{" "}
                            {formatTime(order.createdAt)}
                          </span>
                          {order.rider?.user && (
                            <span className="text-xs text-[#00503a] font-medium">
                              {order.rider.user.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#191c1b]">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
              />
            </div>
          )}
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
