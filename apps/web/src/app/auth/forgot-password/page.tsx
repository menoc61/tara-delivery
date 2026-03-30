"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail, Package, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "@tara/zod-schemas";
import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordInput = { email: string };

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      setSentEmail(data.email);
      toast.success("Email de réinitialisation envoyé");
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
      setSentEmail(data.email);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
              Email envoyé
            </h2>
            <p className="text-sm text-slate-500 mb-2">
              Si un compte existe avec l&apos;adresse
            </p>
            <p className="text-sm font-medium text-[#00503a] mb-4">
              {sentEmail}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Vous recevrez un lien pour réinitialiser votre mot de passe.
              Vérifiez aussi vos spams.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="w-14 h-14 rounded-full bg-[#9ef4d0]/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-[#00503a]" />
          </div>
          <h2 className="text-2xl font-bold text-[#191c1b] text-center mb-2">
            Mot de passe oublié?
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser
            votre mot de passe.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Envoi..." : "Envoyer le lien"}
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
