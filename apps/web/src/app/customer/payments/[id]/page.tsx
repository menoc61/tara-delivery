"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  MapPin,
  User,
  Copy,
  FileText,
  Eye,
} from "lucide-react";
import { paymentsApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DetailSkeleton } from "@/components/shared/Skeleton";
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
  items?: Array<{ name: string; quantity: number }>;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
}

interface PaymentDetail {
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
  transactions: Transaction[];
}

const METHOD_LABELS: Record<string, string> = {
  MTN_MOMO: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
  CASH_ON_DELIVERY: "Espèces à la livraison",
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  MTN_MOMO: <Smartphone className="w-6 h-6 text-yellow-500" />,
  ORANGE_MONEY: <Smartphone className="w-6 h-6 text-orange-500" />,
  CASH_ON_DELIVERY: <Banknote className="w-6 h-6 text-green-500" />,
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  SUCCESS: {
    label: "Paiement réussi",
    icon: <CheckCircle className="w-8 h-8" />,
    color: "text-emerald-500",
  },
  PENDING: {
    label: "En attente de paiement",
    icon: <Clock className="w-8 h-8" />,
    color: "text-amber-500",
  },
  INITIATED: {
    label: "Paiement initié",
    icon: <Clock className="w-8 h-8" />,
    color: "text-blue-500",
  },
  FAILED: {
    label: "Paiement échoué",
    icon: <XCircle className="w-8 h-8" />,
    color: "text-red-500",
  },
  REFUNDED: {
    label: "Remboursé",
    icon: <CheckCircle className="w-8 h-8" />,
    color: "text-purple-500",
  },
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("fr-CM", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await paymentsApi.getById(paymentId);
        setPayment(res.data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        router.push("/customer/payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
        <Header />
        <div className="flex pt-20">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-4xl mx-auto w-full">
            <DetailSkeleton />
          </main>
        </div>
        <PageFooter />
        <MobileNav />
      </div>
    );
  }

  if (!payment) return null;

  const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <Link
            href="/customer/payments"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#00503a] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux paiements
          </Link>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center">
            <div className={`mx-auto mb-4 ${statusConfig.color}`}>
              {statusConfig.icon}
            </div>
            <h2 className="text-xl font-bold text-[#191c1b] mb-2">
              {statusConfig.label}
            </h2>
            <p className="text-3xl font-extrabold text-[#00503a] mb-2">
              {formatCurrency(payment.amount)}
            </p>
            <StatusBadge status={payment.status} variant="payment" />
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h3 className="font-bold text-sm text-[#191c1b] mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#00503a]" />
              Détails du paiement
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Méthode</span>
                <span className="font-medium flex items-center gap-2">
                  {METHOD_ICONS[payment.method]}
                  {METHOD_LABELS[payment.method] || payment.method}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Heure</span>
                <span className="font-medium">
                  {formatTime(payment.createdAt)}
                </span>
              </div>
              {payment.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ID Transaction</span>
                  <button
                    onClick={() => copyToClipboard(payment.transactionId!)}
                    className="font-medium text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-200 transition-colors"
                  >
                    {payment.transactionId.slice(0, 16)}...
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
              {payment.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Payé le</span>
                  <span className="font-medium">
                    {formatDate(payment.paidAt)}
                  </span>
                </div>
              )}
              {payment.failureReason && (
                <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  <strong>Raison de l&apos;échec:</strong>{" "}
                  {payment.failureReason}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          {payment.order && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
              <h3 className="font-bold text-sm text-[#191c1b] mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#00503a]" />
                Commande associée
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">N° Commande</span>
                  <Link
                    href={`/customer/orders/${payment.order.id}`}
                    className="font-medium text-[#00503a] hover:underline"
                  >
                    {payment.order.orderNumber}
                  </Link>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">De</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {payment.order.pickupStreet},{" "}
                    {payment.order.pickupNeighborhood}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Vers</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {payment.order.deliveryStreet},{" "}
                    {payment.order.deliveryNeighborhood}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Montant total</span>
                  <span className="font-bold">
                    {formatCurrency(payment.order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* View Order Button */}
              <Link
                href={`/customer/orders/${payment.order.id}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#00503a] text-white rounded-xl text-sm font-bold hover:bg-[#006a4e] transition-colors"
              >
                <Eye className="w-4 h-4" />
                Voir la commande
              </Link>
            </div>
          )}

          {/* Transactions */}
          {payment.transactions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-sm text-[#191c1b] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00503a]" />
                Historique des transactions
              </h3>
              <div className="space-y-3">
                {payment.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{txn.type}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(txn.createdAt)} ·{" "}
                        {formatTime(txn.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {formatCurrency(txn.amount)}
                      </p>
                      <StatusBadge status={txn.status} variant="payment" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
