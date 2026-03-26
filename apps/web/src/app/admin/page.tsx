"use client";

import { useEffect, useState } from "react";
import {
  Package, Users, Truck, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { adminApi, ordersApi } from "@/lib/api-client";
import { OrderStatus } from "@tara/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B", CONFIRMED: "#3B82F6", ASSIGNED: "#8B5CF6",
  PICKED_UP: "#F97316", IN_TRANSIT: "#FF6B2C", DELIVERED: "#10B981",
  CANCELLED: "#EF4444", FAILED: "#6B7280",
};

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM", { minimumFractionDigits: 0 }).format(v) + " XAF";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, revRes, statusRes, ordersRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getRevenueAnalytics(30),
          adminApi.getOrdersByStatus(),
          adminApi.getRecentOrders(),
        ]);
        setStats(statsRes.data.data);
        setRevenue(revRes.data.data);
        setOrdersByStatus(statusRes.data.data);
        setRecentOrders(ordersRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner scale-150" />
    </div>
  );

  const statCards = [
    { label: "Commandes totales", value: stats?.totalOrders, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Commandes actives", value: stats?.activeOrders, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Livrées aujourd'hui", value: stats?.completedOrders, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "Revenus totaux", value: stats?.totalRevenue ? formatCFA(stats.totalRevenue) : "0 XAF", icon: DollarSign, color: "text-brand-600 bg-brand-500/10", raw: true },
    { label: "Livreurs actifs", value: `${stats?.availableRiders || 0} / ${stats?.totalRiders || 0}`, icon: Truck, color: "text-purple-600 bg-purple-50", raw: true },
    { label: "Clients", value: stats?.totalCustomers, icon: Users, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Tableau de bord</h1>
        <p className="section-subtitle">Vue d'ensemble des opérations TARA DELIVERY</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold font-display text-gray-900">
                  {card.raw ? card.value : (card.value ?? 0).toLocaleString()}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Revenus (30 derniers jours)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip
                formatter={(v: number) => [formatCFA(v), "Revenus"]}
                labelFormatter={(l) => `Date: ${l}`}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Line
                type="monotone" dataKey="revenue"
                stroke="#FF6B2C" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: "#FF6B2C" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Commandes par statut</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ordersByStatus.filter((s) => s.count > 0)}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                dataKey="count"
              >
                {ordersByStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#E5E7EB"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, _n, p) => [v, p.payload.status]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {ordersByStatus.filter((s) => s.count > 0).map((s) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
                <span className="text-xs text-gray-500 truncate">{s.status}</span>
                <span className="text-xs font-semibold text-gray-900 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {["Commande", "Client", "Type", "Statut", "Paiement", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recentOrders as Record<string, unknown>[]).slice(0, 8).map((order) => (
                <tr key={order.id as string} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                    {order.orderNumber as string}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(order.user as { name: string })?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.type as string}</td>
                  <td className="px-6 py-4">
                    <span className={`badge badge-${(order.status as string).toLowerCase().replace(/_/g, "-")}`}>
                      {order.status as string}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatCFA((order.totalAmount as number) || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(order.createdAt as string).toLocaleDateString("fr-CM")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
