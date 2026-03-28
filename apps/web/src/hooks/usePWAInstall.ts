"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running as PWA on iOS
    if ("standalone" in navigator && (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    // If we have the install prompt, use it
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;

        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setInstallPrompt(null);
        }

        return choiceResult;
      } catch (error) {
        console.error("Install prompt error:", error);
      }
    }

    // Fallback: Show instructions based on browser
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      alert(
        "Pour installer TARA DELIVERY sur votre iPhone:\n\n" +
          "1. Appuyez sur le bouton Partager (📤) en bas\n" +
          "2. Faites défiler et appuyez sur \"Sur l'écran d'accueil\"\n" +
          '3. Appuyez sur "Ajouter"',
      );
    } else if (isAndroid) {
      alert(
        "Pour installer TARA DELIVERY:\n\n" +
          "1. Appuyez sur le menu (⋮) en haut à droite\n" +
          '2. Appuyez sur "Installer l\'application"\n' +
          "3. Confirmez l'installation",
      );
    } else {
      alert(
        "Pour installer TARA DELIVERY:\n\n" +
          "1. Cherchez l'icône d'installation dans la barre d'adresse\n" +
          "2. Ou utilisez le menu du navigateur\n" +
          '3. Sélectionnez "Installer TARA DELIVERY"',
      );
    }

    return { outcome: "dismissed" as const };
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
}
