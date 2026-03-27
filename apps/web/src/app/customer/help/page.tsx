"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const faqs = [
  {
    q: "Comment créer une commande?",
    a: "Cliquez sur 'Nouvelle livraison' depuis votre tableau de bord, sélectionnez le type de colis, entrez les addresses et validez.",
  },
  {
    q: "Quels sont les délais de livraison?",
    a: "Les délais varient selon la distance. En général, comptez 30-60 minutes pour une livraison standard à Yaoundé.",
  },
  {
    q: "Comment payer ma livraison?",
    a: "Vous pouvez payer via MTN MoMo, Orange Money ou en espèces à la livraison.",
  },
  {
    q: "Puis-je suivre ma commande en temps réel?",
    a: "Oui, depuis la page de détail de votre commande, vous pouvez suivre le livreur sur la carte.",
  },
  {
    q: "Comment contacter le support?",
    a: "Vous pouvez nous appeler au +237 6XX XXX XXX, nous écrire à support@tara-delivery.cm ou utiliser le chat en direct.",
  },
];

export default function CustomerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/customer"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Aide & FAQ
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <a
            href="tel:+2376XXXXXXX"
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">Appeler</span>
          </a>
          <a
            href="mailto:support@tara-delivery.cm"
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">Email</span>
          </a>
          <Link
            href="/customer/messages"
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">Chat</span>
          </Link>
          <button
            onClick={() => toast.success("Centre d'aide en construction")}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-on-surface">Guide</span>
          </button>
        </div>

        <div className="card p-4">
          <h2 className="font-display font-bold text-on-surface mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Questions fréquentes
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-outline-var/15 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-sur-low transition-colors"
                >
                  <span className="text-sm font-medium text-on-surface">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-on-sur-var transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-on-sur-var">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-display font-bold text-on-surface mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Ressources
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => toast.success("CGV en construction")}
              className="w-full text-left p-3 rounded-lg hover:bg-sur-low flex items-center justify-between"
            >
              <span className="text-sm text-on-surface">
                Conditions générales
              </span>
              <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
            </button>
            <button
              onClick={() =>
                toast.success("Politique de confidentialité en construction")
              }
              className="w-full text-left p-3 rounded-lg hover:bg-sur-low flex items-center justify-between"
            >
              <span className="text-sm text-on-surface">
                Politique de confidentialité
              </span>
              <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
