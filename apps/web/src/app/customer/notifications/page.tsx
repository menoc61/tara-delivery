"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bell,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { usersApi, notificationsApi } from "@/lib/api-client";

const iconMap: Record<string, React.ElementType> = {
  ORDER_CREATED: Package,
  ORDER_DELIVERED: CheckCircle,
  ORDER_CANCELLED: AlertCircle,
  PAYMENT: Info,
};

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getAll()
      .then((r) => setNotifications(r.data.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            Notifications
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-10 text-center">
            <Bell className="w-12 h-12 text-outline-var mx-auto mb-3" />
            <h3 className="text-base font-bold text-on-surface mb-1">
              Aucune notification
            </h3>
            <p className="text-sm text-on-sur-var">Vous êtes à jour!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = iconMap[n.type as string] || Bell;
              return (
                <div
                  key={n.id as string}
                  className="card p-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">
                      {n.title as string}
                    </p>
                    <p className="text-xs text-on-sur-var mt-1">
                      {n.message as string}
                    </p>
                    <p className="text-xs text-outline-var mt-2">
                      {new Date(n.createdAt as string).toLocaleString("fr-CM")}
                    </p>
                  </div>
                  {!n.readAt && (
                    <div className="w-2 h-2 rounded-full bg-secondary-container flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
