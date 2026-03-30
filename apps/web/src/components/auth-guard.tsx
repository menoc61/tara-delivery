"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, tokens } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!tokens?.accessToken) {
      router.push("/auth/login");
      return;
    }

    // Check role if specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "RIDER") {
        router.push("/rider");
      } else {
        router.push("/customer");
      }
      return;
    }

    setIsChecking(false);
  }, [user, tokens, allowedRoles, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00503a] mx-auto mb-4" />
          <p className="text-[#6f7a73]">
            Vérification de l&apos;authentification...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
