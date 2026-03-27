"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Package,
  Activity,
  Wallet,
  User,
  Star,
  Verified,
  Car,
  FileText,
  GraduationCap,
  LogOut,
  ChevronRight,
  LogOut as LogOutIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ridersApi, authApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { RiderStatus } from "@tara/types";

type RiderProfile = {
  id: string;
  status: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
  user: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
};

export default function RiderProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RiderStatus>(RiderStatus.AVAILABLE);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await ridersApi.getMe();
      const data = res.data.data as Record<string, unknown>;
      setProfile(data as unknown as RiderProfile);
      setStatus((data.status as RiderStatus) || RiderStatus.AVAILABLE);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push("/auth/login");
  };

  const totalDeliveries = 1284;
  const rating = 4.98;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col pb-24">
      {/* TopAppBar */}
      <header className="bg-primary text-white shadow-lg shadow-primary/20 fixed top-0 z-50 w-full px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Menu className="text-secondary cursor-pointer" />
          <span className="text-lg font-extrabold tracking-widest uppercase">
            TARA RIDER
          </span>
        </div>
        <div className="flex items-center gap-2 bg-primary-container/50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-secondary-container rounded-full" />
          <span className="font-medium text-sm text-emerald-100">EN LIGNE</span>
        </div>
      </header>

      <main className="flex-grow pt-24 px-4 max-w-2xl mx-auto w-full">
        {/* Profile Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Main Profile Info */}
          <div className="md:col-span-2 bg-surface-container-low rounded-xl p-6 flex items-center gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-secondary-container shadow-md">
                {profile?.user?.avatar ? (
                  <img
                    src={profile.user.avatar}
                    alt={profile.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className="z-10">
              <h2 className="font-bold text-2xl text-primary leading-tight">
                {user?.name || "Rider"}
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                ID: TARA-{user?.id?.slice(0, 4)?.toUpperCase() || "8829"}
              </p>
              {profile?.isVerified && (
                <div className="mt-2 inline-flex items-center bg-secondary-container px-3 py-1 rounded-full text-on-secondary-container text-xs font-bold tracking-wide">
                  <Verified className="w-3 h-3 mr-1" />
                  CERTIFIÉ
                </div>
              )}
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-fixed/20 rounded-full blur-3xl" />
          </div>

          {/* Stats Quick View */}
          <div className="bg-primary text-white rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-md">
            <Star
              className="text-secondary-container text-3xl mb-1 w-8 h-8"
              fill="#feb700"
            />
            <p className="font-bold text-3xl">{rating.toFixed(2)}</p>
            <p className="text-xs text-primary-container font-semibold uppercase tracking-tighter">
              Note Globale
            </p>
          </div>
        </div>

        {/* Deliveries Dashboard Card */}
        <div className="bg-surface-container-highest rounded-xl p-6 mb-6 flex justify-between items-center">
          <div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">
              Total Livraisons
            </p>
            <h3 className="font-extrabold text-4xl text-primary mt-1">
              {profile?.totalDeliveries?.toLocaleString() ||
                totalDeliveries.toLocaleString()}
            </h3>
          </div>
          <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center">
            <Package className="text-primary text-3xl w-9 h-9" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-primary px-1">
            Gestion du Compte
          </h4>

          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-emerald-50 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary-fixed transition-colors">
                <Car className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Détails du véhicule</p>
                <p className="text-xs text-on-surface-variant">
                  {profile?.vehicleType || "Motocyclette"} •{" "}
                  {profile?.vehiclePlate || "Suzuki GSX 150"}
                </p>
              </div>
            </div>
            <ChevronRight className="text-outline" />
          </div>

          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-emerald-50 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary-fixed transition-colors">
                <FileText className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Mes Documents</p>
                <p className="text-xs text-on-surface-variant">
                  Permis, Assurance, CNPS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-error rounded-full" />
              <ChevronRight className="text-outline" />
            </div>
          </div>

          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-emerald-50 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary-fixed transition-colors">
                <Wallet className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-surface">
                  Paramètres de Paiement
                </p>
                <p className="text-xs text-on-surface-variant">
                  Orange Money, MTN MoMo
                </p>
              </div>
            </div>
            <ChevronRight className="text-outline" />
          </div>

          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-emerald-50 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary-fixed transition-colors">
                <GraduationCap className="text-primary w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Formation & Guide</p>
                <p className="text-xs text-on-surface-variant">
                  Conseils de sécurité et bonus
                </p>
              </div>
            </div>
            <ChevronRight className="text-outline" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-10 py-4 bg-surface-container-highest text-error font-bold rounded-xl hover:bg-error/5 transition-colors flex items-center justify-center gap-2"
        >
          <LogOutIcon className="w-5 h-5" />
          SE DÉCONNECTER
        </button>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex justify-around items-center px-4 pb-6 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <Link
          href="/rider"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 transition-all"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Requests
          </span>
        </Link>
        <Link
          href="/rider/orders"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 transition-all"
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Active
          </span>
        </Link>
        <Link
          href="/rider/earnings"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 transition-all"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Earnings
          </span>
        </Link>
        <div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-5 py-1.5">
          <User className="w-5 h-5" fill="#6b4b00" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Profile
          </span>
        </div>
      </nav>
    </div>
  );
}
