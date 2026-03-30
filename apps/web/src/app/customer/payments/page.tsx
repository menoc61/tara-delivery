"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Download,
  Smartphone,
  Banknote,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { paymentsApi } from "@/lib/api-client";
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

interface PaymentOrder {
  id: string;
  orderNumber: string;
  type: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryStreet: string;
  deliveryNeighborhood: string;
  pickupStreet: string;
  pickupNeighborhood: string;
  status: string;
  createdAt: string;
}

interface Payment {
  id: string;
  orderId: string;
  order: PaymentOrder;
  method: string;
  status: string;
  amount: number;
  currency: string;
  transactionId?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PAYMENT_STATUS_OPTIONS = [
  { value: "SUCCESS", label: "Réussi" },
  { value: "PENDING", label: "En attente" },
  { value: "INITIATED", label: "Initié" },
  { value: "FAILED", label: "Échoué" },
  { value: "REFUNDED", label: "Remboursé" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "MTN_MOMO", label: "MTN MoMo" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "CASH_ON_DELIVERY", label: "Espèces" },
];

const METHOD_LABELS: Record<string, string> = {
  MTN_MOMO: "MTN MoMo",
  ORANGE_MONEY: "Orange Money",
  CASH_ON_DELIVERY: "Espèces",
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  MTN_MOMO: <Smartphone className="w-5 h-5 text-yellow-500" />,
  ORANGE_MONEY: <Smartphone className="w-5 h-5 text-orange-500" />,
  CASH_ON_DELIVERY: <Banknote className="w-5 h-5 text-green-500" />,
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

export default function CustomerPaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPayments: 0,
    successRate: 0,
    pendingAmount: 0,
  });

  const hasActiveFilters = useMemo(
    () => !!(search || statusFilter || methodFilter || dateFrom || dateTo),
    [search, statusFilter, methodFilter, dateFrom, dateTo],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const fetchPayments = useCallback(
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
          method?: string;
          dateFrom?: string;
          dateTo?: string;
        } = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (methodFilter) params.method = methodFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const res = await paymentsApi.getMyPayments(params);
        const data = res.data.data;

        setPayments(data?.items || []);
        setTotalPages(data?.meta?.totalPages || 1);
        setTotal(data?.meta?.total || 0);

        // Calculate stats
        const allRes = await paymentsApi.getMyPayments({ limit: 1000 });
        const allPayments: Payment[] = allRes.data.data?.items || [];

        const successfulPayments = allPayments.filter(
          (p) => p.status === "SUCCESS",
        );
        const totalPaid = successfulPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );
        const pendingPayments = allPayments.filter(
          (p) => p.status === "PENDING" || p.status === "INITIATED",
        );
        const pendingAmount = pendingPayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );

        setStats({
          totalPaid,
          totalPayments: allPayments.length,
          successRate:
            allPayments.length > 0
              ? Math.round(
                  (successfulPayments.length / allPayments.length) * 100,
                )
              : 0,
          pendingAmount,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, methodFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Client-side search filter
  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    const term = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.id?.toLowerCase().includes(term) ||
        p.order?.orderNumber?.toLowerCase().includes(term) ||
        p.transactionId?.toLowerCase().includes(term) ||
        p.order?.deliveryStreet?.toLowerCase().includes(term) ||
        p.order?.deliveryNeighborhood?.toLowerCase().includes(term),
    );
  }, [payments, search]);

  const handleExportCSV = () => {
    const header = "Date,Commande,Méthode,Montant,Statut,Transaction ID\n";
    const rows = filteredPayments
      .map(
        (p) =>
          `${formatDate(p.createdAt)},${p.order?.orderNumber || ""},${METHOD_LABELS[p.method] || p.method},${p.amount},${p.status},${p.transactionId || ""}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV réussi");
  };

  const handleExportPDF = () => {
    // Simple HTML-to-PDF export
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Paiements TARA</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #00503a; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #00503a; color: white; }
        .total { font-weight: bold; color: #00503a; }
      </style>
      </head>
      <body>
        <h1>TARA DELIVERY - Historique des Paiements</h1>
        <p>Date: ${new Date().toLocaleDateString("fr-CM")}</p>
        <table>
          <thead>
            <tr><th>Date</th><th>Commande</th><th>Méthode</th><th>Montant</th><th>Statut</th></tr>
          </thead>
          <tbody>
            ${filteredPayments
              .map(
                (p) =>
                  `<tr><td>${formatDate(p.createdAt)}</td><td>${p.order?.orderNumber || ""}</td><td>${METHOD_LABELS[p.method] || ""}</td><td>${p.amount.toLocaleString()} XAF</td><td>${p.status}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <p class="total">Total: ${formatCurrency(stats.totalPaid)}</p>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => win.print();
    }
    toast.success("PDF prêt à imprimer");
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
                Paiements
              </h1>
              <p className="text-sm text-[#3f4944] mt-1">
                Historique de vos transactions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchPayments(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Total Payé"
              value={formatCurrency(stats.totalPaid)}
              icon={<Wallet className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Transactions"
              value={stats.totalPayments}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Taux Réussite"
              value={`${stats.successRate}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="En Attente"
              value={formatCurrency(stats.pendingAmount)}
              icon={<Wallet className="w-5 h-5" />}
              color="amber"
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Rechercher par ID, commande..."
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              statusOptions={PAYMENT_STATUS_OPTIONS}
              statusValue={statusFilter}
              onStatusChange={setStatusFilter}
              statusLabel="Statut"
              methodOptions={PAYMENT_METHOD_OPTIONS}
              methodValue={methodFilter}
              onMethodChange={setMethodFilter}
              methodLabel="Méthode"
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
          ) : filteredPayments.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "Aucun résultat" : "Aucun paiement"}
              description={
                hasActiveFilters
                  ? "Aucun paiement ne correspond aux filtres actuels."
                  : "Vous n'avez pas encore effectué de paiement."
              }
              icon={hasActiveFilters ? "search" : "package"}
              action={
                hasActiveFilters
                  ? { label: "Effacer les filtres", onClick: clearFilters }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/customer/payments/${payment.id}`}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 md:p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Method Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      {METHOD_ICONS[payment.method] || (
                        <Wallet className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-bold text-sm text-[#191c1b]">
                            {payment.order?.orderNumber ||
                              `Commande #${payment.orderId?.slice(0, 8)}`}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {METHOD_LABELS[payment.method] || payment.method}
                          </p>
                        </div>
                        <StatusBadge
                          status={payment.status}
                          variant="payment"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <span className="truncate">
                          {payment.order?.deliveryStreet &&
                          payment.order?.deliveryNeighborhood
                            ? `${payment.order.deliveryStreet}, ${payment.order.deliveryNeighborhood}`
                            : payment.transactionId
                              ? `ID: ${payment.transactionId}`
                              : "En attente de confirmation"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {formatDate(payment.createdAt)} ·{" "}
                          {formatTime(payment.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#191c1b]">
                            {formatCurrency(payment.amount)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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
