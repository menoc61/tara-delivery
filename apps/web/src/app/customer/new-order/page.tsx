"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Minus,
  Heart,
  Snowflake,
  Bolt,
  ChevronRight,
  Bell,
  Settings,
  CreditCard,
  Wallet,
  User,
  Bell as BellIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";

const ORDER_TYPES = [
  { v: "FOOD", label: "Repas", emoji: "🍔", desc: "Chaud ou froid" },
  { v: "PARCEL", label: "Colis", emoji: "📦", desc: "Documents, Boîtes" },
  { v: "PHARMACY", label: "Pharmacie", emoji: "💊", desc: "Urgences" },
  { v: "OTHER", label: "Autre", emoji: "📋", desc: "Sur mesure" },
];

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function NewOrderStep1() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [orderType, setOrderType] = useState("PARCEL");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(1.5);
  const [isFragile, setIsFragile] = useState(false);
  const [isRefrigerated, setIsRefrigerated] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  const handleContinue = () => {
    const orderData = {
      type: orderType,
      description,
      weight,
      isFragile,
      isRefrigerated,
      isUrgent,
    };
    sessionStorage.setItem("orderItems", JSON.stringify(orderData));
    router.push("/customer/new-order/addresses");
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 1 SUR 5
                </span>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Détails de l'envoi
                </h1>
              </div>
              <p className="text-[#3f4944] max-w-xl">
                Dites-nous en plus sur ce que vous souhaitez envoyer à travers
                Yaoundé.
              </p>
            </header>

            <div className="space-y-12">
              <section>
                <label className="block text-sm font-bold text-[#191c1b] mb-6">
                  QUE SOUHAITEZ-VOUS LIVRER ?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ORDER_TYPES.map((type) => (
                    <button
                      key={type.v}
                      onClick={() => setOrderType(type.v)}
                      className={`flex flex-col items-start p-6 rounded-xl transition-all ${
                        orderType === type.v
                          ? "bg-[#9ef4d0] text-[#002116] border-2 border-[#00503a] scale-95"
                          : "bg-[#f2f4f2] hover:bg-[#e7e9e6] border-2 border-transparent"
                      }`}
                    >
                      <span className="text-3xl mb-4">{type.emoji}</span>
                      <span className="font-bold text-lg">{type.label}</span>
                      <span className="text-xs text-[#3f4944]">
                        {type.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section>
                    <label className="block text-sm font-bold text-[#191c1b] mb-3">
                      DESCRIPTION DE L'ARTICLE
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#e7e9e6] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]/60"
                      placeholder="Ex: 2 plats de NDOLÉ avec compléments..."
                      rows={4}
                    />
                  </section>
                  <section>
                    <label className="block text-sm font-bold text-[#191c1b] mb-3">
                      ESTIMATION DU POIDS
                    </label>
                    <div className="flex items-center gap-4 bg-[#f2f4f2] p-2 rounded-xl">
                      <button
                        onClick={() => setWeight(Math.max(0.5, weight - 0.5))}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#00503a] hover:bg-[#00503a] hover:text-white transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold">{weight}</span>
                        <span className="text-sm font-bold text-[#3f4944] ml-1 uppercase">
                          kg
                        </span>
                      </div>
                      <button
                        onClick={() => setWeight(weight + 0.5)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#00503a] hover:bg-[#00503a] hover:text-white transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] text-[#6f7a73] uppercase font-bold tracking-wider">
                      Note: Le prix final peut varier selon le poids réel.
                    </p>
                  </section>
                </div>

                <div className="space-y-6">
                  <label className="block text-sm font-bold text-[#191c1b] mb-3">
                    OPTIONS DE MANIPULATION
                  </label>

                  <div className="flex items-center justify-between p-5 bg-[#f2f4f2] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ffdad6] text-[#93000a] rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#191c1b]">Fragile</h4>
                        <p className="text-xs text-[#3f4944]">
                          Attention particulière requise
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsFragile(!isFragile)}
                      className={`w-14 h-7 rounded-full transition-colors ${isFragile ? "bg-[#00503a]" : "bg-[#e1e3e1]"}`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${isFragile ? "translate-x-7" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-[#f2f4f2] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#9ef4d0] text-[#002116] rounded-full flex items-center justify-center">
                        <Snowflake className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#191c1b]">Réfrigéré</h4>
                        <p className="text-xs text-[#3f4944]">
                          Maintien de la chaîne de froid
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRefrigerated(!isRefrigerated)}
                      className={`w-14 h-7 rounded-full transition-colors ${isRefrigerated ? "bg-[#00503a]" : "bg-[#e1e3e1]"}`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${isRefrigerated ? "translate-x-7" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>

                  <div className="mt-8 p-6 bg-[#feb700] text-[#271900] rounded-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="font-black text-xl mb-1">
                        Besoin de vitesse ?
                      </h4>
                      <p className="text-sm opacity-90 mb-4">
                        Livraison prioritaire en moins de 45 minutes.
                      </p>
                      <button
                        onClick={() => setIsUrgent(!isUrgent)}
                        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${isUrgent ? "bg-[#271900] text-white" : "bg-[#271900] text-white"}`}
                      >
                        {isUrgent ? "ACTIVÉ" : "ACTIVER FLASH"}
                      </button>
                    </div>
                    <Bolt className="absolute -bottom-4 -right-4 text-[#271900] text-9xl opacity-10 rotate-12" />
                  </div>
                </div>
              </div>

              <footer className="flex items-center justify-between pt-10 border-t border-[#bec9c2]/20">
                <Link
                  href="/customer"
                  className="flex items-center gap-2 text-[#3f4944] hover:text-[#00503a] font-bold transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  RETOUR
                </Link>
                <button
                  onClick={handleContinue}
                  className="px-10 py-4 bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white rounded-xl font-bold text-sm tracking-widest hover:shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                  CONTINUER
                  <ChevronRight className="w-5 h-5" />
                </button>
              </footer>
            </div>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
