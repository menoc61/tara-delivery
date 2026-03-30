"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Wallet,
  Bell,
  Gift,
  MessageCircle,
  Shield,
  Wrench,
  Star,
  Settings,
  MapPin,
  ChevronRight,
  CheckCheck,
  Loader2,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  useNotificationStore,
  type Notification,
} from "@/store/notification.store";
import { usePushNotifications } from "@/lib/push-notifications";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

// ── Notification Card Configurations ──────────────────────

interface CardConfig {
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  borderColor?: string;
  accentColor?: string;
}

const cardConfigs: Record<string, CardConfig> = {
  // Order events
  ORDER_CREATED: {
    icon: Package,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-l-blue-500",
  },
  ORDER_CONFIRMED: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-l-emerald-500",
  },
  ORDER_ASSIGNED: {
    icon: Truck,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-l-amber-500",
  },
  ORDER_PICKED_UP: {
    icon: Package,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    borderColor: "border-l-orange-500",
  },
  ORDER_DELIVERED: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-l-emerald-500",
  },
  ORDER_CANCELLED: {
    icon: XCircle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },
  ORDER_FAILED: {
    icon: AlertTriangle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },

  // Payment events
  PAYMENT_SUCCESS: {
    icon: Wallet,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-l-emerald-500",
  },
  PAYMENT_FAILED: {
    icon: XCircle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },

  // User events
  WELCOME: {
    icon: Bell,
    bgColor: "bg-gradient-to-br from-[#9ef4d0]/20 to-[#9ef4d0]/5",
    iconColor: "text-[#00503a]",
    borderColor: "border-l-[#00503a]",
  },
  RATING_REMINDER: {
    icon: Star,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-l-amber-400",
  },

  // Promotion events
  PROMOTION: {
    icon: Gift,
    bgColor: "bg-[#ffdea8]/20",
    iconColor: "text-[#7c5800]",
    borderColor: "border-l-[#feb700]",
    accentColor: "bg-[#feb700]",
  },

  // Chat events
  CHAT_MESSAGE: {
    icon: MessageCircle,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-l-blue-500",
  },

  // Admin/system events
  ADMIN_ANNOUNCEMENT: {
    icon: Shield,
    bgColor: "bg-[#00503a]/5",
    iconColor: "text-[#00503a]",
    borderColor: "border-l-[#00503a]",
    accentColor: "bg-[#00503a]",
  },
  MAINTENANCE: {
    icon: Wrench,
    bgColor: "bg-slate-100",
    iconColor: "text-slate-600",
    borderColor: "border-l-slate-500",
    accentColor: "bg-slate-500",
  },
  DELIVERY_IN_PROGRESS: {
    icon: Truck,
    bgColor: "bg-[#9ef4d0]/10",
    iconColor: "text-[#00503a]",
    borderColor: "border-l-[#00503a]",
  },
  SYSTEM: {
    icon: Settings,
    bgColor: "bg-slate-50",
    iconColor: "text-slate-500",
    borderColor: "border-l-slate-400",
  },

  // Rider events
  RIDER_ASSIGNED: {
    icon: Truck,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-l-amber-500",
  },
  NEW_ORDER_ALERT: {
    icon: Package,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-l-blue-500",
  },
};

const defaultConfig: CardConfig = {
  icon: Bell,
  bgColor: "bg-slate-50",
  iconColor: "text-slate-500",
  borderColor: "border-l-slate-400",
};

// ── Time Formatting ───────────────────────────────────────

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-CM", { day: "numeric", month: "short" });
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {
    today: [],
    yesterday: [],
    older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    if (date >= todayStart) {
      groups.today.push(n);
    } else if (date >= yesterdayStart) {
      groups.yesterday.push(n);
    } else {
      groups.older.push(n);
    }
  });

  return groups;
}

