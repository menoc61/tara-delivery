import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { GeoLocation, OrderUpdate } from "@tara/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

let locationChannel: RealtimeChannel | null = null;
let orderChannel: RealtimeChannel | null = null;

export const initSupabaseClient = () => {
  if (!supabase) {
    console.warn(
      "Supabase not configured. Realtime features will be disabled.",
    );
  }
  return supabase;
};

export const subscribeToRiderLocation = (
  riderId: string,
  callback: (
    location: GeoLocation & { heading?: number; speed?: number },
  ) => void,
) => {
  if (!supabase) return () => {};

  if (locationChannel) {
    supabase.removeChannel(locationChannel);
  }

  locationChannel = supabase
    .channel(`rider-location:${riderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Rider",
        filter: `userId=eq.${riderId}`,
      },
      (payload) => {
        const newRec = payload.new as {
          currentLat: number;
          currentLng: number;
        };
        callback({
          lat: newRec.currentLat,
          lng: newRec.currentLng,
        });
      },
    )
    .subscribe();

  return () => {
    if (locationChannel) {
      supabase.removeChannel(locationChannel);
      locationChannel = null;
    }
  };
};

export const subscribeToOrderUpdates = (
  orderId: string,
  callback: (update: OrderUpdate) => void,
) => {
  if (!supabase) return () => {};

  if (orderChannel) {
    supabase.removeChannel(orderChannel);
  }

  orderChannel = supabase
    .channel(`order-updates:${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Order",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        const newRec = payload.new as { status: string };
        callback({
          status: newRec.status,
        } as OrderUpdate);
      },
    )
    .subscribe();

  return () => {
    if (orderChannel) {
      supabase.removeChannel(orderChannel);
      orderChannel = null;
    }
  };
};

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (typeof window === "undefined") return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    return "subscribed";
  } catch {
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  return () => {};
};

export { supabase };
