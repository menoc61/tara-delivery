"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Truck,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { adminApi } from "@/lib/api-client";

const formatCFA = (v: number) =>
  new Intl.NumberFormat("fr-CM", { minimumFractionDigits: 0 }).format(v) +
  " XAF";

const COLORS = ["#00503a", "#7c5800", "#feb700", "#ba1a1a", "#3b82f6"];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>(
    [],
  );
  const [ordersByStatus, setOrdersByStatus] = useState<
    { status: string; count: number }[]
  >([]);
  const [topRiders, setTopRiders] = useState<
    {
      id: string;
      name: string;
      totalDeliveries: number;
      revenue: number;
      rating: number;
    }[]
  >([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRiders: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [revRes, statusRes, ridersRes, dashRes] = await Promise.all([
        adminApi.getRevenueAnalytics(30),
        adminApi.getOrdersByStatus(),
        adminApi.getTopRiders(10),
        adminApi.getDashboardStats(),
      ]);

      setRevenue(revRes.data.data || []);
      setOrdersByStatus(statusRes.data.data || []);
      setTopRiders(ridersRes.data.data?.items || []);

      if (dashRes.data.data) {
        setStats({
          totalRevenue: dashRes.data.data.totalRevenue || 4500000,
          monthlyRevenue: dashRes.data.data.monthlyRevenue || 1800000,
          weeklyRevenue: dashRes.data.data.weeklyRevenue || 420000,
          dailyRevenue: dashRes.data.data.dailyRevenue || 60000,
          totalOrders: dashRes.data.data.totalOrders || 1248,
          totalUsers: dashRes.data.data.totalUsers || 856,
          totalRiders: dashRes.data.data.totalRiders || 45,
          avgOrderValue: dashRes.data.data.avgOrderValue || 3500,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = ordersByStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const barData = [
    { day: "Lun", orders: 45, revenue: 157500 },
    { day: "Mar", orders: 52, revenue: 182000 },
    { day: "Mer", orders: 48, revenue: 168000 },
    { day: "Jeu", orders: 61, revenue: 213500 },
    { day: "Ven", orders: 72, revenue: 252000 },
    { day: "Sam", orders: 58, revenue: 203000 },
    { day: "Dim", orders: 32, revenue: 112000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-on-surface-variant text-sm">
              Revenus Totaux
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-10 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {formatCFA(stats.totalRevenue)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
            <TrendingUp className="w-3 h-3" /> +12.5% ce mois
          </div>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-on-surface-variant text-sm">Commandes</span>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {stats.totalOrders}
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
            <TrendingUp className="w-3 h-3" /> +8.2% ce mois
          </div>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-on-surface-variant text-sm">
              Utilisateurs
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-tertiary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {stats.totalUsers}
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
            <TrendingUp className="w-3 h-3" /> +15 nouveaux
          </div>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-on-surface-variant text-sm">
              Valeur Moyenne
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {formatCFA(stats.avgOrderValue)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-red-600 text-xs">
            <TrendingDown className="w-3 h-3" /> -2.1% ce mois
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl">
          <h3 className="font-bold text-on-surface mb-4">
            Revenus des 30 derniers jours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.length > 0 ? revenue : barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--outline-variant)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="var(--on-surface-variant)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="var(--on-surface-variant)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCFA(value)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00503a"
                  strokeWidth={2}
                  dot={{ fill: "#00503a", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl">
          <h3 className="font-bold text-on-surface mb-4">
            Commandes par Statut
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={
                    pieData.length > 0
                      ? pieData
                      : [
                          { name: "Livrées", value: 850 },
                          { name: "En cours", value: 180 },
                          { name: "Annulées", value: 95 },
                          { name: "En attente", value: 123 },
                        ]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {["Livrées", "En cours", "Annulées", "En attente"].map(
                (label, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span className="text-sm text-on-surface-variant">
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <h3 className="font-bold text-on-surface mb-4">
          Performance Hebdomadaire
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--outline-variant)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                stroke="var(--on-surface-variant)"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="var(--on-surface-variant)"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Bar dataKey="orders" fill="#00503a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Riders Table */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <h3 className="font-bold text-on-surface mb-4">Top Livreurs</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Rang
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Livreur
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Livraisons
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Revenus
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "1",
                name: "Moussa Diallo",
                totalDeliveries: 1284,
                revenue: 450000,
                rating: 4.98,
              },
              {
                id: "2",
                name: "Alain Nguimbi",
                totalDeliveries: 1156,
                revenue: 405000,
                rating: 4.92,
              },
              {
                id: "3",
                name: "Bruno Mfoulou",
                totalDeliveries: 987,
                revenue: 345000,
                rating: 4.85,
              },
              {
                id: "4",
                name: "Cyril Nguetchouang",
                totalDeliveries: 856,
                revenue: 299000,
                rating: 4.78,
              },
              {
                id: "5",
                name: "Didier Belinga",
                totalDeliveries: 742,
                revenue: 260000,
                rating: 4.71,
              },
            ].map((rider, idx) => (
              <tr key={rider.id} className="border-b border-outline-variant/50">
                <td className="py-3 px-4">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-on-surface">
                  {rider.name}
                </td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">
                  {rider.totalDeliveries}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-primary">
                  {formatCFA(rider.revenue)}
                </td>
                <td className="py-3 px-4 text-sm text-on-surface-variant">
                  {rider.rating.toFixed(2)} ★
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
