"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  ChevronRight,
  Truck,
  Scale,
  Shield,
  Tag,
  ArrowLeft,
  Gift,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

// Fee calculation
const calculateFees = (
  orderData: Record<string, unknown>,
  addressData: Record<string, unknown>,
) => {
  const weight = (orderData.weight as number) || 1.5;
  const isUrgent = (orderData.isUrgent as boolean) || false;
  const isFragile = (orderData.isFragile as boolean) || false;
  const isRefrigerated = (orderData.isRefrigerated as boolean) || false;
  const orderType = (orderData.type as string) || "PARCEL";

  const baseFee = 500;
  const distanceFee = 750;
  const weightFee = weight > 2 ? (weight - 2) * 100 : 0;
  const typeFee =
    orderType === "COURIER" ? 500 : orderType === "GROCERY" ? 200 : 0;
  const urgentFee = isUrgent ? 1000 : 0;
  const fragileFee = isFragile ? 300 : 0;
  const refrigeratedFee = isRefrigerated ? 500 : 0;
  const insuranceFee = 250;

  const subtotal =
    baseFee +
    distanceFee +
    weightFee +
    typeFee +
    urgentFee +
    fragileFee +
    refrigeratedFee +
    insuranceFee;
  const vat = Math.round(subtotal * 0.1925);
  const total = subtotal + vat;

  return {
    baseFee,
    distanceFee,
    weightFee,
    typeFee,
    urgentFee,
    fragileFee,
    refrigeratedFee,
    insuranceFee,
    subtotal,
    vat,
    total,
  };
};

