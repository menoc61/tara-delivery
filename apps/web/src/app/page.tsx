"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Package,
  MapPin,
  CreditCard,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Star,
  Phone,
  Mail,
  Bike,
  ChevronRight,
  CheckCircle,
  Wallet,
  MessageCircle,
  PartyPopper,
  X,
  Home,
  ShoppingBag,
  User,
  Bell,
  ShoppingCart,
  Utensils,
  Package2,
  ShoppingBasket,
  Pill,
  Building2,
  Truck,
  ArrowRightCircle,
} from "lucide-react";

const onboardingSteps = [
  {
    icon: Package2,
    title: "Décrivez votre colis",
    description:
      "Indiquez ce que vous souhaitez livrer, les adresses de collecte et de livraison.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: MapPin,
    title: "Suivez en temps réel",
    description:
      "Voyez votre livreur se déplacer sur la carte depuis le retrait jusqu'à la livraison.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Wallet,
    title: "Payez facilement",
    description:
      "MTN MoMo, Orange Money ou espèces - Choisissez votre méthode de paiement préférée.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: PartyPopper,
    title: "Livraison réussie!",
    description:
      "Votre colis est livré. Notez votre expérience et laissez un avis au livreur.",
    color: "from-yellow-500 to-amber-600",
  },
];

