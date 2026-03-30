import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "order" | "payment";
}

const orderStatusConfig: Record<string, { label: string; className: string }> =
  {
    PENDING: {
      label: "En attente",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    CONFIRMED: {
      label: "Confirmée",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    ASSIGNED: {
      label: "Assignée",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    PICKED_UP: {
      label: "Récupérée",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    IN_TRANSIT: {
      label: "En route",
      className: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
    DELIVERED: {
      label: "Livré",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    CANCELLED: {
      label: "Annulé",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    FAILED: {
      label: "Échoué",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

const paymentStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  INITIATED: {
    label: "Initié",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  SUCCESS: {
    label: "Réussi",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  FAILED: {
    label: "Échoué",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  REFUNDED: {
    label: "Remboursé",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

export function StatusBadge({ status, variant = "order" }: StatusBadgeProps) {
  const config =
    variant === "payment" ? paymentStatusConfig : orderStatusConfig;
  const { label, className } = config[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        className,
      )}
    >
      {label}
    </span>
  );
}
