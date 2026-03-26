import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, ref, onValue, off, Database } from "firebase/database";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { GeoLocation, OrderUpdate } from "@tara/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Database;
let messaging: Messaging | null = null;

export const initFirebaseClient = () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getDatabase(app);

  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      messaging = getMessaging(app);
    } catch {
      console.warn("Firebase messaging not available");
    }
  }

  return { app, db };
};

export const subscribeToRiderLocation = (
  riderId: string,
  callback: (location: GeoLocation & { heading?: number; speed?: number }) => void
) => {
  if (!db) initFirebaseClient();
  const locationRef = ref(db, `rider_locations/${riderId}`);
  onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) callback(snapshot.val());
  });
  return () => off(locationRef);
};

export const subscribeToOrderUpdates = (
  orderId: string,
  callback: (update: OrderUpdate) => void
) => {
  if (!db) initFirebaseClient();
  const orderRef = ref(db, `order_updates/${orderId}`);
  onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      const updates = snapshot.val();
      const latest = Object.values(updates).at(-1);
      if (latest) callback(latest as OrderUpdate);
    }
  });
  return () => off(orderRef);
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch {
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