const services = [
  {
    icon: Utensils,
    title: "Restaurants & Food",
    desc: "Vos plats préférés livrés chauds et à temps",
    color: "bg-orange-100",
  },
  {
    icon: Package2,
    title: "Colis & Documents",
    desc: "Envois sécurisés à travers toute la capitale",
    color: "bg-emerald-100",
  },
  {
    icon: ShoppingBasket,
    title: "Courses Express",
    desc: "Nous faisons vos courses pour vous",
    color: "bg-purple-100",
  },
  {
    icon: Pill,
    title: "Santé & Pharma",
    desc: "Médicaments livrés discrètement",
    color: "bg-pink-100",
  },
];

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-animate]", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from("[data-animate-left]", {
        opacity: 0,
        x: -60,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from("[data-animate-right]", {
        opacity: 0,
        x: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from("[data-animate-scale]", {
        opacity: 0,
        scale: 0.8,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-background">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-[60] bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-yellow-900 rounded-full animate-pulse" />
          Vous êtes hors ligne - Certaines fonctionnalités peuvent être limitées
        </div>
      )}

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary">
              TARA DELIVERY
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#services"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </a>
            <a
              href="#process"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Comment ça marche
            </a>
            <Link
              href="/help"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Aide
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-muted rounded-lg">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Connexion
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgba(158,244,208,0.3) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(255,222,168,0.3) 0%, transparent 50%)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div data-animate-left>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Disponible à Yaoundé
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-extrabold mb-6 leading-tight">
              La ville à votre <span className="text-secondary">porte</span>.
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Logistique de précision pour vos colis, repas et courses. Tara
              Delivery redéfinit la rapidité urbaine au cœur du Cameroun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/auth/register"
                className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2"
              >
                Démarrer un envoi
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowOnboarding(true)}
                className="btn-secondary px-8 py-4 text-base inline-flex items-center gap-2"
              >
                Comment ça marche
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  +2,000 livraisons cette semaine
                </p>
              </div>
            </div>
          </div>

          <div className="relative" data-animate-right>
            <div className="relative w-[280px] h-[560px] mx-auto rounded-[3rem] bg-background shadow-2xl border-8 border-foreground/10 overflow-hidden">
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent z-20 flex justify-between items-center px-6">
                <span className="text-white text-xs font-medium">9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-2.5 bg-white/80 rounded-sm" />
                  <div className="w-0.5 h-2.5 bg-white/80 rounded-sm" />
                </div>
              </div>

              {/* App Header */}
              <div className="pt-14 pb-6 px-5 bg-gradient-to-br from-primary to-primary/80 text-white">
                <p className="text-white/70 text-sm">Bienvenue sur</p>
                <h3 className="font-bold text-xl">TARA DELIVERY</h3>
                <p className="text-white/60 text-xs mt-1">
                  3 livreurs disponibles
                </p>
              </div>

              {/* Dynamic Content */}
              <div className="p-4 space-y-3 bg-muted/30 h-[calc(100%-160px)]">
                {onboardingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl transition-all duration-500 ${
                      idx === currentStep
                        ? "bg-background shadow-lg scale-105"
                        : "bg-muted/50 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color}`}
                      >
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Progress Indicator */}
                <div className="mt-4 p-3 rounded-xl bg-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">
                      Commande en cours
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around px-4">
                {[
                  { icon: Home, active: true },
                  { icon: Package2, active: false },
                  { icon: MessageCircle, active: false },
                  { icon: User, active: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl ${item.active ? "bg-primary/10" : ""}`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${item.active ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -left-4 top-20 bg-background p-3 rounded-2xl shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">En route</span>
              </div>
            </div>

            <div className="absolute -right-4 bottom-32 bg-background p-3 rounded-2xl shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Livré!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16" data-animate-left>
            <h2 className="text-4xl font-display font-bold mb-4 text-primary">
              Une solution pour chaque besoin
            </h2>
            <p className="text-muted-foreground text-lg">
              Plus qu'une livraison, un partenaire quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Food Delivery - Large */}
            <div
              className="md:col-span-2 bg-muted/50 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
              data-animate-scale
            >
              <div className="z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Utensils className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">
                  Restaurants & Food
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Vos plats préférés des meilleurs établissements de Yaoundé,
                  livrés chauds et à temps.
                </p>
              </div>
              <div className="mt-8 flex gap-4 z-10">
                <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-primary">
                  Emballage Thermique
                </span>
                <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-primary">
                  Suivi Live
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />
            </div>

            {/* Parcels - Tall */}
            <div
              className="bg-primary text-white rounded-3xl p-8 flex flex-col justify-between"
              data-animate-scale
            >
              <div>
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6">
                  <Package2 className="w-7 h-7 text-on-primary-container" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Colis & Documents</h3>
                <p className="text-primary-fixed/80">
                  Envois sécurisés à travers toute la capitale.
                </p>
              </div>
              <button className="mt-8 bg-secondary-container text-on-secondary-container w-full py-4 rounded-xl font-bold uppercase tracking-wider">
                Réserver
              </button>
            </div>

            {/* Groceries */}
            <div
              className="bg-muted/30 rounded-3xl p-8 group"
              data-animate-scale
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShoppingBasket className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Courses Express
              </h3>
              <p className="text-muted-foreground mb-6">
                Ne perdez plus de temps au marché.
              </p>
              <div className="h-32 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop"
                  alt="Groceries"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pharmacy */}
            <div
              className="bg-emerald-50 rounded-3xl p-8 border border-primary/5"
              data-animate-scale
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Pill className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Santé & Pharma
              </h3>
              <p className="text-muted-foreground">
                Médicaments livrés discrètement.
              </p>
            </div>

            {/* Business */}
            <div
              className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-center"
              data-animate-scale
            >
              <Building2 className="w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Tara Business</h3>
              <p className="text-slate-400 mb-6">
                Externalisez votre logistique. API dédiée pour les entreprises.
              </p>
              <a
                className="text-secondary flex items-center gap-2 font-bold hover:underline"
                href="#"
              >
                En savoir plus <ArrowRightCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="process" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-4xl font-display font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground">
              Simple, Transparent, Efficace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {onboardingSteps.map((step, i) => (
              <div
                key={i}
                className="text-center flex flex-col items-center"
                data-animate
              >
                <div
                  className={`w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl mb-6 relative ${i < 3 ? "after:hidden md:after:block after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:w-24 after:h-0.5 after:bg-muted-foreground/30" : ""}`}
                >
                  {i + 1}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2">
                  {["Demande", "Estimation", "Paiement", "Livraison"][i]}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" data-animate>
        <div className="max-w-4xl mx-auto text-center rounded-[2.5rem] p-12 md:p-24 bg-gradient-to-r from-primary/90 via-primary/80 to-secondary/90 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white">
              Prêt à expédier votre premier colis ?
            </h2>
            <p className="text-white text-xl mb-12 max-w-2xl mx-auto">
              Rejoignez des milliers de particuliers et d'entreprises qui font
              confiance à Tara Delivery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="bg-secondary-container text-on-secondary-container px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:translate-y-[-2px] transition-transform">
                COMMENCER UN ENVOI
              </button>
              <button className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg">
                Télécharger l'App
              </button>
            </div>
          </div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[100px] opacity-50" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[100px] opacity-20" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 mt-20">
        <div className="h-px bg-primary/5" />
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              © {new Date().getFullYear()} TARA DELIVERY
            </p>
            <p className="text-xs text-muted-foreground">
              Logistique de précision au cœur de Yaoundé.
            </p>
          </div>
          <nav className="flex gap-8">
            <a
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              href="#"
            >
              Conditions
            </a>
            <a
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              href="#"
            >
              Confidentialité
            </a>
            <a
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              href="/help"
            >
              Contact
            </a>
          </nav>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Phone className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const Icon = onboardingSteps[currentStep].icon;
                  return <Icon className="w-10 h-10 text-white" />;
                })()}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-black">
                {onboardingSteps[currentStep].title}
              </h3>
              <p className="text-black">
                {onboardingSteps[currentStep].description}
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Précédent
              </button>
              {currentStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="btn-primary"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                    window.location.href = "/auth/register";
                  }}
                  className="btn-primary"
                >
                  Commencer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
