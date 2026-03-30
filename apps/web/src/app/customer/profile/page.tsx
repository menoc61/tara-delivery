"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Bell,
  ShoppingCart,
  User,
  MapPin,
  Mail,
  Phone,
  Lock,
  Wallet,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
  Settings,
  CreditCard,
  Flag,
  Home,
  Briefcase,
  Camera,
  X,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usersApi } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import {
  MobileNav,
  Sidebar,
  Header,
  PageFooter,
} from "@/components/CustomerLayout";
import toast from "react-hot-toast";

export default function CustomerProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(
    user?.name?.split(" ").slice(1).join(" ") || "",
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone?.replace("237", "") || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  // Notification preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Payment methods
  const [defaultPayment, setDefaultPayment] = useState("mtn");

  // Modals
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // New address form
  const [newAddressLabel, setNewAddressLabel] = useState("home");
  const [newAddressStreet, setNewAddressStreet] = useState("");
  const [newAddressNeighborhood, setNewAddressNeighborhood] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("Yaoundé");
  const [newAddressLandmark, setNewAddressLandmark] = useState("");
  const [newAddressIsDefault, setNewAddressIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load data on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const r = await usersApi.getAddresses();
      setAddresses(r.data.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format accepté: JPG, PNG, WebP");
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);

        try {
          await usersApi.uploadAvatar(base64);
          toast.success("Photo de profil mise à jour");
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      };
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        name: `${firstName} ${lastName}`.trim(),
        phone: `237${phone.replace(/\s/g, "")}`,
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddressStreet || !newAddressNeighborhood) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSavingAddress(true);
    try {
      const label =
        newAddressLabel === "home"
          ? "Maison"
          : newAddressLabel === "work"
            ? "Bureau"
            : "Autre";

      await usersApi.addAddress({
        label,
        street: newAddressStreet,
        neighborhood: newAddressNeighborhood,
        city: newAddressCity,
        landmark: newAddressLandmark,
        isDefault: newAddressIsDefault,
      });

      await loadAddresses();
      setShowAddAddressModal(false);

      // Reset form
      setNewAddressLabel("home");
      setNewAddressStreet("");
      setNewAddressNeighborhood("");
      setNewAddressCity("Yaoundé");
      setNewAddressLandmark("");
      setNewAddressIsDefault(false);

      toast.success("Adresse ajoutée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'adresse");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await usersApi.deleteAddress(id);
      await loadAddresses();
      toast.success("Adresse supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await usersApi.setDefaultAddress(id);
      await loadAddresses();
      toast.success("Adresse par défaut mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddressLabel(
      address.label === "Maison"
        ? "home"
        : address.label === "Bureau"
          ? "work"
          : "other",
    );
    setNewAddressStreet(address.street);
    setNewAddressNeighborhood(address.neighborhood);
    setNewAddressCity(address.city || "Yaoundé");
    setNewAddressLandmark(address.landmark || "");
    setNewAddressIsDefault(address.isDefault);
    setShowEditAddressModal(true);
  };

  const handleUpdateAddress = async () => {
    if (!newAddressStreet || !newAddressNeighborhood) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSavingAddress(true);
    try {
      const label =
        newAddressLabel === "home"
          ? "Maison"
          : newAddressLabel === "work"
            ? "Bureau"
            : "Autre";

      await usersApi.updateAddress(editingAddress.id, {
        label,
        street: newAddressStreet,
        neighborhood: newAddressNeighborhood,
        city: newAddressCity,
        landmark: newAddressLandmark,
        isDefault: newAddressIsDefault,
      });

      await loadAddresses();
      setShowEditAddressModal(false);
      setEditingAddress(null);

      // Reset form
      setNewAddressLabel("home");
      setNewAddressStreet("");
      setNewAddressNeighborhood("");
      setNewAddressCity("Yaoundé");
      setNewAddressLandmark("");
      setNewAddressIsDefault(false);

      toast.success("Adresse mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await usersApi.updatePreferences({
        smsAlerts,
        emailInvoices,
        promotions,
      });
      toast.success("Préférences mises à jour avec succès!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdatePaymentMethod = async (method: string) => {
    try {
      await usersApi.updatePaymentMethod(method);
      setDefaultPayment(method);
      toast.success("Méthode de paiement mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Mot de passe modifié avec succès");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      await usersApi.deactivateAccount();
      toast.success("Compte désactivé");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label) {
      case "Maison":
        return <Home className="w-5 h-5" />;
      case "Bureau":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#191c1b]">
      <Header title="Profil" />

      <div className="flex pt-20">
        <Sidebar />

        <main className="flex-1 bg-[#f2f4f2]/30 p-8 lg:p-12 overflow-y-auto pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-3xl font-extrabold text-[#191c1b] tracking-tight">
                  Profil Personnel
                </h1>
                <p className="text-[#3f4944] mt-1">
                  Mettez à jour vos informations de contact et votre photo.
                </p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-[#00503a] text-white font-bold rounded-lg text-sm transition-transform active:scale-95 shadow-lg shadow-[#00503a]/20 disabled:opacity-50"
              >
                {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
              </button>
            </div>

            {/* Profile Section */}
            <section className="mb-12">
              <div className="grid grid-cols-12 gap-8">
                {/* Avatar Column */}
                <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center p-8 bg-white rounded-3xl">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden mb-4 border-4 border-white shadow-xl">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#9ef4d0] flex items-center justify-center text-[#00503a] text-4xl font-bold">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-4 right-0 w-10 h-10 bg-[#00503a] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm font-bold text-[#00503a]">
                    {user?.name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Membre depuis{" "}
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                      "fr-CM",
                      { month: "long", year: "numeric" },
                    )}
                  </p>
                </div>

                {/* Form Column */}
                <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-6 bg-white p-8 rounded-3xl">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Email Professionnel
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Numéro de Téléphone
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 bg-[#f2f4f2] rounded-lg text-sm font-medium text-slate-600">
                        <Flag className="w-4 h-4" />
                        +237
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="6XX XXX XXX"
                        className="flex-1 bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Saved Addresses Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#191c1b] tracking-tight">
                  Adresses Enregistrées
                </h2>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="flex items-center gap-2 text-[#00503a] font-bold text-sm hover:underline"
                >
                  <Plus className="w-5 h-5" />
                  AJOUTER UNE ADRESSE
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">Aucune adresse enregistrée</p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`${addr.isDefault ? "bg-[#e1e3e1]" : "bg-white"} p-6 rounded-2xl relative group hover:shadow-xl hover:shadow-emerald-900/5 transition-all`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-10 h-10 ${
                            addr.isDefault
                              ? "bg-[#00503a]/10 text-[#00503a]"
                              : "bg-[#feb700]/10 text-[#7c5800]"
                          } rounded-xl flex items-center justify-center`}
                        >
                          {getAddressIcon(addr.label)}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="p-1.5 bg-white text-slate-400 rounded-lg hover:text-[#00503a]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 bg-white text-slate-400 rounded-lg hover:text-[#ba1a1a]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="p-1.5 bg-white text-slate-400 rounded-lg hover:text-[#00503a] text-xs"
                              title="Définir par défaut"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-[#00503a] mb-1">
                        {addr.label}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {addr.neighborhood}, {addr.street}, {addr.city}
                      </p>
                      {addr.landmark && (
                        <p className="text-xs text-slate-400 mt-2 italic">
                          {addr.landmark}
                        </p>
                      )}
                      {addr.isDefault && (
                        <span className="absolute top-6 right-6 px-2 py-0.5 bg-[#9ef4d0] text-[#00503a] text-[10px] font-bold rounded uppercase">
                          Défaut
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-white rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] tracking-tight mb-8">
                Préférences de Notification
              </h2>
              <div className="space-y-6">
                {/* SMS Alerts */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#f2f4f2] rounded-full flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#00503a]">Alertes SMS</p>
                      <p className="text-xs text-slate-500">
                        Recevez un message à chaque étape de la livraison.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={() => {
                        setSmsAlerts(!smsAlerts);
                        handleUpdatePreferences();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00503a]"></div>
                  </label>
                </div>

                {/* Email Invoices */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#f2f4f2] rounded-full flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#00503a]">
                        Facturation par Email
                      </p>
                      <p className="text-xs text-slate-500">
                        Envoi automatique de vos factures après paiement.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailInvoices}
                      onChange={() => {
                        setEmailInvoices(!emailInvoices);
                        handleUpdatePreferences();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00503a]"></div>
                  </label>
                </div>

                {/* Promotions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#f2f4f2] rounded-full flex items-center justify-center text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#00503a]">
                        Offres & Promotions
                      </p>
                      <p className="text-xs text-slate-500">
                        Soyez informés des réductions sur vos tarifs habituels.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promotions}
                      onChange={() => {
                        setPromotions(!promotions);
                        handleUpdatePreferences();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00503a]"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-white rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] tracking-tight mb-8">
                Méthodes de Paiement
              </h2>
              <div className="space-y-4">
                {/* MTN MoMo */}
                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    defaultPayment === "mtn"
                      ? "border-[#00503a] bg-[#9ef4d0]/10"
                      : "border-transparent bg-[#f2f4f2] hover:bg-[#e7e9e6]"
                  }`}
                  onClick={() => handleUpdatePaymentMethod("mtn")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#feb700] rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1b]">
                          MTN Mobile Money
                        </p>
                        <p className="text-xs text-slate-500">
                          {defaultPayment === "mtn"
                            ? "Par défaut"
                            : "Définir par défaut"}
                        </p>
                      </div>
                    </div>
                    {defaultPayment === "mtn" && (
                      <CheckCircle className="w-6 h-6 text-[#00503a]" />
                    )}
                  </div>
                </div>

                {/* Orange Money */}
                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    defaultPayment === "orange"
                      ? "border-[#00503a] bg-[#9ef4d0]/10"
                      : "border-transparent bg-[#f2f4f2] hover:bg-[#e7e9e6]"
                  }`}
                  onClick={() => handleUpdatePaymentMethod("orange")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ff6b00] rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1b]">Orange Money</p>
                        <p className="text-xs text-slate-500">
                          {defaultPayment === "orange"
                            ? "Par défaut"
                            : "Définir par défaut"}
                        </p>
                      </div>
                    </div>
                    {defaultPayment === "orange" && (
                      <CheckCircle className="w-6 h-6 text-[#00503a]" />
                    )}
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    defaultPayment === "cash"
                      ? "border-[#00503a] bg-[#9ef4d0]/10"
                      : "border-transparent bg-[#f2f4f2] hover:bg-[#e7e9e6]"
                  }`}
                  onClick={() => handleUpdatePaymentMethod("cash")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00503a] rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1b]">
                          Paiement à la livraison
                        </p>
                        <p className="text-xs text-slate-500">
                          {defaultPayment === "cash"
                            ? "Par défaut"
                            : "Définir par défaut"}
                        </p>
                      </div>
                    </div>
                    {defaultPayment === "cash" && (
                      <CheckCircle className="w-6 h-6 text-[#00503a]" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-[#191c1b] tracking-tight mb-8">
                Sécurité
              </h2>
              <div className="flex items-center justify-between p-6 bg-[#f2f4f2] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00503a]/10 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#00503a]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1b]">Mot de passe</p>
                    <p className="text-xs text-slate-500">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-[#00503a] text-white font-bold text-sm rounded-lg hover:bg-[#006a4e] transition-colors"
                >
                  Modifier
                </button>
              </div>
            </section>

            {/* Account Deactivation */}
            <section className="bg-[#ffdad6]/20 rounded-3xl p-8 border-2 border-dashed border-[#ba1a1a]/20">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-6 h-6 text-[#ba1a1a]" />
                <h2 className="text-xl font-bold text-[#ba1a1a]">
                  Zone de Sécurité
                </h2>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-sm text-slate-700 leading-relaxed max-w-lg">
                  La désactivation de votre compte est irréversible. Toutes vos
                  adresses enregistrées et votre historique de commandes seront
                  définitivement supprimés.
                </p>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="px-6 py-3 bg-white text-[#ba1a1a] font-bold rounded-xl border border-[#ba1a1a]/20 hover:bg-[#ba1a1a] hover:text-white transition-all"
                >
                  DÉSACTIVER MON COMPTE
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      <PageFooter />
      <MobileNav />

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#191c1b]">
                Ajouter une adresse
              </h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Type d'adresse
                </label>
                <div className="flex gap-4">
                  {[
                    { v: "home", label: "Domicile", icon: Home },
                    { v: "work", label: "Bureau", icon: Briefcase },
                    { v: "other", label: "Autre", icon: MapPin },
                  ].map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() => setNewAddressLabel(v)}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        newAddressLabel === v
                          ? "border-[#00503a] bg-[#9ef4d0]/10"
                          : "border-transparent bg-[#f2f4f2] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${newAddressLabel === v ? "text-[#00503a]" : "text-slate-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${newAddressLabel === v ? "text-[#00503a]" : "text-slate-600"}`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Quartier *
                </label>
                <input
                  type="text"
                  value={newAddressNeighborhood}
                  onChange={(e) => setNewAddressNeighborhood(e.target.value)}
                  placeholder="Ex: Bastos, Mvan, Nlongkak..."
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Rue / Avenue *
                </label>
                <input
                  type="text"
                  value={newAddressStreet}
                  onChange={(e) => setNewAddressStreet(e.target.value)}
                  placeholder="Ex: Rue de l'Ambassade"
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Instructions supplémentaires
                </label>
                <textarea
                  value={newAddressLandmark}
                  onChange={(e) => setNewAddressLandmark(e.target.value)}
                  placeholder="Ex: Porte verte, 2ème étage..."
                  rows={3}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddressIsDefault}
                  onChange={(e) => setNewAddressIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#00503a] focus:ring-[#00503a]"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-[#191c1b]"
                >
                  Définir comme adresse par défaut
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="flex-1 py-3 bg-[#f2f4f2] text-[#191c1b] font-bold rounded-lg hover:bg-[#e7e9e6] transition-all"
              >
                ANNULER
              </button>
              <button
                onClick={handleAddAddress}
                disabled={savingAddress}
                className="flex-1 py-3 bg-[#00503a] text-white font-bold rounded-lg hover:bg-[#006a4e] transition-all disabled:opacity-50"
              >
                {savingAddress ? "AJOUT..." : "AJOUTER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#191c1b]">
                Modifier l'adresse
              </h3>
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Type d'adresse
                </label>
                <div className="flex gap-4">
                  {[
                    { v: "home", label: "Domicile", icon: Home },
                    { v: "work", label: "Bureau", icon: Briefcase },
                    { v: "other", label: "Autre", icon: MapPin },
                  ].map(({ v, label, icon: Icon }) => (
                    <button
                      key={v}
                      onClick={() => setNewAddressLabel(v)}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        newAddressLabel === v
                          ? "border-[#00503a] bg-[#9ef4d0]/10"
                          : "border-transparent bg-[#f2f4f2] hover:bg-[#e7e9e6]"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${newAddressLabel === v ? "text-[#00503a]" : "text-slate-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${newAddressLabel === v ? "text-[#00503a]" : "text-slate-600"}`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Quartier *
                </label>
                <input
                  type="text"
                  value={newAddressNeighborhood}
                  onChange={(e) => setNewAddressNeighborhood(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Rue / Avenue *
                </label>
                <input
                  type="text"
                  value={newAddressStreet}
                  onChange={(e) => setNewAddressStreet(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Instructions supplémentaires
                </label>
                <textarea
                  value={newAddressLandmark}
                  onChange={(e) => setNewAddressLandmark(e.target.value)}
                  rows={3}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefaultEdit"
                  checked={newAddressIsDefault}
                  onChange={(e) => setNewAddressIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#00503a] focus:ring-[#00503a]"
                />
                <label
                  htmlFor="isDefaultEdit"
                  className="text-sm font-medium text-[#191c1b]"
                >
                  Définir comme adresse par défaut
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="flex-1 py-3 bg-[#f2f4f2] text-[#191c1b] font-bold rounded-lg hover:bg-[#e7e9e6] transition-all"
              >
                ANNULER
              </button>
              <button
                onClick={handleUpdateAddress}
                disabled={savingAddress}
                className="flex-1 py-3 bg-[#00503a] text-white font-bold rounded-lg hover:bg-[#006a4e] transition-all disabled:opacity-50"
              >
                {savingAddress ? "MISE À JOUR..." : "ENREGISTRER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#191c1b]">
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f2f4f2] border-none rounded-lg p-3 text-[#191c1b] focus:ring-2 focus:ring-[#00503a]/20 transition-all"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 bg-[#f2f4f2] text-[#191c1b] font-bold rounded-lg hover:bg-[#e7e9e6] transition-all"
              >
                ANNULER
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-3 bg-[#00503a] text-white font-bold rounded-lg hover:bg-[#006a4e] transition-all"
              >
                CONFIRMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#ffdad6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#ba1a1a]" />
              </div>
              <h3 className="text-xl font-bold text-[#191c1b] mb-2">
                Désactiver votre compte ?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Cette action est irréversible. Toutes vos données seront
                supprimées définitivement.
              </p>
              <div className="bg-[#ffdad6]/20 p-4 rounded-xl text-left mb-6">
                <p className="text-xs text-[#ba1a1a] font-medium">
                  • Vos adresses enregistrées seront supprimées
                  <br />• Votre historique de commandes sera perdu
                  <br />• Vos points de fidélité seront annulés
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-3 bg-[#f2f4f2] text-[#191c1b] font-bold rounded-lg hover:bg-[#e7e9e6] transition-all"
              >
                ANNULER
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="flex-1 py-3 bg-[#ba1a1a] text-white font-bold rounded-lg hover:bg-[#c0392b] transition-all"
              >
                CONFIRMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
