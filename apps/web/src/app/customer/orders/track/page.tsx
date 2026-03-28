"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  MapPin,
  CheckCircle,
  Phone,
  MessageCircle,
  Send,
  Plus,
  Minus,
  Locate,
  Star,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";

const statusSteps = [
  { key: "CONFIRMED", label: "Commande confirmée", time: "14:10" },
  { key: "PICKED_UP", label: "Colis récupéré", time: "14:25" },
  {
    key: "IN_TRANSIT",
    label: "En cours de livraison",
    time: "En route",
    current: true,
  },
  { key: "DELIVERED", label: "Livré", time: "Prévu à 14:45" },
];

const demoMessages = [
  {
    from: "rider",
    text: "Bonjour ! J'ai bien récupéré votre colis au point A. Je suis actuellement en route vers votre position à Bastos.",
    time: "14:26",
  },
  {
    from: "user",
    text: "Super, merci ! Vous pouvez laisser le colis à la réception si je ne réponds pas.",
    time: "14:28",
  },
  { from: "rider", text: "C'est noté, à tout de suite ! 👍", time: "14:29" },
];

export default function LiveTrackingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(demoMessages);

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => {
        const allOrders = r.data.data.items || [];
        const active = allOrders.find(
          (o: Record<string, unknown>) =>
            !["DELIVERED", "CANCELLED", "FAILED"].includes(o.status as string),
        );
        setActiveOrder(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      {
        from: "user",
        text: message,
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessage("");
  };

  const etaMinutes = 12;

  return (
    <div className="h-screen flex flex-col bg-[#f8faf7]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 h-20 max-w-screen-2xl mx-auto w-full relative">
          <div className="flex items-center gap-8">
            <Link href="/customer">
              <span className="text-2xl font-black tracking-tighter text-emerald-900">
                TARA DELIVERY
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/customer/orders/track"
                className="text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1 text-sm"
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
                href="/customer/new-order"
                className="text-slate-600 hover:text-emerald-800 transition-colors text-sm font-medium"
              >
                Nouvelle livraison
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600">
              <Bell className="w-5 h-5" />
            </button>
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
          </div>
          <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 left-0"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 relative flex overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[#e8f5e9] flex items-center justify-center">
            <div className="text-center text-[#00503a]/30">
              <MapPin className="w-16 h-16 mx-auto mb-2" />
              <p className="text-lg font-medium">Carte de Yaoundé</p>
              <p className="text-sm">Zenith API - Live Tracking</p>
            </div>
          </div>
          {/* Route Line SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 1000 1000"
          >
            <path
              className="opacity-80"
              d="M 200,800 Q 400,600 500,450 T 800,200"
              fill="none"
              stroke="#00503a"
              strokeDasharray="12,8"
              strokeWidth="6"
            ></path>
            <circle cx="200" cy="800" fill="#00503a" r="10"></circle>
            <circle cx="800" cy="200" fill="#7c5800" r="10"></circle>
            <g transform="translate(500,450)">
              <circle
                className="animate-pulse opacity-20"
                fill="#00503a"
                r="24"
              ></circle>
              <circle fill="#00503a" r="12"></circle>
              <text
                fill="#00503a"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                y="-20"
              >
                Moussa (Rider)
              </text>
            </g>
          </svg>
        </div>

        {/* Left: Status Panel */}
        <div className="absolute top-8 left-8 z-20 w-80 flex flex-col gap-4">
          {/* ETA Card */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#00503a]">
                Arrivée prévue
              </h2>
              <span className="bg-[#feb700] text-[#271900] px-3 py-1 rounded-full text-xs font-bold">
                LIVE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-[#191c1b]">
                {etaMinutes}
              </span>
              <span className="text-xl font-bold text-[#191c1b]">min</span>
            </div>
            <p className="text-sm text-[#3f4944] mb-6">
              En route depuis Bastos
            </p>

            {/* Status Timeline */}
            <div className="space-y-6">
              {statusSteps.map((step, idx) => (
                <div
                  key={step.key}
                  className={`relative flex gap-4 ${step.current ? "" : idx === 0 ? "" : "opacity-40"}`}
                >
                  {idx > 0 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#00503a]/20"></div>
                  )}
                  <div
                    className={`z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                      step.current
                        ? "bg-[#00503a] border-4 border-white"
                        : "bg-[#00503a] text-white"
                    }`}
                  >
                    {step.current ? (
                      <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${step.current ? "text-[#00503a]" : "text-[#191c1b]"}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-[#3f4944]">
                      {step.current ? step.time : step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rider Info Card */}
          <div className="bg-[#e1e3e1] p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0WZi0ustgPeUw0LDfFKgxyqY1_XVbbkM4k8nrjMLLSjgc58go_Te3tukVsTz3CvNZu15k8sZfwLKc3qZDJHjQDd3R-Qc9A8g683LqHzcuQeyuG1vLI_QE46wKzkDoK_KQ6SRr3jRHWYO_dTazEHTYAbxwGyYPWXs3wB4QU69GLpYRJpQ8POIvPhxhTwwKLxvOPkdZa0zju2IrkFWJlVvB4M5cshhRpMIcf3gzS_224bRfHUBe9FkjZln1kn9xaSc5mP9Oq4CRzrI"
                alt="Rider"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <p className="font-bold text-[#191c1b]">Moussa Diop</p>
              <div className="flex items-center gap-1 text-xs text-[#7c5800] font-bold">
                <Star className="w-3 h-3 fill-current" />
                4.9 (1.2k+ livraisons)
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#00503a] shadow-sm hover:bg-[#9ef4d0] transition-all">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="absolute bottom-8 right-8 z-20 w-[400px] flex flex-col h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden border-none">
          {/* Chat Header */}
          <div className="bg-[#00503a] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-[#00503a] overflow-hidden bg-white/20">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6ahJ3wLNZSVSGbLN-OUyGakX19eKM-ZRvQqjurkVASLesh2zDANCRip-vJOZvQbydxusw4JnL4jEDRLrPQdOWnQgb0x8ZLFQ2DBlScGWyobPGaLPWpDNYXso_UyVHJS2DZN9JNjMBYsVDL4ksFj3kIc-k5azZtuID1MeHIxkhHUwQOjmBZ53o6dA1lBL4EZo3hOqqLQzH2wBYPpovz8UQCa81noqxPWYNaL5AcdBugLv1BzQ5BXmDxMEgYS1CuMJ1I7lIoEBnWn4"
                    alt="Rider"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#00503a] rounded-full"></div>
              </div>
              <div>
                <p className="font-bold leading-tight">Moussa Diop</p>
                <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold">
                  Livreur en ligne
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-[#f2f4f2]">
            <div className="flex justify-center">
              <span className="text-[10px] bg-[#bec9c2]/20 px-3 py-1 rounded-full text-[#3f4944] font-bold uppercase tracking-widest">
                Aujourd'hui
              </span>
            </div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                  msg.from === "rider"
                    ? "bg-white rounded-tl-none"
                    : "bg-[#00503a] text-white rounded-tr-none self-end"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-[10px] text-right mt-1 ${msg.from === "rider" ? "text-[#3f4944]" : "text-[#92e7c3]"}`}
                >
                  {msg.time}
                </p>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 opacity-60">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3f4944] animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3f4944] animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#3f4944] animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="text-[10px] font-medium ml-1">
                Moussa écrit...
              </span>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3 bg-[#f2f4f2] rounded-xl px-4 py-2">
              <button className="text-[#3f4944] hover:text-[#00503a] transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm flex-grow font-medium py-2"
                placeholder="Écrire un message..."
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#00503a] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#006a4e] active:scale-90 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-8 left-8 z-20 flex flex-col gap-2">
          <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#00503a] hover:bg-[#9ef4d0] transition-colors">
            <Locate className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#3f4944] hover:bg-[#f2f4f2] transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#3f4944] hover:bg-[#f2f4f2] transition-colors">
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 relative z-40">
        <div className="bg-emerald-900/5 h-px"></div>
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-4 w-full gap-4 max-w-screen-2xl mx-auto">
          <p className="text-xs text-slate-500">
            © 2026 TARA DELIVERY. Logistique de précision au cœur de Yaoundé.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Conditions Générales
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Confidentialité
            </Link>
            <Link
              href="/contact"
              className="text-xs text-slate-500 hover:text-emerald-700"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
