"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Package,
  User,
  Bike,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema, LoginInput } from "@tara/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import { UserRole } from "@tara/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEST_ACCOUNTS = [
  {
    role: "Client",
    email: "customer1@test.cm",
    password: "Customer@123",
    icon: User,
  },
  {
    role: "Livreur",
    email: "rider1@test.cm",
    password: "Rider@123",
    icon: Bike,
  },
  {
    role: "Admin",
    email: "admin@tara-delivery.cm",
    password: "Admin@123456",
    icon: Shield,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { user, tokens } = res.data.data;
      setAuth(user, tokens);
      toast.success(`Bienvenue, ${user.name}!`);
      if (user.role === UserRole.ADMIN) router.push("/admin");
      else if (user.role === UserRole.RIDER) router.push("/rider");
      else router.push("/customer");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { user, tokens } = res.data.data;
      setAuth(user, tokens);
      toast.success(`Bienvenue, ${user.name}!`);
      if (user.role === UserRole.ADMIN) router.push("/admin");
      else if (user.role === UserRole.RIDER) router.push("/rider");
      else router.push("/customer");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Cover Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#003d2e]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center font-display">
            TARA DELIVERY
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Votre solution de livraison rapide et fiable à Yaoundé. Payez en
            toute sécurité avec MTN MoMo ou Orange Money.
          </p>

          <div className="mt-12 flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">30min</p>
              <p className="text-white/60 text-sm">Livraison</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-white/60 text-sm">Livreurs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-white/60 text-sm">Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl text-primary">
              TARA DELIVERY
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Connexion</h2>
          <p className="text-muted-foreground mb-8">
            Entrez vos identifiants pour accéder à votre compte
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
            Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Oublié?
                </Link>
              </div>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas de compte?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Créer un compte
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-3">
              Comptes de test
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TEST_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => quickLogin(account.email, account.password)}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <account.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium">{account.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
