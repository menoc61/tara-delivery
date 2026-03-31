"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Weight,
  Zap,
  Shield,
  ChevronRight,
  Calculator,
  Gift,
  CheckCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { calculateDeliveryFee, formatCFA } from "@/lib/delivery-utils";

gsap.registerPlugin(ScrollTrigger);

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
  { v: "PARCEL", label: "Colis", desc: "Documents, Boîtes" },
  { v: "FOOD", label: "Repas", desc: "Chaud ou froid" },
  { v: "GROCERY", label: "Courses", desc: "Supermarché" },
  { v: "COURIER", label: "Express", desc: "Course rapide" },
];

const pricingTiers = [
  {
    name: "Standard",
    price: "500",
    unit: "XAF",
    desc: "Pour les livraisons courantes",
    features: [
      "Livraison en 45-90 min",
      "Suivi en temps réel",
      "Paiement à la livraison",
      "Support client",
    ],
    color: "bg-[#f2f4f2]",
    icon: Package,
  },
  {
    name: "Express",
    price: "1 500",
    unit: "XAF",
    desc: "Pour les urgences",
    features: [
      "Livraison en 20-30 min",
      "Priorité absolue",
      "Suivi GPS live",
      "Support prioritaire 24/7",
      "Assurance incluse",
    ],
    color: "bg-[#00503a]",
    textColor: "text-white",
    icon: Zap,
    popular: true,
  },
  {
    name: "Business",
    price: "Sur mesure",
    unit: "",
    desc: "Pour les entreprises",
    features: [
      "Volume illimité",
      "Tarifs préférentiels",
      "API dédiée",
      "Gestionnaire de compte",
      "Facturation mensuelle",
      "Tableau de bord analytique",
    ],
    color: "bg-[#191c1b]",
    textColor: "text-white",
    icon: Truck,
  },
];

