"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, MapPin, CreditCard, Plus, Trash2, ChevronLeft, Loader2, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { createOrderSchema, CreateOrderInput } from "@tara/zod-schemas";
import { OrderType, PaymentMethod } from "@tara/types";
import { ordersApi } from "@/lib/api-client";
import Link from "next/link";

const ORDER_TYPES = [
  { v: OrderType.PARCEL,  label: "Colis",      emoji: "📦", desc: "Documents, cadeaux..." },
  { v: OrderType.FOOD,    label: "Nourriture",  emoji: "🍔", desc: "Restaurants, traiteurs" },
  { v: OrderType.COURIER, label: "Coursier",    emoji: "⚡", desc: "Urgent, express" },
  { v: OrderType.GROCERY, label: "Courses",     emoji: "🛒", desc: "Marchés, supermarchés" },
];

const PAYMENT_METHODS = [
  { v: PaymentMethod.MTN_MOMO,         label: "MTN MoMo",            icon: "🟡", hint: "Numéro 67X / 65X" },
  { v: PaymentMethod.ORANGE_MONEY,     label: "Orange Money",        icon: "🟠", hint: "Numéro 69X" },
  { v: PaymentMethod.CASH_ON_DELIVERY, label: "Cash à la livraison", icon: "💵", hint: "Payez au livreur" },
];

