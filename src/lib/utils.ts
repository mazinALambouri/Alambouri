import { Trip, TripStats, Day } from '../types';
import { format, differenceInDays } from 'date-fns';

export function calculateTripStats(trip: Trip): TripStats {
  let totalCost = 0;
  let totalDistance = 0;
  let totalPlaces = 0;
  let currency = 'BHD';

  trip.days.forEach(day => {
    day.places.forEach(place => {
      totalCost += place.price;
      totalDistance += place.timeToReach;
      totalPlaces++;
      currency = place.currency; // Use the currency from places
    });
  });

  return {
    totalCost,
    totalDistance,
    totalPlaces,
    currency
  };
}

export function calculateDayStats(day: Day) {
  let totalCost = 0;
  let totalDistance = 0;
  let currency = 'BHD';

  day.places.forEach(place => {
    totalCost += place.price;
    totalDistance += place.timeToReach;
    currency = place.currency;
  });

  return { totalCost, totalDistance, currency };
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

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
