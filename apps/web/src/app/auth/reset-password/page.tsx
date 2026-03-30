"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Package,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { resetPasswordSchema } from "@tara/zod-schemas";
import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "" },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Lien de réinitialisation invalide");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      await authApi.resetPassword({
        token: data.token,
        newPassword: data.password,
      });
      setSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès");
    } catch {
      toast.error("Lien invalide ou expiré. Demandez un nouveau lien.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7] p-4">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00503a]">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-[#00503a]">
              TARA DELIVERY
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#9ef4d0]/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#00503a]" />
            </div>
            <h2 className="text-2xl font-bold text-[#191c1b] mb-2">
              Mot de passe réinitialisé
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Votre mot de passe a été modifié avec succès. Vous pouvez
              maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf7] p-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00503a]">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-[#00503a]">
            TARA DELIVERY
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#191c1b] text-center mb-2">
            Nouveau mot de passe
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} />

            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Minimum 8 caractères, une majuscule et un chiffre.
            </p>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading
                ? "Réinitialisation..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <Link
              href="/auth/login"
              className="text-sm text-[#00503a] hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
          <Loader2 className="w-8 h-8 text-[#00503a] animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
