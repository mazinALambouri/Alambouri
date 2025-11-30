import { Trip, TripStats, Day } from '../types';
import { format, differenceInDays } from 'date-fns';

// Exchange rates to OMR (Omani Rial)
const EXCHANGE_RATES_TO_OMR: Record<string, number> = {
  'OMR': 1,
  'SAR': 0.103, // 1 SAR ≈ 0.103 OMR
  'QAR': 0.106, // 1 QAR ≈ 0.106 OMR
  'AED': 0.105, // 1 AED ≈ 0.105 OMR
  'KWD': 1.26,  // 1 KWD ≈ 1.26 OMR
  'BHD': 1.02,  // 1 BHD ≈ 1.02 OMR
  'USD': 0.385, // 1 USD ≈ 0.385 OMR
};

export function calculateTripStats(trip: Trip): TripStats {
  let totalCostOMR = 0;
  let totalDistance = 0;
  let totalPlaces = 0;

  trip.days.forEach(day => {
    day.places.forEach(place => {
      // Convert price to OMR
      const rate = EXCHANGE_RATES_TO_OMR[place.currency] || 1;
      totalCostOMR += place.price * rate;

      totalDistance += place.timeToReach || 0;
      totalPlaces++;
    });
  });

  return {
    totalCost: Math.round(totalCostOMR * 100) / 100, // Round to 2 decimal places
    totalDistance,
    totalPlaces,
    currency: 'OMR' // Standardize on OMR for the total
  };
}

export function calculateDayStats(day: Day) {
  let totalCostOMR = 0;
  let totalDistance = 0;

  day.places.forEach(place => {
    const rate = EXCHANGE_RATES_TO_OMR[place.currency] || 1;
    totalCostOMR += place.price * rate;
    totalDistance += place.timeToReach;
  });

  return {
    totalCost: Math.round(totalCostOMR * 100) / 100,
    totalDistance,
    currency: 'OMR'
  };
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM dd');
}

export function formatDateCard(date: Date): string {
  return format(date, 'MMM');
}

export function formatDay(date: Date): string {
  return format(date, 'dd');
}

export function getTripDuration(trip: Trip): number {
  return differenceInDays(trip.endDate, trip.startDate) + 1;
}

export function formatCurrency(amount: number, currency: string = 'BHD'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatDistance(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `${hours}h ${mins}m`;
}

export function formatDistanceKm(km: number): string {
  return `${km.toFixed(1)} km from you`;
}

export function cn(...classes: (string | boolean | undefined | Record<string, boolean>)[]): string {
  return classes
    .map(cls => {
      if (typeof cls === 'object' && cls !== null) {
        return Object.keys(cls).filter(key => cls[key]).join(' ');
      }
      return cls;
    })
    .filter(Boolean)
    .join(' ');
}
