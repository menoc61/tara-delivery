"use client";

import { useEffect, useState, useCallback } from "react";
import { notificationsApi } from "@/lib/api-client";
import toast from "react-hot-toast";

const VAPID_PUBLIC_KEY =
  "BBqZsjJuNEDxIcN-9a3WYhZkl3RoMhq4UrxEqkqgmGQLBiAeOinyzizHqgStyVA4Pv4esovun3dkl2SfuU1GLJc";

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications non supportées");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        const subJson = JSON.stringify(existingSub);
        setSubscription(subJson);
        await notificationsApi.updateFcmToken(subJson);
        toast.success("Notifications activées");
        return;
      }

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = JSON.stringify(newSub);
      setSubscription(subJson);
      await notificationsApi.updateFcmToken(subJson);
      toast.success("Notifications activées!");
    } catch (err) {
      console.error("Push subscription error:", err);
      toast.error("Erreur d'activation des notifications");
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
        setSubscription(null);
        toast.success("Notifications désactivées");
      }
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    }
  }, []);

  return { subscription, isSupported, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export async function initPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported");
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register("/service-worker.js");
    console.log("Service Worker registered:", registration);

    await navigator.serviceWorker.ready;
    console.log("Service Worker ready");

    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      await notificationsApi.updateFcmToken(JSON.stringify(existingSub));
    }
  } catch (err) {
    console.error("Service Worker registration failed:", err);
  }
}
