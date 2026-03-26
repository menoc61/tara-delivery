"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { registerSchema, RegisterInput } from "@tara/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import { UserRole } from "@tara/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { user, tokens } = res.data.data;
      setAuth(user, tokens);
      toast.success("Compte créé avec succès! Bienvenue 🎉");
      router.push("/customer");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || "Erreur lors de la création du compte";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-gray-900">
              TARA <span className="text-brand-500">DELIVERY</span>
            </span>
          </Link>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-display text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-1">Rejoignez TARA DELIVERY gratuitement</p>
          </div>

          <button
            onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nom complet</label>
              <input {...register("name")} type="text" placeholder="Jean-Pierre Mbarga"
                className={`input ${errors.name ? "input-error" : ""}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" placeholder="vous@exemple.com"
                className={`input ${errors.email ? "input-error" : ""}`} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input {...register("phone")} type="tel" placeholder="6XXXXXXXX"
                className="input" />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  {[
                    { ok: checks.length, label: "8 caractères minimum" },
                    { ok: checks.upper, label: "Une majuscule" },
                    { ok: checks.number, label: "Un chiffre" },
                  ].map((c) => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-emerald-600" : "text-gray-400"}`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte?{" "}
            <Link href="/auth/login" className="text-brand-500 font-medium hover:text-brand-600">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
