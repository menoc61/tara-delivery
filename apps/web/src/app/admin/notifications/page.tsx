"use client";

import { useState } from "react";
import { Search, Bell, Send, Users, Truck, AlertCircle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "system" | "promo" | "order" | "alert";
  target: "all" | "customers" | "riders";
  sentAt: string;
  recipients: number;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Promotion Ramadan",
    message: "-20% sur toutes les livraisons!",
    type: "promo",
    target: "all",
    sentAt: "2026-03-26 10:00",
    recipients: 856,
  },
  {
    id: "2",
    title: "Nouveau livreur",
    message: "Bienvenue à notre nouvelle équipe",
    type: "system",
    target: "riders",
    sentAt: "2026-03-25 14:30",
    recipients: 45,
  },
  {
    id: "3",
    title: "Alerte météo",
    message: " fortes pluie prévues à Yaoundé",
    type: "alert",
    target: "all",
    sentAt: "2026-03-24 08:00",
    recipients: 901,
  },
  {
    id: "4",
    title: "Mise à jour",
    message: "Nouvelle version disponible",
    type: "system",
    target: "customers",
    sentAt: "2026-03-23 16:00",
    recipients: 856,
  },
];

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockNotifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-primary" />
            <span className="text-on-surface-variant text-sm">Envoyées</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">156</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-on-surface-variant text-sm">
              Utilisateurs ciblés
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">12,450</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-tertiary" />
            <span className="text-on-surface-variant text-sm">Alertes</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">8</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-green-600" />
            <span className="text-on-surface-variant text-sm">
              Taux d'ouverture
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">72%</p>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" /> Nouvelle notification
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Rechercher une notification..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className="bg-surface-container-lowest p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    notif.type === "promo"
                      ? "bg-secondary-container/20"
                      : notif.type === "alert"
                        ? "bg-error/10"
                        : "bg-primary/10"
                  }`}
                >
                  <Bell
                    className={`w-5 h-5 ${
                      notif.type === "promo"
                        ? "text-secondary"
                        : notif.type === "alert"
                          ? "text-error"
                          : "text-primary"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{notif.title}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {notif.message}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">
                  {notif.sentAt}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {notif.recipients} destinataires
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
