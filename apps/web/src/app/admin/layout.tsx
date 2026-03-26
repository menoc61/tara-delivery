"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Users, Truck,
  BarChart3, Settings, LogOut, Bell, Package2
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/orders", icon: Package, label: "Commandes" },
  { href: "/admin/riders", icon: Truck, label: "Livreurs" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytiques" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    toast.success("Déconnecté");
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm font-display">TARA DELIVERY</div>
              <div className="text-gray-400 text-xs">Administration</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900 font-display">
            {navItems.find((n) => n.href === pathname)?.label || "Administration"}
          </h1>
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
