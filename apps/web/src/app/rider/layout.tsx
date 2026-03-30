"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Activity, Wallet, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/auth-guard";

const navItems = [
  { href: "/rider", icon: Package, label: "Requests" },
  { href: "/rider/orders", icon: Activity, label: "Active" },
  { href: "/rider/earnings", icon: Wallet, label: "Earnings" },
  { href: "/rider/profile", icon: User, label: "Profile" },
];

export default function RiderLayout({
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

  return (
    <AuthGuard allowedRoles={["RIDER"]}>
      <div className="min-h-screen bg-surface">
        {/* Bottom navigation for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 ${
                    active ? "text-primary" : "text-gray-500"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Déconnexion</span>
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div className="pb-20 lg:pb-0">{children}</div>
      </div>
    </AuthGuard>
  );
}
