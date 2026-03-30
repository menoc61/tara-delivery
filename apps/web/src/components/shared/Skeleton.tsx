"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-[#edeeec]", className)} />
  );
}

// Table row skeleton matching reference design
export function TableRowSkeleton() {
  return (
    <tr className="hover:bg-[#f2f4f2]/50">
      <td className="px-6 py-5">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-12" />
      </td>
      <td className="px-6 py-5">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-6 py-5">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-5 text-right">
        <Skeleton className="h-8 w-28 rounded-lg ml-auto" />
      </td>
    </tr>
  );
}

// Full table skeleton matching reference layout
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#ffffff] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f2] border-none">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                N° Commande
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                Destination
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                Statut
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944]">
                Total
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#3f4944] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00503a]/5">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination skeleton */}
      <div className="px-6 py-4 bg-[#f2f4f2] flex justify-between items-center">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#00503a] p-6 rounded-2xl text-white relative overflow-hidden">
      <div className="relative z-10">
        <Skeleton className="h-3 w-24 mb-2 bg-white/20" />
        <Skeleton className="h-8 w-32 bg-white/20 mb-1" />
        <Skeleton className="h-3 w-40 bg-white/20" />
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-10 w-32 mx-auto mb-2" />
        <Skeleton className="h-5 w-20 rounded-full mx-auto" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}
