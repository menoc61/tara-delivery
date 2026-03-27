"use client";

import { useState } from "react";
import {
  Search,
  FileText,
  User,
  Shield,
  LogIn,
  Package,
  AlertTriangle,
} from "lucide-react";

type Log = {
  id: string;
  action: string;
  user: string;
  role: "admin" | "customer" | "rider";
  details: string;
  ip: string;
  timestamp: string;
};

const mockLogs: Log[] = [
  {
    id: "1",
    action: "Connexion admin",
    user: "admin@tara-delivery.cm",
    role: "admin",
    details: "Connexion réussie",
    ip: "192.168.1.45",
    timestamp: "2026-03-27 09:15:22",
  },
  {
    id: "2",
    action: "Modification commande",
    user: "admin@tara-delivery.cm",
    role: "admin",
    details: "Commande #TD2506153847 annulée",
    ip: "192.168.1.45",
    timestamp: "2026-03-27 08:45:11",
  },
  {
    id: "3",
    action: "Création client",
    user: "system",
    role: "admin",
    details: "Nouveau client créé: customer16@test.cm",
    ip: "system",
    timestamp: "2026-03-27 08:30:05",
  },
  {
    id: "4",
    action: "Paiement reçu",
    user: "customer1@test.cm",
    role: "customer",
    details: "Paiement de 2500 XAF pour commande #TD2506153849",
    ip: "10.0.0.23",
    timestamp: "2026-03-27 07:22:33",
  },
  {
    id: "5",
    action: "Verification rider",
    user: "admin@tara-delivery.cm",
    role: "admin",
    details: "Rider rider5@test.cm vérifié",
    ip: "192.168.1.45",
    timestamp: "2026-03-26 16:10:00",
  },
  {
    id: "6",
    action: "Tentative connexion",
    user: "hacker@test.cm",
    role: "customer",
    details: "Mot de passe incorrect",
    ip: "203.45.67.89",
    timestamp: "2026-03-26 14:55:22",
  },
];

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "customer" | "rider">(
    "all",
  );

  const filteredLogs = mockLogs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || l.role === filter;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    if (action.includes("Connexion")) return LogIn;
    if (action.includes("Paiement")) return Package;
    if (action.includes("Vérification")) return Shield;
    return FileText;
  };

  const getActionColor = (action: string) => {
    if (action.includes("Tentative")) return "text-error";
    if (action.includes("Connexion")) return "text-green-600";
    return "text-primary";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Total logs (30j)</p>
          <p className="text-2xl font-bold text-on-surface">2,456</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Connexions</p>
          <p className="text-2xl font-bold text-on-surface">856</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Actions admin</p>
          <p className="text-2xl font-bold text-on-surface">234</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <p className="text-on-surface-variant text-sm">Alertes sécurité</p>
          <p className="text-2xl font-bold text-error">3</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "admin", "customer", "rider"] as const).map((f) => (
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
                : f === "admin"
                  ? "Admin"
                  : f === "customer"
                    ? "Clients"
                    : "Livreurs"}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Action
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Utilisateur
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Détails
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                IP
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <tr key={log.id} className="border-t border-outline-variant/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${getActionColor(log.action)}`}
                      />
                      <span className="text-sm font-medium text-on-surface">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-sm text-on-surface">
                        {log.user}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          log.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : log.role === "rider"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">
                    {log.ip}
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {log.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
