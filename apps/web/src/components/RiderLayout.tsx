"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Wallet,
  FileText,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  Zap,
  Search,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi, ridersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useNotificationStore } from "@/store/notification.store";
import toast from "react-hot-toast";

const sidebarLinks = [
  { href: "/rider", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/rider/deliveries", label: "Mes Livraisons", icon: Truck },
  { href: "/rider/earnings", label: "Mes Gains", icon: Wallet },
  { href: "/rider/documents", label: "Documents Véhicule", icon: FileText },
  { href: "/rider/performance", label: "Performance", icon: BarChart3 },
  { href: "/rider/messages", label: "Communications", icon: MessageCircle },
];

export function RiderSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [riderStatus, setRiderStatus] = useState<string>("OFFLINE");

  useEffect(() => {
    ridersApi
      .getMe()
      .then((res) => setRiderStatus(res.data.data?.status || "OFFLINE"))
      .catch(() => {});
  }, []);

  const handleToggleStatus = async () => {
    try {
      const newStatus = riderStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
      await ridersApi.updateStatus(newStatus);
      setRiderStatus(newStatus);
      toast.success(
        newStatus === "AVAILABLE"
          ? "Vous êtes en ligne!"
          : "Vous êtes hors ligne",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 z-40 bg-[#0a3d2a] flex-col py-6 shadow-xl">
      {/* Logo */}
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">
          TARA Delivery
        </h1>
        <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mt-1">
          Espace Coursier
        </p>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col flex-1 gap-1 px-2">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/rider" && pathname.startsWith(link.href));
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${
                isActive
                  ? "bg-emerald-900/50 text-white"
                  : "text-emerald-100/70 hover:bg-emerald-900/30 hover:text-white"
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-4 space-y-4">
        {/* Go Online Button */}
        <button
          onClick={handleToggleStatus}
          className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            riderStatus === "AVAILABLE"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-[#feb700] text-[#271900] hover:opacity-90"
          }`}
        >
          <Zap className="w-5 h-5" style={{ fill: "currentColor" }} />
          {riderStatus === "AVAILABLE"
            ? "Passer hors ligne"
            : "Passer en ligne"}
        </button>

        {/* Settings & Logout */}
        <div className="pt-4 border-t border-emerald-900/50">
          <Link
            href="/rider/settings"
            className="flex items-center gap-3 px-4 py-2 text-emerald-100/70 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Paramètres</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-emerald-100/70 hover:text-white transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function RiderHeader({ title }: { title?: string }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const pathname = usePathname();
  const [riderStatus, setRiderStatus] = useState<string>("OFFLINE");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    ridersApi
      .getMe()
      .then((res) => setRiderStatus(res.data.data?.status || "OFFLINE"))
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 right-0 md:w-[calc(100%-16rem)] w-full h-16 z-30 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 border-b border-slate-100">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-slate-100"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Search */}
      <div className="hidden md:flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une livraison..."
            className="w-full pl-10 pr-4 py-2 bg-[#f2f4f2] border-none rounded-full text-sm focus:ring-2 focus:ring-[#00503a] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Title on mobile */}
      {title && <h1 className="md:hidden font-bold text-[#00503a]">{title}</h1>}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${
            riderStatus === "AVAILABLE"
              ? "bg-[#9ef4d0] text-[#002116]"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${riderStatus === "AVAILABLE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
          />
          <span className="text-xs font-bold">
            {riderStatus === "AVAILABLE" ? "Disponible" : "Hors ligne"}
          </span>
        </div>

        {/* Notifications */}
        <Link
          href="/rider/notifications"
          className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-[#00503a]">
              {user?.name || "Rider"}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Livreur</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#9ef4d0] flex items-center justify-center overflow-hidden ring-2 ring-[#9ef4d0]">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[#00503a]" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 z-50 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-[#0a3d2a] py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 mb-4">
              <h2 className="text-lg font-black text-white">TARA Delivery</h2>
              <p className="text-xs text-emerald-400">Espace Coursier</p>
            </div>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 transition-all ${
                    isActive
                      ? "bg-emerald-900/50 text-white"
                      : "text-emerald-100/70 hover:bg-emerald-900/30"
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

export function RiderMobileNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationStore();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 px-4 py-2 flex justify-between items-center z-50">
      <Link
        href="/rider"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive("/rider") && pathname === "/rider" ? "text-[#00503a]" : "text-slate-400"}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[9px] font-bold">Accueil</span>
      </Link>
      <Link
        href="/rider/deliveries"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive("/rider/deliveries") ? "text-[#00503a]" : "text-slate-400"}`}
      >
        <Truck className="w-5 h-5" />
        <span className="text-[9px] font-bold">Courses</span>
      </Link>
      <Link
        href="/rider/earnings"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive("/rider/earnings") ? "text-[#00503a]" : "text-slate-400"}`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[9px] font-bold">Gains</span>
      </Link>
      <Link
        href="/rider/messages"
        className={`relative flex flex-col items-center gap-0.5 px-3 py-1 ${isActive("/rider/messages") ? "text-[#00503a]" : "text-slate-400"}`}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[9px] font-bold">Messages</span>
      </Link>
      <Link
        href="/rider/settings"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive("/rider/settings") ? "text-[#00503a]" : "text-slate-400"}`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[9px] font-bold">Params</span>
      </Link>
    </div>
  );
}
