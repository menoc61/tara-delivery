"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { ChevronLeft, Bike, Edit2, Camera, Loader2 } from "lucide-react";
import { ridersApi } from "@/lib/api-client";

const vehicleTypes = [
  { v: "MOTORCYCLE", label: "Moto", icon: "🏍️" },
  { v: "BICYCLE", label: "Vélo", icon: "🚲" },
  { v: "CAR", label: "Voiture", icon: "🚗" },
];

interface VehicleData {
  type: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
  year: string;
}

export default function RiderVehiclePage() {
  const { user } = useAuthStore();
  const [vehicle, setVehicle] = useState<VehicleData>({
    type: "MOTORCYCLE",
    brand: "",
    model: "",
    plate: "",
    color: "",
    year: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ridersApi
      .getMe()
      .then((r) => {
        const rider = r.data.data;
        if (rider) {
          setVehicle({
            type: rider.vehicleType || "MOTORCYCLE",
            brand: rider.vehicleBrand || "",
            model: rider.vehicleModel || "",
            plate: rider.vehiclePlate || "",
            color: rider.vehicleColor || "",
            year: rider.vehicleYear?.toString() || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ridersApi.updateProfile({
        vehicleType: vehicle.type,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehiclePlate: vehicle.plate,
        vehicleColor: vehicle.color,
        vehicleYear: vehicle.year ? parseInt(vehicle.year) : undefined,
      });
      toast.success("Véhicule mis à jour!");
    } catch {
      toast.error("Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/rider/settings"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Mon véhicule
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bike className="w-12 h-12 text-primary" />
            </div>
            <button className="btn-secondary text-sm">
              <Camera className="w-4 h-4" /> Ajouter une photo
            </button>
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="font-bold text-on-surface">Type de véhicule</h2>
            <div className="grid grid-cols-3 gap-3">
              {vehicleTypes.map((t) => (
                <button
                  key={t.v}
                  onClick={() => setVehicle({ ...vehicle, type: t.v })}
                  className={`p-3 rounded-xl text-center transition-all ${
                    vehicle.type === t.v
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-sur-low"
                  }`}
                >
                  <span className="text-2xl block">{t.icon}</span>
                  <span className="text-sm font-medium text-on-surface">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <div>
              <label className="label">Marque</label>
              <input
                value={vehicle.brand}
                onChange={(e) =>
                  setVehicle({ ...vehicle, brand: e.target.value })
                }
                placeholder="Yamaha, Honda..."
                className="input"
              />
            </div>
            <div>
              <label className="label">Modèle</label>
              <input
                value={vehicle.model}
                onChange={(e) =>
                  setVehicle({ ...vehicle, model: e.target.value })
                }
                placeholder="NMAX, PCX..."
                className="input"
              />
            </div>
            <div>
              <label className="label">Plaque d'immatriculation</label>
              <input
                value={vehicle.plate}
                onChange={(e) =>
                  setVehicle({
                    ...vehicle,
                    plate: e.target.value.toUpperCase(),
                  })
                }
                placeholder="CE-1234-XX"
                className="input"
              />
            </div>
            <div>
              <label className="label">Couleur</label>
              <input
                value={vehicle.color}
                onChange={(e) =>
                  setVehicle({ ...vehicle, color: e.target.value })
                }
                placeholder="Noir, Blanc..."
                className="input"
              />
            </div>
            <div>
              <label className="label">Année</label>
              <input
                value={vehicle.year}
                onChange={(e) =>
                  setVehicle({ ...vehicle, year: e.target.value })
                }
                placeholder="2022"
                type="number"
                className="input"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Edit2 className="w-4 h-4" /> Enregistrer
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
