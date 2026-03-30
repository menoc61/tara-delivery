"use client";

import { useState } from "react";
import { Search, Calendar, Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  statusOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusLabel?: string;
  methodOptions?: FilterOption[];
  methodValue?: string;
  onMethodChange?: (value: string) => void;
  methodLabel?: string;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  statusOptions,
  statusValue = "",
  onStatusChange,
  statusLabel = "Statut",
  methodOptions,
  methodValue = "",
  onMethodChange,
  methodLabel = "Méthode",
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
            showFilters || hasActiveFilters
              ? "bg-[#00503a] text-white border-[#00503a]"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[#feb700] rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Status and Method Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statusOptions && onStatusChange && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  {statusLabel}
                </label>
                <div className="relative">
                  <select
                    value={statusValue}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] transition-all pr-8"
                  >
                    <option value="">Tous</option>
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {methodOptions && onMethodChange && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  {methodLabel}
                </label>
                <div className="relative">
                  <select
                    value={methodValue}
                    onChange={(e) => onMethodChange(e.target.value)}
                    className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00503a]/20 focus:border-[#00503a] transition-all pr-8"
                  >
                    <option value="">Toutes</option>
                    {methodOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              Effacer les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
