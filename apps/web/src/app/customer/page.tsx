"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  Bell,
  LogOut,
  Settings,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, authApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  ASSIGNED: "En cours",
  PICKED_UP: "Récupération",
  IN_TRANSIT: "En livraison",
  DELIVERED: "Livré",
  CANCELLED: "Annulé",
  FAILED: "Échoué",
};

export default function CustomerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => setOrders(r.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
  );
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  const getDay = (d: string) => new Date(d as string).getDate();
  const getMonth = (d: string) =>
    new Date(d as string)
      .toLocaleString("fr-CM", { month: "short" })
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto w-full relative">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-emerald-900">
              TARA DELIVERY
            </span>
            <nav className="hidden md:flex items-center space-y-0 space-x-6">
              <Link
                href="/customer/orders/track"
                className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
              >
                Suivi
              </Link>
              <Link
                href="/customer/orders"
                className="text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1 text-sm"
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
            <Link href="/customer/notifications" className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600">
              <Bell className="w-5 h-5" />
            </Link>
            <Link href="/customer/profile">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-[#edeeec]">
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
              </div>
            </Link> 
          </div>
          <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 left-0"></div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-20 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-64 border-r-0 py-6 px-4 space-y-2 sticky top-20">
          <div className="mb-8 px-2">
            <h2 className="text-xl font-bold text-emerald-900">
              Tableau de Bord
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Gérez vos envois
            </p>
          </div>
          <nav className="flex-1 space-y-1">
            <Link
              href="/customer/new-order"
              className="flex items-center gap-3 py-3 px-4 bg-emerald-100 text-emerald-900 rounded-xl font-semibold transition-transform duration-200 hover:translate-x-1"
            >
              <Package
                className="w-5 h-5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              />
              <span className="text-sm">Nouvelle Livraison</span>
            </Link>
            <Link
              href="/customer/orders"
              className="flex items-center gap-3 py-3 px-4 text-slate-500 hover:bg-slate-100 rounded-xl transition-transform duration-200 hover:translate-x-1"
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Mes Colis</span>
            </Link>
            <Link
              href="/customer/payments"
              className="flex items-center gap-3 py-3 px-4 text-slate-500 hover:bg-slate-100 rounded-xl transition-transform duration-200 hover:translate-x-1"
            >
              <Wallet className="w-5 h-5" />
              <span className="text-sm">Paiements</span>
            </Link>
            <Link
              href="/customer/settings"
              className="flex items-center gap-3 py-3 px-4 text-slate-500 hover:bg-slate-100 rounded-xl transition-transform duration-200 hover:translate-x-1"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Paramètres</span>
            </Link>
          </nav>
          <Link
            href="/customer/new-order"
            className="mt-auto w-full py-4 bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg active:scale-95 transition-all text-center"
          >
            Démarrer un envoi
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {/* Welcome Card - 2 cols */}
            <div className="md:col-span-2 lg:col-span-2 bg-[#00503a] text-white p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-1">
                  Bienvenue, {user?.name?.split(" ")[0] || "Client"}
                </h3>
                <p className="text-[#92e7c3] text-sm font-medium max-w-[240px]">
                  Vous avez {activeOrders.length} livraison
                  {activeOrders.length > 1 ? "s" : ""} active
                  {activeOrders.length > 1 ? "s" : ""} aujourd'hui à Yaoundé.
                </p>
              </div>
              <Link
                href="/customer/new-order"
                className="relative z-10 mt-6 bg-[#feb700] text-[#271900] px-6 py-3 rounded-lg font-bold text-sm w-fit active:scale-95 transition-all"
              >
                NOUVEL ENVOI
              </Link>
              {/* Decorative */}
              <div className="absolute -right-12 -bottom-12 opacity-10">
                <Package
                  className="text-[200px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                />
              </div>
            </div>

            {/* Total Deliveries */}
            <div className="bg-[#f2f4f2] p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Total Livraisons
                  </span>
                  <span className="text-[#00503a]">
                    <Package className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-4xl font-black text-[#191c1b]">
                  {orders.length}
                </p>
              </div>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="text-sm">↑</span> +
                {Math.floor(deliveredCount / 2)}% ce mois
              </p>
            </div>

            {/* Savings */}
            <div className="bg-[#f2f4f2] p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Économies
                  </span>
                  <span className="text-[#7c5800]">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-3xl font-black text-[#191c1b]">
                  {formatCFA(orders.length * 500)}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Grâce au programme fidélité
              </p>
            </div>
          </div>

          {/* Active Deliveries Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-emerald-950">
                Suivi en direct
              </h2>
              <Link
                href="/customer/orders"
                className="text-[#00503a] font-bold text-sm hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tracking Card 1 */}
              <div className="bg-[#e1e3e1] p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <Package className="w-6 h-6 text-emerald-800" />
                    </div>
                    <div>
                      <p className="font-bold text-[#191c1b]">
                        Commande #TR-892
                      </p>
                      <p className="text-xs text-slate-500">
                        Destinataire: Jean M. (Bastos)
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#006a4e] text-[#9ef4d0] rounded-full text-[10px] font-bold uppercase tracking-tighter">
                    En cours
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Progression</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 w-full bg-[#edeeec] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00503a] rounded-full w-[75%]"></div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Le livreur est à 5 min de
                    l'arrivée
                  </p>
                </div>
              </div>

              {/* Tracking Card 2 */}
              <div className="bg-[#e1e3e1] p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <Clock className="w-6 h-6 text-emerald-800" />
                    </div>
                    <div>
                      <p className="font-bold text-[#191c1b]">
                        Commande #TR-885
                      </p>
                      <p className="text-xs text-slate-500">
                        Origine: Boulangerie Centrale
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#feb700] text-[#271900] rounded-full text-[10px] font-bold uppercase tracking-tighter">
                    Récupération
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Progression</span>
                    <span>20%</span>
                  </div>
                  <div className="h-2 w-full bg-[#edeeec] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7c5800] rounded-full w-[20%]"></div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Attente de prise en charge par
                    le coursier
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent History Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-emerald-950">
                Historique récent
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-[#f2f4f2] rounded-lg hover:bg-[#e7e9e6]">
                  <span className="text-sm">↓</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {/* History Item 1 */}
              <div className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white hover:bg-emerald-50/50 transition-colors rounded-xl gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Mars
                    </p>
                    <p className="text-xl font-black text-[#191c1b]">26</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#191c1b]">
                      Documents Administratifs
                    </h4>
                    <p className="text-xs text-slate-500">
                      De: Omnisports — À: Mvan
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-12">
                  <div className="text-right">
                    <p className="font-bold text-[#191c1b]">2.500 XAF</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      Orange Money
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden md:block px-3 py-1 bg-[#ffdbcb] text-[#341100] rounded-full text-[10px] font-bold uppercase">
                      Livré
                    </span>
                    <button className="p-2 group-hover:bg-emerald-100 rounded-lg transition-all">
                      <span className="text-slate-400 group-hover:text-emerald-700 text-xs">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* History Item 2 */}
              <div className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white hover:bg-emerald-50/50 transition-colors rounded-xl gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Mars
                    </p>
                    <p className="text-xl font-black text-[#191c1b]">24</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#191c1b]">
                      Colis Alimentaire
                    </h4>
                    <p className="text-xs text-slate-500">
                      De: Marché Central — À: Santa Barbara
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-12">
                  <div className="text-right">
                    <p className="font-bold text-[#191c1b]">3.800 XAF</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      MTN MoMo
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden md:block px-3 py-1 bg-[#ffdbcb] text-[#341100] rounded-full text-[10px] font-bold uppercase">
                      Livré
                    </span>
                    <button className="p-2 group-hover:bg-emerald-100 rounded-lg transition-all">
                      <span className="text-slate-400 group-hover:text-emerald-700 text-xs">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* History Item 3 */}
              <div className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white hover:bg-emerald-50/50 transition-colors rounded-xl gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Mars
                    </p>
                    <p className="text-xl font-black text-[#191c1b]">19</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#191c1b]">
                      Électronique (Smartphone)
                    </h4>
                    <p className="text-xs text-slate-500">
                      De: Akwa Douala — À: Yaoundé V
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-12">
                  <div className="text-right">
                    <p className="font-bold text-[#191c1b]">12.000 XAF</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      Cash
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden md:block px-3 py-1 bg-[#ffdbcb] text-[#341100] rounded-full text-[10px] font-bold uppercase">
                      Livré
                    </span>
                    <button className="p-2 group-hover:bg-emerald-100 rounded-lg transition-all">
                      <span className="text-slate-400 group-hover:text-emerald-700 text-xs">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
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

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
        <Link
          href="/customer"
          className="flex flex-col items-center gap-1 text-emerald-900"
        >
          <span className="text-xl">☰</span>
          <span className="text-[10px] font-bold">Accueil</span>
        </Link>
        <Link
          href="/customer/orders"
          className="flex flex-col items-center gap-1 text-slate-400"
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
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold">Portefeuille</span>
        </Link>
        <Link
          href="/customer/profile"
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-bold">Profil</span>
        </Link>
      </div>
    </div>
  );
}
