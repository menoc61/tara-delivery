// Delivery fee calculation utilities

const BASE_FEE = 500; // XAF
const DISTANCE_FEE_PER_KM = 150; // XAF per km
const WEIGHT_THRESHOLD = 2; // kg
const WEIGHT_FEE_PER_KG = 100; // XAF per kg above threshold
const URGENT_FEE = 1000; // XAF
const FRAGILE_FEE = 300; // XAF
const REFRIGERATED_FEE = 500; // XAF
const INSURANCE_FEE = 250; // XAF
const VAT_RATE = 0.1925; // 19.25%
const MIN_FEE = 500; // XAF
const MAX_FEE = 15000; // XAF

// Order type surcharges
const ORDER_TYPE_SURCHARGES: Record<string, number> = {
  PARCEL: 0,
  FOOD: 0,
  PHARMACY: 200,
  GROCERY: 200,
  COURIER: 500,
  OTHER: 0,
};

// Average speed in Yaoundé (km/h)
const AVERAGE_SPEED = 25;

interface DeliveryFeeParams {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  weight: number;
  orderType: "PARCEL" | "FOOD" | "PHARMACY" | "GROCERY" | "COURIER" | "OTHER";
  isUrgent?: boolean;
  isFragile?: boolean;
  isRefrigerated?: boolean;
}

interface DeliveryFeeResult {
  baseFee: number;
  distance: number;
  distanceFee: number;
  weightFee: number;
  typeSurcharge: number;
  urgentFee: number;
  fragileFee: number;
  refrigeratedFee: number;
  insuranceFee: number;
  subtotal: number;
  vat: number;
  total: number;
  eta: number; // minutes
}

// Haversine formula to calculate distance between two points
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDeliveryFee(
  params: DeliveryFeeParams,
): DeliveryFeeResult {
  const {
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
    weight,
    orderType,
    isUrgent = false,
    isFragile = false,
    isRefrigerated = false,
  } = params;

  // Calculate distance
  const distance = haversineDistance(
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
  );

  // Base fee
  const baseFee = BASE_FEE;

  // Distance fee
  const distanceFee = Math.round(distance * DISTANCE_FEE_PER_KM);

  // Weight fee (only if above threshold)
  const weightFee =
    weight > WEIGHT_THRESHOLD
      ? Math.round((weight - WEIGHT_THRESHOLD) * WEIGHT_FEE_PER_KG)
      : 0;

  // Order type surcharge
  const typeSurcharge = ORDER_TYPE_SURCHARGES[orderType] || 0;

  // Optional services
  const urgentFee = isUrgent ? URGENT_FEE : 0;
  const fragileFee = isFragile ? FRAGILE_FEE : 0;
  const refrigeratedFee = isRefrigerated ? REFRIGERATED_FEE : 0;
  const insuranceFee = INSURANCE_FEE;

  // Calculate subtotal
  const subtotal =
    baseFee +
    distanceFee +
    weightFee +
    typeSurcharge +
    urgentFee +
    fragileFee +
    refrigeratedFee +
    insuranceFee;

  // Calculate VAT
  const vat = Math.round(subtotal * VAT_RATE);

  // Calculate total (clamped to min/max)
  const total = Math.min(Math.max(subtotal + vat, MIN_FEE), MAX_FEE);

  // Calculate ETA (in minutes)
  const eta = Math.round((distance / AVERAGE_SPEED) * 60) + 15; // Add 15 min for pickup/delivery

  return {
    baseFee,
    distance: Math.round(distance * 10) / 10,
    distanceFee,
    weightFee,
    typeSurcharge,
    urgentFee,
    fragileFee,
    refrigeratedFee,
    insuranceFee,
    subtotal,
    vat,
    total,
    eta: Math.max(eta, 20), // Minimum 20 minutes
  };
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CM").format(amount) + " XAF";
}

// Yaoundé neighborhoods with approximate coordinates
export const YAOUNDE_NEIGHBORHOODS = [
  { name: "Bastos", lat: 3.8667, lng: 11.5167 },
  { name: "Mvan", lat: 3.85, lng: 11.5 },
  { name: "Nlongkak", lat: 3.8833, lng: 11.5167 },
  { name: "Biyem-Assi", lat: 3.8333, lng: 11.5 },
  { name: "Mokolo", lat: 3.8667, lng: 11.5 },
  { name: "Ahala", lat: 3.85, lng: 11.5333 },
  { name: "Ngousso", lat: 3.8667, lng: 11.5333 },
  { name: "Odza", lat: 3.8167, lng: 11.5167 },
  { name: "Essos", lat: 3.8667, lng: 11.5 },
  { name: "Mvog-Ada", lat: 3.85, lng: 11.5167 },
  { name: "Ekounou", lat: 3.8667, lng: 11.55 },
  { name: "Nkoldongo", lat: 3.8333, lng: 11.4833 },
  { name: "Mendong", lat: 3.8167, lng: 11.5 },
  { name: "Omnisport", lat: 3.8667, lng: 11.5167 },
  { name: "Messa", lat: 3.8667, lng: 11.5167 },
  { name: "Santa Barbara", lat: 3.85, lng: 11.55 },
  { name: "Etoug-Ebe", lat: 3.85, lng: 11.5 },
  { name: "Nkolmesseng", lat: 3.8333, lng: 11.5167 },
  { name: "Tsinga", lat: 3.8667, lng: 11.5167 },
  { name: "Elig-Essono", lat: 3.8667, lng: 11.5 },
];
