"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  Wallet,
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
  Activity,
  Timer,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { paymentsApi } from "@/lib/api-client";
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

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [payments, setPayments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    paymentsApi
      .getMyPayments({ limit: 50 })
      .then((r) => {
        setPayments(r.data.data.items || []);
      })
      .catch(() => {
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPayments = payments
    .filter((payment) => {
      // Apply search filter
      if (search) {
        const searchableFields = [
          payment.id,
          payment.paymentMethod,
          payment.status,
        ]
          .join(" ")
          .toLowerCase();
        return searchableFields.includes(search.toLowerCase());
      }

      // Apply status filter
      switch (filter) {
        case "all":
          return true;
        case "completed":
          return payment.status === "SUCCESS";
        case "pending":
          return payment.status === "PENDING";
        case "failed":
          return payment.status === "FAILED";
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
      <Header title="Historique des Paiements" />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24">
          <div className="max-w-screen-xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight mb-2">
                  Historique des Paiements
                </h1>
                <p className="text-[#3f4944] max-w-2xl">
                  Consultez l'historique de vos paiements et téléchargez vos
                  reçus.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/customer/payments/export"
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
                  placeholder="Rechercher par ID, méthode ou statut..."
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
                  onClick={() => setFilter("completed")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "completed" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  Réussi
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "pending" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setFilter("failed")}
                  className={`px-4 py-1.5 hover:bg-white/50 rounded-lg text-sm font-medium text-[#3f4944] ${
                    filter === "failed" ? "bg-[#9ef4d0] text-[#002116]" : ""
                  }`}
                >
                  Échoué
                </button>
              </div>
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
                        ID de Paiement
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Méthode
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Montant
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] font-label">
                        Statut
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
                          Chargement des paiements...
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Aucun paiement trouvé
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
                              #{payment.id}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-medium text-[#191c1b]">
                              {payment.paymentMethod === "MTN_MOMO"
                                ? "MTN MoMo"
                                : payment.paymentMethod === "ORANGE_MONEY"
                                  ? "Orange Money"
                                  : "Espèces"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-[#191c1b]">
                              {formatCFA(Number(payment.amount))}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusBadgeClass(
                                payment.status,
                              )} uppercase tracking-tight`}
                            >
                              {getPaymentStatusLabel(payment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex gap-2">
                              <Link
                                href={`/customer/payments/${payment.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#feb700] text-[#271900] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#ffba20] transition-all active:scale-95"
                              >
                                Reçu
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

function getPaymentStatusBadgeClass(status: string) {
  switch (status) {
    case "SUCCESS":
      return "bg-[#9ef4d0] text-[#002116]";
    case "PENDING":
      return "bg-[#feb700] text-[#271900]";
    case "FAILED":
      return "bg-[#ba1a1a] text-white";
    default:
      return "bg-[#f2f4f2] text-[#3f4944]";
  }
}

function getPaymentStatusLabel(status: string) {
  switch (status) {
    case "SUCCESS":
      return "Réussi";
    case "PENDING":
      return "En attente";
    case "FAILED":
      return "Échoué";
    default:
      return status;
  }
}
