"use client";

import { useState } from "react";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved";
  channel: "chat" | "phone" | "email";
  createdAt: string;
};

const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Problème de paiement",
    user: "customer5@test.cm",
    priority: "high",
    status: "open",
    channel: "chat",
    createdAt: "2026-03-27 10:30",
  },
  {
    id: "2",
    subject: "Commande non livrée",
    user: "customer12@test.cm",
    priority: "medium",
    status: "pending",
    channel: "phone",
    createdAt: "2026-03-27 09:15",
  },
  {
    id: "3",
    subject: "Demande de remboursement",
    user: "customer8@test.cm",
    priority: "high",
    status: "open",
    channel: "email",
    createdAt: "2026-03-26 16:45",
  },
  {
    id: "4",
    subject: "Comment utiliser l'app",
    user: "customer20@test.cm",
    priority: "low",
    status: "resolved",
    channel: "chat",
    createdAt: "2026-03-26 14:20",
  },
  {
    id: "5",
    subject: "Rider trop lent",
    user: "customer3@test.cm",
    priority: "medium",
    status: "resolved",
    channel: "phone",
    createdAt: "2026-03-25 11:00",
  },
];

export default function AdminSupportPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "resolved">(
    "all",
  );

  const filteredTickets = mockTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.includes(search);
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "chat":
        return MessageCircle;
      case "phone":
        return Phone;
      case "email":
        return Mail;
      default:
        return MessageCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-error" />
            <span className="text-on-surface-variant text-sm">Ouverts</span>
          </div>
          <p className="text-2xl font-bold text-error">
            {mockTickets.filter((t) => t.status === "open").length}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-on-surface-variant text-sm">En attente</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mockTickets.filter((t) => t.status === "pending").length}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-on-surface-variant text-sm">Résolus</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {mockTickets.filter((t) => t.status === "resolved").length}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-on-surface-variant text-sm">Temps moyen</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">2.5h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "open", "pending", "resolved"] as const).map((f) => (
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
                : f === "open"
                  ? "Ouverts"
                  : f === "pending"
                    ? "En attente"
                    : "Résolus"}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const ChannelIcon = getChannelIcon(ticket.channel);
          return (
            <div
              key={ticket.id}
              className="bg-surface-container-lowest p-5 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ChannelIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ticket.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : ticket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ticket.priority === "high"
                          ? "Haute"
                          : ticket.priority === "medium"
                            ? "Moyenne"
                            : "Basse"}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {ticket.user}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === "open"
                        ? "bg-error/10 text-error"
                        : ticket.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ticket.status === "open"
                      ? "Ouvert"
                      : ticket.status === "pending"
                        ? "En attente"
                        : "Résolu"}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {ticket.createdAt}
                  </span>
                  <button className="btn-primary text-sm py-2">Répondre</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
