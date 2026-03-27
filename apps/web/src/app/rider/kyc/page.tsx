"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  CheckCircle,
  Clock,
  Shield,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const docs = [
  { name: "Permis de conduire", status: "verified" },
  { name: "Carte d'identité nationale", status: "verified" },
  { name: "Assurance véhicule", status: "pending" },
  { name: "Certificat de visite technique", status: "pending" },
];

export default function RiderKycPage() {
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
            Vérification KYC
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Statut de vérification
            </h2>
            <p className="text-sm text-on-sur-var">En attente de validation</p>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-on-surface mb-4">Documents</h3>
          <div className="space-y-3">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-sur-low rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-on-sur-var" />
                  <span className="text-sm font-medium text-on-surface">
                    {doc.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "verified" ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-4 h-4" /> Vérifié
                    </span>
                  ) : (
                    <button
                      onClick={() => toast.success("Upload")}
                      className="p-2 bg-primary/10 rounded-lg"
                    >
                      <Upload className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
