'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NotificationPermission {
  permission: NotificationPermission | null;
  supported: boolean;
  subscribed: boolean;
  subscription: PushSubscription | null;
}

/**
 * Hook for managing web push notifications
 * Replaces Firebase Cloud Messaging
 */
export function usePushNotifications(vapidPublicKey?: string) {
  const [state, setState] = useState<NotificationPermission>({
    permission: null,
    supported: false,
    subscribed: false,
    subscription: null
  });

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      return;
    }

    setState(prev => ({ ...prev, supported: true, permission: Notification.permission }));

    // Check existing subscription
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState(prev => ({
        ...prev,
        subscribed: !!subscription,
        subscription: subscription || null
      }));
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission | null> => {
    if (!state.supported) return null;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return null;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.supported || !vapidPublicKey) return null;

    try {
      // Ensure service worker is registered
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await registration.update();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setState(prev => ({
        ...prev,
        subscribed: true,
        subscription,
        permission: 'granted' as NotificationPermission
      }));

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.subscription) return false;

    try {
      await state.subscription.unsubscribe();

      // Remove from server
      await removeSubscriptionFromServer(state.subscription);

      setState(prev => ({
        ...prev,
        subscribed: false,
        subscription: null
      }));

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe
  };
}

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Send push subscription to server
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
  }
}

/**
 * Remove push subscription from server
 */
async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
  }
}
