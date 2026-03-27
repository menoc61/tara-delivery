"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  User,
  Bike,
  Bell,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  LogOut,
  Shield,
  Edit2,
} from "lucide-react";

export default function RiderSettingsPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const settingsItems = [
    { icon: User, label: "Informations personnelles", href: "/rider/profile" },
    { icon: Bike, label: "Véhicule", href: "/rider/vehicle" },
    { icon: Bell, label: "Notifications", href: "/rider/notifications" },
    { icon: Shield, label: "Vérification KYC", href: "/rider/kyc" },
    { icon: HelpCircle, label: "Aide & Support", href: "/rider/help" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/rider" className="p-2 -ml-2 hover:bg-sur-low rounded-lg">
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Paramètres
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-on-surface">
                {user?.name}
              </h2>
              <p className="text-sm text-on-sur-var">{user?.email}</p>
              <p className="text-sm text-on-sur-var">
                {user?.phone || "Aucun téléphone"}
              </p>
            </div>
            <Link
              href="/rider/profile"
              className="p-2 hover:bg-sur-low rounded-lg"
            >
              <Edit2 className="w-5 h-5 text-on-sur-var" />
            </Link>
          </div>
        </div>

        <div className="card divide-y divide-sur-low">
          {settingsItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 p-4 hover:bg-sur-low transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 text-on-surface">{item.label}</span>
              <ChevronLeft className="w-4 h-4 text-on-sur-var rotate-180" />
            </Link>
          ))}
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-on-surface mb-3">Contact</p>
          <div className="space-y-2">
            <a
              href="tel:+2376XXXXXXX"
              className="flex items-center gap-3 text-sm text-on-sur-var"
            >
              <Phone className="w-4 h-4" /> +237 6XX XXX XXX
            </a>
            <a
              href="mailto:support@tara-delivery.cm"
              className="flex items-center gap-3 text-sm text-on-sur-var"
            >
              <Mail className="w-4 h-4" /> support@tara-delivery.cm
            </a>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary w-full text-red-600"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
