"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "TARA Delivery",
    supportEmail: "support@tara-delivery.cm",
    supportPhone: "+237 650 000 000",
    defaultDeliveryFee: 500,
    perKmFee: 150,
    maxDeliveryFee: 15000,
    minOrderAmount: 500,
    commissionRate: 15,
    timezone: "Africa/Douala",
    language: "fr",
  });

  const handleSave = () => {
    alert("Paramètres enregistrés avec succès!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* General Settings */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-on-surface">ParamètresGénéraux</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Nom de l'application</label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) =>
                setSettings({ ...settings, appName: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email support</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">Téléphone support</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings({ ...settings, supportPhone: e.target.value })
                }
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-on-surface">Paramètres de Livraison</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Frais de base (XAF)</label>
            <input
              type="number"
              value={settings.defaultDeliveryFee}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultDeliveryFee: parseInt(e.target.value),
                })
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Frais par km (XAF)</label>
            <input
              type="number"
              value={settings.perKmFee}
              onChange={(e) =>
                setSettings({ ...settings, perKmFee: parseInt(e.target.value) })
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Frais max (XAF)</label>
            <input
              type="number"
              value={settings.maxDeliveryFee}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxDeliveryFee: parseInt(e.target.value),
                })
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Commande min (XAF)</label>
            <input
              type="number"
              value={settings.minOrderAmount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minOrderAmount: parseInt(e.target.value),
                })
              }
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-on-surface">Commission & Revenue</h3>
        </div>

        <div>
          <label className="label">Taux de commission (%)</label>
          <input
            type="number"
            value={settings.commissionRate}
            onChange={(e) =>
              setSettings({
                ...settings,
                commissionRate: parseInt(e.target.value),
              })
            }
            className="input max-w-xs"
          />
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-on-surface">Paramètres Régionaux</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fuseau horaire</label>
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="input"
            >
              <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
              <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
            </select>
          </div>
          <div>
            <label className="label">Langue</label>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="input"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
