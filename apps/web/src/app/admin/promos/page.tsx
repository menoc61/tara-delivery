"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Tag,
  Percent,
  Calendar,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";

type Promo = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  used: number;
  validUntil: string;
  status: "active" | "expired";
};

const mockPromos: Promo[] = [
  {
    id: "1",
    code: "BIENVENUE20",
    type: "percent",
    value: 20,
    minOrder: 2000,
    maxUses: 500,
    used: 234,
    validUntil: "2026-04-30",
    status: "active",
  },
  {
    id: "2",
    code: "REDUCTION500",
    type: "fixed",
    value: 500,
    minOrder: 3000,
    maxUses: 1000,
    used: 456,
    validUntil: "2026-03-31",
    status: "active",
  },
  {
    id: "3",
    code: "FREEDELIV",
    type: "percent",
    value: 100,
    minOrder: 5000,
    maxUses: 200,
    used: 200,
    validUntil: "2026-02-28",
    status: "expired",
  },
  {
    id: "4",
    code: "PREMIER10",
    type: "percent",
    value: 10,
    minOrder: 0,
    maxUses: 1000,
    used: 89,
    validUntil: "2026-05-15",
    status: "active",
  },
];

export default function AdminPromosPage() {
  const [search, setSearch] = useState("");

  const filteredPromos = mockPromos.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Créer un code promo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-on-surface-variant text-sm">
              Codes actifs
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mockPromos.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-secondary" />
            <span className="text-on-surface-variant text-sm">
              Utilisations
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mockPromos.reduce((sum, p) => sum + p.used, 0)}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-tertiary" />
            <span className="text-on-surface-variant text-sm">
              Expirent ce mois
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">1</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-on-surface-variant text-sm">
              Codes expirés
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mockPromos.filter((p) => p.status === "expired").length}
          </p>
        </div>
      </div>

      {/* Promos List */}
      <div className="space-y-4">
        {filteredPromos.map((promo) => (
          <div
            key={promo.id}
            className="bg-surface-container-lowest p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-on-surface">{promo.code}</h3>
                    <button className="p-1 rounded hover:bg-surface-container">
                      <Copy className="w-3 h-3 text-on-surface-variant" />
                    </button>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {promo.type === "percent"
                      ? `${promo.value}% de réduction`
                      : `${promo.value} XAF de réduction"}`}
                    {promo.minOrder > 0 &&
                      ` • Commande min: ${promo.minOrder} XAF`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-on-surface-variant">Utilisé</p>
                  <p className="font-bold text-on-surface">
                    {promo.used}/{promo.maxUses}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-surface-variant">Expire</p>
                  <p className="font-bold text-on-surface">
                    {promo.validUntil}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    promo.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {promo.status === "active" ? "Actif" : "Expiré"}
                </span>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-surface-container">
                    <Edit className="w-4 h-4 text-on-surface-variant" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-surface-container">
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
