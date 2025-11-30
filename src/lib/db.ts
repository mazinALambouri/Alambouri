import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Trip, Day, Place } from '../types';

interface TripPlannerDB extends DBSchema {
  trips: {
    key: string;
    value: Trip;
    indexes: { 'by-date': Date };
  };
}

const DB_NAME = 'trip-planner-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<TripPlannerDB> | null = null;

async function getDB(): Promise<IDBPDatabase<TripPlannerDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<TripPlannerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create trips store
      if (!db.objectStoreNames.contains('trips')) {
        const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
        tripStore.createIndex('by-date', 'startDate');
      }
    },
  });

  return dbInstance;
}

// Trip operations
export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDB();
  const trips = await db.getAll('trips');
  // Convert date strings back to Date objects
  return trips.map(trip => ({
    ...trip,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    createdAt: new Date(trip.createdAt),
    updatedAt: new Date(trip.updatedAt),
    days: trip.days.map(day => ({
      ...day,
      date: new Date(day.date)
    }))
  }));
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  const db = await getDB();
  const trip = await db.get('trips', id);
  if (!trip) return undefined;
  
  return {
    ...trip,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    createdAt: new Date(trip.createdAt),
    updatedAt: new Date(trip.updatedAt),
    days: trip.days.map(day => ({
      ...day,
      date: new Date(day.date)
    }))
  };
}

export async function saveTrip(trip: Trip): Promise<void> {
  const db = await getDB();
  await db.put('trips', {
    ...trip,
    updatedAt: new Date()
  });
}

export async function deleteTrip(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('trips', id);
}

export async function createTrip(
  name: string,
  location: string,
  startDate: Date,
  endDate: Date
): Promise<Trip> {
  const trip: Trip = {
    id: crypto.randomUUID(),
    name,
    location,
    startDate,
    endDate,
    days: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create days for the trip
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    trip.days.push({
      id: crypto.randomUUID(),
      tripId: trip.id,
      date,
      dayNumber: i + 1,
      places: [],
    });
  }

  await saveTrip(trip);
  return trip;
}

export async function addDay(tripId: string): Promise<Day | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const lastDay = trip.days[trip.days.length - 1];
  const newDate = new Date(lastDay.date);
  newDate.setDate(newDate.getDate() + 1);

  const newDay: Day = {
    id: crypto.randomUUID(),
    tripId,
    date: newDate,
    dayNumber: trip.days.length + 1,
    places: [],
  };

  trip.days.push(newDay);
  trip.endDate = newDate;
  await saveTrip(trip);
  return newDay;
}

export async function deleteDay(tripId: string, dayId: string): Promise<void> {
  const trip = await getTrip(tripId);
  if (!trip) return;

  trip.days = trip.days.filter(d => d.id !== dayId);
  
  // Renumber days
  trip.days.forEach((day, index) => {
    day.dayNumber = index + 1;
  });

  if (trip.days.length > 0) {
    trip.endDate = trip.days[trip.days.length - 1].date;
  }

  await saveTrip(trip);
}

export async function addPlaceToDay(
  tripId: string,
  dayId: string,
  place: Omit<Place, 'id'>
): Promise<Place | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const day = trip.days.find(d => d.id === dayId);
  if (!day) return null;

  const newPlace: Place = {
    ...place,
    id: crypto.randomUUID(),
  };

  day.places.push(newPlace);
  await saveTrip(trip);
  return newPlace;
}

export async function updatePlace(
  tripId: string,
  dayId: string,
  placeId: string,
  updates: Partial<Place>
): Promise<void> {
  const trip = await getTrip(tripId);
  if (!trip) return;

  const day = trip.days.find(d => d.id === dayId);
  if (!day) return;

  const placeIndex = day.places.findIndex(p => p.id === placeId);
  if (placeIndex === -1) return;

  day.places[placeIndex] = {
    ...day.places[placeIndex],
    ...updates,
  };

  await saveTrip(trip);
}

export async function deletePlace(
  tripId: string,
  dayId: string,
  placeId: string
): Promise<void> {
  const trip = await getTrip(tripId);
  if (!trip) return;

  const day = trip.days.find(d => d.id === dayId);
  if (!day) return;

  day.places = day.places.filter(p => p.id !== placeId);
  await saveTrip(trip);
}

export async function reorderPlaces(
  tripId: string,
  dayId: string,
  placeIds: string[]
): Promise<void> {
  const trip = await getTrip(tripId);
  if (!trip) return;

  const day = trip.days.find(d => d.id === dayId);
  if (!day) return;

  const reorderedPlaces: Place[] = [];
  placeIds.forEach(id => {
    const place = day.places.find(p => p.id === id);
    if (place) {
      reorderedPlaces.push(place);
    }
  });

  day.places = reorderedPlaces;
  await saveTrip(trip);
}