const HOODS = ["Bastos","Nlongkak","Omnisports","Mvog-Ada","Mfoundi","Biyem-Assi","Mbankolo","Nkolbisson","Ekounou","Melen","Djoungolo","Emana","Tsinga","Elig-Essono","Mvog-Mbi","Briqueterie"];

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      type: OrderType.PARCEL,
      paymentMethod: PaymentMethod.MTN_MOMO,
      pickupAddress:   { city: "Yaoundé", neighborhood: "", street: "" },
      deliveryAddress: { city: "Yaoundé", neighborhood: "", street: "" },
      items: [{ name: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const type = form.watch("type");
  const pm   = form.watch("paymentMethod");

  const onSubmit = async (data: CreateOrderInput) => {
    setSubmitting(true);
    try {
      const res = await ordersApi.create(data);
      toast.success("Commande créée! 🎉");
      router.push(`/customer/orders/${res.data.data.id}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur création");
    } finally { setSubmitting(false); }
  };

  const StepDot = ({ n }: { n: number }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
      step > n ? "text-white" : step === n ? "text-white" : "text-on_sur_var"
    }`} style={{ background: step >= n ? "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" : "var(--sur-high)" }}>
      {step > n ? <Check className="w-4 h-4" /> : n}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/customer" className="p-2 rounded-lg hover:bg-sur_mid transition-colors">
            <ChevronLeft className="w-5 h-5" style={{ color: "var(--on-sur-var)" }} />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-on_surface text-base">Nouvelle livraison</h1>
          </div>
        </div>
        {/* Step indicator */}
        <div className="max-w-lg mx-auto mt-3 flex items-center gap-0">
          {[1,2,3].map((n) => (
            <div key={n} className="flex items-center gap-0 flex-1">
              <StepDot n={n} />
              {n < 3 && <div className="flex-1 h-0.5 mx-1 transition-all"
                              style={{ background: step > n ? "var(--primary)" : "var(--sur-high)" }} />}
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>

          {/* ── Step 1: Type ── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <h2 className="font-display text-xl font-bold text-on_surface">Que livrons-nous?</h2>
              <div className="grid grid-cols-2 gap-3">
                {ORDER_TYPES.map((t) => (
                  <button key={t.v} type="button" onClick={() => form.setValue("type", t.v)}
                          className="p-4 rounded-xl text-left transition-all relative"
                          style={{
                            background: type === t.v ? "var(--primary-fixed)" : "var(--sur-low)",
                            outline: type === t.v ? "2px solid rgba(0,80,58,.3)" : "none",
                          }}>
                    {type === t.v && <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}><Check className="w-2.5 h-2.5 text-white" /></div>}
                    <span className="text-2xl block mb-2">{t.emoji}</span>
                    <p className="font-bold text-sm text-on_surface">{t.label}</p>
                    <p className="text-xs mt-0.5 text-on_sur_var">{t.desc}</p>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3.5">
                CONTINUER <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 2: Addresses + items ── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <h2 className="font-display text-xl font-bold text-on_surface">Adresses & articles</h2>

              {/* Pickup */}
              <div className="rounded-2xl p-5" style={{ background: "var(--sur-low)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary)" }} />
                  <span className="text-sm font-bold text-on_surface">Adresse de collecte</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Quartier</label>
                    <select {...form.register("pickupAddress.neighborhood")} className="input">
                      <option value="">Sélectionner un quartier</option>
                      {HOODS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quartier, Rue, ou Point de repère</label>
                    <input {...form.register("pickupAddress.street")} placeholder="Rue, bâtiment, repère..." className="input" />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-2xl p-5" style={{ background: "var(--sur-low)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-on_surface">Adresse de livraison</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Quartier</label>
                    <select {...form.register("deliveryAddress.neighborhood")} className="input">
                      <option value="">Sélectionner un quartier</option>
                      {HOODS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Quartier, Rue, ou Point de repère</label>
                    <input {...form.register("deliveryAddress.street")} placeholder="Rue, appartement, école..." className="input" />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl p-5" style={{ background: "var(--sur-low)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" style={{ color: "var(--primary)" }} />
                    <span className="text-sm font-bold text-on_surface">Articles</span>
                  </div>
                  <button type="button" onClick={() => append({ name: "", quantity: 1 })}
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: "var(--primary)" }}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>
                <div className="space-y-2.5">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2">
                      <input {...form.register(`items.${idx}.name`)} placeholder={`Article ${idx+1}`} className="input flex-1" />
                      <input {...form.register(`items.${idx}.quantity`, { valueAsNumber: true })} type="number" min={1} className="input w-16 text-center" />
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(idx)} className="p-2.5 rounded-lg transition-colors hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes pour le livreur (optionnel)</label>
                <textarea {...form.register("notes")} rows={2} placeholder="Instructions spéciales, code d'accès..." className="input resize-none" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 border" style={{ borderColor: "var(--out-var)" }}>
                  Retour
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 py-3">
                  CONTINUER <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-up">
              <h2 className="font-display text-xl font-bold text-on_surface">Moyen de paiement</h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((p) => (
                  <button key={p.v} type="button" onClick={() => form.setValue("paymentMethod", p.v)}
                          className={`payment-option w-full ${pm === p.v ? "selected" : ""}`}>
                    <span className="text-2xl">{p.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm text-on_surface">{p.label}</p>
                      <p className="text-xs text-on_sur_var">{p.hint}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      pm === p.v ? "border-primary bg-primary" : "border-out_var"
                    }`}>
                      {pm === p.v && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              {(pm === PaymentMethod.MTN_MOMO || pm === PaymentMethod.ORANGE_MONEY) && (
                <div>
                  <label className="label">Numéro de téléphone</label>
                  <input {...form.register("phoneNumber")} type="tel" placeholder="6XXXXXXXX" className="input" />
                  <p className="text-xs mt-1.5 text-on_sur_var">
                    {pm === PaymentMethod.MTN_MOMO
                      ? "Format: 237XXXXXXXXX ou 6XXXXXXXX. Une demande de paiement vous sera envoyée."
                      : "Vous serez redirigé vers la page Orange Money pour confirmer."}
                  </p>
                </div>
              )}

              <div className="rounded-xl p-4" style={{ background: "var(--primary-fixed)" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-on_sur_var">Frais de livraison estimés</span>
                  <span className="font-bold text-on_surface">500 – 2.000 XAF</span>
                </div>
                <p className="text-xs mt-1 text-on_sur_var">Calculés selon la distance réelle.</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 py-3 border" style={{ borderColor: "var(--out-var)" }}>
                  Retour
                </button>
                <button type="submit" disabled={submitting} className="btn-cta flex-1 py-3">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : <><CreditCard className="w-4 h-4" /> COMMANDER</>}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
