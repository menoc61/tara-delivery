"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Wallet,
  User,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  X,
  MessageCircleCode,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/customer") return pathname === "/customer";
    return pathname.startsWith(path);
  };

  const activeClass = "text-[#00503a]";
  const inactiveClass = "text-slate-400";

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
      <Link
        href="/customer"
        className={`flex flex-col items-center gap-1 ${isActive("/customer") && pathname === "/customer" ? activeClass : inactiveClass}`}
      >
        <span className="text-xl">☰</span>
        <span className="text-[10px] font-bold">Accueil</span>
      </Link>
      <Link
        href="/customer/orders"
        className={`flex flex-col items-center gap-1 ${isActive("/customer/orders") ? activeClass : inactiveClass}`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] font-bold">Envois</span>
      </Link>
      <div className="relative -top-8">
        <Link
          href="/customer/new-order"
          className="w-14 h-14 bg-[#feb700] rounded-full shadow-lg flex items-center justify-center text-[#271900]"
        >
          <Plus className="text-3xl" />
        </Link>
      </div>
      <Link
        href="/customer/payments"
        className={`flex flex-col items-center gap-1 ${isActive("/customer/payments") ? activeClass : inactiveClass}`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[10px] font-bold">Portefeuille</span>
      </Link>
      <Link
        href="/customer/profile"
        className={`flex flex-col items-center gap-1 ${isActive("/customer/profile") ? activeClass : inactiveClass}`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">Profil</span>
      </Link>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-64 border-r-0 py-6 px-4 space-y-2 sticky top-20">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold text-emerald-900">Tableau de Bord</h2>
        <p className="text-xs text-slate-500 font-medium">Gérez vos envois</p>
      </div>
      <nav className="flex-1 space-y-1">
        <Link
          href="/customer/new-order"
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-transform duration-200 hover:translate-x-1 ${
            isActive("/customer/new-order")
              ? "bg-emerald-100 text-emerald-900 font-semibold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Nouvelle Livraison</span>
        </Link>
        <Link
          href="/customer/orders"
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-transform duration-200 hover:translate-x-1 ${
            isActive("/customer/orders")
              ? "bg-emerald-100 text-emerald-900 font-semibold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-sm">Mes Colis</span>
        </Link>
        <Link
          href="/customer/payments"
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-transform duration-200 hover:translate-x-1 ${
            isActive("/customer/payments")
              ? "bg-emerald-100 text-emerald-900 font-semibold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-sm">Paiements</span>
        </Link>
        <Link
          href="/customer/profile"
          className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-transform duration-200 hover:translate-x-1 ${
            isActive("/customer/profile")
              ? "bg-emerald-100 text-emerald-900 font-semibold"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-sm">Profil</span>
        </Link>
      </nav>
      <Link
        href="/customer/new-order"
        className="mt-auto w-full py-4 bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg active:scale-95 transition-all text-center"
      >
        Démarrer un envoi
      </Link>
    </aside>
  );
}

export function Header({ title }: { title?: string }) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    toast.success("Déconnexion réussie");
    router.push("/auth/login");
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto w-full relative">
        <div className="flex items-center gap-8">
          <Link href="/customer">
            <span className="text-2xl font-black tracking-tighter text-emerald-900">
              TARA DELIVERY
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-y-0 space-x-6">
            <Link
              href="/customer/orders/track"
              className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            >
              Suivi
            </Link>
            <Link
              href="/customer/orders"
              className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            >
              Historique
            </Link>
            <Link
              href="/customer/pricing"
              className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            >
              Tarifs
            </Link>
            <Link
              href="/customer/help"
              className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            >
              Aide
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/customer/notifications"
            className="p-2 hover:bg-slate-50 rounded-lg transition-all text-[#00503a] font-bold border-b-2 border-[#00503a] pb-1"
          >
            <Bell className="w-5 h-5" />
          </Link>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="h-10 w-10 rounded-full overflow-hidden bg-[#edeeec] flex items-center justify-center hover:ring-2 hover:ring-[#00503a] hover:ring-offset-2 transition-all"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </button>

            {/* Profile Dropdown Modal */}
            {showProfileModal && (
              <div
                ref={modalRef}
                className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              >
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          {user?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{user?.name || "Utilisateur"}</p>
                      <p className="text-xs opacity-80">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    href="/customer/profile"
                    onClick={() => setShowProfileModal(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Settings className="w-5 h-5 text-[#00503a]" />
                    <span className="font-medium">Paramètres</span>
                  </Link>
                  <Link
                    href="/customer/messages"
                    onClick={() => setShowProfileModal(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <MessageCircleCode className="w-5 h-5 text-[#00503a]" />
                    <span className="font-medium">Messages</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 left-0"></div>
      </div>
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className="bg-slate-100 w-full">
      <div className="bg-emerald-900/5 h-px"></div>
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full gap-4 max-w-screen-2xl mx-auto">
        <p className="text-xs text-slate-500">
          © 2026 TARA DELIVERY. Logistique de précision au cœur de Yaoundé.
        </p>
        <div className="flex gap-8">
          <Link
            href="/terms"
            className="text-xs text-slate-500 hover:text-emerald-700 transition-colors"
          >
            Conditions Générales
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-slate-500 hover:text-emerald-700 transition-colors"
          >
            Confidentialité
          </Link>
          <Link
            href="/contact"
            className="text-xs text-slate-500 hover:text-emerald-700 transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </footer>
  );
}
