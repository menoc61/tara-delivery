"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "green" | "blue" | "amber" | "red" | "purple";
}

const colorMap = {
  green: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
  },
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
  },
  amber: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-700",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-700",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "green",
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border border-slate-100 bg-white shadow-sm",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            colors.iconBg,
          )}
        >
          <div className={colors.iconColor}>{icon}</div>
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#191c1b] mb-0.5">{value}</p>
      <p className="text-xs text-slate-500">{title}</p>
      {subtitle && (
        <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
