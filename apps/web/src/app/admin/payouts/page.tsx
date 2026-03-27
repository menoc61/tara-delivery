"use client";

import { useState } from "react";
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

type Payout = {
  id: string;
  riderName: string;
  amount: number;
  method: "mtn" | "orange";
  status: "pending" | "completed" | "failed";
  requestedAt: string;
  processedAt?: string;
};

const mockPayouts: Payout[] = [
  {
    id: "1",
    riderName: "Moussa Diallo",
    amount: 45000,
    method: "mtn",
    status: "completed",
    requestedAt: "2026-03-25 10:30",
    processedAt: "2026-03-25 11:15",
  },
  {
    id: "2",
    riderName: "Alain Nguimbi",
    amount: 32000,
    method: "orange",
    status: "pending",
    requestedAt: "2026-03-26 08:45",
  },
  {
    id: "3",
    riderName: "Bruno Mfoulou",
    amount: 28000,
    method: "mtn",
    status: "completed",
    requestedAt: "2026-03-24 14:20",
    processedAt: "2026-03-24 15:00",
  },
  {
    id: "4",
    riderName: "Cyril Nguetchouang",
    amount: 15000,
    method: "orange",
    status: "failed",
    requestedAt: "2026-03-23 09:00",
  },
  {
    id: "5",
    riderName: "Didier Belinga",
    amount: 55000,
    method: "mtn",
    status: "pending",
    requestedAt: "2026-03-26 16:00",
  },
];

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

export default function AdminPayoutsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");

  const filteredPayouts = mockPayouts.filter((p) => {
    const matchesSearch = p.riderName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPending = mockPayouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalProcessed = mockPayouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-on-surface-variant text-sm">En attente</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {formatCFA(totalPending)}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-on-surface-variant text-sm">
              Traitées ce mois
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCFA(totalProcessed)}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-on-surface-variant text-sm">MTN MoMo</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">127,000 XAF</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-secondary" />
            <span className="text-on-surface-variant text-sm">
              Orange Money
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">47,000 XAF</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
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
          {(["all", "pending", "completed", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {f === "all"
                ? "Tous"
                : f === "pending"
                  ? "En attente"
                  : f === "completed"
                    ? "Traitées"
                    : "Échouées"}
            </button>
          ))}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Rider
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Montant
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Méthode
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Statut
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Date demande
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.map((payout) => (
              <tr
                key={payout.id}
                className="border-t border-outline-variant/50"
              >
                <td className="py-3 px-4 text-sm font-medium text-on-surface">
                  {payout.riderName}
                </td>
                <td className="py-3 px-4 text-sm font-bold text-primary">
                  {formatCFA(payout.amount)}
                </td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">
                  <span
                    className={`px-2 py-1 rounded ${payout.method === "mtn" ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"}`}
                  >
                    {payout.method === "mtn" ? "MTN" : "Orange"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      payout.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payout.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payout.status === "completed"
                      ? "Traitée"
                      : payout.status === "pending"
                        ? "En attente"
                        : "Échouée"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">
                  {payout.requestedAt}
                </td>
                <td className="py-3 px-4">
                  <button className="p-2 rounded hover:bg-surface-container">
                    <ArrowUpRight className="w-4 h-4 text-on-surface-variant" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
