"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  ShoppingCart,
  CheckCircle,
  Gift,
  Wallet,
  Settings,
  Truck,
  Map,
  CheckCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { notificationsApi } from "@/lib/api-client";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";

const iconMap: Record<string, React.ElementType> = {
  ORDER_CREATED: Package,
  ORDER_DELIVERED: CheckCircle,
  ORDER_CANCELLED: Package,
  PAYMENT: Wallet,
  PROMO: Gift,
  SETTINGS: Settings,
};

export default function CustomerNotificationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getAll()
      .then((r) => setNotifications(r.data.data?.items || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  // Dummy data for demonstration
  const dummyNotifications = [
    {
      id: 1,
      type: "ORDER_CREATED",
      title: "Colis en cours de livraison",
      message:
        "Votre coursier Ibrahim est en route vers Bastos. Arrivée prévue à 14:30.",
      createdAt: new Date().toISOString(),
      readAt: null,
      time: "À l'instant",
    },
    {
      id: 2,
      type: "PROMO",
      title: "Promo Week-end",
      message: "Profitez de -15% sur tous vos envois interurbains.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readAt: null,
      time: "IL Y A 2 HEURES",
    },
    {
      id: 3,
      type: "ORDER_DELIVERED",
      title: "Livraison Terminée",
      message: "Le colis #TR-9902 a été remis en main propre à M. Atangana.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date().toISOString(),
      time: "Hier, 18:45",
    },
    {
      id: 4,
      type: "PAYMENT",
      title: "Paiement Reçu",
      message: "Votre paiement de 5.500 XAF via Orange Money a été confirmé.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date().toISOString(),
      time: "Hier, 11:20",
    },
    {
      id: 5,
      type: "SETTINGS",
      title: "Mise à jour de sécurité",
      message: "Nous avons renforcé la protection de vos données de paiement.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date().toISOString(),
      time: "3 jours",
    },
  ];

  // Group notifications by date
  const groupedNotifications = {
    today:
      notifications.length > 0 ? [notifications[0]] : [dummyNotifications[0]],
    yesterday:
      notifications.length > 1
        ? notifications.slice(1, 3)
        : [dummyNotifications[2], dummyNotifications[3]],
    older:
      notifications.length > 3
        ? notifications.slice(3)
        : [dummyNotifications[4]],
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header title="Centre de Notifications" />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-extrabold text-[#191c1b] tracking-tight mb-2">
                  Centre de Notifications
                </h1>
                <p className="text-[#3f4944] max-w-md">
                  Restez informé de l'état de vos livraisons et des dernières
                  actualités de Tara Delivery.
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-[#00503a] hover:text-[#006a4e] transition-colors px-4 py-2 rounded-lg bg-[#9ef4d0]/30">
                <CheckCheck className="w-5 h-5" />
                Tout Marquer comme Lu
              </button>
            </div>

            {/* Bento Grid Layout for Notifications */}
            <div className="space-y-4">
              {/* Notification Group: Aujourd'hui */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-4 px-2">
                  Aujourd'hui
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Unread Status Update */}
                  <div className="md:col-span-8 bg-[#9ef4d0]/10 p-6 rounded-xl relative group transition-all hover:bg-[#9ef4d0]/20">
                    <div className="absolute top-6 left-0 w-1 h-12 bg-[#00503a] rounded-r-full"></div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-[#9ef4d0] flex items-center justify-center text-[#00503a]">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-lg text-[#002116]">
                            Colis en cours de livraison
                          </h4>
                          <span className="text-xs font-medium text-[#00503a]">
                            À l'instant
                          </span>
                        </div>
                        <p className="text-[#3f4944] leading-relaxed mb-4">
                          Votre coursier Ibrahim est en route vers{" "}
                          <span className="font-bold">Bastos</span>. Arrivée
                          prévue à 14:30.
                        </p>
                        <button className="bg-[#feb700] text-[#271900] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md">
                          SUIVRE SUR LA CARTE
                          <Map className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Small Marketing Tile */}
                  <div className="md:col-span-4 bg-[#ffdea8]/20 p-6 rounded-xl flex flex-col justify-between border-2 border-transparent hover:border-[#ffdea8] transition-all">
                    <div className="w-10 h-10 rounded-lg bg-[#ffdea8] flex items-center justify-center text-[#7c5800] mb-4">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#271900]">
                        Promo Week-end
                      </h4>
                      <p className="text-xs text-[#6b4b00] mt-1">
                        Profitez de -15% sur tous vos envois interurbains.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold mt-4 text-[#7c5800]/60">
                      IL Y A 2 HEURES
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Group: Hier */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-4 px-2">
                  Hier
                </h3>
                <div className="space-y-4">
                  {/* Standard Read Notification */}
                  <div className="bg-[#f2f4f2] p-5 rounded-xl flex gap-4 hover:translate-x-1 transition-transform duration-200">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#e1e3e1] flex items-center justify-center text-[#6f7a73]">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#191c1b]">
                          Livraison Terminée
                        </h4>
                        <span className="text-xs text-[#6f7a73]">
                          Hier, 18:45
                        </span>
                      </div>
                      <p className="text-sm text-[#3f4944]">
                        Le colis #TR-9902 a été remis en main propre à M.
                        Atangana.
                      </p>
                    </div>
                  </div>

                  {/* Payment Notification */}
                  <div className="bg-[#f2f4f2] p-5 rounded-xl flex gap-4 hover:translate-x-1 transition-transform duration-200">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#ffdbcb] flex items-center justify-center text-[#772f00]">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#191c1b]">
                          Paiement Reçu
                        </h4>
                        <span className="text-xs text-[#6f7a73]">
                          Hier, 11:20
                        </span>
                      </div>
                      <p className="text-sm text-[#3f4944]">
                        Votre paiement de{" "}
                        <span className="font-bold">5.500 XAF</span> via Orange
                        Money a été confirmé.
                      </p>
                    </div>
                  </div>

                  {/* Asymmetric Promo Card */}
                  <div className="bg-[#00503a] text-white p-8 rounded-2xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 text-center md:text-left">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold mb-4 tracking-widest">
                          NOUVEAU SERVICE
                        </span>
                        <h3 className="text-2xl font-black mb-2">
                          Tara Express : Livraison en 30min
                        </h3>
                        <p className="text-[#92e7c3] text-sm max-w-sm">
                          Désormais disponible dans les quartiers Akwa et
                          Bonanjo. Testez la rapidité absolue.
                        </p>
                      </div>
                      <div className="w-32 h-32 relative shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Truck className="w-16 h-16 text-white/80" />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  </div>
                </div>
              </div>

              {/* Older Notifications */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-4 px-2">
                  Plus Ancien
                </h3>
                <div className="bg-[#f2f4f2] p-5 rounded-xl flex gap-4 opacity-75">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#e1e3e1] flex items-center justify-center text-[#6f7a73]">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-[#191c1b]">
                        Mise à jour de sécurité
                      </h4>
                      <span className="text-xs text-[#6f7a73]">3 jours</span>
                    </div>
                    <p className="text-sm text-[#3f4944]">
                      Nous avons renforcé la protection de vos données de
                      paiement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
