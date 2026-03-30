"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import toast from "react-hot-toast";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (!accessToken || !refreshToken) {
        setError("Tokens manquants");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      try {
        // Store tokens temporarily to fetch user profile
        useAuthStore.setState({ tokens: { accessToken, refreshToken } });

        // Fetch user profile
        const response = await authApi.getMe();
        const user = response.data.data;

        // Set auth with user and tokens
        setAuth(user, { accessToken, refreshToken });

        toast.success("Connexion réussie!");

        // Redirect based on role
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (user.role === "RIDER") {
          router.push("/rider");
        } else {
          router.push("/customer");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Erreur de connexion");
        useAuthStore.getState().clearAuth();
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <p className="text-lg font-bold">{error}</p>
            <p className="text-sm mt-2">Redirection en cours...</p>
          </div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-[#00503a] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#191c1b]">
              Connexion en cours...
            </p>
            <p className="text-sm text-[#6f7a73] mt-2">
              Veuillez patienter pendant que nous finalisons votre connexion.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
          <Loader2 className="w-12 h-12 animate-spin text-[#00503a]" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
