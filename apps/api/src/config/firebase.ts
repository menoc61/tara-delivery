import * as admin from "firebase-admin";
import { logger } from "./logger";

let initialized = false;

export const initFirebase = () => {
  if (initialized || admin.apps.length > 0) return;

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    initialized = true;
    logger.info("✅ Firebase Admin initialized");
  } catch (error) {
    logger.warn("⚠️  Firebase initialization skipped (check env vars):", error);
  }
};

export const getFirebaseAdmin = () => admin;

export const getRealtimeDB = () => {
  if (!initialized) initFirebase();
  return admin.database();
};

export const getMessaging = () => {
  if (!initialized) initFirebase();
  return admin.messaging();
};

// Real-time location updates
export const updateRiderLocation = async (
  riderId: string,
  location: { lat: number; lng: number; heading?: number; speed?: number }
) => {
  const db = getRealtimeDB();
  await db.ref(`rider_locations/${riderId}`).set({
    ...location,
    timestamp: admin.database.ServerValue.TIMESTAMP,
  });
};

export const updateOrderStatus = async (
  orderId: string,
  update: {
    status: string;
    riderLocation?: { lat: number; lng: number };
    message?: string;
  }
) => {
  const db = getRealtimeDB();
  await db.ref(`order_updates/${orderId}`).push({
    ...update,
    timestamp: admin.database.ServerValue.TIMESTAMP,
  });
};

export const sendPushNotification = async (
  fcmToken: string,
  notification: { title: string; body: string; data?: Record<string, string> }
) => {
  const messaging = getMessaging();
  try {
    await messaging.send({
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        notification: {
          channelId: "tara_delivery",
          priority: "high",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    });
  } catch (error) {
    logger.error("FCM send error:", error);
    throw error;
  }
};
