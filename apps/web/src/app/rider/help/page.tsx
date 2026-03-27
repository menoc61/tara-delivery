"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const faqs = [
  {
    q: "Comment accepter une course?",
    a: "Ouvrez l'application, acceptez les demandes depuis votre tableau de bord.",
  },
  {
    q: "Comment mettre à jour ma disponibilité?",
    a: "Allez dans Paramètres > Disponibilité pour activer ou désactiver vos disponibilités.",
  },
  {
    q: "Quand reçois-je mes gains?",
    a: "Les paiements sont effectués chaque semaine le vendredi.",
  },
  {
    q: "Comment contacter le support?",
    a: "Appelez au +237 6XX XXX XXX ou utilisez le chat.",
  },
];

export default function RiderHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/rider/settings"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Aide & Support
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <a
            href="tel:+2376XXXXXXX"
            className="card p-4 flex flex-col items-center gap-2"
          >
            <Phone className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Appeler</span>
          </a>
          <a
            href="mailto:support@tara-delivery.cm"
            className="card p-4 flex flex-col items-center gap-2"
          >
            <Mail className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Email</span>
          </a>
        </div>

        <div className="card p-4">
          <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> FAQ
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-outline-var/15 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 flex justify-between text-left"
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
      </div>
    </div>
  );
}
