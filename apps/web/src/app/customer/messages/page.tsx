"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  Search,
  Send,
  Plus,
  Image,
  Phone,
  Info,
  MapPin,
  MessageCircle,
  Headphones,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/lib/api-client";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "image" | "location";
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  type: "rider" | "support";
  name: string;
  avatar?: string;
  orderId?: string;
  orderNumber?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export default function CustomerMessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dummy conversations for display
  const dummyConversations: Conversation[] = [
    {
      id: "1",
      type: "rider",
      name: "Jean-Paul (Coursier)",
      orderId: "1",
      orderNumber: "#TR-9921",
      lastMessage: "Je suis devant l'immeuble...",
      lastMessageTime: "12:45",
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: "1",
          senderId: "rider1",
          senderName: "Jean-Paul",
          content:
            "Bonjour ! Je suis en route pour récupérer votre colis à Bastos. Je devrais être là dans 10 minutes.",
          type: "text",
          timestamp: "12:30",
          isRead: true,
        },
        {
          id: "2",
          senderId: "customer1",
          senderName: user?.name || "Vous",
          content:
            "Parfait Jean-Paul. Le code d'entrée est le 2408. Je vous attends devant le portail noir.",
          type: "text",
          timestamp: "12:32",
          isRead: true,
        },
        {
          id: "3",
          senderId: "rider1",
          senderName: "Jean-Paul",
          content: "C'est bien ce colis à livrer ?",
          type: "image",
          timestamp: "12:40",
          isRead: true,
        },
        {
          id: "4",
          senderId: "customer1",
          senderName: user?.name || "Vous",
          content: "Ma position exacte pour vous aider.",
          type: "location",
          timestamp: "12:43",
          isRead: true,
        },
        {
          id: "5",
          senderId: "rider1",
          senderName: "Jean-Paul",
          content: "Entendu, je suis devant l'immeuble avec le portail noir.",
          type: "text",
          timestamp: "12:45",
          isRead: true,
        },
      ],
    },
    {
      id: "2",
      type: "support",
      name: "Support Tara",
      lastMessage: "Votre ticket #829 est résolu.",
      lastMessageTime: "Hier",
      unreadCount: 1,
      isOnline: true,
      messages: [
        {
          id: "1",
          senderId: "support1",
          senderName: "Support Tara",
          content: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?",
          type: "text",
          timestamp: "Hier, 14:30",
          isRead: true,
        },
        {
          id: "2",
          senderId: "customer1",
          senderName: user?.name || "Vous",
          content: "J'ai un problème avec ma livraison #TR-8921.",
          type: "text",
          timestamp: "Hier, 14:32",
          isRead: true,
        },
        {
          id: "3",
          senderId: "support1",
          senderName: "Support Tara",
          content: "Votre ticket #829 est résolu.",
          type: "text",
          timestamp: "Hier, 15:00",
          isRead: false,
        },
      ],
    },
    {
      id: "3",
      type: "rider",
      name: "Marie-Noëlle",
      lastMessage: "Merci pour la livraison rapide !",
      lastMessageTime: "Lun",
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: "1",
          senderId: "rider2",
          senderName: "Marie-Noëlle",
          content: "Votre colis est arrivé avec succès !",
          type: "text",
          timestamp: "Lun, 16:45",
          isRead: true,
        },
        {
          id: "2",
          senderId: "customer1",
          senderName: user?.name || "Vous",
          content: "Merci pour la livraison rapide !",
          type: "text",
          timestamp: "Lun, 16:50",
          isRead: true,
        },
      ],
    },
  ];

  useEffect(() => {
    // Load conversations
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => {
        const orders: Record<string, unknown>[] = r.data.data.items || [];
        // Create conversations from orders with riders
        setConversations(dummyConversations);
        if (dummyConversations.length > 0) {
          setSelectedConv(dummyConversations[0].id);
        }
      })
      .catch(() => {
        setConversations(dummyConversations);
        if (dummyConversations.length > 0) {
          setSelectedConv(dummyConversations[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedConversation = conversations.find((c) => c.id === selectedConv);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "customer1",
      senderName: user?.name || "Vous",
      content: newMessage,
      type: "text",
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConv
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMessage,
              lastMessageTime: "À l'instant",
            }
          : conv,
      ),
    );
    setNewMessage("");

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header title="Messages" />

      <div className="flex h-screen pt-20 overflow-hidden">
        <Sidebar />

        {/* Main Content: Message Center */}
        <main className="flex-1 flex overflow-hidden bg-white">
          {/* Conversations List */}
          <section className="w-full md:w-80 lg:w-96 flex flex-col border-r-0 bg-[#f2f4f2] border-none">
            <div className="p-6">
              <h1 className="text-2xl font-extrabold mb-4 tracking-tight">
                Messages
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7a73] w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-[#00503a] shadow-sm text-sm"
                  placeholder="Rechercher une discussion..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
              {loading ? (
                <div className="text-center py-8 text-[#6f7a73]">
                  Chargement...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-[#6f7a73]">
                  Aucune conversation
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`p-4 rounded-2xl flex gap-4 cursor-pointer transition-colors ${
                      selectedConv === conv.id
                        ? "bg-[#9ef4d0]"
                        : "hover:bg-[#e7e9e6]"
                    }`}
                  >
                    <div className="relative">
                      {conv.type === "rider" ? (
                        <div className="w-12 h-12 rounded-full bg-[#00503a]/10 flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#00503a]" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#feb700] flex items-center justify-center text-[#271900]">
                          <Headphones className="w-6 h-6" />
                        </div>
                      )}
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3
                          className={`font-bold truncate ${selectedConv === conv.id ? "text-[#002116]" : "text-[#191c1b]"}`}
                        >
                          {conv.name}
                        </h3>
                        <span
                          className={`text-[10px] ${selectedConv === conv.id ? "text-[#002116] opacity-60" : "text-[#6f7a73]"}`}
                        >
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${selectedConv === conv.id ? "text-[#00503a] font-semibold" : "text-[#6f7a73]"}`}
                      >
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-[#7c5800] self-center"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Chat Window */}
          <section className="hidden md:flex flex-1 flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="h-20 px-8 flex items-center justify-between border-b-0 bg-white">
                  <div className="flex items-center gap-4">
                    {selectedConversation.type === "rider" ? (
                      <div className="w-10 h-10 rounded-full bg-[#00503a]/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#00503a]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#feb700] flex items-center justify-center text-[#271900]">
                        <Headphones className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-bold text-[#191c1b] leading-tight">
                        {selectedConversation.name}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        {selectedConversation.isOnline && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-[#6f7a73]">
                          {selectedConversation.isOnline
                            ? "En ligne"
                            : "Hors ligne"}
                          {selectedConversation.orderNumber &&
                            ` • Commande ${selectedConversation.orderNumber}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#f2f4f2] rounded-lg text-[#00503a] transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-[#f2f4f2] rounded-lg text-[#00503a] transition-all">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Canvas */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8faf7]/50">
                  <div className="flex justify-center">
                    <span className="px-4 py-1 bg-[#e7e9e6] rounded-full text-[10px] font-bold text-[#6f7a73] uppercase tracking-wider">
                      Aujourd'hui
                    </span>
                  </div>

                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 max-w-[80%] ${
                        message.senderId === "customer1"
                          ? "ml-auto flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            message.senderId === "customer1"
                              ? "bg-[#006a4e] text-white rounded-tr-none"
                              : "bg-white text-[#191c1b] rounded-tl-none"
                          }`}
                        >
                          {message.type === "image" ? (
                            <div className="space-y-2">
                              <div className="w-full h-48 bg-[#e1e3e1] rounded-xl flex items-center justify-center">
                                <Image className="w-12 h-12 text-[#6f7a73]" />
                              </div>
                              <p
                                className={
                                  message.senderId === "customer1"
                                    ? "text-white"
                                    : "text-[#191c1b]"
                                }
                              >
                                {message.content}
                              </p>
                            </div>
                          ) : message.type === "location" ? (
                            <div className="space-y-2 overflow-hidden">
                              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#00503a]">
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                  <MapPin className="w-12 h-12 text-[#feb700]" />
                                </div>
                              </div>
                              <p
                                className={
                                  message.senderId === "customer1"
                                    ? "text-white"
                                    : "text-[#191c1b]"
                                }
                              >
                                {message.content}
                              </p>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        <span
                          className={`text-[10px] text-[#6f7a73] mt-1 block px-1 ${
                            message.senderId === "customer1" ? "text-right" : ""
                          }`}
                        >
                          {message.timestamp}
                          {message.senderId === "customer1" &&
                            message.isRead &&
                            " • Lu"}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white">
                  <div className="bg-[#f2f4f2] rounded-2xl p-2 flex items-end gap-2">
                    <div className="flex items-center">
                      <button className="p-3 text-[#6f7a73] hover:text-[#00503a] transition-colors">
                        <Plus className="w-6 h-6" />
                      </button>
                      <button className="p-3 text-[#6f7a73] hover:text-[#00503a] transition-colors">
                        <Image className="w-6 h-6" />
                      </button>
                    </div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none max-h-32"
                      placeholder="Écrivez votre message..."
                      rows={1}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#006a4e] text-white p-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#6f7a73]">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
