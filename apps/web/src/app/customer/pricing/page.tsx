"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  Truck,
  MapPin,
  Clock,
  Weight,
  Zap,
  Shield,
  ChevronRight,
  Calculator,
  Gift,
  Info,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import { calculateDeliveryFee, formatCFA } from "@/lib/delivery-utils";

const NEIGHBORHOODS = [
  { name: "Bastos", lat: 3.8667, lng: 11.5167 },
  { name: "Mvan", lat: 3.85, lng: 11.5 },
  { name: "Nlongkak", lat: 3.8833, lng: 11.5167 },
  { name: "Biyem-Assi", lat: 3.8333, lng: 11.5 },
  { name: "Mokolo", lat: 3.8667, lng: 11.5 },
  { name: "Ahala", lat: 3.85, lng: 11.5333 },
  { name: "Ngousso", lat: 3.8667, lng: 11.5333 },
  { name: "Odza", lat: 3.8167, lng: 11.5167 },
  { name: "Essos", lat: 3.8667, lng: 11.5 },
  { name: "Mvog-Ada", lat: 3.85, lng: 11.5167 },
];

const ORDER_TYPES = [
  { v: "PARCEL", label: "Colis", emoji: "📦", desc: "Documents, Boîtes" },
  { v: "FOOD", label: "Repas", emoji: "🍔", desc: "Chaud ou froid" },
  { v: "PHARMACY", label: "Pharmacie", emoji: "💊", desc: "Urgences" },
  { v: "GROCERY", label: "Courses", emoji: "🛒", desc: "Supermarché" },
];

