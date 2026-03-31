"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Send,
  Phone,
  User,
  ArrowLeft,
  MessageCircle,
  Package,
  MapPin,
  Headphones,
  Mic,
  Image as ImageIcon,
  Smile,
  MoreVertical,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { chatApi, ordersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: string;
  imageUrl?: string;
  locationLat?: number;
  locationLng?: number;
  createdAt: string;
  sender?: { id: string; name: string; avatar?: string };
}

interface Conversation {
  id: string;
  type: string;
  user1Id: string;
  user2Id: string;
  orderId?: string;
  order?: { id: string; orderNumber: string; status: string };
  otherUser?: { id: string; name: string; avatar?: string };
  unreadCount: number;
  lastMessage?: Message;
  lastMessageAt?: string;
  user1?: { id: string; name: string; avatar?: string };
  user2?: { id: string; name: string; avatar?: string };
}

function ChatContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatApi.getConversations();
        setConversations(res.data.data || []);

        // Auto-select conversation if orderId provided
        if (orderIdParam) {
          const existing = (res.data.data || []).find(
            (c: Conversation) => c.orderId === orderIdParam,
          );
          if (existing) {
            setSelectedConvId(existing.id);
          } else {
            // Create new conversation for this order
            try {
              const convRes = await chatApi.getRiderConversation(orderIdParam);
              if (convRes.data.data) {
                setConversations((prev) => [convRes.data.data, ...prev]);
                setSelectedConvId(convRes.data.data.id);
              }
            } catch {
              toast("Pas de livreur assigné à cette commande", { icon: "ℹ️" });
            }
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [orderIdParam]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await chatApi.getMessages(selectedConvId);
        setMessages(res.data.data?.messages || []);

        // Mark as read
        await chatApi.markAsRead(selectedConvId);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await chatApi.sendMessage(selectedConvId, {
        content: newMessage,
        type: "TEXT",
      });

      const sentMessage = res.data.data;
      setMessages((prev) => [...prev, sentMessage]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                lastMessage: sentMessage,
                lastMessageAt: sentMessage.createdAt,
              }
            : c,
        ),
      );
      setNewMessage("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleShareLocation = async () => {
    if (!selectedConvId) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await chatApi.sendMessage(selectedConvId, {
              content: `📍 Position partagée: https://maps.google.com/?q=${latitude},${longitude}`,
              type: "LOCATION",
              locationLat: latitude,
              locationLng: longitude,
            });
            setMessages((prev) => [...prev, res.data.data]);
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        },
        () => toast.error("Impossible d'accéder à la position"),
      );
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const otherUser =
    selectedConv?.otherUser || selectedConv?.user1?.id === user?.id
      ? selectedConv?.user2
      : selectedConv?.user1;

  const filteredConversations = searchQuery
    ? conversations.filter((c) => {
        const name = (
          c.otherUser?.name ||
          c.user1?.name ||
          c.user2?.name ||
          ""
        ).toLowerCase();
        const orderNum = (c.order?.orderNumber || "").toLowerCase();
        return (
          name.includes(searchQuery.toLowerCase()) ||
          orderNum.includes(searchQuery.toLowerCase())
        );
      })
    : conversations;

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-5rem)]">
      {/* Conversation List */}
      <div
        className={`${
          selectedConvId ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#00503a] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f2f4f2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20"
            />
          </div>
        </div>

        {/* Support Button */}
        <button
          onClick={async () => {
            try {
              const res = await chatApi.getSupportConversation();
              const conv = res.data.data;
              setConversations((prev) => {
                if (prev.find((c) => c.id === conv.id)) return prev;
                return [conv, ...prev];
              });
              setSelectedConvId(conv.id);
            } catch (err) {
              toast.error(getErrorMessage(err));
            }
          }}
          className="m-3 flex items-center gap-3 p-3 bg-[#00503a]/5 rounded-xl hover:bg-[#00503a]/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#00503a] flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm text-[#00503a]">Support TARA</p>
            <p className="text-xs text-slate-500">
              Contactez le support client
            </p>
          </div>
        </button>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const displayUser =
                conv.otherUser ||
                (conv.user1Id === user?.id ? conv.user2 : conv.user1);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-[#f2f4f2]/50 transition-colors text-left ${
                    selectedConvId === conv.id ? "bg-[#9ef4d0]/20" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#00503a]/10 flex items-center justify-center overflow-hidden">
                      {displayUser?.avatar ? (
                        <img
                          src={displayUser.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#00503a]" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-sm text-[#191c1b] truncate">
                        {displayUser?.name || "Utilisateur"}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString(
                              "fr-CM",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </span>
                    </div>
                    {conv.order?.orderNumber && (
                      <p className="text-xs text-[#00503a] font-medium mb-0.5">
                        {conv.order.orderNumber}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 truncate">
                      {conv.lastMessage?.content || "Pas de messages"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#00503a] text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`${
          selectedConvId ? "flex" : "hidden md:flex"
        } flex-col flex-1 bg-[#f8faf7]`}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
              <button
                onClick={() => setSelectedConvId(null)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#00503a]/10 flex items-center justify-center overflow-hidden">
                {otherUser?.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#00503a]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  {otherUser?.name || "Utilisateur"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedConv.order?.orderNumber || "Support"}
                </p>
              </div>
              {selectedConv.orderId && (
                <Link
                  href={`/customer/orders/${selectedConv.orderId}`}
                  className="p-2 rounded-full bg-slate-100 text-slate-600"
                >
                  <Package className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.senderId === user?.id
                        ? "bg-[#00503a] text-white rounded-br-md"
                        : "bg-white text-[#191c1b] rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.type === "LOCATION" ? (
                      <a
                        href={msg.content.split(": ").pop()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-200 hover:underline"
                      >
                        <MapPin className="w-4 h-4" />
                        Voir la position
                      </a>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.senderId === user?.id
                          ? "text-white/50"
                          : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("fr-CM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp-style Input Bar */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                {/* Attachment Button */}
                <div className="relative">
                  <button
                    onClick={handleShareLocation}
                    className="p-2 rounded-full bg-[#f2f4f2] text-slate-500 hover:bg-[#e7e9e6] transition-colors"
                    title="Partager position"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Button */}
                <button
                  onClick={() =>
                    toast("Envoi d'images bientôt disponible", { icon: "📷" })
                  }
                  className="p-2 rounded-full bg-[#f2f4f2] text-slate-500 hover:bg-[#e7e9e6] transition-colors"
                  title="Envoyer image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Text Input */}
                <div className="flex-1 flex items-center bg-[#f2f4f2] rounded-full">
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Votre message..."
                    className="flex-1 bg-transparent py-2 text-sm focus:outline-none"
                  />
                </div>

                {/* Send/Voice Button */}
                {newMessage.trim() ? (
                  <button
                    onClick={handleSend}
                    disabled={sendingMessage}
                    className="w-10 h-10 bg-[#00503a] text-white rounded-full flex items-center justify-center hover:bg-[#006a4e] transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="w-10 h-10 bg-[#00503a] text-white rounded-full flex items-center justify-center hover:bg-[#006a4e] transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-[#9ef4d0]/30 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#00503a]" />
            </div>
            <h3 className="font-bold text-lg text-[#191c1b] mb-2">
              Centre de Messages
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              Sélectionnez une conversation pour commencer à discuter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerMessagesPage() {
  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header />
      <div className="flex pt-20">
        <Sidebar />
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#00503a] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ChatContent />
        </Suspense>
      </div>
      <MobileNav />
    </div>
  );
}
