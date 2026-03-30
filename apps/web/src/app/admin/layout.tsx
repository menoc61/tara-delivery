"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Package2,
  MapPin,
  Shield,
  CreditCard,
  Tag,
  BellRing,
  FileText,
  HelpCircle,
  Activity,
  Map,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/auth-guard";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/orders", icon: Package, label: "Commandes" },
  { href: "/admin/users", icon: Users, label: "Clients" },
  { href: "/admin/riders", icon: Truck, label: "Livreurs" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytiques" },
  { href: "/admin/zones", icon: MapPin, label: "Zones & Tarifs" },
  { href: "/admin/kyc", icon: Shield, label: "Vérification KYC" },
  { href: "/admin/payouts", icon: CreditCard, label: "Paiements" },
  { href: "/admin/promos", icon: Tag, label: "Codes Promo" },
  { href: "/admin/notifications", icon: BellRing, label: "Notifications" },
  { href: "/admin/audit", icon: FileText, label: "Audit & Sécurité" },
  { href: "/admin/support", icon: HelpCircle, label: "Support Client" },
  { href: "/admin/fleet", icon: Activity, label: "Performance Flotte" },
  { href: "/admin/live-map", icon: Map, label: "Carte Temps Réel" },
  { href: "/admin/settings", icon: Settings, label: "Paramètres" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    toast.success("Déconnecté");
    router.push("/auth/login");
  };

  const currentItem = navItems.find((n) => n.href === pathname);

  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-primary flex flex-col">
          <div className="p-4 border-b border-primary-container">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                <Package2 className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">
                  TARA DELIVERY
                </div>
                <div className="text-primary-container text-xs">
                  Administration
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-primary-container hover:bg-primary-container/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-primary-container space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name}
                </p>
                <p className="text-primary-container text-xs truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-container hover:bg-primary-container/50 transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h1 className="text-lg font-bold text-on-surface">
              {currentItem?.label || "Administration"}
            </h1>
            <button className="relative p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <Bell className="w-5 h-5 text-on-surface-variant" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-container rounded-full" />
            </button>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
