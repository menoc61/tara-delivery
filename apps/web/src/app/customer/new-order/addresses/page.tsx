"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  MapPin,
  Building2,
  Home,
  Briefcase,
  ChevronRight,
  Navigation,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const YAOUNDE_NEIGHBORHOODS = [
  "Bastos",
  "Mfoundi",
  "Nlongkak",
  "Ekounou",
  "Mvan",
  "Biyem-Assi",
  "Mokolo",
  "Awae",
  "Ahala",
  "Ngousso",
  "Odza",
  "Essazou",
  "Messassi",
  "Nkolndongo",
  "Mendong",
];

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function NewOrderStep2() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Load step 1 data
  const step1Data = JSON.parse(sessionStorage.getItem("orderItems") || "{}");

  const [pickupType, setPickupType] = useState<"home" | "office" | "other">(
    "home",
  );
  const [deliveryType, setDeliveryType] = useState<"home" | "office" | "other">(
    "home",
  );

  const [pickupNeighborhood, setPickupNeighborhood] = useState("");
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupContactName, setPickupContactName] = useState(user?.name || "");
  const [pickupContactPhone, setPickupContactPhone] = useState(
    user?.phone || "",
  );

  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryContactName, setDeliveryContactName] = useState("");
  const [deliveryContactPhone, setDeliveryContactPhone] = useState("");

  const [scheduledTime, setScheduledTime] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleContinue = () => {
    const addressData = {
      pickup: {
        type: pickupType,
        neighborhood: pickupNeighborhood,
        street: pickupStreet,
        contactName: pickupContactName,
        contactPhone: pickupContactPhone,
      },
      delivery: {
        type: deliveryType,
        neighborhood: deliveryNeighborhood,
        street: deliveryStreet,
        contactName: deliveryContactName,
        contactPhone: deliveryContactPhone,
      },
      scheduledTime,
      scheduledDate,
    };
    sessionStorage.setItem("orderAddresses", JSON.stringify(addressData));
    router.push("/customer/new-order/fee");
  };

  const isValid =
    pickupNeighborhood &&
    pickupStreet &&
    pickupContactName &&
    pickupContactPhone &&
    deliveryNeighborhood &&
    deliveryStreet &&
    deliveryContactName &&
    deliveryContactPhone;

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
            <Link
              href="/customer/settings"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Building2 className="w-5 h-5" />
              <span className="text-sm">Paramètres</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <header className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 2 SUR 5
                </span>
                <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Adresses & Timing
                </h1>
              </div>
              <p className="text-[#3f4944] max-w-xl">
                Précisez les points de collecte et de livraison, ainsi que le
                moment souhaité.
              </p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12 max-w-md">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step < 2
                        ? "bg-[#00503a] text-white"
                        : step === 2
                          ? "bg-[#00503a] text-white ring-4 ring-[#9ef4d0]"
                          : "bg-[#e1e3e1] text-[#6f7a73]"
                    }`}
                  >
                    {step < 2 ? "✓" : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${
                        step < 2 ? "bg-[#00503a]" : "bg-[#e1e3e1]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-12">
              {/* Pickup Address */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#9ef4d0] rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#00503a]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#191c1b]">
                      Point de Collecte
                    </h2>
                    <p className="text-sm text-[#3f4944]">
                      Où devons-nous récupérer votre colis ?
                    </p>
                  </div>
                </div>

                {/* Address Type */}
                <div className="flex gap-4 mb-6">
                  {[
                    { v: "home", label: "Domicile", icon: Home },
                    { v: "office", label: "Bureau", icon: Briefcase },
                    { v: "other", label: "Autre", icon: MapPin },
                  ].map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() =>
                        setPickupType(v as "home" | "office" | "other")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        pickupType === v
                          ? "bg-[#00503a] text-white"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      QUARTIER *
                    </label>
                    <select
                      value={pickupNeighborhood}
                      onChange={(e) => setPickupNeighborhood(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b]"
                    >
                      <option value="">Sélectionner un quartier</option>
                      {YAOUNDE_NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      RUE / Avenue *
                    </label>
                    <input
                      type="text"
                      value={pickupStreet}
                      onChange={(e) => setPickupStreet(e.target.value)}
                      placeholder="Ex: Rue de l'Ambassade"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      CONTACT *
                    </label>
                    <input
                      type="text"
                      value={pickupContactName}
                      onChange={(e) => setPickupContactName(e.target.value)}
                      placeholder="Nom de la personne"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      TÉLÉPHONE *
                    </label>
                    <input
                      type="tel"
                      value={pickupContactPhone}
                      onChange={(e) => setPickupContactPhone(e.target.value)}
                      placeholder="6XX XXX XXX"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#feb700] rounded-full flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-[#271900]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#191c1b]">
                      Point de Livraison
                    </h2>
                    <p className="text-sm text-[#3f4944]">
                      Où devons-nous livrer votre colis ?
                    </p>
                  </div>
                </div>

                {/* Address Type */}
                <div className="flex gap-4 mb-6">
                  {[
                    { v: "home", label: "Domicile", icon: Home },
                    { v: "office", label: "Bureau", icon: Briefcase },
                    { v: "other", label: "Autre", icon: MapPin },
                  ].map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() =>
                        setDeliveryType(v as "home" | "office" | "other")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        deliveryType === v
                          ? "bg-[#00503a] text-white"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      QUARTIER *
                    </label>
                    <select
                      value={deliveryNeighborhood}
                      onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b]"
                    >
                      <option value="">Sélectionner un quartier</option>
                      {YAOUNDE_NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      RUE / Avenue *
                    </label>
                    <input
                      type="text"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      placeholder="Ex: Rue de la Pharmacie"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      CONTACT *
                    </label>
                    <input
                      type="text"
                      value={deliveryContactName}
                      onChange={(e) => setDeliveryContactName(e.target.value)}
                      placeholder="Nom du destinataire"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#191c1b] mb-2">
                      TÉLÉPHONE *
                    </label>
                    <input
                      type="tel"
                      value={deliveryContactPhone}
                      onChange={(e) => setDeliveryContactPhone(e.target.value)}
                      placeholder="6XX XXX XXX"
                      className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b] placeholder:text-[#6f7a73]"
                    />
                  </div>
                </div>
              </section>

              {/* Scheduling */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#006a4e] rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#191c1b]">
                      Horaire de Collecte
                    </h2>
                    <p className="text-sm text-[#3f4944]">
                      Quand souhaitez-vous que nous récupérer le colis ?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setScheduledTime("now")}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                      scheduledTime === "now"
                        ? "bg-[#00503a] text-white"
                        : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                    }`}
                  >
                    Maintenant
                  </button>
                  <button
                    onClick={() => setScheduledTime("scheduled")}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                      scheduledTime === "scheduled"
                        ? "bg-[#00503a] text-white"
                        : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                    }`}
                  >
                    Planifier
                  </button>
                </div>

                {scheduledTime === "scheduled" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#191c1b] mb-2">
                        DATE
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#191c1b] mb-2">
                        HEURE
                      </label>
                      <input
                        type="time"
                        className="w-full bg-[#f2f4f2] border-none focus:ring-2 focus:ring-[#00503a] rounded-xl p-4 text-[#191c1b]"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Actions */}
              <footer className="flex items-center justify-between pt-10 border-t border-[#bec9c2]/20">
                <Link
                  href="/customer/new-order"
                  className="flex items-center gap-2 text-[#3f4944] hover:text-[#00503a] font-bold transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  RETOUR
                </Link>
                <button
                  onClick={handleContinue}
                  disabled={!isValid}
                  className={`px-10 py-4 rounded-xl font-bold text-sm tracking-widest transition-all flex items-center gap-3 ${
                    isValid
                      ? "bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white hover:shadow-lg active:scale-95"
                      : "bg-[#e1e3e1] text-[#6f7a73] cursor-not-allowed"
                  }`}
                >
                  CALCULER LE PRIX
                  <ChevronRight className="w-5 h-5" />
                </button>
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 w-full mt-auto">
        <div className="bg-emerald-900/5 h-px"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full gap-4 max-w-screen-2xl mx-auto">
          <p className="text-xs text-slate-500">
            © 2024 TARA DELIVERY. Logistique de précision au cœur de Yaoundé.
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
