"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, User, Package, Send } from "lucide-react";
import { ordersApi, ridersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import { LoadingState } from "@/components/shared/EmptyState";
import toast from "react-hot-toast";

interface OrderForRating {
  id: string;
  orderNumber: string;
  status: string;
  rider?: {
    id?: string;
    user?: { name: string; phone: string; avatar?: string };
    rating?: number;
  };
}

export default function RateDriverPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderForRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersApi.getById(orderId);
        const orderData = res.data.data;
        if (orderData.status !== "DELIVERED") {
          toast.error("Seules les commandes livrées peuvent être notées");
          router.push("/customer/orders");
          return;
        }
        setOrder(orderData);
      } catch (err) {
        toast.error(getErrorMessage(err));
        router.push("/customer/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  const handleSubmit = async () => {
    if (score === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }
    setSubmitting(true);
    try {
      await ridersApi.rate({
        orderId,
        score,
        comment: comment || undefined,
      });
      toast.success("Merci pour votre évaluation!");
      router.push("/customer/orders");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
        <Header />
        <div className="flex pt-20">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-4xl mx-auto w-full">
            <LoadingState />
          </main>
        </div>
        <PageFooter />
        <MobileNav />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-lg mx-auto w-full">
          {/* Back Button */}
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#00503a] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux commandes
          </Link>

          {/* Rate Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            {/* Driver Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#00503a]/10 flex items-center justify-center mx-auto mb-4">
              {order.rider?.user?.avatar ? (
                <img
                  src={order.rider.user.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-[#00503a]" />
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-[#00503a] mb-1">
              Noter le livreur
            </h1>
            <p className="text-sm text-slate-500 mb-2">
              {order.rider?.user?.name || "Livreur"}
            </p>
            <p className="text-xs text-slate-400 mb-8">
              Commande #{order.orderNumber}
            </p>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setScore(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverScore || score)
                        ? "text-[#feb700] fill-[#feb700]"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Score Labels */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                "",
                "Mauvais",
                "Passable",
                "Bien",
                "Très bien",
                "Excellent",
              ].map(
                (label, i) =>
                  i > 0 && (
                    <span
                      key={i}
                      className={`text-xs transition-colors ${
                        score === i
                          ? "text-[#00503a] font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  ),
              )}
            </div>

            {/* Comment */}
            <div className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire (optionnel)"
                rows={4}
                maxLength={500}
                className="w-full bg-[#f2f4f2] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00503a]/20 resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">
                {comment.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || score === 0}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all ${
                submitting || score === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer l&apos;évaluation
                </>
              )}
            </button>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
