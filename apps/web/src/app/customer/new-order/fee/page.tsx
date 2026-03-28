"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  MapPin,
  Building2,
  ChevronRight,
  Truck,
  Scale,
  Shield,
  Tag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

// Mock fee calculation - in production would come from API
const calculateFees = (
  orderData: Record<string, unknown>,
  addressData: Record<string, unknown>,
) => {
  const weight = (orderData.weight as number) || 2;
  const isUrgent = (orderData.isUrgent as boolean) || false;
  const isFragile = (orderData.isFragile as boolean) || false;
  const isRefrigerated = (orderData.isRefrigerated as boolean) || false;

  const baseFee = 1500;
  const distanceFee = 750;
  const weightFee = weight > 2 ? Math.round((weight - 2) * 100) : 0;
  const insuranceFee = 250;
  const urgentFee = isUrgent ? 1000 : 0;
  const fragileFee = isFragile ? 300 : 0;
  const refrigeratedFee = isRefrigerated ? 500 : 0;

  const subtotal =
    baseFee +
    distanceFee +
    weightFee +
    insuranceFee +
    urgentFee +
    fragileFee +
    refrigeratedFee;
  const discount = 300; // Demo promo code
  const vat = Math.round((subtotal - discount) * 0.1925);
  const total = subtotal - discount + vat;

  return {
    baseFee,
    distanceFee,
    distance: 12.4,
    from: "Bastos",
    to: "Ahala",
    weightFee,
    weightCategory: weight <= 2 ? "Léger" : weight <= 5 ? "Moyen" : "Lourd",
    insuranceFee,
    urgentFee,
    fragileFee,
    refrigeratedFee,
    discount,
    promoCode: "TARA2026",
    subtotal,
    vat,
    total,
    eta: "14:30 - 15:15",
  };
};

