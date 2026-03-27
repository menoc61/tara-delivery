"use client";

import { useState } from "react";
import { Search, Plus, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";

type Zone = {
  id: string;
  name: string;
  neighborhoods: string[];
  baseFee: number;
  perKmFee: number;
  status: "active" | "inactive";
};

const mockZones: Zone[] = [
  {
    id: "1",
    name: "Centre-Ville",
    neighborhoods: ["Bastos", "Nlongkak", "Mfoundi"],
    baseFee: 500,
    perKmFee: 150,
    status: "active",
  },
  {
    id: "2",
    name: "Nord",
    neighborhoods: ["Ekounou", "Mvan", "Nkolbisson"],
    baseFee: 600,
    perKmFee: 180,
    status: "active",
  },
  {
    id: "3",
    name: "Est",
    neighborhoods: ["Melen", "Biyem-Assi", "Mvog-Ada"],
    baseFee: 550,
    perKmFee: 160,
    status: "active",
  },
  {
    id: "4",
    name: "Ouest",
    neighborhoods: ["Mbankolo", "Nkol-Yaoundé"],
    baseFee: 700,
    perKmFee: 200,
    status: "inactive",
  },
];

export default function AdminZonesPage() {
  const [search, setSearch] = useState("");
  const [zones, setZones] = useState(mockZones);

  const filteredZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(search.toLowerCase()) ||
      z.neighborhoods.some((n) =>
        n.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher une zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter une zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className="bg-surface-container-lowest p-5 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{zone.name}</h3>
                  <span
                    className={`text-xs ${zone.status === "active" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {zone.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 rounded-lg hover:bg-surface-container">
                  <Edit className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-container">
                  <Trash2 className="w-4 h-4 text-error" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-on-surface-variant">
                Quartiers: {zone.neighborhoods.join(", ")}
              </p>
              <div className="flex gap-4 pt-2 border-t border-outline-variant">
                <div>
                  <p className="text-xs text-on-surface-variant">
                    Frais de base
                  </p>
                  <p className="font-bold text-primary">{zone.baseFee} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Par km</p>
                  <p className="font-bold text-on-surface">
                    {zone.perKmFee} XAF
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
