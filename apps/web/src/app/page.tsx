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
  ArrowUpRight,
  ChevronRight,
  CheckCircle,
  Wallet,
  MessageCircle,
  X,
  Home,
  User,
  Bell,
  Utensils,
  Package2,
  ShoppingBasket,
  Pill,
  Building2,
  Truck,
  ArrowRightCircle,
  Download,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Heart,
  ChevronDown,
  Menu,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

gsap.registerPlugin(ScrollTrigger);

const onboardingSteps = [
  {
    icon: Package2,
    title: "Décrivez votre colis",
    description:
      "Indiquez ce que vous souhaitez livrer, les adresses de collecte et de livraison.",
    color: "from-[#feb700] to-[#ff8c00]",
  },
  {
    icon: MapPin,
    title: "Suivez en temps réel",
    description:
      "Voyez votre livreur se déplacer sur la carte du retrait jusqu'à la livraison.",
    color: "from-[#00503a] to-[#006a4e]",
  },
  {
    icon: Wallet,
    title: "Payez facilement",
    description:
      "MTN MoMo, Orange Money ou espèces - Choisissez votre méthode préférée.",
    color: "from-[#7c5800] to-[#feb700]",
  },
  {
    icon: CheckCircle,
    title: "Livraison réussie!",
    description:
      "Votre colis est livré. Notez votre expérience et laissez un avis au livreur.",
    color: "from-[#00503a] to-[#9ef4d0]",
  },
];

