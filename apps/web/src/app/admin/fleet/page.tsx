"use client";

import { useState } from "react";
import {
  Search,
  Truck,
  MapPin,
  Clock,
  Star,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Rider = {
  id: string;
  name: string;
  status: "available" | "busy" | "offline";
  deliveries: number;
  rating: number;
  hoursOnline: number;
  zone: string;
};

const mockRiders: Rider[] = [
  {
    id: "1",
    name: "Moussa Diallo",
    status: "available",
    deliveries: 156,
    rating: 4.98,
    hoursOnline: 45,
    zone: "Centre",
  },
  {
    id: "2",
    name: "Alain Nguimbi",
    status: "busy",
    deliveries: 142,
    rating: 4.92,
    hoursOnline: 38,
    zone: "Nord",
  },
  {
    id: "3",
    name: "Bruno Mfoulou",
    status: "available",
    deliveries: 128,
    rating: 4.85,
    hoursOnline: 52,
    zone: "Est",
  },
  {
    id: "4",
    name: "Cyril Nguetchouang",
    status: "offline",
    deliveries: 98,
    rating: 4.78,
    hoursOnline: 25,
    zone: "Ouest",
  },
  {
    id: "5",
    name: "Didier Belinga",
    status: "available",
    deliveries: 87,
    rating: 4.71,
    hoursOnline: 30,
    zone: "Centre",
  },
];

const chartData = [
  { day: "Lun", active: 12, busy: 8 },
  { day: "Mar", active: 15, busy: 10 },
  { day: "Mer", active: 14, busy: 9 },
  { day: "Jeu", active: 18, busy: 12 },
  { day: "Ven", active: 20, busy: 15 },
  { day: "Sam", active: 16, busy: 11 },
  { day: "Dim", active: 10, busy: 6 },
];

export default function AdminFleetPage() {
  const [search, setSearch] = useState("");

  const filteredRiders = mockRiders.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const available = mockRiders.filter((r) => r.status === "available").length;
  const busy = mockRiders.filter((r) => r.status === "busy").length;
  const offline = mockRiders.filter((r) => r.status === "offline").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-primary" />
            <span className="text-on-surface-variant text-sm">
              Total livreurs
            </span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mockRiders.length}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-on-surface-variant text-sm">Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{available}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-yellow-600" />
            <span className="text-on-surface-variant text-sm">En course</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{busy}</p>
        </div>
        <div className="bg-surface-container-low p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-on-surface-variant text-sm">Hors ligne</span>
          </div>
          <p className="text-2xl font-bold text-gray-500">{offline}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <h3 className="font-bold text-on-surface mb-4">
          Activité de la flotte (semaine)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              />
              <Bar
                dataKey="active"
                fill="#00503a"
                name="Disponibles"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="busy"
                fill="#feb700"
                name="En course"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Riders List */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-on-surface">Livreurs</h3>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un livreur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRiders.map((rider) => (
          <div
            key={rider.id}
            className="bg-surface-container-lowest p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{rider.name}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {rider.zone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-on-surface-variant">Livraisons</p>
                  <p className="font-bold text-on-surface">
                    {rider.deliveries}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-on-surface-variant">Note</p>
                  <p className="font-bold text-on-surface flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="#feb700" />
                    {rider.rating.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-on-surface-variant">Heures</p>
                  <p className="font-bold text-on-surface">
                    {rider.hoursOnline}h
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rider.status === "available"
                      ? "bg-green-100 text-green-800"
                      : rider.status === "busy"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {rider.status === "available"
                    ? "Disponible"
                    : rider.status === "busy"
                      ? "En course"
                      : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
