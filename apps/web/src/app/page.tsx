"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Package, MapPin, CreditCard, Zap, Shield, Clock,
  ArrowRight, Star, Phone, Mail, Bike, ChevronDown,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ── Floating status chip ──────────────────────────────────
function StatusChip({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-float">
      <span className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse-soft`} />
      <div>
        <p className="text-xs font-bold text-on_surface leading-none">{label}</p>
        <p className="text-[10px] text-on_sur_var mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const heroRef    = useRef<HTMLElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const featRef    = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero stagger ────────────────────────────────
      gsap.from("[data-hero]", {
        opacity: 0, y: 40, stagger: 0.12, duration: 0.9,
        ease: "power3.out", delay: 0.1,
      });

      // ── Stats counter ────────────────────────────────
      gsap.from("[data-stat]", {
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
        opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: "power2.out",
      });

      // ── Feature cards ────────────────────────────────
      gsap.from("[data-feat]", {
        scrollTrigger: { trigger: featRef.current, start: "top 75%" },
        opacity: 0, y: 50, stagger: 0.08, duration: 0.7, ease: "power2.out",
      });

      // ── Steps ────────────────────────────────────────
      gsap.from("[data-step]", {
        scrollTrigger: { trigger: stepsRef.current, start: "top 75%" },
        opacity: 0, x: -40, stagger: 0.15, duration: 0.8, ease: "power2.out",
      });

      // ── CTA ──────────────────────────────────────────
      gsap.from("[data-cta]", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
        opacity: 0, scale: 0.96, duration: 0.7, ease: "power2.out",
      });

      // ── Floating phone tilt on scroll ────────────────
      gsap.to("[data-phone]", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
        rotateY: 8, rotateX: -4, y: 30, ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--surface)" }}>

      {/* ── Header ────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 glass border-b border-out_var/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg,#00503a,#006a4e)" }}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-on_surface">
              TARA<span className="text-primary"> DELIVERY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on_sur_var">
            {["#features", "#how-it-works", "#pricing"].map((href, i) => (
              <a key={i} href={href}
                 className="hover:text-primary transition-colors">
                {["Fonctionnalités", "Comment ça marche", "Tarifs"][i]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm">Connexion</Link>
            <Link href="/auth/register" className="btn-cta text-sm px-5 py-2.5">
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-28 pb-20 px-5 overflow-hidden"
               style={{ background: "var(--bg-hero-mesh, radial-gradient(ellipse at 20% 50%,rgba(0,80,58,.05) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(254,183,0,.07) 0%,transparent 50%))" }}>

        {/* Decorative blobs */}
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-[0.04] -z-10"
             style={{ background: "radial-gradient(#00503a, transparent)", filter: "blur(60px)" }} />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full opacity-[0.05] -z-10"
             style={{ background: "radial-gradient(#feb700, transparent)", filter: "blur(50px)" }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="relative z-10">
            <div data-hero className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-7"
                 style={{ background: "rgba(0,80,58,.08)", color: "var(--primary)" }}>
              <Zap className="w-3.5 h-3.5" />
              Livraison express — Yaoundé
            </div>

            <h1 data-hero className="font-display text-5xl lg:text-[3.75rem] font-extrabold leading-[1.1] mb-6"
                style={{ color: "var(--on-surface)" }}>
              Livrez n'importe où<br />
              <span style={{ color: "var(--primary)" }}>à Yaoundé.</span><br />
              <span className="text-4xl lg:text-5xl font-bold" style={{ color: "var(--on-sur-var)" }}>
                En 30 minutes.
              </span>
            </h1>

            <p data-hero className="text-lg leading-relaxed mb-9 max-w-lg"
               style={{ color: "var(--on-sur-var)" }}>
              Commandez en quelques secondes. Suivez en temps réel.
              Payez avec <strong>MTN MoMo</strong> ou <strong>Orange Money</strong>.
            </p>

            <div data-hero className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register" className="btn-primary text-base px-8 py-4">
                Commander une livraison
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register?role=rider" className="btn-ghost text-base px-8 py-4 border"
                    style={{ borderColor: "rgba(0,80,58,.2)" }}>
                Devenir livreur
              </Link>
            </div>

            {/* Social proof */}
            <div data-hero className="flex items-center gap-6 mt-10 pt-8"
                 style={{ borderTop: "1px solid rgba(190,201,194,.3)" }}>
              <div className="flex -space-x-2">
                {["JM", "PK", "SA", "EM"].map((i, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                       style={{ background: ["#00503a","#006a4e","#feb700","#7c5800"][idx] }}>
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-[#feb700]">{"★★★★★"}</div>
                <p className="text-xs mt-0.5" style={{ color: "var(--on-sur-var)" }}>
                  +500 clients satisfaits
                </p>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center lg:justify-end" style={{ perspective: "1200px" }}>
            <div data-phone className="relative">
              {/* Floating chips */}
              <div className="absolute -left-12 top-16 z-20 animate-fade-up" style={{ animationDelay: "0.6s" }}>
                <StatusChip label="Colis collecté" sub="il y a 2 min" color="bg-primary" />
              </div>
              <div className="absolute -right-10 bottom-24 z-20 animate-fade-up" style={{ animationDelay: "0.9s" }}>
                <StatusChip label="En route 🛵" sub="8 min restants" color="bg-secondary-container" />
              </div>

              {/* Phone shell */}
              <div className="w-[260px] h-[520px] rounded-[2.5rem] shadow-modal overflow-hidden"
                   style={{ background: "#0d1110", border: "6px solid #1c2420" }}>
                {/* App content */}
                <div className="h-full flex flex-col">
                  <div className="px-6 pt-10 pb-6 text-white"
                       style={{ background: "linear-gradient(160deg,#00503a,#006a4e)" }}>
                    <p className="text-white/70 text-xs mb-1">Bonjour Jean-Pierre 👋</p>
                    <h3 className="font-display font-bold text-xl mb-1">Que livrons-nous?</h3>
                    <p className="text-white/60 text-[11px]">3 livreurs disponibles près de vous</p>
                  </div>

                  <div className="flex-1 bg-white p-4 space-y-2.5">
                    {[
                      { e:"📦", l:"Colis", c:"#e8f5e9" },
                      { e:"🍔", l:"Nourriture", c:"#fff8e1" },
                      { e:"🛒", l:"Courses", c:"#f3e5f5" },
                    ].map((item) => (
                      <div key={item.l} className="flex items-center gap-3 p-3 rounded-xl"
                           style={{ background: item.c }}>
                        <span className="text-xl">{item.e}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>{item.l}</p>
                          <p className="text-[10px]" style={{ color: "var(--on-sur-var)" }}>Livraison express</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-on_sur_var" />
                      </div>
                    ))}

                    <div className="mt-1 p-3 rounded-xl" style={{ background: "var(--primary-fixed)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "var(--primary)" }} />
                        <span className="text-[10px] font-bold" style={{ color: "var(--primary)" }}>
                          Commande TD240001 • En route
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,80,58,.15)" }}>
                        <div className="h-full rounded-full" style={{ width: "72%", background: "var(--primary)" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--on-sur-var)" }}>Défiler</span>
          <ChevronDown className="w-4 h-4 text-on_sur_var animate-bounce" />
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────── */}
      <section ref={statsRef} className="py-14 px-5" style={{ background: "var(--sur-low)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "500+", l: "Livraisons / mois" },
            { v: "30min", l: "Délai moyen" },
            { v: "4.9 ★", l: "Note client" },
            { v: "24/7", l: "Disponibilité" },
          ].map((s) => (
            <div key={s.l} data-stat>
              <div className="font-display text-3xl font-extrabold mb-1" style={{ color: "var(--primary)" }}>
                {s.v}
              </div>
              <div className="text-sm" style={{ color: "var(--on-sur-var)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold mb-4" style={{ color: "var(--on-surface)" }}>
              Tout pour votre livraison
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--on-sur-var)" }}>
              Une plateforme complète, conçue pour les réalités de Yaoundé.
            </p>
          </div>
          <div ref={featRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: MapPin,    title: "Suivi temps réel",    desc: "Voyez votre livreur se déplacer en direct sur la carte, mètre par mètre.", color: "rgba(0,80,58,.1)",  ic: "var(--primary)" },
              { icon: CreditCard,title: "Mobile money",        desc: "MTN MoMo, Orange Money ou cash. Aucune carte bancaire requise.", color: "rgba(254,183,0,.12)", ic: "#7c5800" },
              { icon: Zap,       title: "En 30 minutes",       desc: "Des livreurs vérifiés disponibles dans tous les quartiers de Yaoundé.", color: "rgba(0,80,58,.08)",  ic: "var(--primary-container)" },
              { icon: Shield,    title: "Livreurs vérifiés",   desc: "Chaque livreur est contrôlé, formé et évalué après chaque livraison.", color: "rgba(254,183,0,.1)",  ic: "#a37400" },
              { icon: Clock,     title: "Disponible 24h/24",   desc: "Week-ends, jours fériés, nuits — nous livrons quand vous en avez besoin.", color: "rgba(0,80,58,.07)",  ic: "var(--primary)" },
              { icon: Star,      title: "Qualité garantie",    desc: "Notez vos livraisons et aidez-nous à maintenir l'excellence du service.", color: "rgba(254,183,0,.1)",  ic: "#7c5800" },
            ].map((feat) => (
              <div key={feat.title} data-feat className="card p-6 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: feat.color }}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.ic }} />
                </div>
                <h3 className="font-display text-base font-bold mb-2" style={{ color: "var(--on-surface)" }}>
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--on-sur-var)" }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5" style={{ background: "var(--sur-low)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold" style={{ color: "var(--on-surface)" }}>
              Comment ça marche?
            </h2>
          </div>
          <div ref={stepsRef} className="grid md:grid-cols-3 gap-8">
            {[
              { n:"01", e:"📝", t:"Créez votre commande",  d:"Indiquez adresse de collecte, de livraison et décrivez votre colis en 30 secondes." },
              { n:"02", e:"🛵", t:"Un livreur accepte",    d:"Un livreur disponible dans votre zone accepte et se met en route vers vous." },
              { n:"03", e:"✅", t:"Livré & payé",          d:"Suivez la livraison. Payez via MoMo, Orange Money ou en espèces à la réception." },
            ].map((step) => (
              <div key={step.n} data-step className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                       style={{ background: "linear-gradient(135deg,#00503a,#006a4e)" }}>
                    {step.e}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-widest uppercase"
                          style={{ color: "rgba(0,80,58,.4)" }}>Étape {step.n}</span>
                    <h3 className="font-display text-lg font-bold mt-0.5" style={{ color: "var(--on-surface)" }}>
                      {step.t}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed ml-[4.5rem]" style={{ color: "var(--on-sur-var)" }}>
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section ref={ctaRef} className="py-24 px-5">
        <div data-cta className="max-w-2xl mx-auto text-center rounded-3xl p-12"
             style={{ background: "linear-gradient(135deg,#00503a,#006a4e)" }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
               style={{ background: "rgba(255,255,255,.15)" }}>
            <Bike className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">
            Prêt à livrer?
          </h2>
          <p className="text-white/75 mb-8 text-base leading-relaxed">
            Rejoignez des centaines de Yaoundéens qui font confiance à TARA DELIVERY.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-bold text-sm uppercase tracking-wide text-primary bg-white hover:bg-sur_low transition-all">
              Créer un compte
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/register?role=rider"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-bold text-sm uppercase tracking-wide text-white transition-all"
                  style={{ background: "rgba(255,255,255,.12)", outline: "1px solid rgba(255,255,255,.25)" }}>
              Devenir livreur
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer style={{ background: "#0d1b16", color: "rgba(248,250,247,.6)" }} className="py-14 px-5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 pb-10"
             style={{ borderBottom: "1px solid rgba(190,201,194,.1)" }}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: "rgba(158,244,208,.15)" }}>
                <Package className="w-4 h-4" style={{ color: "var(--primary-fixed)" }} />
              </div>
              <span className="font-display font-bold text-white/90">TARA DELIVERY</span>
            </div>
            <p className="text-sm leading-relaxed">
              Livraison rapide et fiable à Yaoundé, Cameroun.
            </p>
          </div>
          {[
            { t: "Navigation", l: [["Accueil","/"], ["Commander","/auth/register"], ["Devenir livreur","/auth/register?role=rider"]] },
            { t: "Support",    l: [["FAQ","/faq"], ["Contact","/contact"], ["Conditions","/terms"]] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="text-white/80 font-semibold text-sm mb-4">{col.t}</h4>
              <ul className="space-y-2">
                {col.l.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-60" /><span>+237 6XX XXX XXX</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-60" /><span>support@tara-delivery.cm</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-60" /><span>Yaoundé, Cameroun</span></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 text-center text-xs">
          © {new Date().getFullYear()} TARA DELIVERY. Fait avec ❤️ au Cameroun 🇨🇲
        </div>
      </footer>
    </main>
  );
}
