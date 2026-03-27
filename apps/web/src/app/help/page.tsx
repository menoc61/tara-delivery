"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  Search,
  Truck,
  Wallet,
  Shield,
  Store,
  User,
  ChevronDown,
  Phone,
  Mail,
  Send,
  ArrowRight,
  X,
  Package2,
  MessageCircle,
  Home,
  LucideIcon,
} from "lucide-react";

interface Category {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  count: string;
}

const categories: Category[] = [
  {
    icon: Truck,
    title: "Suivi & Livraison",
    description:
      "Suivez votre colis en temps réel, modifiez une adresse ou contactez votre livreur.",
    color: "bg-primary/10",
    count: "12 articles",
  },
  {
    icon: Wallet,
    title: "Paiements",
    description: "Gérer MoMo, Orange Money et factures.",
    color: "bg-secondary-container/20",
    count: "",
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Confidentialité et protection de vos colis.",
    color: "bg-primary/5",
    count: "",
  },
  {
    icon: Store,
    title: "Tara Pro",
    description: "Offres pour entreprises et e-commerce.",
    color: "bg-primary/5",
    count: "",
  },
  {
    icon: User,
    title: "Compte",
    description: "Paramètres, mot de passe et profil.",
    color: "bg-primary/5",
    count: "",
  },
];

const faqs = [
  {
    question: "Comment estimer le prix de ma livraison ?",
    answer:
      "Utilisez notre calculateur de tarifs sur la page d'accueil. Saisissez le point de départ et de destination dans Yaoundé, et choisir le type de colis. Le prix est calculé instantanément en XAF.",
  },
  {
    question: "Quels sont les délais de livraison standard ?",
    answer:
      "Pour une livraison urbaine classique, le délai moyen est de 45 à 90 minutes. Les options Express garantissent une livraison en moins de 40 minutes selon le trafic.",
  },
  {
    question: "Puis-je payer en espèces à la livraison ?",
    answer:
      "Oui, Tara Delivery accepte les paiements en espèces (Cash on Delivery) ainsi que les solutions mobiles comme MTN Mobile Money et Orange Money.",
  },
  {
    question: "Comment suivre ma commande en temps réel ?",
    answer:
      "Depuis l'application, cliquez sur votre commande en cours pour voir la position du livreur sur la carte. Vous pouvez également recevoir des notifications à chaque étape.",
  },
  {
    question: "Que faire si mon colis n'est pas livré ?",
    answer:
      "Contactez notre support immédiatement via l'app ou appelez le +237 6XX XXX XXX. Nous thérapeutrerons le problème et vous tiendrons informé.",
  },
  {
    question: "Puis-je modifier l'adresse de livraison après commande ?",
    answer:
      "Oui, tant que le livreur n'a pas encore collectées le colis. Allez dans les détails de votre commande et modifiez l'adresse avant le statut 'Collecté'.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-animate]", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      alert("Message envoyé! Nous vous répondrons sous 24h.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-background">
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
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/#services"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </Link>
            <span className="text-sm font-bold text-primary border-b-2 border-primary">
              Aide
            </span>
          </nav>

          <Link href="/auth/login" className="btn-primary text-sm">
            Connexion
          </Link>
        </div>
      </header>

      {/* Hero Search */}
      <section className="bg-gradient-to-br from-primary to-primary-container py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1
            data-animate
            className="text-4xl md:text-6xl font-display font-extrabold text-white"
          >
            Comment pouvons-nous vous aider ?
          </h1>
          <p
            data-animate
            className="text-primary-fixed text-lg md:text-xl max-w-2xl mx-auto"
          >
            Recherchez des articles, des guides et des solutions pour vos
            livraisons à Yaoundé.
          </p>
          <div data-animate className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Décrivez votre problème ou posez une question..."
              className="w-full pl-12 pr-6 py-5 rounded-xl bg-white text-on-background border-none shadow-xl focus:ring-4 focus:ring-secondary-container/30 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-screen-xl mx-auto px-4 py-20">
        <div data-animate className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card */}
          <div className="md:col-span-2 bg-muted/50 rounded-xl p-8 flex flex-col justify-between group cursor-pointer hover:bg-muted transition-colors">
            <div>
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Suivi & Livraison</h2>
              <p className="text-muted-foreground text-lg">
                Apprenez à suivre votre colis en temps réel, modifier une
                adresse ou contacter votre livreur directement.
              </p>
            </div>
            <div className="mt-8 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
              Voir les 12 articles <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </div>

          {/* Small Cards */}
          {categories.slice(1).map((cat, i) => (
            <div
              key={i}
              className={`${i === 0 ? "bg-secondary-container" : "bg-muted/50"} rounded-xl p-8 flex flex-col justify-between group cursor-pointer hover:bg-muted transition-colors`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${i === 0 ? "bg-white/20" : "bg-primary/5"}`}
                >
                  <cat.icon
                    className={`w-6 h-6 ${i === 0 ? "text-on-secondary-container" : "text-primary"}`}
                  />
                </div>
                <h2 className="text-xl font-bold mb-2">{cat.title}</h2>
                <p
                  className={
                    i === 0
                      ? "text-on-secondary-container/80"
                      : "text-muted-foreground"
                  }
                >
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div data-animate className="text-center mb-12">
            <h2 className="text-3xl font-display font-extrabold mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-muted-foreground">
              Tout ce que vous devez savoir pour une expérience fluide.
            </p>
          </div>

          <div data-animate className="space-y-4">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-lg font-bold">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform group-open:rotate-180 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </summary>
                  <div className="mt-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Form */}
      <section className="py-20 px-4 max-w-screen-xl mx-auto">
        <div
          data-animate
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
        >
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-extrabold">
              Vous n'avez pas trouvé votre réponse ?
            </h2>
            <p className="text-muted-foreground text-lg">
              Notre équipe de support client à Yaoundé est disponible 7j/7 pour
              vous assister.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Appelez-nous</h4>
                  <p className="text-muted-foreground">+237 6XX XXX XXX</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-secondary-container/20 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold">Email direct</h4>
                  <p className="text-muted-foreground">
                    support@taradelivery.cm
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 rounded-bl-full" />
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <h3 className="text-2xl font-bold mb-8">
                Ouvrir un ticket de support
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-muted border-none rounded-lg p-4 focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-muted border-none rounded-lg p-4 focus:ring-2 focus:ring-primary"
                    placeholder="jean@email.cm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Sujet
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full bg-muted border-none rounded-lg p-4 focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Sélectionner un sujet</option>
                  <option>Problème de paiement</option>
                  <option>Colis non reçu</option>
                  <option>Devenir partenaire</option>
                  <option>Autre question</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Votre message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-muted border-none rounded-lg p-4 focus:ring-2 focus:ring-primary"
                  placeholder="Détaillez votre demande ici..."
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {sending ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    Envoyer le message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 mt-20">
        <div className="h-px bg-primary/5" />
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TARA DELIVERY. Logistique de précision
            au cœur de Yaoundé.
          </p>
          <div className="flex gap-8">
            <a
              className="text-sm text-muted-foreground hover:text-primary"
              href="#"
            >
              Conditions
            </a>
            <a
              className="text-sm text-muted-foreground hover:text-primary"
              href="#"
            >
              Confidentialité
            </a>
            <a
              className="text-sm text-muted-foreground hover:text-primary"
              href="#"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