// ── Notification Card Component ───────────────────────────

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notification: Notification) => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const config = cardConfigs[notification.type] || defaultConfig;
  const Icon = config.icon;
  const isDeletable = notification.isDeletable !== false;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDeletable) return;
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || !isDeletable) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff < 0) {
      setSwipeX(Math.max(diff, -100));
    } else {
      setSwipeX(0);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (swipeX < -60 && isDeletable) {
      onDelete(notification.id);
    } else {
      setSwipeX(0);
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onAction(notification);
    }
  };

  // Special card for CHAT_MESSAGE type
  if (notification.type === "CHAT_MESSAGE") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-blue-500/20" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isDeletable && (
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-2xl">
            <span className="text-white text-xs font-bold">Supprimer</span>
          </div>
        )}
        <Link
          href={notification.actionUrl || "/customer/messages"}
          className={`block p-4 rounded-2xl border-l-4 ${config.borderColor} ${
            !notification.isRead ? config.bgColor : "bg-white"
          } hover:shadow-md transition-all`}
          onClick={(e) => {
            if (!notification.isRead) {
              e.preventDefault();
              onMarkAsRead(notification.id);
              window.location.href =
                notification.actionUrl || "/customer/messages";
            }
          }}
        >
          <div className="flex gap-3">
            <div className="relative shrink-0">
              {notification.imageUrl ? (
                <img
                  src={notification.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}
                >
                  <MessageCircle className={`w-6 h-6 ${config.iconColor}`} />
                </div>
              )}
              {!notification.isRead && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4
                  className={`font-bold text-sm ${!notification.isRead ? "text-[#191c1b]" : "text-slate-600"}`}
                >
                  {notification.title}
                </h4>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">
                {notification.body}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">
                  Ouvrir la conversation
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Special PROMOTION card (bento style)
  if (notification.type === "PROMOTION") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-[#feb700]/30" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isDeletable && (
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-2xl z-10">
            <span className="text-white text-xs font-bold">Supprimer</span>
          </div>
        )}
        <div
          className={`p-5 rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} cursor-pointer hover:shadow-lg transition-all`}
          onClick={handleClick}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-lg ${config.accentColor} flex items-center justify-center shrink-0`}
            >
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-[#271900]">
                  {notification.title}
                </h4>
                <span className="text-[10px] text-[#7c5800]/60 font-medium whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-[#6b4b00]">{notification.body}</p>
              {notification.data &&
                "code" in notification.data &&
                typeof notification.data.code === "string" && (
                  <div className="mt-2 inline-block px-3 py-1 bg-white/60 rounded-lg">
                    <span className="text-xs font-bold text-[#7c5800]">
                      Code: {notification.data.code}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special DELIVERY_IN_PROGRESS card
  if (notification.type === "DELIVERY_IN_PROGRESS") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-[#00503a]/20" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isDeletable && (
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-2xl z-10">
            <span className="text-white text-xs font-bold">Supprimer</span>
          </div>
        )}
        <div
          className={`p-5 rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} cursor-pointer hover:shadow-lg transition-all`}
          onClick={handleClick}
        >
          <div className="flex gap-4">
            <div className="relative shrink-0">
              <div
                className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center border-2 border-[#00503a]/20`}
              >
                <Truck className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00503a] rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-[#002116]">
                  {notification.title}
                </h4>
                <span className="text-xs text-[#00503a] font-medium whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-[#3f4944] mb-3">{notification.body}</p>
              <Link
                href={notification.actionUrl || "/customer/orders/track"}
                className="inline-flex items-center gap-2 bg-[#feb700] text-[#271900] px-4 py-2 rounded-lg text-xs font-bold hover:scale-[1.02] transition-transform shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                SUIVRE SUR LA CARTE
                <MapPin className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special WELCOME card
  if (notification.type === "WELCOME") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-[#00503a]/20" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isDeletable && (
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-2xl z-10">
            <span className="text-white text-xs font-bold">Supprimer</span>
          </div>
        )}
        <div
          className="p-5 rounded-2xl bg-gradient-to-br from-[#00503a] to-[#006a4e] text-white cursor-pointer hover:shadow-lg transition-all"
          onClick={handleClick}
        >
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-lg text-white">
                  {notification.title}
                </h4>
                <span className="text-[10px] text-white/70 whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-white/90">{notification.body}</p>
              {notification.actionUrl && (
                <Link
                  href={notification.actionUrl}
                  className="inline-flex items-center gap-2 mt-3 bg-white text-[#00503a] px-4 py-2 rounded-lg text-xs font-bold hover:scale-[1.02] transition-transform shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  Créer une livraison
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special ADMIN_ANNOUNCEMENT card
  if (notification.type === "ADMIN_ANNOUNCEMENT") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-[#00503a]/20" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isDeletable && (
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-2xl z-10">
            <span className="text-white text-xs font-bold">Supprimer</span>
          </div>
        )}
        <div
          className={`p-5 rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} cursor-pointer hover:shadow-md transition-all`}
          onClick={handleClick}
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#00503a]/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#00503a]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#191c1b]">
                    {notification.title}
                  </h4>
                  <span className="px-2 py-0.5 bg-[#00503a] text-white text-[10px] font-bold rounded uppercase">
                    Annonce
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{notification.body}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special MAINTENANCE card
  if (notification.type === "MAINTENANCE") {
    return (
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl transition-all ${
          !notification.isRead ? "ring-2 ring-slate-300" : ""
        }`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Maintenance notifications cannot be deleted */}
        <div
          className={`p-5 rounded-2xl border-l-4 ${config.borderColor} ${config.bgColor} cursor-pointer hover:shadow-md transition-all`}
          onClick={handleClick}
        >
          <div className="flex gap-4">
            <div
              className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center shrink-0 border-2 border-slate-200`}
            >
              <Wrench className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#191c1b]">
                    {notification.title}
                  </h4>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">
                    Maintenance
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{notification.body}</p>
              {notification.expiresAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Fin prévue:{" "}
                  {new Date(notification.expiresAt).toLocaleString("fr-CM")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard notification card
  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl transition-all ${
        !notification.isRead ? "ring-2 ring-[#00503a]/10" : ""
      }`}
      style={{ transform: `translateX(${swipeX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isDeletable && swipeX < 0 && (
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-end pr-4 rounded-r-xl">
          <span className="text-white text-xs font-bold">Supprimer</span>
        </div>
      )}
      <div
        className={`p-4 rounded-xl border-l-4 ${
          !notification.isRead ? config.borderColor : "border-l-transparent"
        } ${!notification.isRead ? config.bgColor : "bg-white"} ${
          notification.actionUrl ? "cursor-pointer hover:shadow-sm" : ""
        } transition-all`}
        onClick={handleClick}
      >
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            {!notification.isRead && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00503a] rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h4
                className={`font-bold text-sm ${!notification.isRead ? "text-[#191c1b]" : "text-slate-600"}`}
              >
                {notification.title}
              </h4>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {formatTime(notification.createdAt)}
              </span>
            </div>
            <p
              className={`text-sm ${!notification.isRead ? "text-slate-700" : "text-slate-500"}`}
            >
              {notification.body}
            </p>
            {notification.actionUrl && (
              <div className="mt-2 flex items-center gap-1">
                <ChevronRight className={`w-4 h-4 ${config.iconColor}`} />
                <span className={`text-xs font-medium ${config.iconColor}`}>
                  {notification.type.includes("ORDER")
                    ? "Voir les détails"
                    : notification.type.includes("PAYMENT")
                      ? "Voir le paiement"
                      : "Voir plus"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Notifications Page ───────────────────────────────

export default function CustomerNotificationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    meta,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();
  const { permission, requestPermission } = usePushNotifications();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.4;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Track notification count changes and play sound for new ones
  useEffect(() => {
    if (
      prevCountRef.current > 0 &&
      notifications.length > prevCountRef.current
    ) {
      const newCount = notifications.length - prevCountRef.current;
      if (newCount > 0) {
        playNotificationSound();
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications.length, playNotificationSound]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta.hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [meta.hasMore, isLoadingMore, loadMore]);

  // Poll for new notifications every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification supprimée");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de supprimer";
      toast.error(message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success("Toutes les notifications ont été lues");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const grouped = groupByDate(notifications);

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 pb-28 md:pb-24 max-w-4xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#00503a] tracking-tight">
                Centre de Notifications
              </h1>
              <p className="text-sm text-[#3f4944] mt-1 max-w-lg">
                Restez informé de l&apos;état de vos livraisons et des dernières
                actualités de TARA Delivery
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Push notification permission */}
              {permission === "default" && (
                <button
                  onClick={requestPermission}
                  className="flex items-center gap-2 text-xs font-bold text-[#00503a] hover:text-[#006a4e] px-3 py-2 rounded-lg bg-[#9ef4d0]/30 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Activer les alertes</span>
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 text-xs font-bold text-[#00503a] hover:text-[#006a4e] px-3 py-2 rounded-lg bg-[#9ef4d0]/30 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Tout marquer comme lu
                  </span>
                  <span className="sm:hidden">Tout lire</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#00503a] animate-spin mb-4" />
              <p className="text-sm text-slate-500">
                Chargement des notifications...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm">
              <div className="w-20 h-20 rounded-full bg-[#9ef4d0]/30 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-[#00503a]" />
              </div>
              <h3 className="font-bold text-lg text-[#191c1b] mb-2">
                Aucune notification
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-xs px-4">
                Vous n&apos;avez pas encore de notifications. Elles apparaîtront
                ici lorsque vous aurez de l&apos;activité.
              </p>
              <button
                onClick={() => fetchNotifications(true)}
                className="mt-4 text-xs text-[#00503a] font-medium hover:underline"
              >
                Actualiser
              </button>
            </div>
          )}

          {/* Notifications List */}
          {notifications.length > 0 && (
            <div className="space-y-6">
              {/* Today */}
              {grouped.today.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-3 px-1">
                    Aujourd&apos;hui
                  </h3>
                  <div className="space-y-3">
                    {grouped.today.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={handleDelete}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {grouped.yesterday.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-3 px-1">
                    Hier
                  </h3>
                  <div className="space-y-3">
                    {grouped.yesterday.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={handleDelete}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older */}
              {grouped.older.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6f7a73] mb-3 px-1">
                    Plus ancien
                  </h3>
                  <div className="space-y-3">
                    {grouped.older.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={handleDelete}
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="h-4">
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-[#00503a] animate-spin mr-2" />
                    <span className="text-sm text-slate-500">
                      Chargement...
                    </span>
                  </div>
                )}
                {meta.hasMore && !isLoadingMore && (
                  <button
                    onClick={loadMore}
                    className="w-full text-center text-sm text-[#00503a] font-medium py-3 hover:bg-[#9ef4d0]/10 rounded-lg transition-colors"
                  >
                    Voir plus de notifications
                  </button>
                )}
                {!meta.hasMore && notifications.length > 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">
                    {meta.total} notification{meta.total > 1 ? "s" : ""} au
                    total
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <PageFooter />
      <MobileNav />
    </div>
  );
}
