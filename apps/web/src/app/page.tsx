"use client";

import { useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function StatusChip({
  label,
  sub,
  color,
}: {
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-card">
      <span
        className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse-soft`}
      />
      <div>
        <p className="text-xs font-bold text-gray-900 leading-none">{label}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero]", {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.from("[data-stat]", {
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.from("[data-feat]", {
        scrollTrigger: { trigger: featRef.current, start: "top 75%" },
        opacity: 0,
        y: 50,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.from("[data-step]", {
        scrollTrigger: { trigger: stepsRef.current, start: "top 75%" },
        opacity: 0,
        x: -40,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from("[data-cta]", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.to("[data-phone]", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
        rotateY: 8,
        rotateX: -4,
        y: 30,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-secondary">
      <header className="fixed top-0 w-full z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-gray-900">
              TARA<span className="text-brand-primary"> DELIVERY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {["#features", "#how-it-works", "#pricing"].map((href, i) => (
              <a
                key={i}
                href={href}
                className="hover:text-brand-primary transition-colors"
              >
                {["Fonctionnalités", "Comment ça marche", "Tarifs"][i]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm">
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative pt-28 pb-20 px-5 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%,rgba(255,107,44,.05) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(255,140,0,.07) 0%,transparent 50%)",
        }}
      >
        <div
          className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-[0.04] -z-10"
          style={{
            background: "radial-gradient(#ff6b2c, transparent)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-10 left-10 w-56 h-56 rounded-full opacity-[0.05] -z-10"
          style={{
            background: "radial-gradient(#ff8c00, transparent)",
            filter: "blur(50px)",
          }}
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div
              data-hero
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-7 bg-brand-50 text-brand-primary"
            >
              <Zap className="w-3.5 h-3.5" />
              Livraison express — Yaoundé
            </div>

            <h1
              data-hero
              className="font-display text-5xl lg:text-[3.75rem] font-extrabold leading-[1.1] mb-6 text-gray-900"
            >
              Livrez n'importe où
              <br />
              <span className="text-brand-primary">à Yaoundé.</span>
              <br />
              <span className="text-4xl lg:text-5xl font-bold text-gray-600">
                En 30 minutes.
              </span>
            </h1>

            <p
              data-hero
              className="text-lg leading-relaxed mb-9 max-w-lg text-gray-600"
            >
              Commandez en quelques secondes. Suivez en temps réel. Payez avec{" "}
              <strong>MTN MoMo</strong> ou <strong>Orange Money</strong>.
            </p>

            <div data-hero className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="btn-primary text-base px-8 py-4"
              >
                Commander une livraison
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/register?role=rider"
                className="btn-secondary text-base px-8 py-4"
              >
                Devenir livreur
              </Link>
            </div>

            <div
              data-hero
              className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-200"
            >
              <div className="flex -space-x-2">
                {["JM", "PK", "SA", "EM"].map((i, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                    style={{
                      background: ["#ff6b2c", "#ff8c00", "#c2410c", "#ea580c"][
                        idx
                      ],
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-[#fbbf24]">{"★★★★★"}</div>
                <p className="text-xs mt-0.5 text-gray-500">
                  +500 clients satisfaits
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative flex justify-center lg:justify-end"
            style={{ perspective: "1200px" }}
          >
            <div data-phone className="relative">
              <div
                className="absolute -left-12 top-16 z-20 animate-fade-up"
                style={{ animationDelay: "0.6s" }}
              >
                <StatusChip
                  label="Colis collecté"
                  sub="il y a 2 min"
                  color="bg-brand-primary"
                />
              </div>
              <div
                className="absolute -right-10 bottom-24 z-20 animate-fade-up"
                style={{ animationDelay: "0.9s" }}
              >
                <StatusChip
                  label="En route 🛵"
                  sub="8 min restants"
                  color="bg-orange-500"
                />
              </div>

              <div
                className="w-[260px] h-[520px] rounded-[2.5rem] shadow-modal overflow-hidden"
                style={{ background: "#0d1110", border: "6px solid #1c2420" }}
              >
                <div className="h-full flex flex-col">
                  <div
                    className="px-6 pt-10 pb-6 text-white"
                    style={{
                      background: "linear-gradient(160deg,#ff6b2c,#ff8c00)",
                    }}
                  >
                    <p className="text-white/70 text-xs mb-1">
                      Bonjour Jean-Pierre 👋
                    </p>
                    <h3 className="font-display font-bold text-xl mb-1">
                      Que livrons-nous?
                    </h3>
                    <p className="text-white/60 text-[11px]">
                      3 livreurs disponibles près de vous
                    </p>
                  </div>

                  <div className="flex-1 bg-white p-4 space-y-2.5">
                    {[
                      { e: "📦", l: "Colis", c: "#f0fdf4" },
                      { e: "🍔", l: "Nourriture", c: "#fef3c7" },
                      { e: "🛒", l: "Courses", c: "#f3e8ff" },
                    ].map((item) => (
                      <div
                        key={item.l}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: item.c }}
                      >
                        <span className="text-xl">{item.e}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900">
                            {item.l}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Livraison express
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    ))}

                    <div className="mt-1 p-3 rounded-xl bg-brand-50 border border-brand-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft bg-brand-primary" />
                        <span className="text-[10px] font-bold text-brand-primary">
                          Commande TD240001 • En route
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full rounded-full bg-brand-primary"
                          style={{ width: "72%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            Défiler
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500 animate-bounce" />
        </div>
      </section>

      <section ref={statsRef} className="py-14 px-5 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "500+", l: "Livraisons / mois" },
            { v: "30min", l: "Délai moyen" },
            { v: "4.9 ★", l: "Note client" },
            { v: "24/7", l: "Disponibilité" },
          ].map((s) => (
            <div key={s.l} data-stat>
              <div className="font-display text-3xl font-extrabold mb-1 text-brand-primary">
                {s.v}
              </div>
              <div className="text-sm text-gray-600">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold mb-4 text-gray-900">
              Tout pour votre livraison
            </h2>
            <p className="text-lg max-w-xl mx-auto text-gray-600">
              Une plateforme complète, conçue pour les réalités de Yaoundé.
            </p>
          </div>
          <div
            ref={featRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: MapPin,
                title: "Suivi temps réel",
                desc: "Voyez votre livreur se déplacer en direct sur la carte, mètre par mètre.",
                color: "rgba(255,107,44,.1)",
                ic: "#ff6b2c",
              },
              {
                icon: CreditCard,
                title: "Mobile money",
                desc: "MTN MoMo, Orange Money ou cash. Aucune carte bancaire requise.",
                color: "rgba(255,140,0,.12)",
                ic: "#f97316",
              },
              {
                icon: Zap,
                title: "En 30 minutes",
                desc: "Des livreurs vérifiés disponibles dans tous les quartiers de Yaoundé.",
                color: "rgba(255,107,44,.08)",
                ic: "#ff6b2c",
              },
              {
                icon: Shield,
                title: "Livreurs vérifiés",
                desc: "Chaque livreur est contrôlé, formé et évalué après chaque livraison.",
                color: "rgba(255,140,0,.1)",
                ic: "#f97316",
              },
              {
                icon: Clock,
                title: "Disponible 24h/24",
                desc: "Week-ends, jours fériés, nuits — nous livrons quand vous en avez besoin.",
                color: "rgba(255,107,44,.07)",
                ic: "#ff6b2c",
              },
              {
                icon: Star,
                title: "Qualité garantie",
                desc: "Notez vos livraisons et aidez-nous à maintenir l'excellence du service.",
                color: "rgba(255,140,0,.1)",
                ic: "#f97316",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                data-feat
                className="card p-6 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feat.color }}
                >
                  <feat.icon className="w-6 h-6" style={{ color: feat.ic }} />
                </div>
                <h3 className="font-display text-base font-bold mb-2 text-gray-900">
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold text-gray-900">
              Comment ça marche?
            </h2>
          </div>
          <div ref={stepsRef} className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                e: "📝",
                t: "Créez votre commande",
                d: "Indiquez adresse de collecte, de livraison et décrivez votre colis en 30 secondes.",
              },
              {
                n: "02",
                e: "🛵",
                t: "Un livreur accepte",
                d: "Un livreur disponible dans votre zone accepte et se met en route vers vous.",
              },
              {
                n: "03",
                e: "✅",
                t: "Livré & payé",
                d: "Suivez la livraison. Payez via MoMo, Orange Money ou en espèces à la réception.",
              },
            ].map((step) => (
              <div key={step.n} data-step className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br from-brand-primary to-orange-500">
                    {step.e}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-widest uppercase text-brand-primary/40">
                      Étape {step.n}
                    </span>
                    <h3 className="font-display text-lg font-bold mt-0.5 text-gray-900">
                      {step.t}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed ml-[4.5rem] text-gray-600">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-24 px-5">
        <div
          data-cta
          className="max-w-2xl mx-auto text-center rounded-3xl p-12 bg-gradient-to-br from-brand-primary to-orange-500"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-white/15">
            <Bike className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">
            Prêt à livrer?
          </h2>
          <p className="text-white/75 mb-8 text-base leading-relaxed">
            Rejoignez des centaines de Yaoundéens qui font confiance à TARA
            DELIVERY.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-brand-primary bg-white hover:bg-gray-50 transition-all"
            >
              Créer un compte
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?role=rider"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all bg-white/12 hover:bg-white/20 border border-white/25"
            >
              Devenir livreur
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-14 px-5 bg-gray-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="font-display font-bold text-white/90">
                TARA DELIVERY
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Livraison rapide et fiable à Yaoundé, Cameroun.
            </p>
          </div>
          {[
            {
              t: "Navigation",
              l: [
                ["Accueil", "/"],
                ["Commander", "/auth/register"],
                ["Devenir livreur", "/auth/register?role=rider"],
              ],
            },
            {
              t: "Support",
              l: [
                ["FAQ", "/faq"],
                ["Contact", "/contact"],
                ["Conditions", "/terms"],
              ],
            },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="text-white/80 font-semibold text-sm mb-4">
                {col.t}
              </h4>
              <ul className="space-y-2">
                {col.l.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 opacity-60" />
                <span>+237 6XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-60" />
                <span>support@tara-delivery.cm</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 opacity-60" />
                <span>Yaoundé, Cameroun</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} TARA DELIVERY. Fait avec ❤️ au Cameroun
          🇨🇲
        </div>
      </footer>
    </main>
  );
}
