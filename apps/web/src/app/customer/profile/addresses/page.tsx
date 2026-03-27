"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Home,
  Briefcase,
  Star,
  Edit2,
  Trash2,
  MapPin,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api-client";

const NEIGHBORHOODS = [
  "Bastos",
  "Nlongkak",
  "Omnisports",
  "Mvog-Ada",
  "Mfoundi",
  "Biyem-Assi",
  "Mbankolo",
  "Nkolbisson",
  "Ekounou",
  "Melen",
  "Djoungolo",
  "Emana",
  "Tsinga",
  "Elig-Essono",
  "Mvog-Mbi",
  "Briqueterie",
];

interface Address {
  id: string;
  label: string;
  type: "HOME" | "WORK" | "OTHER";
  neighborhood: string;
  street: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
  type: "HOME" | "WORK" | "OTHER";
  neighborhood: string;
  street: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  label: "",
  type: "HOME",
  neighborhood: "",
  street: "",
  isDefault: false,
};

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    usersApi
      .getAddresses()
      .then((r) => setAddresses(r.data.data || []))
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.neighborhood || !formData.street) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await usersApi.updateAddress(editingId, formData);
        toast.success("Adresse mise à jour");
      } else {
        await usersApi.addAddress(formData);
        toast.success("Adresse ajoutée");
      }
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormData);
      loadAddresses();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse?")) return;
    try {
      await usersApi.deleteAddress(id);
      toast.success("Adresse supprimée");
      loadAddresses();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label,
      type: addr.type,
      neighborhood: addr.neighborhood,
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return Home;
      case "WORK":
        return Briefcase;
      default:
        return Star;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-var/15">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/customer/profile"
            className="p-2 -ml-2 hover:bg-sur-low rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-on-sur-var" />
          </Link>
          <h1 className="font-display font-bold text-on-surface text-lg">
            Mes adresses
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="card p-8 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="card p-10 text-center">
            <MapPin className="w-12 h-12 text-outline-var mx-auto mb-3" />
            <h3 className="text-base font-bold text-on-surface mb-2">
              Aucune adresse
            </h3>
            <p className="text-sm text-on-sur-var mb-4">
              Ajoutez vos adresses de livraison
            </p>
            <button onClick={openAdd} className="btn-primary">
              <Plus className="w-4 h-4" /> Ajouter une adresse
            </button>
          </div>
        ) : (
          <>
            {addresses.map((addr) => {
              const Icon = getIcon(addr.type);
              return (
                <div key={addr.id} className="card p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-on-surface">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-xs px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-on-sur-var" />
                      <p className="text-sm text-on-sur-var">
                        {addr.neighborhood}, {addr.street}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(addr)}
                      className="p-2 hover:bg-sur-low rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-on-sur-var" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            <button onClick={openAdd} className="btn-primary w-full">
              <Plus className="w-4 h-4" /> Ajouter une adresse
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">
                {editingId ? "Modifier l'adresse" : "Ajouter une adresse"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-sur-low rounded-lg"
              >
                <X className="w-5 h-5 text-on-sur-var" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Type d'adresse</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        formData.type === t
                          ? "bg-primary text-white"
                          : "bg-sur-low text-on-surface"
                      }`}
                    >
                      {t === "HOME"
                        ? "Maison"
                        : t === "WORK"
                          ? "Bureau"
                          : "Autre"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Nom de l'adresse</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="Ex: Maison, Bureau..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">Quartier</label>
                <select
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Sélectionner un quartier</option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Rue / Description</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Numéro, rue, bâtiment..."
                  className="input"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface">
                  Définir comme adresse par défaut
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    "Mettre à jour"
                  ) : (
                    "Ajouter"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
