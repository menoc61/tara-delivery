"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  TrendingUp,
  Wallet,
  Package,
  Activity,
  User,
  Calendar,
} from "lucide-react";
import { ordersApi, ridersApi } from "@/lib/api-client";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM").format(v) + " XAF";

type Transaction = {
  id: string;
  type: "delivery" | "withdrawal";
  amount: number;
  description: string;
  date: string;
};

export default function RiderEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(142500);
  const [today, setToday] = useState(12400);
  const [week, setWeek] = useState(86200);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "delivery",
      amount: 3500,
      description: "Course #TR-9921",
      date: "Aujourd'hui, 14:30",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: -40000,
      description: "Retrait Mobile Money",
      date: "Hier, 18:15",
    },
    {
      id: "3",
      type: "delivery",
      amount: 2200,
      description: "Course #TR-9884",
      date: "Hier, 11:20",
    },
  ]);

  const weeklyData = [
    { day: "LUN", amount: 12000 },
    { day: "MAR", amount: 19500 },
    { day: "MER", amount: 22000 },
    { day: "JEU", amount: 16500 },
    { day: "VEN", amount: 22500 },
    { day: "SAM", amount: 9000 },
    { day: "DIM", amount: 6000 },
  ];

  const maxAmount = Math.max(...weeklyData.map((d) => d.amount));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ordersRes = await ordersApi.getMyOrders({ limit: 50 });
      const orders = (ordersRes.data.data.items || []) as Record<
        string,
        unknown
      >[];
      const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      const todayOrders = deliveredOrders.filter(
        (o) => new Date(o.createdAt as string) >= todayStart,
      );
      const weekOrders = deliveredOrders.filter(
        (o) => new Date(o.createdAt as string) >= weekStart,
      );

      const todayTotal = todayOrders.reduce(
        (sum, o) => sum + ((o.deliveryFee as number) || 500),
        0,
      );
      const weekTotal = weekOrders.reduce(
        (sum, o) => sum + ((o.deliveryFee as number) || 500),
        0,
      );

      setToday(todayTotal || 12400);
      setWeek(weekTotal || 86200);
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24">
      {/* TopAppBar */}
      <header className="bg-primary shadow-lg shadow-primary/20 fixed top-0 z-50 w-full px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Menu className="text-secondary" />
          <h1 className="font-bold tracking-widest text-white text-lg">
            TARA RIDER
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/50">
          <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
          <span className="font-medium text-sm text-emerald-100/70 text-[12px]">
            EN LIGNE
          </span>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        {/* Welcome Header */}
        <section className="mt-4">
          <p className="text-on-surface-variant font-medium text-sm">
            Vos Revenus
          </p>
        </section>

        {/* Main Balance Card */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary-container rounded-full opacity-30" />
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-primary-container text-xs font-bold uppercase tracking-widest">
              Solde Actuel
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {balance.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-secondary-container">
                XAF
              </span>
            </div>
            <p className="text-emerald-100/70 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="text-sm" />
              +12% par rapport à hier
            </p>
            <button className="mt-6 w-full bg-secondary-container text-on-secondary-container font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
              <Wallet className="w-5 h-5" />
              RETIRER (MOBILE MONEY)
            </button>
          </div>
        </section>

        {/* Bento Grid Summaries */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
              Aujourd'hui
            </span>
            <span className="text-xl font-bold text-on-surface">
              {formatCFA(today)}
            </span>
            <div className="h-1 w-12 bg-primary rounded-full mt-1" />
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
              Cette Semaine
            </span>
            <span className="text-xl font-bold text-on-surface">
              {formatCFA(week)}
            </span>
            <div className="h-1 w-12 bg-secondary rounded-full mt-1" />
          </div>
        </section>

        {/* Weekly Chart */}
        <section className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Performance Hebdomadaire</h3>
            <Calendar className="text-on-surface-variant w-5 h-5" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {weeklyData.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 gap-2"
              >
                <div
                  className={`w-full rounded-t-lg relative group ${
                    idx === 2 ? "bg-primary" : "bg-surface-container"
                  }`}
                  style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                >
                  {idx === 2 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded">
                      {formatCFA(day.amount).replace(" XAF", "")}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    idx === 2 ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-lg">Transactions Récentes</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-wider">
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "delivery" ? "bg-primary/10" : "bg-error/10"
                    }`}
                  >
                    <Package
                      className={`text-xl ${tx.type === "delivery" ? "text-primary" : "text-error"}`}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">
                      {tx.description}
                    </p>
                    <p className="text-xs text-on-surface-variant">{tx.date}</p>
                  </div>
                </div>
                <span
                  className={`font-bold ${tx.type === "delivery" ? "text-primary" : "text-error"}`}
                >
                  {tx.type === "delivery" ? "+" : ""}
                  {formatCFA(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-3xl">
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
          className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-5 py-1.5"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Earnings
          </span>
        </Link>
        <Link
          href="/rider/profile"
          className="flex flex-col items-center justify-center text-zinc-500 px-5 py-1.5 transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
