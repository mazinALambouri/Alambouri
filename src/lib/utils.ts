import { Trip, TripStats, Day } from '../types';
import { format, differenceInDays } from 'date-fns';

const EXCHANGE_RATES: Record<string, number> = {
  'SAR': 1,
  'QAR': 1.03, // 1 QAR ≈ 1.03 SAR
  'AED': 1.02, // 1 AED ≈ 1.02 SAR
  'OMR': 9.75, // 1 OMR ≈ 9.75 SAR
  'KWD': 12.25, // 1 KWD ≈ 12.25 SAR
  'BHD': 9.95, // 1 BHD ≈ 9.95 SAR
  'USD': 3.75, // 1 USD ≈ 3.75 SAR
};

export function calculateTripStats(trip: Trip): TripStats {
  let totalCostSAR = 0;
  let totalDistance = 0;
  let totalPlaces = 0;

  trip.days.forEach(day => {
    day.places.forEach(place => {
      // Convert price to SAR
      const rate = EXCHANGE_RATES[place.currency] || 1;
      totalCostSAR += place.price * rate;

      totalDistance += place.timeToReach;
      totalPlaces++;
    });
  });

  return {
    totalCost: Math.round(totalCostSAR),
    totalDistance,
    totalPlaces,
    currency: 'SAR' // Standardize on SAR for the total
  };
}

export function calculateDayStats(day: Day) {
  let totalCostSAR = 0;
  let totalDistance = 0;

  day.places.forEach(place => {
    const rate = EXCHANGE_RATES[place.currency] || 1;
    totalCostSAR += place.price * rate;
    totalDistance += place.timeToReach;
  });

  return {
    totalCost: Math.round(totalCostSAR),
    totalDistance,
    currency: 'SAR'
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
