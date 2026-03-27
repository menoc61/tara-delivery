"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bike,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { adminApi } from "@/lib/api-client";
import { RiderStatus } from "@tara/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "status-available" },
  BUSY: { label: "En livraison", className: "status-busy" },
  OFFLINE: { label: "Hors ligne", className: "status-offline" },
};

export default function AdminRidersPage() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const [riders, setRiders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadRiders();
  }, [page]);

  const loadRiders = async () => {
    try {
      const res = await adminApi.getRiders({ page, limit: 20 });
      setRiders(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Failed to load riders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    clearAuth();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Livreurs
          </h1>
          <p className="text-sm text-gray-500">{total} livreurs au total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-4">
          {riders.map((rider) => (
            <div
              key={rider.id as string}
              className="card p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bike className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {(rider.user as Record<string, unknown>)?.name as string}
                  </p>
                  {rider.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {(rider.user as Record<string, unknown>)?.phone as string}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`badge ${statusConfig[rider.status as string]?.className}`}
                  >
                    {statusConfig[rider.status as string]?.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {(rider.rating as number)?.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {rider.totalDeliveries as number} livraisons
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {rider.vehiclePlate as string}
                </p>
                <p className="text-xs text-gray-500">
                  {rider.vehicleType as string}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="btn-secondary py-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
