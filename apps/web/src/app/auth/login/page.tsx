"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import { loginSchema, LoginInput } from "@tara/zod-schemas";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api-client";
import { UserRole } from "@tara/types";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    gsap.from(cardRef.current, { opacity: 0, y: 32, duration: 0.7, ease: "power3.out" });
  }, []);

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { user, tokens } = res.data.data;
      setAuth(user, tokens);
      toast.success(`Bienvenue, ${user.name}!`);
      if (user.role === UserRole.ADMIN)    router.push("/admin");
      else if (user.role === UserRole.RIDER) router.push("/rider");
      else router.push("/customer");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Identifiants invalides";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: "radial-gradient(ellipse at 30% 40%,rgba(0,80,58,.06) 0%,transparent 60%),var(--sur-low)" }}>

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full -z-10 opacity-30"
           style={{ background: "radial-gradient(#9ef4d0,transparent)", filter: "blur(80px)" }} />

      <div ref={cardRef} className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#00503a,#006a4e)" }}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-extrabold text-xl text-on_surface">
            TARA <span style={{ color: "var(--primary)" }}>DELIVERY</span>
          </span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-extrabold mb-1" style={{ color: "var(--on-surface)" }}>
            Connexion
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--on-sur-var)" }}>
            Accédez à votre espace livraison
          </p>

          {/* Google OAuth */}
          <button onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; }}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-md text-sm font-semibold mb-5 transition-all"
                  style={{ background: "var(--sur-high)", color: "var(--on-surface)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--out-var)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--on-sur-var)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "var(--out-var)" }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" placeholder="vous@exemple.com"
                     className={`input ${errors.email ? "input-error" : ""}`} autoComplete="email" />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline"
                      style={{ color: "var(--primary)" }}>Oublié?</Link>
              </div>
              <div className="relative">
                <input {...register("password")} type={showPwd ? "text" : "password"}
                       placeholder="••••••••" autoComplete="current-password"
                       className={`input pr-10 ${errors.password ? "input-error" : ""}`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> : "SE CONNECTER"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--on-sur-var)" }}>
            Pas de compte?{" "}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
