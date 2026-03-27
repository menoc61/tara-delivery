"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MessageCircle,
  User,
  Send,
  Phone,
  Mail,
} from "lucide-react";
import { ordersApi } from "@/lib/api-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  riderId: string;
  riderName: string;
  orderId: string;
  orderNumber: string;
  messages: Message[];
}

export default function CustomerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    ordersApi
      .getMyOrders({ limit: 20 })
      .then((r) => {
        const orders: Record<string, unknown>[] = r.data.data.items || [];
        const convs: Conversation[] = orders
          .filter((o: Record<string, unknown>) => o.riderId)
          .map((o: Record<string, unknown>) => ({
            id: o.id as string,
            riderId: ((o.rider as Record<string, unknown>)?.id as string) || "",
            riderName:
              ((o.rider as Record<string, unknown>)?.name as string) ||
              "Livreur",
            orderId: o.id as string,
            orderNumber: o.orderNumber as string,
            messages: [],
          }));
        setConversations(convs);
        if (convs.length > 0) setSelectedConv(convs[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    alert("Chat feature - will integrate with real-time messaging");
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/customer"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Messages
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 flex h-[calc(100vh-140px)]">
        <div className="w-1/3 border-r border-outline-var/15 pr-2 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-on-sur-var">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-on-sur-var">
              Aucune conversation
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedConv === conv.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-sur-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">
                      {conv.riderName}
                    </p>
                    <p className="text-xs text-on-sur-var">
                      {conv.orderNumber}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex-1 flex flex-col pl-4">
          {selectedConv ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                <div className="text-center text-sm text-on-sur-var py-4">
                  Messages avec{" "}
                  {conversations.find((c) => c.id === selectedConv)?.riderName}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-outline-var/15">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez un message..."
                  className="input flex-1"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="btn-primary px-4">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-on-sur-var">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="card p-4 space-y-2">
          <p className="text-sm font-medium text-on-surface mb-2">
            Contact rapide
          </p>
          <a
            href="tel:+2376XXXXXXX"
            className="flex items-center gap-2 text-sm text-on-sur-var hover:text-primary"
          >
            <Phone className="w-4 h-4" /> +237 6XX XXX XXX
          </a>
          <a
            href="mailto:support@tara-delivery.cm"
            className="flex items-center gap-2 text-sm text-on-sur-var hover:text-primary"
          >
            <Mail className="w-4 h-4" /> support@tara-delivery.cm
          </a>
        </div>
      </div>
    </div>
  );
}
