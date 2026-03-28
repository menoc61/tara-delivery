"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  Building2,
  Smartphone,
  Wallet,
  CreditCard,
  ChevronRight,
  Shield,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function NewOrderStep4() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step1Data, setStep1Data] = useState<Record<string, unknown>>({});
  const [step2Data, setStep2Data] = useState<Record<string, unknown>>({});
  const [step3Data, setStep3Data] = useState<Record<string, unknown>>({});

  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "orange" | "cash">(
    "mtn",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load data from sessionStorage
    const data1 = JSON.parse(sessionStorage.getItem("orderItems") || "{}");
    const data2 = JSON.parse(sessionStorage.getItem("orderAddresses") || "{}");
    const data3 = JSON.parse(sessionStorage.getItem("orderFees") || "{}");

    setStep1Data(data1);
    setStep2Data(data2);
    setStep3Data(data3);

    if (!data1.type) {
      router.push("/customer/new-order");
    }
  }, [router]);

  const total = step3Data?.total || 3219;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Store final order data
    const finalOrderData = {
      ...step1Data,
      ...step2Data,
      ...step3Data,
      paymentMethod,
      phoneNumber,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem("completedOrder", JSON.stringify(finalOrderData));

    router.push("/customer/new-order/success");
  };

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
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 4 SUR 5
                </span>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Finaliser le paiement
                </h1>
              </div>
              <p className="text-[#3f4944]">
                Choisissez votre mode de paiement préféré pour valider votre
                livraison.
              </p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12 max-w-md">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step < 4
                        ? "bg-[#00503a] text-white"
                        : step === 4
                          ? "bg-[#00503a] text-white ring-4 ring-[#9ef4d0]"
                          : "bg-[#e1e3e1] text-[#6f7a73]"
                    }`}
                  >
                    {step < 4 ? "✓" : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${step < 4 ? "bg-[#00503a]" : "bg-[#e1e3e1]"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Left: Payment Methods */}
              <div className="lg:col-span-7 space-y-10">
                <section>
                  <h2 className="text-2xl font-bold text-[#191c1b] mb-6">
                    Mode de paiement
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* MTN MoMo */}
                    <button
                      onClick={() => setPaymentMethod("mtn")}
                      className={`flex items-center p-6 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === "mtn"
                          ? "bg-[#9ef4d0] border-[#00503a] text-[#002116]"
                          : "bg-[#f2f4f2] border-transparent hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg mr-4 ${paymentMethod === "mtn" ? "bg-white" : "bg-white shadow-sm"}`}
                      >
                        <Smartphone
                          className={`w-8 h-8 ${paymentMethod === "mtn" ? "text-[#00503a]" : "text-[#3f4944]"}`}
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-lg">
                          MTN MoMo
                        </span>
                        <span
                          className={`text-sm ${paymentMethod === "mtn" ? "text-[#00513b]" : "text-[#3f4944]"}`}
                        >
                          Paiement mobile instantané
                        </span>
                      </div>
                      {paymentMethod === "mtn" && (
                        <Shield className="w-6 h-6 ml-auto text-[#00503a]" />
                      )}
                    </button>

                    {/* Orange Money */}
                    <button
                      onClick={() => setPaymentMethod("orange")}
                      className={`flex items-center p-6 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === "orange"
                          ? "bg-[#9ef4d0] border-[#00503a] text-[#002116]"
                          : "bg-[#f2f4f2] border-transparent hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg mr-4 ${paymentMethod === "orange" ? "bg-white" : "bg-white shadow-sm"}`}
                      >
                        <Wallet
                          className={`w-8 h-8 ${paymentMethod === "orange" ? "text-[#00503a]" : "text-[#3f4944]"}`}
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-lg">
                          Orange Money
                        </span>
                        <span
                          className={`text-sm ${paymentMethod === "orange" ? "text-[#00513b]" : "text-[#3f4944]"}`}
                        >
                          Rapide et sécurisé
                        </span>
                      </div>
                      {paymentMethod === "orange" && (
                        <Shield className="w-6 h-6 ml-auto text-[#00503a]" />
                      )}
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex items-center p-6 rounded-xl border-2 text-left transition-all md:col-span-2 ${
                        paymentMethod === "cash"
                          ? "bg-[#9ef4d0] border-[#00503a] text-[#002116]"
                          : "bg-[#f2f4f2] border-transparent hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg mr-4 ${paymentMethod === "cash" ? "bg-white" : "bg-white shadow-sm"}`}
                      >
                        <CreditCard
                          className={`w-8 h-8 ${paymentMethod === "cash" ? "text-[#00503a]" : "text-[#3f4944]"}`}
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-lg">
                          Paiement à la livraison
                        </span>
                        <span
                          className={`text-sm ${paymentMethod === "cash" ? "text-[#00513b]" : "text-[#3f4944]"}`}
                        >
                          Payez en espèces lors de la réception
                        </span>
                      </div>
                      {paymentMethod === "cash" && (
                        <Shield className="w-6 h-6 ml-auto text-[#00503a]" />
                      )}
                    </button>
                  </div>
                </section>

                {/* Phone Number Input (for mobile money) */}
                {(paymentMethod === "mtn" || paymentMethod === "orange") && (
                  <div className="bg-[#f2f4f2] p-8 rounded-xl space-y-6">
                    <div>
                      <label className="block font-bold text-[#00503a] mb-2 uppercase tracking-wider text-xs">
                        Numéro de téléphone{" "}
                        {paymentMethod === "mtn" ? "MoMo" : "Money"}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="6XX XXX XXX"
                          className="w-full bg-white border-b-2 border-transparent focus:border-[#00503a] focus:ring-0 rounded-t-lg px-4 py-4 text-xl font-medium tracking-widest text-[#191c1b] placeholder:text-[#6f7a73]"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <span className="text-xs text-[#3f4944] font-medium">
                            {paymentMethod === "mtn"
                              ? "MTN Cameroon"
                              : "Orange Cameroon"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-[#3f4944] flex items-center gap-2">
                        <span className="text-sm">ℹ</span>
                        Un message de confirmation apparaîtra sur votre
                        téléphone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-5">
                <div className="sticky top-32 space-y-6">
                  <div className="bg-[#e1e3e1] rounded-xl p-8">
                    <h2 className="font-bold text-xl mb-6 text-[#191c1b]">
                      Récapitulatif de l'envoi
                    </h2>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-[#3f4944]">
                        <span>Frais de livraison</span>
                        <span className="font-medium text-[#191c1b]">
                          {formatCFA(Number(step3Data?.baseFee) || 1500)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#3f4944]">
                        <span>Assurance colis</span>
                        <span className="font-medium text-[#191c1b]">
                          {formatCFA(Number(step3Data?.insuranceFee) || 250)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#3f4944]">
                        <span>Frais de service</span>
                        <span className="font-medium text-[#191c1b]">
                          {formatCFA(Number(step3Data?.vat) || 519)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-[#bec9c2]/20 flex justify-between items-center">
                        <span className="font-bold text-lg text-[#00503a]">
                          TOTAL
                        </span>
                        <span className="font-bold text-2xl text-[#00503a]">
                          {formatCFA(Number(total) || 3219)}
                        </span>
                      </div>
                    </div>

                    {/* Security Badges */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-white/50 p-3 rounded-lg flex items-center gap-3">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                          Cryptage SSL 256-bit
                        </span>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg flex items-center gap-3">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                          Paiement Sécurisé
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={
                        loading || (paymentMethod !== "cash" && !phoneNumber)
                      }
                      className={`w-full py-5 rounded-xl font-bold text-lg flex justify-center items-center gap-3 shadow-lg transition-all ${
                        loading || (paymentMethod !== "cash" && !phoneNumber)
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white hover:opacity-90 active:scale-[0.98]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Traitement...
                        </>
                      ) : (
                        <>
                          CONFIRMER LE PAIEMENT
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-center mt-6 text-xs text-[#3f4944]">
                      En cliquant sur confirmer, vous acceptez nos{" "}
                      <a className="underline text-[#00503a]" href="#">
                        conditions d'utilisation
                      </a>
                      .
                    </p>
                  </div>

                  {/* Help Card */}
                  <div className="bg-[#feb700]/10 p-6 rounded-xl flex gap-4">
                    <span className="text-[#7c5800] text-3xl">📞</span>
                    <div>
                      <h4 className="font-bold text-[#6b4b00] text-sm">
                        Besoin d'aide ?
                      </h4>
                      <p className="text-xs text-[#6b4b00]/80 mt-1">
                        Notre support client est disponible 24/7 au 6XX XX XX XX
                        pour vous assister.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <footer className="flex items-center justify-between pt-10 mt-10 border-t border-[#bec9c2]/20">
              <Link
                href="/customer/new-order/fee"
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
