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
  FileText,
  Search,
  ChevronLeft,
  ChevronDown,
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
import {
  TableSkeleton,
  StatsSkeleton,
  CardSkeleton,
} from "@/components/shared/Skeleton";
import toast from "react-hot-toast";

interface PaymentOrder {
  id: string;
  orderNumber: string;
  type: string;
  totalAmount: number;
  deliveryStreet: string;
  deliveryNeighborhood: string;
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
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
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

const METHOD_LABELS: Record<string, string> = {
  MTN_MOMO: "MTN MoMo",
  ORANGE_MONEY: "Orange Money",
  CASH_ON_DELIVERY: "Espèces",
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  MTN_MOMO: <Smartphone className="w-4 h-4 text-yellow-500" />,
  ORANGE_MONEY: <Smartphone className="w-4 h-4 text-orange-500" />,
  CASH_ON_DELIVERY: <Banknote className="w-4 h-4 text-green-500" />,
};

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-[#83d7b4] text-[#002116]";
    case "PENDING":
    case "INITIATED":
      return "bg-[#feb700] text-[#271900]";
    case "FAILED":
      return "bg-[#ffdad6] text-[#ba1a1a]";
    case "REFUNDED":
      return "bg-[#92e7c3] text-[#00513b]";
    default:
      return "bg-[#e1e3e1] text-[#6f7a73]";
  }
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SUCCESS: "Réussi",
    PENDING: "En attente",
    INITIATED: "Initié",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
  };
  return labels[status] || status;
};

// Mobile payment card
function PaymentCard({ payment }: { payment: Payment }) {
  return (
    <Link
      href={`/customer/payments/${payment.id}`}
      className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#9ef4d0]/20 rounded-lg">
            {METHOD_ICONS[payment.method] || (
              <Wallet className="w-4 h-4 text-[#00503a]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[#191c1b]">
              {METHOD_LABELS[payment.method] || payment.method}
            </p>
            <p className="text-xs text-[#6f7a73]">
              {payment.order?.orderNumber || `#${payment.orderId?.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${getPaymentStatusStyle(payment.status)}`}
        >
          {getPaymentStatusLabel(payment.status)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6f7a73]">
          {formatDate(payment.createdAt)} · {formatTime(payment.createdAt)}
        </p>
        <span className="text-sm font-bold text-[#191c1b]">
          {formatCFA(payment.amount)}
        </span>
      </div>
    </Link>
  );
}

export default function CustomerPaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const limit = 10;

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPayments: 0,
    successRate: 0,
  });

  const fetchPayments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params: Record<string, unknown> = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (methodFilter) params.method = methodFilter;

        const res = await paymentsApi.getMyPayments(
          params as {
            page?: number;
            limit?: number;
            status?: string;
            method?: string;
          },
        );
        const data = res.data.data;
        setPayments(data?.items || []);
        setTotalPages(data?.meta?.totalPages || 1);
        setTotal(data?.meta?.total || 0);

        // Stats
        const allRes = await paymentsApi.getMyPayments({ limit: 1000 });
        const allPayments: Payment[] = allRes.data.data?.items || [];
        const successful = allPayments.filter((p) => p.status === "SUCCESS");
        setStats({
          totalPaid: successful.reduce((s, p) => s + (p.amount || 0), 0),
          totalPayments: allPayments.length,
          successRate:
            allPayments.length > 0
              ? Math.round((successful.length / allPayments.length) * 100)
              : 0,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, methodFilter],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    const term = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.id?.toLowerCase().includes(term) ||
        p.order?.orderNumber?.toLowerCase().includes(term) ||
        p.transactionId?.toLowerCase().includes(term),
    );
  }, [payments, search]);

  const handleExportCSV = () => {
    const header = "Date,Commande,Méthode,Montant,Statut\n";
    const rows = filteredPayments
      .map(
        (p) =>
          `${formatDate(p.createdAt)},${p.order?.orderNumber || ""},${METHOD_LABELS[p.method] || ""},${p.amount},${p.status}`,
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
                Historique des Paiements
              </h1>
              <p className="text-sm md:text-base text-[#3f4944]">
                Consultez vos transactions passées.
              </p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => fetchPayments(true)}
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
                    </div>
                  </>
                )}
              </div>
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
                { v: "SUCCESS", l: "Réussi" },
                { v: "PENDING", l: "En attente" },
                { v: "FAILED", l: "Échoué" },
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
              <div className="md:hidden space-y-3">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              <div className="hidden md:block">
                <TableSkeleton rows={5} />
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-[#bec9c2]" />
                    <p className="font-medium text-[#6f7a73]">Aucun paiement</p>
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
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
                          Commande
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Méthode
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                          Montant
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00503a]/5">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-16 text-center text-[#6f7a73]"
                          >
                            <Wallet className="w-12 h-12 mx-auto mb-4 text-[#bec9c2]" />
                            <p className="font-medium">Aucun paiement</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-[#f2f4f2]/50 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[#191c1b]">
                                  {formatDate(payment.createdAt)}
                                </span>
                                <span className="text-xs text-[#6f7a73]">
                                  {formatTime(payment.createdAt)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="font-mono text-sm text-[#00503a] font-bold">
                                #
                                {payment.order?.orderNumber ||
                                  payment.orderId?.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {METHOD_ICONS[payment.method] || (
                                  <Wallet className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="text-sm text-[#191c1b]">
                                  {METHOD_LABELS[payment.method] ||
                                    payment.method}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${getPaymentStatusStyle(payment.status)}`}
                              >
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-[#191c1b]">
                                {formatCFA(payment.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link
                                href={`/customer/payments/${payment.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#feb700] text-[#271900] rounded-lg font-bold text-xs uppercase tracking-tighter hover:shadow-md transition-all active:scale-95"
                              >
                                Voir
                              </Link>
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
                    {Math.min(page * limit, total)} sur {total} paiements
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
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${page === p ? "bg-[#00503a] text-white" : "hover:bg-white text-[#3f4944]"}`}
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
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats */}
              <section className="mt-8 md:mt-12 grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-[#00503a] p-4 md:p-6 rounded-2xl text-white">
                  <p className="text-[#92e7c3] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                    Total Payé
                  </p>
                  <h3 className="text-lg md:text-3xl font-extrabold">
                    {formatCFA(stats.totalPaid)}
                  </h3>
                </div>
                <div className="bg-[#feb700] p-4 md:p-6 rounded-2xl text-[#271900]">
                  <p className="text-[#6b4b00] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                    Transactions
                  </p>
                  <h3 className="text-lg md:text-3xl font-extrabold">
                    {stats.totalPayments}
                  </h3>
                </div>
                <div className="bg-[#e1e3e1] p-4 md:p-6 rounded-2xl text-[#191c1b]">
                  <p className="text-[#3f4944] text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">
                    Taux Réussite
                  </p>
                  <h3 className="text-lg md:text-3xl font-extrabold">
                    {stats.successRate}%
                  </h3>
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
