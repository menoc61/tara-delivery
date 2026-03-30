"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Home,
  Building2,
  Briefcase,
  ChevronRight,
  Clock,
  ChevronDown,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

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
  "Emombo",
  "Nkolbisson",
  "Nkoabang",
  "Obili",
  "Santa Barbara",
];

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  neighborhood: string;
  city: string;
  isDefault: boolean;
}

const ADDRESS_TYPES = [
  { v: "home", label: "Domicile", icon: Home },
  { v: "office", label: "Bureau", icon: Briefcase },
  { v: "other", label: "Autre", icon: MapPin },
];

export default function NewOrderStep2() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step1Data, setStep1Data] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  // Pickup state
  const [pickupType, setPickupType] = useState<string>("home");
  const [pickupNeighborhood, setPickupNeighborhood] = useState("");
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");

  // Delivery state
  const [deliveryType, setDeliveryType] = useState<string>("home");
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryContactName, setDeliveryContactName] = useState("");
  const [deliveryContactPhone, setDeliveryContactPhone] = useState("");

  // Scheduling state
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("orderItems") || "{}");
    setStep1Data(data);
    if (!data.type) {
      router.push("/customer/new-order");
      return;
    }

    // Pre-fill user info for pickup contact
    if (user?.name) setPickupContactName(user.name);
    if (user?.phone) setPickupContactPhone(user.phone.replace("237", ""));

    // Load saved addresses
    loadSavedAddresses();
  }, [user, router]);

  const loadSavedAddresses = async () => {
    try {
      const res = await usersApi.getAddresses();
      setSavedAddresses(res.data.data || []);
    } catch {
      // No saved addresses - that's ok
    }
  };

  const applySavedAddress = (
    address: SavedAddress,
    type: "pickup" | "delivery",
  ) => {
    if (type === "pickup") {
      setPickupNeighborhood(address.neighborhood);
      setPickupStreet(address.street);
    } else {
      setDeliveryNeighborhood(address.neighborhood);
      setDeliveryStreet(address.street);
    }
    setShowSavedAddresses(false);
    toast.success("Adresse appliquée");
  };

  const handleContinue = () => {
    if (
      !pickupNeighborhood ||
      !pickupStreet ||
      !pickupContactName ||
      !pickupContactPhone ||
      !deliveryNeighborhood ||
      !deliveryStreet ||
      !deliveryContactName ||
      !deliveryContactPhone
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const addressData = {
      pickupType,
      pickupNeighborhood,
      pickupStreet,
      pickupContactName,
      pickupContactPhone: `237${pickupContactPhone.replace(/\s/g, "")}`,
      deliveryType,
      deliveryNeighborhood,
      deliveryStreet,
      deliveryContactName,
      deliveryContactPhone: `237${deliveryContactPhone.replace(/\s/g, "")}`,
      scheduleType,
      scheduledDate,
      scheduledTime,
      notes,
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
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 pb-28 md:pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Step Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#9ef4d0] text-[#002116] text-xs font-bold">
                  ÉTAPE 2 SUR 5
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#00503a] tracking-tight">
                  Adresses & Timing
                </h1>
              </div>
              <p className="text-[#3f4944]">
                Indiquez les adresses de collecte et de livraison.
              </p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-10 max-w-md">
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

            {/* Saved Addresses Quick Select */}
            {savedAddresses.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                  className="flex items-center gap-2 text-sm font-medium text-[#00503a] hover:text-[#006a4e]"
                >
                  <MapPin className="w-4 h-4" />
                  Utiliser une adresse enregistrée
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showSavedAddresses ? "rotate-180" : ""}`}
                  />
                </button>
                {showSavedAddresses && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#00503a] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-[#9ef4d0]/30 text-[#00503a] text-[10px] font-bold rounded">
                                Par défaut
                              </span>
                            )}
                            <span className="font-medium text-sm">
                              {addr.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          {addr.street}, {addr.neighborhood}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applySavedAddress(addr, "pickup")}
                            className="flex-1 text-xs py-1.5 px-3 bg-[#00503a]/5 text-[#00503a] rounded-lg font-medium hover:bg-[#00503a]/10"
                          >
                            Comme collecte
                          </button>
                          <button
                            onClick={() => applySavedAddress(addr, "delivery")}
                            className="flex-1 text-xs py-1.5 px-3 bg-[#00503a]/5 text-[#00503a] rounded-lg font-medium hover:bg-[#00503a]/10"
                          >
                            Comme livraison
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pickup Address */}
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1b] mb-2">
                    Collecte
                  </h2>
                  <p className="text-sm text-slate-500">
                    Où récupérer votre colis?
                  </p>
                </div>

                {/* Address Type Selection */}
                <div className="flex gap-3">
                  {ADDRESS_TYPES.map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() => setPickupType(v)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        pickupType === v
                          ? "bg-[#00503a] border-[#00503a] text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Pickup Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                      Quartier *
                    </label>
                    <div className="relative">
                      <select
                        value={pickupNeighborhood}
                        onChange={(e) => setPickupNeighborhood(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] pr-10"
                      >
                        <option value="">Sélectionner un quartier</option>
                        {YAOUNDE_NEIGHBORHOODS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                      Rue / Avenue *
                    </label>
                    <input
                      type="text"
                      value={pickupStreet}
                      onChange={(e) => setPickupStreet(e.target.value)}
                      placeholder="Ex: Rue de l'Ambassade"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Nom du contact *
                      </label>
                      <input
                        type="text"
                        value={pickupContactName}
                        onChange={(e) => setPickupContactName(e.target.value)}
                        placeholder="Nom"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Téléphone *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500">
                          +237
                        </span>
                        <input
                          type="tel"
                          value={pickupContactPhone}
                          onChange={(e) =>
                            setPickupContactPhone(e.target.value)
                          }
                          placeholder="6XX XXX XXX"
                          className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1b] mb-2">
                    Livraison
                  </h2>
                  <p className="text-sm text-slate-500">
                    Où délivrer votre colis?
                  </p>
                </div>

                {/* Address Type Selection */}
                <div className="flex gap-3">
                  {ADDRESS_TYPES.map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() => setDeliveryType(v)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        deliveryType === v
                          ? "bg-[#00503a] border-[#00503a] text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Delivery Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                      Quartier *
                    </label>
                    <div className="relative">
                      <select
                        value={deliveryNeighborhood}
                        onChange={(e) =>
                          setDeliveryNeighborhood(e.target.value)
                        }
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] pr-10"
                      >
                        <option value="">Sélectionner un quartier</option>
                        {YAOUNDE_NEIGHBORHOODS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                      Rue / Avenue *
                    </label>
                    <input
                      type="text"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      placeholder="Ex: Rue de la Paix"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Nom du contact *
                      </label>
                      <input
                        type="text"
                        value={deliveryContactName}
                        onChange={(e) => setDeliveryContactName(e.target.value)}
                        placeholder="Nom du destinataire"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Téléphone *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500">
                          +237
                        </span>
                        <input
                          type="tel"
                          value={deliveryContactPhone}
                          onChange={(e) =>
                            setDeliveryContactPhone(e.target.value)
                          }
                          placeholder="6XX XXX XXX"
                          className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Horaire de Collecte */}
            <section className="mt-8 bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-[#191c1b] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00503a]" />
                Horaire de Collecte
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Now / Later Selection */}
                <div className="md:col-span-1 space-y-2">
                  <button
                    onClick={() => setScheduleType("now")}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      scheduleType === "now"
                        ? "bg-[#9ef4d0]/20 border-[#00503a]"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        scheduleType === "now"
                          ? "border-[#00503a]"
                          : "border-slate-300"
                      }`}
                    >
                      {scheduleType === "now" && (
                        <div className="w-3 h-3 rounded-full bg-[#00503a]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Maintenant</p>
                      <p className="text-xs text-slate-500">
                        Collecte immédiate
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setScheduleType("scheduled")}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      scheduleType === "scheduled"
                        ? "bg-[#9ef4d0]/20 border-[#00503a]"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        scheduleType === "scheduled"
                          ? "border-[#00503a]"
                          : "border-slate-300"
                      }`}
                    >
                      {scheduleType === "scheduled" && (
                        <div className="w-3 h-3 rounded-full bg-[#00503a]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Planifier</p>
                      <p className="text-xs text-slate-500">
                        Choisissez date et heure
                      </p>
                    </div>
                  </button>
                </div>

                {/* Date/Time Selection */}
                {scheduleType === "scheduled" && (
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                        Heure
                      </label>
                      <select
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a]"
                      >
                        <option value="">Sélectionner une heure</option>
                        <option value="08:00">08:00 - 09:00</option>
                        <option value="09:00">09:00 - 10:00</option>
                        <option value="10:00">10:00 - 11:00</option>
                        <option value="11:00">11:00 - 12:00</option>
                        <option value="12:00">12:00 - 13:00</option>
                        <option value="13:00">13:00 - 14:00</option>
                        <option value="14:00">14:00 - 15:00</option>
                        <option value="15:00">15:00 - 16:00</option>
                        <option value="16:00">16:00 - 17:00</option>
                        <option value="17:00">17:00 - 18:00</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-[#00503a] mb-1.5 uppercase tracking-wider">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions spéciales, détails supplémentaires..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] resize-none"
                />
              </div>
            </section>

            {/* Actions */}
            <footer className="flex items-center justify-between pt-8 mt-8 border-t border-[#bec9c2]/20">
              <Link
                href="/customer/new-order"
                className="flex items-center gap-2 text-[#3f4944] hover:text-[#00503a] font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                RETOUR
              </Link>
              <button
                onClick={handleContinue}
                disabled={!isValid || loading}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isValid && !loading
                    ? "bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white hover:opacity-90 active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    CALCULER LE PRIX
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </footer>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
