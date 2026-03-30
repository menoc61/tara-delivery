"use client";

import { Package, RefreshCw, Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "package" | "search";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = "Aucune donnée",
  description = "Aucun élément trouvé avec les filtres actuels.",
  icon = "search",
  action,
}: EmptyStateProps) {
  const Icon = icon === "package" ? Package : Search;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-bold text-lg text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#00503a] text-white rounded-lg text-sm font-medium hover:bg-[#006a4e] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-[#00503a] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-slate-500">Chargement...</p>
    </div>
  );
}
