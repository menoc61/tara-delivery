"use client";

import { useState, useEffect } from "react";
import { Truck, MapPin, Navigation, RefreshCw, Filter } from "lucide-react";
import Map from "@/components/Map";

type RiderLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "available" | "busy";
  currentOrder?: string;
};

const mockRiders: RiderLocation[] = [
  {
    id: "1",
    name: "Moussa Diallo",
    lat: 3.8694,
    lng: 11.5163,
    status: "available",
  },
  {
    id: "2",
    name: "Alain Nguimbi",
    lat: 3.8544,
    lng: 11.5018,
    status: "busy",
    currentOrder: "TD2506153847",
  },
  {
    id: "3",
    name: "Bruno Mfoulou",
    lat: 3.862,
    lng: 11.508,
    status: "available",
  },
  {
    id: "4",
    name: "Cyril Nguetchouang",
    lat: 3.8415,
    lng: 11.5235,
    status: "busy",
    currentOrder: "TD2506153848",
  },
  {
    id: "5",
    name: "Didier Belinga",
    lat: 3.8571,
    lng: 11.5198,
    status: "available",
  },
];

export default function AdminLiveMapPage() {
  const [riders, setRiders] = useState(mockRiders);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "busy">("all");

  const filteredRiders = riders.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const markers = filteredRiders.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    label: r.name,
    color: r.status === "available" ? "#10b981" : "#f59e0b",
  }));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const available = riders.filter((r) => r.status === "available").length;
  const busy = riders.filter((r) => r.status === "busy").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-on-surface-variant text-sm">Total actifs</p>
          <p className="text-2xl font-bold text-on-surface">{riders.length}</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-on-surface-variant text-sm">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{available}</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-on-surface-variant text-sm">En course</p>
          <p className="text-2xl font-bold text-yellow-600">{busy}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "available", "busy"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {f === "all"
                ? "Tous"
                : f === "available"
                  ? "Disponibles"
                  : "En course"}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualiser
        </button>
      </div>

      {/* Map and List */}
      <div className="grid grid-cols-3 gap-6">
        {/* Map */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl overflow-hidden h-[500px]">
          <Map
            center={[11.5023, 3.848]}
            zoom={13}
            markers={markers}
            className="w-full h-full"
          />
        </div>

        {/* Riders List */}
        <div className="space-y-3">
          <h3 className="font-bold text-on-surface">Livreurs actifs</h3>
          {filteredRiders.map((rider) => (
            <div
              key={rider.id}
              className="bg-surface-container-low p-4 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    rider.status === "available"
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <Truck
                    className={`w-5 h-5 ${rider.status === "available" ? "text-green-600" : "text-yellow-600"}`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{rider.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {rider.status === "available"
                      ? "Disponible"
                      : `En livraison: ${rider.currentOrder}`}
                  </p>
                </div>
                <Navigation className="w-4 h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
