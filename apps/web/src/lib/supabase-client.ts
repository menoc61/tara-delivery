import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Realtime features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

export type RiderLocation = {
  lat: number;
  lng: number;
  lastUpdated?: string;
};

export type OrderUpdate = {
  id: string;
  status?: string;
  riderId?: string;
  currentLat?: number;
  currentLng?: number;
  updatedAt?: string;
  [key: string]: unknown;
};

/**
 * Subscribe to real-time rider location updates
 * @param riderId - The rider's user ID
 * @param callback - Function called when location updates
 * @returns Subscription object for cleanup
 */
export function subscribeToRiderLocation(
  riderId: string,
  callback: (location: RiderLocation) => void
) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const channel = supabase
    .channel(`rider-${riderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rider',
        filter: `userId=eq.${riderId}`
      },
      (payload) => {
        callback({
          lat: payload.new.currentLat,
          lng: payload.new.currentLng,
          lastUpdated: payload.new.updatedAt
        });
      }
    )
    .subscribe((status) => {
      console.log(`Rider subscription status: ${status}`);
    });

  return channel;
}

/**
 * Subscribe to real-time order updates
 * @param orderId - The order ID to watch
 * @param callback - Function called when order updates
 * @returns Subscription object for cleanup
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: OrderUpdate) => void
) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        callback(payload.new as OrderUpdate);
      }
    )
    .subscribe((status) => {
      console.log(`Order subscription status: ${status}`);
    });

  return channel;
}

/**
 * Subscribe to notifications for a user
 * @param userId - The user ID
 * @param callback - Function called when new notification arrives
 * @returns Subscription object for cleanup
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: unknown) => void
) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
  }

  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notification',
        filter: `userId=eq.${userId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel
 * @param channel - The channel to unsubscribe
 */
export function unsubscribe(channel: unknown) {
  if (!supabase || !channel) return;
  supabase.removeChannel(channel as any);
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll() {
  if (!supabase) return;
  supabase.removeAllChannels();
}
