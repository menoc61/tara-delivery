import { OrderType, DeliveryFeeInput, DeliveryFeeResult } from "@tara/types";

// Pricing in XAF (Central African Franc)
const PRICING = {
  BASE_FEE: 500,            // 500 XAF base fee
  PER_KM_RATE: 150,         // 150 XAF per km
  WEIGHT_RATE: 100,         // 100 XAF per kg above 2kg
  WEIGHT_FREE_LIMIT: 2,     // First 2kg free
  SURCHARGES: {
    [OrderType.FOOD]: 0,
    [OrderType.PARCEL]: 0,
    [OrderType.COURIER]: 500,
    [OrderType.GROCERY]: 200,
  },
  MIN_FEE: 500,
  MAX_FEE: 15000,
};

export const calculateDeliveryFee = (input: DeliveryFeeInput): DeliveryFeeResult => {
  const { distance, orderType, weight = 0 } = input;

  const baseFee = PRICING.BASE_FEE + (PRICING.SURCHARGES[orderType] || 0);
  const distanceFee = Math.ceil(distance * PRICING.PER_KM_RATE);
  const excessWeight = Math.max(0, weight - PRICING.WEIGHT_FREE_LIMIT);
  const weightFee = Math.ceil(excessWeight * PRICING.WEIGHT_RATE);

  const total = Math.min(
    Math.max(baseFee + distanceFee + weightFee, PRICING.MIN_FEE),
    PRICING.MAX_FEE
  );

  return { baseFee, distanceFee, weightFee, total };
};

// Haversine formula to calculate distance between two geo points
export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (val: number) => (val * Math.PI) / 180;

// Estimated delivery time in minutes
export const estimateDeliveryTime = (distanceKm: number): number => {
  const AVERAGE_SPEED_KMH = 20; // Yaoundé urban speed
  const PICKUP_TIME = 10;       // Minutes to reach pickup point
  return Math.ceil((distanceKm / AVERAGE_SPEED_KMH) * 60) + PICKUP_TIME;
};

export const generateOrderNumber = (): string => {
  const now = new Date();
  const prefix = "TD";
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${date}${rand}`;
};
