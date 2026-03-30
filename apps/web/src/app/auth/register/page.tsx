"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Mail,
  Lock,
  Smartphone,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import { registerSchema, RegisterInput } from "@tara/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import { UserRole } from "@tara/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    if (!agreedToTerms) {
      toast.error("Veuillez accepter les conditions générales");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { user, tokens } = res.data.data;
      setAuth(user, tokens);
      toast.success("Compte créé avec succès! Bienvenue!");

      if (roleParam === "rider") {
        router.push("/rider");
      } else {
        router.push("/customer");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erreur lors de la création du compte";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-5/12 lg:w-4/12 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1617644142756-5a923b6bbc91?w=800&h=1200&fit=crop"
            alt="Delivery rider"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-primary" />
        </div>

        <div className="relative z-10">
          <div className="text-3xl font-display font-black tracking-tight text-white mb-2">
            TARA DELIVERY
          </div>
          <div className="h-1 w-12 bg-secondary-container rounded-full" />
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            L'excellence logistique au cœur de{" "}
            <span className="text-secondary-container italic">Yaoundé.</span>
          </h1>
          <p className="text-primary-fixed text-lg font-medium leading-relaxed max-w-sm">
            Rejoignez le réseau de livraison le plus fiable et transformez votre
            façon d'expédier.
          </p>

          <div className="mt-12 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-primary bg-muted flex items-center justify-center text-sm font-bold text-primary"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-xs text-white">
              <span className="font-bold">+2 500</span> utilisateurs actifs
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-background overflow-y-auto">
        <div className="md:hidden w-full flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-black tracking-tight text-primary">
              TARA DELIVERY
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-extrabold tracking-tight">
              Créer un compte
            </h2>
            <p className="text-muted-foreground font-medium">
              {roleParam === "rider"
                ? "Devenez livreur et rejoignez notre réseau"
                : "Commencez à envoyer vos colis dès aujourd'hui"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground ml-1">
                  Prénom
                </label>
                <input
                  {...register("name")}
                  className={`w-full bg-muted border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-muted-foreground focus:ring-2 focus:ring-primary ${errors.name ? "ring-2 ring-red-500" : ""}`}
                  placeholder="Ex: Jean"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground ml-1">
                  Nom
                </label>
                <input
                  {...register("name")}
                  className="w-full bg-muted border-none rounded-lg px-4 py-3.5 text-on-surface placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Bakari"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
                <input
                  {...register("email")}
                  className={`w-full bg-muted border-none rounded-lg pl-10 pr-4 py-3.5 text-on-surface placeholder:text-muted-foreground focus:ring-2 focus:ring-primary ${errors.email ? "ring-2 ring-red-500" : ""}`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                <div className="bg-muted rounded-lg px-3 py-3.5 flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold">+237</span>
                </div>
                <div className="relative flex-1">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
                  <input
                    {...register("phone")}
                    className="w-full bg-muted border-none rounded-lg pl-10 pr-4 py-3.5 text-on-surface placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    placeholder="6XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-muted border-none rounded-lg pl-10 pr-12 py-3.5 text-on-surface placeholder:text-muted-foreground focus:ring-2 focus:ring-primary ${errors.password ? "ring-2 ring-red-500" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                Minimum 8 caractères, une majuscule et un chiffre.
              </p>

              {password && (
                <div className="mt-2 space-y-1">
                  {[
                    { ok: checks.length, label: "8 caractères minimum" },
                    { ok: checks.upper, label: "Une majuscule" },
                    { ok: checks.number, label: "Un chiffre" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
              />
              <label
                htmlFor="terms"
                className="text-xs leading-relaxed text-muted-foreground"
              >
                J'accepte les{" "}
                <a href="#" className="text-primary font-bold hover:underline">
                  Conditions Générales d'Utilisation
                </a>{" "}
                et la{" "}
                <a href="#" className="text-primary font-bold hover:underline">
                  Politique de Confidentialité
                </a>{" "}
                de Tara Delivery.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-display font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Inscription..." : "S'inscrire Maintenant"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-muted" />
              <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Ou s'inscrire avec
              </span>
              <div className="flex-grow border-t border-muted" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-outline rounded-lg hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-bold">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-outline rounded-lg hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-bold">Facebook</span>
              </button>
            </div>

            <p className="text-center text-sm font-medium text-muted-foreground mt-8">
              Vous avez déjà un compte?
              <Link
                href="/auth/login"
                className="text-primary font-bold hover:underline ml-1"
              >
                Connectez-vous
              </Link>
            </p>
          </form>
        </div>
      </main>

      <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="fixed bottom-0 left-1/2 -z-10 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl -ml-32 -mb-32" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