export default function NewOrderStep3() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [fees, setFees] = useState<ReturnType<typeof calculateFees> | null>(
    null,
  );

  const step1Data = JSON.parse(sessionStorage.getItem("orderItems") || "{}");
  const step2Data = JSON.parse(
    sessionStorage.getItem("orderAddresses") || "{}",
  );

  useEffect(() => {
    if (!step1Data.type) {
      router.push("/customer/new-order");
      return;
    }
    setFees(calculateFees(step1Data, step2Data));
  }, [step1Data, step2Data, router]);

  const handleContinue = () => {
    if (fees) {
      sessionStorage.setItem("orderFees", JSON.stringify(fees));
    }
    router.push("/customer/new-order/payment");
  };

  if (!fees) return null;

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto w-full relative">
          <div className="flex items-center gap-8">
            <Link href="/customer">
              <span className="text-2xl font-black tracking-tighter text-emerald-900">
                TARA DELIVERY
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden bg-[#edeeec]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 left-0"></div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-64 py-6 px-4 space-y-2 bg-slate-50 sticky top-20">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-emerald-900">
              Tableau de Bord
            </h2>
            <p className="text-xs text-slate-500">Gérez vos envois</p>
          </div>
          <nav className="flex-1 space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-100 text-emerald-900 rounded-xl font-semibold">
              <Package className="w-5 h-5" />
              <span className="text-sm">Nouvelle Livraison</span>
            </div>
            <Link
              href="/customer/orders"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Package className="w-5 h-5" />
              <span className="text-sm">Mes Colis</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 3 SUR 5
                </span>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Récapitulatif de l'envoi
                </h1>
              </div>
              <p className="text-[#3f4944] max-w-xl">
                Vérifiez les détails de votre facturation avant de procéder au
                paiement.
              </p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12 max-w-md">
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
                      className={`w-12 h-0.5 mx-1 ${step < 3 ? "bg-[#00503a]" : "bg-[#e1e3e1]"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left: Fee Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-[#f2f4f2] rounded-xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <Truck className="w-8 h-8 text-[#00503a]" />
                      <span className="text-xs font-bold text-[#00503a] uppercase tracking-wider">
                        Tarif de base
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#191c1b]">
                        {formatCFA(fees.baseFee)}
                      </div>
                      <div className="text-xs text-[#3f4944]">
                        Livraison standard intra-urbaine
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#f2f4f2] rounded-xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <MapPin className="w-8 h-8 text-[#00503a]" />
                      <span className="text-xs font-bold text-[#00503a] uppercase tracking-wider">
                        Distance
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#191c1b]">
                        {formatCFA(fees.distanceFee)}
                      </div>
                      <div className="text-xs text-[#3f4944]">
                        Trajet de {fees.distance} km ({fees.from} → {fees.to})
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#f2f4f2] rounded-xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <Scale className="w-8 h-8 text-[#00503a]" />
                      <span className="text-xs font-bold text-[#00503a] uppercase tracking-wider">
                        Poids
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#191c1b]">
                        {formatCFA(fees.weightFee)}
                      </div>
                      <div className="text-xs text-[#3f4944]">
                        Colis {fees.weightCategory}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#f2f4f2] rounded-xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <Shield className="w-8 h-8 text-[#00503a]" />
                      <span className="text-xs font-bold text-[#00503a] uppercase tracking-wider">
                        Assurance
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#191c1b]">
                        {formatCFA(fees.insuranceFee)}
                      </div>
                      <div className="text-xs text-[#3f4944]">
                        Protection contre la perte ou casse
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional extras */}
                {(fees.urgentFee > 0 ||
                  fees.fragileFee > 0 ||
                  fees.refrigeratedFee > 0) && (
                  <div className="grid md:grid-cols-3 gap-4">
                    {fees.urgentFee > 0 && (
                      <div className="p-4 bg-[#feb700]/20 rounded-xl flex justify-between items-center">
                        <span className="text-sm font-bold text-[#271900]">
                          Flash
                        </span>
                        <span className="font-bold text-[#271900]">
                          {formatCFA(fees.urgentFee)}
                        </span>
                      </div>
                    )}
                    {fees.fragileFee > 0 && (
                      <div className="p-4 bg-[#ffdad6] rounded-xl flex justify-between items-center">
                        <span className="text-sm font-bold text-[#93000a]">
                          Fragile
                        </span>
                        <span className="font-bold text-[#93000a]">
                          {formatCFA(fees.fragileFee)}
                        </span>
                      </div>
                    )}
                    {fees.refrigeratedFee > 0 && (
                      <div className="p-4 bg-[#9ef4d0] rounded-xl flex justify-between items-center">
                        <span className="text-sm font-bold text-[#002116]">
                          Froid
                        </span>
                        <span className="font-bold text-[#002116]">
                          {formatCFA(fees.refrigeratedFee)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Code */}
                <div className="p-6 bg-[#e1e3e1] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#9ef4d0] flex items-center justify-center text-[#00503a]">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-[#191c1b]">
                        Code Promo: {fees.promoCode}
                      </div>
                      <div className="text-xs text-[#00503a] font-semibold">
                        Remise de -10% appliquée
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#ba1a1a]">
                      -{formatCFA(fees.discount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Invoice Summary */}
              <div className="lg:col-span-5">
                <div className="bg-[#00503a] text-white rounded-2xl p-8 sticky top-28">
                  <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                    Détails de facturation
                  </h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-[#92e7c3]">
                      <span className="font-medium">Sous-total</span>
                      <span className="font-mono">
                        {formatCFA(fees.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#92e7c3]">
                      <span className="font-medium">Remise Promotionnelle</span>
                      <span className="font-mono">
                        -{formatCFA(fees.discount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#92e7c3]">
                      <span className="font-medium">TVA (19.25%)</span>
                      <span className="font-mono">{formatCFA(fees.vat)}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <span className="block text-xs uppercase tracking-[0.2em] font-bold text-[#83d7b4] opacity-80 mb-1">
                          Montant Total
                        </span>
                        <span className="text-4xl font-black">
                          {formatCFA(fees.total)}
                        </span>
                      </div>
                      <div className="bg-[#006a4e] text-[#9ef4d0] px-3 py-1 rounded-full text-xs font-bold mb-1 uppercase tracking-wider">
                        Net à payer
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full bg-[#feb700] hover:bg-[#ffba20] text-[#271900] py-5 rounded-xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                  >
                    Passer au Paiement
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-4 py-4 grayscale opacity-60 mt-4">
                    <span className="text-xs text-[#83d7b4]">MTN MoMo</span>
                    <span className="text-xs text-[#83d7b4]">Orange Money</span>
                    <span className="text-xs text-[#83d7b4]">Espèces</span>
                  </div>

                  <p className="text-[10px] text-center text-[#83d7b4] opacity-70 px-4 leading-relaxed mt-4">
                    En cliquant sur "Passer au Paiement", vous acceptez nos
                    Conditions Générales de Vente.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="flex flex-col gap-3">
                <span className="text-[#7c5800] text-4xl">⏱</span>
                <h3 className="font-bold text-[#191c1b]">
                  Estimation de livraison
                </h3>
                <p className="text-sm text-[#3f4944] leading-relaxed">
                  Arrivée prévue entre{" "}
                  <span className="font-bold text-[#191c1b]">{fees.eta}</span>{" "}
                  aujourd'hui.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[#7c5800] text-4xl">📞</span>
                <h3 className="font-bold text-[#191c1b]">
                  Assistance Prioritaire
                </h3>
                <p className="text-sm text-[#3f4944] leading-relaxed">
                  Une question sur vos frais ? Notre équipe est disponible 24/7
                  au <span className="font-bold text-[#191c1b]">8080</span>.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[#7c5800] text-4xl">🗺</span>
                <h3 className="font-bold text-[#191c1b]">Zone de Service</h3>
                <p className="text-sm text-[#3f4944] leading-relaxed">
                  Livraison couvrant tout le périmètre urbain de{" "}
                  <span className="font-bold text-[#191c1b]">Yaoundé</span>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <footer className="flex items-center justify-between pt-10 mt-10 border-t border-[#bec9c2]/20">
              <Link
                href="/customer/new-order/addresses"
                className="flex items-center gap-2 text-[#3f4944] hover:text-[#00503a] font-bold transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                RETOUR
              </Link>
            </footer>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 w-full mt-auto">
        <div className="bg-emerald-900/5 h-px"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full gap-4 max-w-screen-2xl mx-auto">
          <p className="text-xs text-slate-500">
            © 2026 TARA DELIVERY. Logistique de précision au cœur de Yaoundé.
          </p>
          <div className="flex gap-8">
            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Conditions Générales
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Confidentialité
            </Link>
            <Link
              href="/contact"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