export default function NewOrderStep3() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step1Data, setStep1Data] = useState<Record<string, unknown>>({});
  const [step2Data, setStep2Data] = useState<Record<string, unknown>>({});
  const [fees, setFees] = useState<{
    baseFee: number;
    distanceFee: number;
    weightFee: number;
    typeFee: number;
    urgentFee: number;
    fragileFee: number;
    refrigeratedFee: number;
    insuranceFee: number;
    subtotal: number;
    vat: number;
    total: number;
  }>({
    baseFee: 0,
    distanceFee: 0,
    weightFee: 0,
    typeFee: 0,
    urgentFee: 0,
    fragileFee: 0,
    refrigeratedFee: 0,
    insuranceFee: 0,
    subtotal: 0,
    vat: 0,
    total: 0,
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    const data1 = JSON.parse(sessionStorage.getItem("orderItems") || "{}");
    const data2 = JSON.parse(sessionStorage.getItem("orderAddresses") || "{}");

    setStep1Data(data1);
    setStep2Data(data2);

    if (!data1.type) {
      router.push("/customer/new-order");
      return;
    }

    const calculatedFees = calculateFees(data1, data2);
    setFees(calculatedFees);
  }, [router]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "TARA2026") {
      setPromoApplied(true);
      setPromoDiscount(300);
      toast.success("Code promo appliqué! -300 XAF");
    } else {
      toast.error("Code promo invalide");
    }
  };

  const handleContinue = () => {
    const feeData = {
      ...fees,
      promoCode: promoApplied ? promoCode : undefined,
      promoDiscount,
      total: (fees.total || 0) - promoDiscount,
    };
    sessionStorage.setItem("orderFees", JSON.stringify(feeData));
    router.push("/customer/new-order/payment");
  };

  const total = (fees.total || 0) - promoDiscount;

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 pb-28 md:pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Step Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 3 SUR 5
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Récapitulatif & Prix
                </h1>
              </div>
              <p className="text-[#3f4944]">
                Vérifiez les détails et le tarif de votre livraison.
              </p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-10 max-w-md">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step < 3
                        ? "bg-[#00503a] text-white"
                        : step === 3
                          ? "bg-[#00503a] text-white ring-4 ring-[#9ef4d0]"
                          : "bg-[#e1e3e1] text-[#6f7a73]"
                    }`}
                  >
                    {step < 3 ? "✓" : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${
                        step < 3 ? "bg-[#00503a]" : "bg-[#e1e3e1]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left: Details */}
              <div className="lg:col-span-7 space-y-6">
                {/* Route Summary */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="font-bold text-[#191c1b] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00503a]" />
                    Itinéraire
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#00503a] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Collecte
                        </p>
                        <p className="text-sm font-medium">
                          {step2Data.pickupStreet as string},{" "}
                          {step2Data.pickupNeighborhood as string}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Livraison
                        </p>
                        <p className="text-sm font-medium">
                          {step2Data.deliveryStreet as string},{" "}
                          {step2Data.deliveryNeighborhood as string}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="font-bold text-[#191c1b] mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#00503a]" />
                    Article
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00503a]/5 flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#00503a]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {(step1Data.type as string) === "FOOD"
                          ? "Repas"
                          : (step1Data.type as string) === "GROCERY"
                            ? "Courses"
                            : (step1Data.type as string) === "COURIER"
                              ? "Express"
                              : "Colis"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Poids: {(step1Data.weight as number) || 1.5} kg
                      </p>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {Boolean(step1Data.isFragile) && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">
                          Fragile
                        </span>
                      )}
                      {Boolean(step1Data.isUrgent) && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded">
                          Urgent
                        </span>
                      )}
                      {Boolean(step1Data.isRefrigerated) && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                          Réfrigéré
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="font-bold text-[#191c1b] mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#00503a]" />
                    Code Promo
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Entrez votre code"
                      disabled={promoApplied}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] disabled:opacity-50"
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoApplied || !promoCode}
                      className="px-6 py-3 bg-[#00503a] text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-[#006a4e] transition-colors"
                    >
                      {promoApplied ? "Appliqué" : "Appliquer"}
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium">
                      Remise de {formatCFA(promoDiscount)} appliquée!
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Fee Breakdown */}
              <div className="lg:col-span-5">
                <div className="sticky top-32 space-y-6">
                  <div className="bg-[#e1e3e1] rounded-2xl p-6">
                    <h2 className="font-bold text-lg text-[#191c1b] mb-4">
                      Détail des Frais
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Frais de base</span>
                        <span className="font-medium">
                          {formatCFA(fees.baseFee || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Distance</span>
                        <span className="font-medium">
                          {formatCFA(fees.distanceFee || 0)}
                        </span>
                      </div>
                      {(fees.weightFee || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Surpoids</span>
                          <span className="font-medium">
                            {formatCFA(fees.weightFee || 0)}
                          </span>
                        </div>
                      )}
                      {(fees.typeFee || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            Type de service
                          </span>
                          <span className="font-medium">
                            {formatCFA(fees.typeFee || 0)}
                          </span>
                        </div>
                      )}
                      {(fees.urgentFee || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Express</span>
                          <span className="font-medium">
                            {formatCFA(fees.urgentFee || 0)}
                          </span>
                        </div>
                      )}
                      {(fees.fragileFee || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Fragile</span>
                          <span className="font-medium">
                            {formatCFA(fees.fragileFee || 0)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Assurance</span>
                        <span className="font-medium">
                          {formatCFA(fees.insuranceFee || 250)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">TVA (19.25%)</span>
                        <span className="font-medium">
                          {formatCFA(fees.vat || 0)}
                        </span>
                      </div>
                      {promoApplied && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Remise promo</span>
                          <span>-{formatCFA(promoDiscount)}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-[#bec9c2]/30 flex justify-between items-center">
                        <span className="font-bold text-lg text-[#00503a]">
                          TOTAL
                        </span>
                        <span className="font-bold text-2xl text-[#00503a]">
                          {formatCFA(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    CHOISIR LE PAIEMENT
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <footer className="flex items-center justify-between pt-8 mt-8 border-t border-[#bec9c2]/20">
              <Link
                href="/customer/new-order/addresses"
                className="flex items-center gap-2 text-[#3f4944] hover:text-[#00503a] font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                RETOUR
              </Link>
            </footer>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
