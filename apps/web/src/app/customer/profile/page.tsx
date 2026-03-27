"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  Home,
  Briefcase,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usersApi } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function CustomerProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getAddresses()
      .then((r) => setAddresses(r.data.data || []))
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
            Mon profil
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-on-surface">
                {user?.name}
              </h2>
              <p className="text-sm text-on-sur-var">{user?.email}</p>
              <p className="text-sm text-on-sur-var">
                {user?.phone || "Aucun téléphone"}
              </p>
            </div>
          </div>
          <button className="btn-secondary w-full mt-4">
            <Edit2 className="w-4 h-4" /> Modifier le profil
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-on-surface">
              Adresses enregistrées
            </h3>
            <button className="text-sm font-medium text-primary flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="card p-8 text-center">
              <MapPin className="w-10 h-10 text-outline-var mx-auto mb-3" />
              <p className="text-sm text-on-sur-var mb-4">
                Aucune adresse enregistrée
              </p>
              <button className="btn-primary text-sm py-2 px-4">
                <Plus className="w-4 h-4" /> Ajouter une adresse
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={String(addr.id)}
                  className="card p-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {addr.type === "HOME" ? (
                      <Home className="w-5 h-5 text-primary" />
                    ) : addr.type === "WORK" ? (
                      <Briefcase className="w-5 h-5 text-primary" />
                    ) : (
                      <Star className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">
                      {addr.label as string}
                    </p>
                    <p className="text-sm text-on-sur-var">
                      {addr.neighborhood as string}
                    </p>
                    <p className="text-xs text-on-sur-var">
                      {addr.street as string}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-sur-low rounded-lg">
                      <Edit2 className="w-4 h-4 text-on-sur-var" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4 space-y-3">
          <Link
            href="/customer/notifications"
            className="flex items-center justify-between p-2 hover:bg-sur-low rounded-lg"
          >
            <span className="text-on-surface">Notifications</span>
            <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
          </Link>
          <Link
            href="/customer/messages"
            className="flex items-center justify-between p-2 hover:bg-sur-low rounded-lg"
          >
            <span className="text-on-surface">Messages</span>
            <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
          </Link>
          <Link
            href="/customer/help"
            className="flex items-center justify-between p-2 hover:bg-sur-low rounded-lg"
          >
            <span className="text-on-surface">Aide & FAQ</span>
            <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