const stats = [
  { value: 50000, suffix: "+", label: "Livraisons effectuées" },
  { value: 98, suffix: "%", label: "Clients satisfaits" },
  { value: 25, suffix: " min", label: "Temps moyen" },
  { value: 500, suffix: "+", label: "Livreurs actifs" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (!ref.current || counted.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: value,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent =
                  Math.round(obj.val).toLocaleString("fr-FR") + suffix;
              }
            },
          });
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

  // Hero Animations
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Hero text reveal animation
      const heroLines = heroTextRef.current?.querySelectorAll(".hero-line");
      if (heroLines) {
        gsap.from(heroLines, {
          y: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.3,
        });
      }

      // CTA buttons
      gsap.from(".hero-cta", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.8,
      });

      // Phone mockup
      gsap.from(".phone-mockup", {
        y: 100,
        opacity: 0,
        rotationY: -15,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.5,
      });

      // Floating badges
      gsap.from(".float-badge", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 1.2,
      });

      // Continuous float animation
      gsap.to(".float-badge-1", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".float-badge-2", {
        y: 10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });

      // Stats counter animation
      if (statsRef.current) {
        gsap.from(statsRef.current.querySelectorAll(".stat-item"), {
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
          y: 60,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Services bento grid
      if (servicesRef.current) {
        gsap.from(servicesRef.current.querySelectorAll(".service-card"), {
          scrollTrigger: {
            trigger: servicesRef.current,
            start: "top 75%",
          },
          y: 80,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Process steps
      if (processRef.current) {
        gsap.from(processRef.current.querySelectorAll(".process-step"), {
          scrollTrigger: {
            trigger: processRef.current,
            start: "top 75%",
          },
          x: -60,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
        });

        // Draw connecting line
        gsap.from(".process-line", {
          scrollTrigger: {
            trigger: processRef.current,
            start: "top 75%",
          },
          scaleX: 0,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.8,
        });
      }

      // CTA section
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
          scale: 0.9,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={heroRef} className="min-h-screen bg-[#f8faf7] overflow-x-hidden">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#feb700] text-[#271900] px-4 py-2.5 text-center text-sm font-bold flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-[#271900] rounded-full animate-pulse" />
          Vous êtes hors ligne
        </div>
      )}

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#f8faf7]/90 backdrop-blur-xl border-b border-[#e1e3e1]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo - using favicon SVG */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-[#00503a]/20"
              viewBox="0 0 512 512"
            >
              <rect width="512" height="512" fill="#00503a" rx="96" />
              <path
                d="M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 224c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z"
                fill="#9ef4d0"
              />
              <circle cx="256" cy="256" r="48" fill="#feb700" />
              <path
                d="M256 176l24 48h56l-44 36 16 56-52-36-52 36 16-56-44-36h56z"
                fill="white"
              />
            </svg>
            <span className="font-extrabold text-xl text-[#00503a] tracking-tight">
              TARA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              "Services",
              "Comment ça marche",
              { label: "Tarifs", href: "/pricing" },
              "Aide",
            ].map((item) => {
              const isObj = typeof item === "object";
              const label = isObj ? item.label : item;
              const href = isObj
                ? item.href
                : `#${label.toLowerCase().replace(/ /g, "-")}`;
              return (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-[#3f4944] hover:text-[#00503a] transition-colors font-medium relative group"
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00503a] transition-all group-hover:w-full" />
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#3f4944] hover:text-[#00503a] px-4 py-2 rounded-lg hover:bg-[#00503a]/5 transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#00503a] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-all shadow-lg shadow-[#00503a]/20 hover:shadow-[#00503a]/30 hover:-translate-y-0.5"
            >
              Commencer
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#00503a]/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#191c1b]" />
            ) : (
              <Menu className="w-6 h-6 text-[#191c1b]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#e1e3e1] shadow-xl z-50">
            <nav className="flex flex-col p-4 gap-1">
              {[
                "Services",
                "Comment ça marche",
                { label: "Tarifs", href: "/pricing" },
                "Aide",
              ].map((item) => {
                const isObj = typeof item === "object";
                const label = isObj ? item.label : item;
                const href = isObj
                  ? item.href
                  : `#${label.toLowerCase().replace(/ /g, "-")}`;
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base text-[#3f4944] hover:text-[#00503a] hover:bg-[#00503a]/5 px-4 py-3 rounded-xl transition-all font-medium"
                  >
                    {label}
                  </a>
                );
              })}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#e1e3e1]">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-[#3f4944] hover:text-[#00503a] px-4 py-3 rounded-xl hover:bg-[#00503a]/5 transition-all"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-[#00503a] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-all"
                >
                  Commencer
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        className="relative pt-28 md:pt-32 pb-20 px-4 min-h-[90vh] flex items-center"
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgba(158,244,208,0.4) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(254,183,0,0.15) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(0,80,58,0.03) 0%, transparent 70%)",
        }}
      >
        {/* Animated background shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#9ef4d0]/30 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#feb700]/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00503a]/10 text-[#00503a] text-sm font-bold mb-8 border border-[#00503a]/10">
              <Zap className="w-4 h-4" />
              Disponible à Yaoundé
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>

            <h1
              ref={heroTextRef}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[0.95] tracking-tight"
            >
              <span className="hero-line block text-[#191c1b]">La ville</span>
              <span className="hero-line block text-[#191c1b]">à votre</span>
              <span className="hero-line block text-[#feb700] relative">
                porte.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#feb700]/40"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 8C40 2 100 2 198 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#3f4944] mb-10 max-w-lg leading-relaxed">
              Logistique de précision pour vos colis, repas et courses. TARA
              redéfinit la rapidité urbaine au cœur du Cameroun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/auth/register"
                className="hero-cta bg-[#00503a] text-white px-8 py-4 rounded-2xl font-bold text-base inline-flex items-center justify-center gap-2 hover:bg-[#006a4e] transition-all shadow-xl shadow-[#00503a]/25 hover:shadow-[#00503a]/40 hover:-translate-y-0.5"
              >
                Démarrer un envoi
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowOnboarding(true)}
                className="hero-cta bg-white text-[#191c1b] px-8 py-4 rounded-2xl font-bold text-base inline-flex items-center justify-center gap-2 border-2 border-[#e1e3e1] hover:border-[#00503a]/30 hover:bg-[#00503a]/5 transition-all"
              >
                Comment ça marche
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {["A", "B", "C", "D"].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-full border-2 border-white bg-[#9ef4d0] flex items-center justify-center text-sm font-bold text-[#002116] shadow-sm"
                    style={{ zIndex: 4 - i }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#feb700] fill-[#feb700]"
                    />
                  ))}
                </div>
                <p className="text-sm text-[#3f4944]">
                  <span className="font-bold text-[#191c1b]">+2,000</span>{" "}
                  livraisons cette semaine
                </p>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative phone-mockup">
            <div className="relative w-[280px] h-[560px] mx-auto rounded-[3rem] bg-[#191c1b] shadow-2xl p-3">
              <div className="w-full h-full rounded-[2.5rem] bg-[#f8faf7] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-20 flex justify-between items-center px-6">
                  <span className="text-white text-xs font-bold">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2.5 bg-white/90 rounded-sm" />
                    <div className="w-0.5 h-2.5 bg-white/90 rounded-sm" />
                  </div>
                </div>

                {/* App Header */}
                <div className="pt-14 pb-6 px-5 bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white">
                  <p className="text-white/70 text-xs font-medium">
                    Bienvenue sur
                  </p>
                  <h3 className="font-extrabold text-lg">TARA DELIVERY</h3>
                  <p className="text-white/50 text-xs mt-1">
                    3 livreurs disponibles
                  </p>
                </div>

                {/* Dynamic Steps */}
                <div className="p-4 space-y-2.5 bg-[#f2f4f2]/50 flex-1">
                  {onboardingSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl transition-all duration-500 ${
                        idx === currentStep
                          ? "bg-white shadow-lg scale-[1.03]"
                          : "bg-white/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${step.color}`}
                        >
                          <step.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-xs text-[#191c1b]">
                            {step.title}
                          </p>
                          <p className="text-[10px] text-[#6f7a73] line-clamp-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-[#e1e3e1] flex items-center justify-around px-4">
                  {[Home, Package2, MessageCircle, User].map((Icon, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl ${i === 0 ? "bg-[#00503a]/10" : ""}`}
                    >
                      <Icon
                        className={`w-5 h-5 ${i === 0 ? "text-[#00503a]" : "text-[#6f7a73]"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="float-badge float-badge-1 absolute -left-6 top-24 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-[#e1e3e1]/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-[#191c1b]">
                  En route
                </span>
              </div>
            </div>

            <div className="float-badge float-badge-2 absolute -right-4 bottom-36 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-[#e1e3e1]/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-[#191c1b]">Livré!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-[#6f7a73] font-medium">Découvrir</span>
          <ChevronDown className="w-5 h-5 text-[#6f7a73]" />
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-4 bg-[#00503a]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-[#92e7c3] text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Bento Grid */}
      <section ref={servicesRef} id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#00503a] tracking-tight">
              Une solution pour chaque besoin
            </h2>
            <p className="text-[#3f4944] text-lg">
              Plus qu&apos;une livraison, un partenaire quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Food - Large */}
            <div className="service-card md:col-span-2 bg-[#f2f4f2] rounded-3xl p-8 overflow-hidden relative group hover:shadow-xl transition-shadow">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Utensils className="w-7 h-7 text-[#00503a]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#00503a] mb-3">
                  Restaurants & Food
                </h3>
                <p className="text-[#3f4944] max-w-md">
                  Vos plats préférés des meilleurs établissements de Yaoundé,
                  livrés chauds et à temps.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-[#00503a]">
                    Emballage Thermique
                  </span>
                  <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-[#00503a]">
                    Suivi Live
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#00503a]/5 to-transparent" />
            </div>

            {/* Parcels */}
            <div className="service-card bg-[#00503a] text-white rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div>
                <div className="w-14 h-14 bg-[#9ef4d0]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Package2 className="w-7 h-7 text-[#9ef4d0]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Colis & Documents</h3>
                <p className="text-[#92e7c3]/80">
                  Envois sécurisés à travers toute la capitale.
                </p>
              </div>
              <Link
                href="/auth/register"
                className="mt-6 bg-[#feb700] text-[#271900] w-full py-4 rounded-xl font-bold uppercase tracking-wider text-center hover:bg-[#ffca28] transition-colors"
              >
                Réserver
              </Link>
            </div>

            {/* Groceries */}
            <div className="service-card bg-[#f2f4f2] rounded-3xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShoppingBasket className="w-7 h-7 text-[#00503a]" />
              </div>
              <h3 className="text-2xl font-bold text-[#00503a] mb-2">
                Courses Express
              </h3>
              <p className="text-[#3f4944]">
                Ne perdez plus de temps au marché.
              </p>
            </div>

            {/* Pharmacy */}
            <div className="service-card bg-[#9ef4d0]/20 rounded-3xl p-8 border border-[#00503a]/10 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Pill className="w-7 h-7 text-[#00503a]" />
              </div>
              <h3 className="text-2xl font-bold text-[#00503a] mb-2">
                Santé & Pharma
              </h3>
              <p className="text-[#3f4944]">Médicaments livrés discrètement.</p>
            </div>

            {/* Business */}
            <div className="service-card bg-[#191c1b] text-white rounded-3xl p-8 hover:shadow-xl transition-shadow">
              <Building2 className="w-8 h-8 mb-4 text-[#9ef4d0]" />
              <h3 className="text-2xl font-bold mb-2">Tara Business</h3>
              <p className="text-[#6f7a73] mb-4">
                Externalisez votre logistique. API dédiée.
              </p>
              <a
                className="text-[#feb700] flex items-center gap-2 font-bold hover:underline"
                href="#"
              >
                En savoir plus <ArrowRightCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        ref={processRef}
        id="comment-ça-marche"
        className="py-20 px-4 bg-[#f2f4f2]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#00503a]">
              Comment ça marche ?
            </h2>
            <p className="text-[#3f4944] text-lg">
              Simple, Transparent, Efficace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-[#00503a]/20">
              <div className="process-line absolute inset-0 bg-[#00503a] origin-left" />
            </div>

            {onboardingSteps.map((step, i) => (
              <div
                key={i}
                className="process-step text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#00503a] text-white flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-[#00503a]/30 relative z-10">
                  {i + 1}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#191c1b]">
                  {["Demande", "Estimation", "Paiement", "Livraison"][i]}
                </h4>
                <p className="text-sm text-[#3f4944]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-[2.5rem] p-10 md:p-16 bg-gradient-to-br from-[#00503a] via-[#00503a] to-[#006a4e] relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#9ef4d0] rounded-full blur-[120px] opacity-20" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#feb700] rounded-full blur-[120px] opacity-10" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-white leading-tight">
              Prêt à expédier votre premier colis ?
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers de particuliers et d&apos;entreprises qui
              font confiance à TARA Delivery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/register"
                className="bg-[#feb700] text-[#271900] px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-[#ffca28] hover:-translate-y-1 transition-all inline-flex items-center justify-center gap-2"
              >
                COMMENCER UN ENVOI
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={installApp}
                className="bg-white/10 backdrop-blur text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Download className="w-5 h-5" />
                Télécharger l&apos;App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2376XXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#128C7E] hover:scale-110 transition-all animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Modern Footer */}
      <footer className="bg-[#191c1b] text-white">
        {/* Top wave decoration */}
        <div className="relative h-16 overflow-hidden">
          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V20C240 0 480 40 720 20C960 0 1200 40 1440 20V60H0Z"
              fill="#191c1b"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
          {/* Footer Top */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#00503a] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight">
                  TARA
                </span>
              </div>
              <p className="text-[#6f7a73] text-sm leading-relaxed mb-6">
                Logistique de précision au cœur de Yaoundé. Livraison rapide et
                fiable pour vos colis, repas et courses.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Facebook, href: "#" },
                  { icon: Linkedin, href: "#" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#6f7a73] hover:bg-[#00503a] hover:text-white transition-all"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#92e7c3] mb-6">
                Services
              </h4>
              <ul className="space-y-3">
                {[
                  "Livraison de colis",
                  "Livraison de repas",
                  "Courses express",
                  "Pharmacie",
                  "Tara Business",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[#bec9c2] text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#92e7c3] mb-6">
                Entreprise
              </h4>
              <ul className="space-y-3">
                {["À propos", "Carrières", "Presse", "Blog", "Partenaires"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[#bec9c2] text-sm hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#92e7c3] mb-6">
                Contact
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#feb700] shrink-0 mt-0.5" />
                  <span className="text-[#bec9c2] text-sm">
                    Bastos, Yaoundé
                    <br />
                    Cameroun
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#feb700] shrink-0" />
                  <a
                    href="tel:+2376XXXXXXXX"
                    className="text-[#bec9c2] text-sm hover:text-white transition-colors"
                  >
                    +237 6XX XXX XXX
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
                  <a
                    href="https://wa.me/2376XXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#bec9c2] text-sm hover:text-[#25D366] transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#feb700] shrink-0" />
                  <a
                    href="mailto:contact@tara-delivery.cm"
                    className="text-[#bec9c2] text-sm hover:text-white transition-colors"
                  >
                    contact@tara-delivery.cm
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-lg mb-1">Restez informé</h4>
                <p className="text-[#6f7a73] text-sm">
                  Recevez nos dernières actualités et offres spéciales.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 md:w-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#6f7a73] focus:outline-none focus:border-[#00503a] focus:ring-1 focus:ring-[#00503a]"
                />
                <button className="px-6 py-3 bg-[#00503a] text-white rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-colors">
                  S&apos;inscrire
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6f7a73] text-xs">
              © {new Date().getFullYear()} TARA DELIVERY. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-[#6f7a73] text-xs hover:text-white transition-colors"
              >
                Conditions Générales
              </a>
              <a
                href="#"
                className="text-[#6f7a73] text-xs hover:text-white transition-colors"
              >
                Politique de Confidentialité
              </a>
              <a
                href="#"
                className="text-[#6f7a73] text-xs hover:text-white transition-colors"
              >
                Mentions Légales
              </a>
            </div>
            <div className="flex items-center gap-2 text-[#6f7a73] text-xs">
              <span>Fait avec</span>
              <Heart className="w-3 h-3 text-[#ba1a1a] fill-[#ba1a1a]" />
              <span>à Yaoundé</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#f2f4f2] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${onboardingSteps[currentStep].color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                {(() => {
                  const Icon = onboardingSteps[currentStep].icon;
                  return <Icon className="w-10 h-10 text-white" />;
                })()}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {onboardingSteps[currentStep].title}
              </h3>
              <p className="text-[#3f4944]">
                {onboardingSteps[currentStep].description}
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentStep ? "w-8 bg-[#00503a]" : "w-2 bg-[#e1e3e1]"
                  }`}
                  onClick={() => setCurrentStep(i)}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2.5 text-sm font-bold text-[#3f4944] disabled:opacity-30"
              >
                Précédent
              </button>
              {currentStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-[#00503a] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <Link
                  href="/auth/register"
                  className="bg-[#00503a] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006a4e] transition-colors"
                >
                  Commencer
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
