"use client";

import { useState } from "react";
import { Search, Check, X, Eye, Shield, FileText } from "lucide-react";

type RiderDocument = {
  id: string;
  riderName: string;
  email: string;
  license: string;
  insurance: string;
  idCard: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
};

const mockDocuments: RiderDocument[] = [
  {
    id: "1",
    riderName: "Moussa Diallo",
    email: "rider1@test.cm",
    license: "CMR20260001",
    insurance: "ASSU-2026-001",
    idCard: "ID-2378901",
    status: "verified",
    submittedAt: "2026-03-15",
  },
  {
    id: "2",
    riderName: "Alain Nguimbi",
    email: "rider2@test.cm",
    license: "CMR20260002",
    insurance: "ASSU-2026-002",
    idCard: "ID-2378902",
    status: "pending",
    submittedAt: "2026-03-20",
  },
  {
    id: "3",
    riderName: "Bruno Mfoulou",
    email: "rider3@test.cm",
    license: "CMR20260003",
    insurance: "ASSU-2026-003",
    idCard: "ID-2378903",
    status: "pending",
    submittedAt: "2026-03-21",
  },
  {
    id: "4",
    riderName: "Cyril Nguetchouang",
    email: "rider4@test.cm",
    license: "CMR20260004",
    insurance: "ASSU-2026-004",
    idCard: "ID-2378904",
    status: "rejected",
    submittedAt: "2026-03-18",
  },
];

export default function AdminKYCPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");

  const filteredDocs = mockDocuments.filter((d) => {
    const matchesSearch =
      d.riderName.toLowerCase().includes(search.toLowerCase()) ||
      d.email.includes(search);
    const matchesFilter = filter === "all" || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">En attente</p>
          <p className="text-2xl font-bold text-on-surface">12</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Vérifiés</p>
          <p className="text-2xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Rejetés</p>
          <p className="text-2xl font-bold text-error">3</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un rider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f === "all"
                ? "Tous"
                : f === "pending"
                  ? "En attente"
                  : f === "verified"
                    ? "Vérifiés"
                    : "Rejetés"}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-surface-container-lowest p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{doc.riderName}</h3>
                  <p className="text-sm text-on-surface-variant">{doc.email}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.status === "verified"
                    ? "bg-green-100 text-green-800"
                    : doc.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {doc.status === "verified"
                  ? "Vérifié"
                  : doc.status === "pending"
                    ? "En attente"
                    : "Rejeté"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-surface-container p-3 rounded-xl">
                <FileText className="w-4 h-4 text-on-surface-variant mb-1" />
                <p className="text-xs text-on-surface-variant">Permis</p>
                <p className="text-sm font-medium text-on-surface">
                  {doc.license}
                </p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <FileText className="w-4 h-4 text-on-surface-variant mb-1" />
                <p className="text-xs text-on-surface-variant">Assurance</p>
                <p className="text-sm font-medium text-on-surface">
                  {doc.insurance}
                </p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <FileText className="w-4 h-4 text-on-surface-variant mb-1" />
                <p className="text-xs text-on-surface-variant">CNIB</p>
                <p className="text-sm font-medium text-on-surface">
                  {doc.idCard}
                </p>
              </div>
            </div>

            {doc.status === "pending" && (
              <div className="flex gap-2">
                <button className="btn-primary flex items-center gap-2">
                  <Check className="w-4 h-4" /> Vérifier
                </button>
                <button className="btn-secondary flex items-center gap-2 text-error">
                  <X className="w-4 h-4" /> Rejeter
                </button>
                <button className="btn-ghost flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Voir documents
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
