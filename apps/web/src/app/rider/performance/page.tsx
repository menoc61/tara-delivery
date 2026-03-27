"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  Award,
  Clock,
  Package,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RiderPerformancePage() {
  const stats = [
    {
      label: "Livraisons",
      value: "124",
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Note moyenne",
      value: "4.8",
      icon: Star,
      color: "bg-secondary-container/20 text-secondary",
    },
    {
      label: "Heures actives",
      value: "86h",
      icon: Clock,
      color: "bg-tertiary-fixed/10 text-tertiary-fixed",
    },
    {
      label: "Taux acceptance",
      value: "94%",
      icon: TrendingUp,
      color: "bg-green-100 text-green-700",
    },
  ];

  const weeklyData = [
    { day: "Lun", deliveries: 12 },
    { day: "Mar", deliveries: 15 },
    { day: "Mer", deliveries: 8 },
    { day: "Jeu", deliveries: 18 },
    { day: "Ven", deliveries: 22 },
    { day: "Sam", deliveries: 14 },
    { day: "Dim", deliveries: 10 },
  ];

  const maxDeliveries = Math.max(...weeklyData.map((d) => d.deliveries));

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/rider" className="p-2 -ml-2 hover:bg-sur-low rounded-lg">
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Performance
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="card-tonal p-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-on-surface">
                {s.value}
              </p>
              <p className="text-xs text-on-sur-var mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-on-surface mb-4">Cette semaine</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary rounded-t-md"
                  style={{ height: `${(d.deliveries / maxDeliveries) * 100}%` }}
                />
                <span className="text-xs text-on-sur-var mt-2">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-on-surface mb-4">Badges</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-sur-low rounded-xl">
              <Award className="w-8 h-8 mx-auto mb-2 text-secondary-container" />
              <p className="text-xs font-medium text-on-surface">100 courses</p>
            </div>
            <div className="text-center p-4 bg-sur-low rounded-xl">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-xs font-medium text-on-surface">4.8+ note</p>
            </div>
            <div className="text-center p-4 bg-sur-low rounded-xl">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-xs font-medium text-on-surface">Streak 7j</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
