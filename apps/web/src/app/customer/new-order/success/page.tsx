"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  Building2,
  CheckCircle,
  MapPin,
  Truck,
  Download,
  Home,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TD${yy}${mm}${dd}${rand}`;
}

export default function NewOrderStep5() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("completedOrder") || "{}");
    if (!data.type) {
      router.push("/customer/new-order");
      return;
    }
    setOrderData(data);
  }, [router]);

  if (!orderData) return null;

  const orderNumber = orderData.orderNumber || generateOrderNumber();
  const eta = orderData.eta || "14:30 - 15:15";

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

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-screen-xl mx-auto">
        {/* Success Hero */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-24 h-24 bg-[#9ef4d0] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#00503a]/10">
            <CheckCircle className="w-16 h-16 text-[#00503a]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#00503a] mb-4 tracking-tight">
            Commande Confirmée !
          </h1>
          <p className="text-[#3f4944] text-lg max-w-lg font-medium">
            Votre envoi est entre de bonnes mains. Préparez votre colis, notre
            livreur est en route vers vous.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#f2f4f2] rounded-xl p-8 transition-all hover:translate-y-[-4px] duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-1 block">
                    ID COMMANDE
                  </span>
                  <h2 className="text-2xl font-bold text-[#00503a]">
                    #{String(orderNumber)}
                  </h2>
                </div>
                <button className="flex items-center gap-2 text-[#00503a] font-bold hover:underline transition-all">
                  <Download className="w-5 h-5" />
                  Télécharger le reçu
                </button>
              </div>

              <div className="space-y-6">
                {/* Delivery Type */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-[#83d7b4] rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-[#00503a]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#191c1b] mb-1 uppercase">
                      Type d'envoi
                    </p>
                    <p className="text-[#3f4944]">
                      {orderData.type === "FOOD"
                        ? "Repas"
                        : orderData.type === "PHARMACY"
                          ? "Pharmacie"
                          : orderData.type === "OTHER"
                            ? "Autre"
                            : "Colis"}{" "}
                      -{orderData.isUrgent ? " Express" : " Standard"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#191c1b] mb-1 uppercase">
                      Total
                    </p>
                    <p className="text-xl font-bold text-[#00503a]">
                      {formatCFA((orderData.total as number) || 3219)}
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-[#ffdea8] rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#7c5800]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191c1b] mb-1 uppercase">
                      Itinéraire
                    </p>
                    <p className="text-[#3f4944]">
                      De:{" "}
                      {String(
                        (orderData.pickup as Record<string, unknown>)
                          ?.neighborhood || "Bastos",
                      )}
                      , Rue de l'Ambassade
                    </p>
                    <p className="text-[#3f4944]">
                      Vers:{" "}
                      {String(
                        (orderData.delivery as Record<string, unknown>)
                          ?.neighborhood || "Ahala",
                      )}
                      , Rue de la Pharmacie
                    </p>
                  </div>
                </div>

                {/* ETA */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-[#9ef4d0] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl">⏱</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191c1b] mb-1 uppercase">
                      Heure estimée
                    </p>
                    <p className="text-[#3f4944]">
                      Arrivée prévue entre{" "}
                      <span className="font-bold text-[#191c1b]">
                        {String(eta)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking CTA */}
            <div className="bg-[#00503a] text-white rounded-xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-2">
                    Suivez votre livraison en temps réel
                  </h3>
                  <p className="opacity-80">
                    Visualisez le parcours de votre colis sur la carte
                  </p>
                </div>
                <Link
                  href="/customer/orders/track"
                  className="bg-[#feb700] text-[#271900] px-6 py-3 rounded-xl font-bold hover:bg-[#ffba20] transition-colors flex items-center gap-2"
                >
                  Suivre
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#191c1b] mb-4">Paiement</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#3f4944]">Mode de paiement</span>
                  <span className="font-medium text-[#191c1b]">
                    {orderData.paymentMethod === "mtn"
                      ? "MTN MoMo"
                      : orderData.paymentMethod === "orange"
                        ? "Orange Money"
                        : "Espèces"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#3f4944]">Statut</span>
                  <span className="font-medium text-[#00503a]">Confirmé</span>
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-[#f2f4f2] p-6 rounded-xl flex gap-4">
                <div className="w-12 h-12 bg-[#9ef4d0] rounded-full flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6 text-[#00503a]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#191c1b]">
                    Point de collecte
                  </h4>
                  <p className="text-sm text-[#3f4944]">
                    {((orderData.pickup as Record<string, unknown>)
                      ?.contactName as string) || user?.name}
                  </p>
                  <p className="text-sm text-[#3f4944]">
                    {((orderData.pickup as Record<string, unknown>)
                      ?.contactPhone as string) || user?.phone}
                  </p>
                </div>
              </div>

              <div className="bg-[#f2f4f2] p-6 rounded-xl flex gap-4">
                <div className="w-12 h-12 bg-[#ffdea8] rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[#7c5800]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#191c1b]">
                    Point de livraison
                  </h4>
                  <p className="text-sm text-[#3f4944]">
                    {
                      (orderData.delivery as Record<string, unknown>)
                        ?.contactName as string
                    }
                  </p>
                  <p className="text-sm text-[#3f4944]">
                    {
                      (orderData.delivery as Record<string, unknown>)
                        ?.contactPhone as string
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-[#feb700]/10 p-6 rounded-xl flex gap-4">
              <MessageCircle className="w-8 h-8 text-[#7c5800]" />
              <div>
                <h4 className="font-bold text-[#6b4b00]">Une question ?</h4>
                <p className="text-xs text-[#6b4b00]/80 mt-1">
                  Notre équipe est disponible 24/7 pour vous accompagner.
                </p>
                <button className="mt-3 text-xs font-bold text-[#00503a] uppercase tracking-wider hover:underline">
                  Contacter le support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/customer/orders/track"
            className="px-8 py-4 bg-[#00503a] text-white rounded-xl font-bold hover:bg-[#006a4e] transition-colors flex items-center gap-3"
          >
            <MapPin className="w-5 h-5" />
            Suivre ma livraison
          </Link>
          <Link
            href="/customer/new-order"
            className="px-8 py-4 bg-[#f2f4f2] text-[#191c1b] rounded-xl font-bold hover:bg-[#e7e9e6] transition-colors flex items-center gap-3"
          >
            <Package className="w-5 h-5" />
            Nouvelle livraison
          </Link>
        </div>
      </main>

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