export default function PublicPricingPage() {
  const [orderType, setOrderType] = useState("PARCEL");
  const [weight, setWeight] = useState(1.5);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [pickup, setPickup] = useState(NEIGHBORHOODS[0]);
  const [delivery, setDelivery] = useState(NEIGHBORHOODS[3]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const fee = calculateDeliveryFee({
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    deliveryLat: delivery.lat,
    deliveryLng: delivery.lng,
    weight,
    orderType: orderType as
      | "PARCEL"
      | "FOOD"
      | "PHARMACY"
      | "GROCERY"
      | "COURIER",
    isUrgent,
    isFragile,
    isRefrigerated,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".pricing-hero", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });
      gsap.from(".calculator-section", {
        scrollTrigger: {
          trigger: ".calculator-section",
          start: "top 80%",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      if (cardsRef.current) {
        gsap.from(cardsRef.current.querySelectorAll(".pricing-card"), {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
          y: 60,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8faf7]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#f8faf7]/90 backdrop-blur-xl border-b border-[#e1e3e1]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00503a] flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-[#00503a] tracking-tight">
              TARA
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#services"
              className="text-sm text-[#3f4944] hover:text-[#00503a] transition-colors font-medium"
            >
              Services
            </Link>
            <Link href="/pricing" className="text-sm text-[#00503a] font-bold">
              Tarifs
            </Link>
            <Link
              href="/#comment-ça-marche"
              className="text-sm text-[#3f4944] hover:text-[#00503a] transition-colors font-medium"
            >
              Comment ça marche
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#3f4944] hover:text-[#00503a] px-4 py-2 rounded-lg transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#00503a] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-all shadow-lg"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4">
        {/* Hero */}
        <div className="pricing-hero max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#00503a] mb-6 tracking-tight">
            Tarifs <span className="text-[#feb700]">transparents</span>
          </h1>
          <p className="text-lg text-[#3f4944] max-w-2xl mx-auto">
            Calculez le coût de votre livraison en quelques secondes. Pas de
            frais cachés, juste une tarification claire.
          </p>
        </div>

        {/* Calculator */}
        <section className="calculator-section max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#00503a] rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#191c1b]">
                  Simulateur de prix
                </h2>
                <p className="text-sm text-[#3f4944]">
                  Estimez le coût de votre livraison
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Order Type */}
                <div>
                  <label className="text-xs font-bold text-[#00503a] uppercase tracking-wider mb-3 block">
                    Type d&apos;envoi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ORDER_TYPES.map((t) => (
                      <button
                        key={t.v}
                        onClick={() => setOrderType(t.v)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          orderType === t.v
                            ? "bg-[#00503a] text-white shadow-lg"
                            : "bg-[#f2f4f2] text-[#191c1b] hover:bg-[#e7e9e6]"
                        }`}
                      >
                        <p className="font-bold text-sm">{t.label}</p>
                        <p
                          className={`text-xs ${orderType === t.v ? "text-white/70" : "text-[#6f7a73]"}`}
                        >
                          {t.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-bold text-[#00503a] uppercase tracking-wider mb-3 block">
                    Poids: {weight} kg
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-2 bg-[#e1e3e1] rounded-lg appearance-none cursor-pointer accent-[#00503a]"
                  />
                  <div className="flex justify-between text-xs text-[#6f7a73] mt-1">
                    <span>0.5 kg</span>
                    <span>20 kg</span>
                  </div>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#00503a] uppercase tracking-wider mb-2 block">
                      Départ
                    </label>
                    <select
                      value={pickup.name}
                      onChange={(e) =>
                        setPickup(
                          NEIGHBORHOODS.find(
                            (n) => n.name === e.target.value,
                          ) || NEIGHBORHOODS[0],
                        )
                      }
                      className="w-full p-3 bg-[#f2f4f2] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#00503a]"
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#00503a] uppercase tracking-wider mb-2 block">
                      Arrivée
                    </label>
                    <select
                      value={delivery.name}
                      onChange={(e) =>
                        setDelivery(
                          NEIGHBORHOODS.find(
                            (n) => n.name === e.target.value,
                          ) || NEIGHBORHOODS[0],
                        )
                      }
                      className="w-full p-3 bg-[#f2f4f2] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#00503a]"
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      label: "Urgent",
                      active: isUrgent,
                      toggle: () => setIsUrgent(!isUrgent),
                      icon: Zap,
                    },
                    {
                      label: "Fragile",
                      active: isFragile,
                      toggle: () => setIsFragile(!isFragile),
                      icon: Shield,
                    },
                    {
                      label: "Réfrigéré",
                      active: isRefrigerated,
                      toggle: () => setIsRefrigerated(!isRefrigerated),
                      icon: Clock,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={opt.toggle}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        opt.active
                          ? "bg-[#00503a] text-white"
                          : "bg-[#f2f4f2] text-[#3f4944] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="bg-gradient-to-br from-[#00503a] to-[#006a4e] rounded-2xl p-8 text-white flex flex-col justify-between">
                <div>
                  <p className="text-[#92e7c3] text-sm font-medium mb-2">
                    Estimation du prix
                  </p>
                  <h3 className="text-5xl font-black mb-2">
                    {formatCFA(fee.total)}
                  </h3>
                  <p className="text-white/60 text-sm">
                    TTC, frais de service inclus
                  </p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Frais de base</span>
                    <span>{formatCFA(fee.baseFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Distance</span>
                    <span>{formatCFA(fee.distanceFee)}</span>
                  </div>
                  {(fee.urgentFee || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Express</span>
                      <span>{formatCFA(fee.urgentFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">TVA (19.25%)</span>
                    <span>{formatCFA(fee.vat)}</span>
                  </div>
                </div>
                <Link
                  href="/auth/register"
                  className="mt-8 w-full bg-[#feb700] text-[#271900] py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-[#ffca28] transition-colors"
                >
                  Commander maintenant <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section ref={cardsRef} className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#00503a] mb-4">
              Nos formules
            </h2>
            <p className="text-[#3f4944]">Choisissez celle qui vous convient</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => {
              const TierIcon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`pricing-card ${tier.color} ${tier.textColor || "text-[#191c1b]"} rounded-3xl p-8 relative overflow-hidden ${
                    tier.popular ? "ring-4 ring-[#feb700] scale-105" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute top-4 right-4 bg-[#feb700] text-[#271900] px-3 py-1 rounded-full text-xs font-bold">
                      Populaire
                    </div>
                  )}
                  <TierIcon
                    className={`w-10 h-10 mb-6 ${tier.textColor ? "text-[#9ef4d0]" : "text-[#00503a]"}`}
                  />
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black">{tier.price}</span>
                    {tier.unit && (
                      <span className="text-lg opacity-70">{tier.unit}</span>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-6 ${tier.textColor ? "text-white/70" : "text-[#3f4944]"}`}
                  >
                    {tier.desc}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-5 h-5 ${tier.textColor ? "text-[#9ef4d0]" : "text-[#00503a]"}`}
                        />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className={`w-full py-4 rounded-xl font-bold text-center block transition-all ${
                      tier.popular
                        ? "bg-[#feb700] text-[#271900] hover:bg-[#ffca28]"
                        : "bg-white text-[#00503a] hover:bg-[#f2f4f2]"
                    }`}
                  >
                    Commencer
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Promo */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#feb700] to-[#ff8c00] rounded-3xl p-8 md:p-12 text-[#271900] relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Gift className="w-12 h-12" />
                <div>
                  <h3 className="text-2xl font-bold">
                    Première livraison gratuite!
                  </h3>
                  <p className="opacity-80">
                    Inscrivez-vous et recevez votre première livraison offerte.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/register"
                className="bg-[#271900] text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors whitespace-nowrap"
              >
                En profiter
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#191c1b] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00503a] flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">TARA DELIVERY</span>
          </div>
          <p className="text-[#6f7a73] text-sm">
            © {new Date().getFullYear()} TARA DELIVERY. Logistique de précision.
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-[#6f7a73] text-sm hover:text-white transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/auth/login"
              className="text-[#6f7a73] text-sm hover:text-white transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
