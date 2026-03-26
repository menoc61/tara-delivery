import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Supabase credentials not configured. Realtime features will be disabled.');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Broadcast a rider location update to all subscribers
 * Uses Supabase Realtime to notify clients
 */
export async function broadcastRiderLocation(
  riderId: string,
  location: { lat: number; lng: number }
): Promise<void> {
  if (!supabase) {
    logger.debug('Supabase not configured, skipping location broadcast');
    return;
  }

  try {
    // The actual update happens in Prisma (database)
    // Supabase Realtime will automatically notify subscribers
    logger.debug(`Broadcast rider location: ${riderId}`, location);
  } catch (error) {
    logger.error('Failed to broadcast rider location:', error);
  }
}

/**
 * Broadcast an order status update to all subscribers
 */
export async function broadcastOrderUpdate(
  orderId: string,
  update: Record<string, unknown>
): Promise<void> {
  if (!supabase) {
    logger.debug('Supabase not configured, skipping order broadcast');
    return;
  }

  try {
    // Database update triggers realtime notification
    logger.debug(`Broadcast order update: ${orderId}`, update);
  } catch (error) {
    logger.error('Failed to broadcast order update:', error);
  }
}

/**
 * Subscribe to database changes (for server-side use if needed)
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  filter?: { event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; filter?: string }
): void {
  if (!supabase) {
    logger.warn('Cannot subscribe: Supabase not configured');
    return;
  }

  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: filter?.event || '*',
        schema: 'public',
        table,
        filter: filter?.filter
      },
      callback
    )
    .subscribe();

  logger.debug(`Subscribed to ${table} changes`);
}