export default function PricingPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Calculator state
  const [pickupNeighborhood, setPickupNeighborhood] = useState("");
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("");
  const [orderType, setOrderType] = useState("PARCEL");
  const [weight, setWeight] = useState(2);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [isRefrigerated, setIsRefrigerated] = useState(false);

  // Calculate estimated price
  const getEstimatedPrice = () => {
    if (!pickupNeighborhood || !deliveryNeighborhood) return null;

    const pickup = NEIGHBORHOODS.find((n) => n.name === pickupNeighborhood);
    const delivery = NEIGHBORHOODS.find((n) => n.name === deliveryNeighborhood);

    if (!pickup || !delivery) return null;

    return calculateDeliveryFee({
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      deliveryLat: delivery.lat,
      deliveryLng: delivery.lng,
      weight,
      orderType: orderType as any,
      isUrgent,
      isFragile,
      isRefrigerated,
    });
  };

  const estimatedPrice = getEstimatedPrice();

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header title="Tarifs" />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <h1 className="text-4xl font-extrabold text-[#00503a] tracking-tight mb-2">
                Nos Tarifs de Livraison
              </h1>
              <p className="text-[#3f4944] max-w-2xl">
                Découvrez notre grille tarifaire transparente et calculez le
                coût de votre livraison en temps réel.
              </p>
            </header>

            {/* Pricing Calculator */}
            <section className="bg-white rounded-3xl p-8 mb-12 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#00503a] rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#191c1b]">
                    Simulateur de Prix
                  </h2>
                  <p className="text-sm text-[#3f4944]">
                    Estimez le coût de votre livraison
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  {/* Pickup */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Quartier de collecte
                    </label>
                    <select
                      value={pickupNeighborhood}
                      onChange={(e) => setPickupNeighborhood(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20"
                    >
                      <option value="">Sélectionner...</option>
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Quartier de livraison
                    </label>
                    <select
                      value={deliveryNeighborhood}
                      onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20"
                    >
                      <option value="">Sélectionner...</option>
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Type de commande
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ORDER_TYPES.map((type) => (
                        <button
                          key={type.v}
                          onClick={() => setOrderType(type.v)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            orderType === type.v
                              ? "bg-[#00503a] text-white"
                              : "bg-[#f2f4f2] text-[#191c1b] hover:bg-[#e7e9e6]"
                          }`}
                        >
                          <span className="text-2xl">{type.emoji}</span>
                          <span className="block text-xs font-medium mt-1">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Poids estimé: {weight} kg
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-[#f2f4f2] rounded-lg appearance-none cursor-pointer accent-[#00503a]"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0.5 kg</span>
                      <span>20 kg</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsUrgent(!isUrgent)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isUrgent
                          ? "bg-[#feb700] text-[#271900]"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      Express (30min)
                    </button>
                    <button
                      onClick={() => setIsFragile(!isFragile)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isFragile
                          ? "bg-[#ffdad6] text-[#93000a]"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Fragile
                    </button>
                    <button
                      onClick={() => setIsRefrigerated(!isRefrigerated)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isRefrigerated
                          ? "bg-[#9ef4d0] text-[#002116]"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Réfrigéré
                    </button>
                  </div>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-br from-[#00503a] to-[#006a4e] rounded-2xl p-8 text-white">
                  <h3 className="text-lg font-bold mb-6 opacity-90">
                    Estimation du prix
                  </h3>

                  {estimatedPrice ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="opacity-80">Tarif de base</span>
                          <span className="font-medium">
                            {formatCFA(estimatedPrice.baseFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="opacity-80">
                            Distance ({estimatedPrice.distance.toFixed(1)} km)
                          </span>
                          <span className="font-medium">
                            {formatCFA(estimatedPrice.distanceFee)}
                          </span>
                        </div>
                        {estimatedPrice.weightFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">
                              Surcharge poids ({weight} kg)
                            </span>
                            <span className="font-medium">
                              {formatCFA(estimatedPrice.weightFee)}
                            </span>
                          </div>
                        )}
                        {estimatedPrice.urgentFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Express</span>
                            <span className="font-medium">
                              {formatCFA(estimatedPrice.urgentFee)}
                            </span>
                          </div>
                        )}
                        {estimatedPrice.fragileFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Fragile</span>
                            <span className="font-medium">
                              {formatCFA(estimatedPrice.fragileFee)}
                            </span>
                          </div>
                        )}
                        {estimatedPrice.refrigeratedFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Réfrigéré</span>
                            <span className="font-medium">
                              {formatCFA(estimatedPrice.refrigeratedFee)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-white/20 pt-3 flex justify-between">
                          <span className="opacity-80">TVA (19.25%)</span>
                          <span className="font-medium">
                            {formatCFA(estimatedPrice.vat)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-end">
                          <span className="text-sm opacity-80">
                            Total estimé
                          </span>
                          <span className="text-3xl font-black">
                            {formatCFA(estimatedPrice.total)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm opacity-80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Livraison estimée: {estimatedPrice.eta} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {pickupNeighborhood} → {deliveryNeighborhood}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/customer/new-order")}
                        className="w-full py-3 bg-[#feb700] text-[#271900] font-bold rounded-xl hover:bg-[#ffba20] transition-all flex items-center justify-center gap-2"
                      >
                        CRÉER CETTE LIVRAISON
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="opacity-80">
                        Sélectionnez les quartiers pour voir l'estimation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Pricing Structure */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] mb-6">
                Structure Tarifaire
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 bg-[#9ef4d0] rounded-xl flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-[#00503a]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#191c1b] mb-2">
                    Tarif de Base
                  </h3>
                  <p className="text-3xl font-black text-[#00503a] mb-2">
                    500 XAF
                  </p>
                  <p className="text-sm text-[#3f4944]">
                    Inclus pour toute livraison standard dans Yaoundé
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 bg-[#feb700] rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-[#271900]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#191c1b] mb-2">
                    Par Kilomètre
                  </h3>
                  <p className="text-3xl font-black text-[#00503a] mb-2">
                    150 XAF/km
                  </p>
                  <p className="text-sm text-[#3f4944]">
                    Calculé selon la distance entre le point de collecte et de
                    livraison
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 bg-[#ffdad6] rounded-xl flex items-center justify-center mb-4">
                    <Weight className="w-6 h-6 text-[#93000a]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#191c1b] mb-2">
                    Surcharge Poids
                  </h3>
                  <p className="text-3xl font-black text-[#00503a] mb-2">
                    100 XAF/kg
                  </p>
                  <p className="text-sm text-[#3f4944]">
                    Appliqué pour les colis dépassant 2 kg
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Services */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] mb-6">
                Services Additionnels
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#f2f4f2] p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-[#feb700]" />
                    <span className="font-bold text-[#191c1b]">Express</span>
                  </div>
                  <p className="text-2xl font-black text-[#00503a] mb-1">
                    +1000 XAF
                  </p>
                  <p className="text-xs text-[#3f4944]">
                    Livraison en moins de 30 minutes
                  </p>
                </div>

                <div className="bg-[#f2f4f2] p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-[#ba1a1a]" />
                    <span className="font-bold text-[#191c1b]">Fragile</span>
                  </div>
                  <p className="text-2xl font-black text-[#00503a] mb-1">
                    +300 XAF
                  </p>
                  <p className="text-xs text-[#3f4944]">
                    Manipulation spéciale requise
                  </p>
                </div>

                <div className="bg-[#f2f4f2] p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-[#00503a]" />
                    <span className="font-bold text-[#191c1b]">Réfrigéré</span>
                  </div>
                  <p className="text-2xl font-black text-[#00503a] mb-1">
                    +500 XAF
                  </p>
                  <p className="text-xs text-[#3f4944]">
                    Maintien de la chaîne de froid
                  </p>
                </div>

                <div className="bg-[#f2f4f2] p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-[#7c5800]" />
                    <span className="font-bold text-[#191c1b]">Assurance</span>
                  </div>
                  <p className="text-2xl font-black text-[#00503a] mb-1">
                    +250 XAF
                  </p>
                  <p className="text-xs text-[#3f4944]">
                    Protection contre perte ou casse
                  </p>
                </div>
              </div>
            </section>

            {/* Price Range */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] mb-6">
                Fourchettes de Prix
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f2f4f2]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                        Distance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                        Poids
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                        Prix Estimé
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                        Temps
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e3e1]">
                    <tr className="hover:bg-[#f2f4f2]/50">
                      <td className="px-6 py-4 text-sm font-medium text-[#191c1b]">
                        0-5 km
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        &lt; 2 kg
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#00503a]">
                        500 - 1,250 XAF
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        20-35 min
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f2f4f2]/50">
                      <td className="px-6 py-4 text-sm font-medium text-[#191c1b]">
                        5-10 km
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        2-5 kg
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#00503a]">
                        1,250 - 2,500 XAF
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        30-45 min
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f2f4f2]/50">
                      <td className="px-6 py-4 text-sm font-medium text-[#191c1b]">
                        10+ km
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        5+ kg
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#00503a]">
                        2,500 - 15,000 XAF
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3f4944]">
                        45-90 min
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#3f4944] mt-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Les prix sont indicatifs et peuvent varier selon les conditions
                de circulation
              </p>
            </section>

            {/* Promotions */}
            <section className="bg-gradient-to-r from-[#00503a] to-[#006a4e] rounded-2xl p-8 text-white mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                    <Gift className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      Programme Fidélité
                    </h3>
                    <p className="opacity-80">
                      Gagnez des points à chaque livraison et profitez de
                      réductions exclusives
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <span className="text-sm opacity-80">10 livraisons</span>
                    <p className="font-bold">-10%</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <span className="text-sm opacity-80">25 livraisons</span>
                    <p className="font-bold">-15%</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <span className="text-sm opacity-80">50 livraisons</span>
                    <p className="font-bold">-20%</p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] mb-6">
                Questions Fréquentes
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Comment est calculé le prix de livraison ?",
                    a: "Le prix est calculé en fonction de la distance entre le point de collecte et de livraison, du poids du colis, et des options choisies (express, fragile, réfrigéré).",
                  },
                  {
                    q: "Y a-t-il des frais cachés ?",
                    a: "Non, tous nos tarifs sont transparents. Le prix affiché lors de la commande est le prix final que vous paierez.",
                  },
                  {
                    q: "Puis-je payer en espèces ?",
                    a: "Oui, nous acceptons les paiements en espèces à la livraison, ainsi que MTN Mobile Money et Orange Money.",
                  },
                  {
                    q: "Quelle est la zone de couverture ?",
                    a: "Nous couvrons l'ensemble de la ville de Yaoundé et ses environs immédiats.",
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold text-[#191c1b] mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00503a]" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-[#3f4944] pl-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="text-center">
              <h2 className="text-2xl font-bold text-[#191c1b] mb-4">
                Prêt à envoyer votre colis ?
              </h2>
              <p className="text-[#3f4944] mb-6">
                Créez votre première livraison en quelques clics
              </p>
              <button
                onClick={() => router.push("/customer/new-order")}
                className="px-8 py-4 bg-[#00503a] text-white font-bold rounded-xl hover:bg-[#006a4e] transition-all inline-flex items-center gap-2"
              >
                CRÉER UNE LIVRAISON
                <ChevronRight className="w-5 h-5" />
              </button>
            </section>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
