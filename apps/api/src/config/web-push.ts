import webPush from 'web-push';
import { logger } from '../utils/logger';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    'mailto:admin@taradelivery.com',
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  logger.warn('VAPID keys not configured. Push notifications will be disabled.');
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }&gt;;
  data?: Record<string, unknown>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a push notification to a subscribed client
 * @param subscription - The push subscription from the client
 * @param payload - Notification content
 * @returns Promise resolving to the push result
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<{ success: boolean; message?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.debug('Push notifications not configured');
    return { success: false, message: 'Push notifications not configured' };
  }

  try {
    await webPush.sendNotification(
      subscription as any,
      JSON.stringify(payload)
    );
    logger.debug('Push notification sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('Failed to send push notification:', error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Send notification to multiple subscribers
 * @param subscriptions - Array of push subscriptions
 * @param payload - Notification content
 * @returns Results for each subscription
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<Map<string, { success: boolean; message?: string }>> {
  const results = new Map<string, { success: boolean; message?: string }>();

  await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      results.set(sub.endpoint, result);
    })
  );

  return results;
}

/**
 * Generate VAPID keys (run once and store in env)
 * @returns Object with public and private keys
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webPush.generateVAPIDKeys();
}

export { webPush };
