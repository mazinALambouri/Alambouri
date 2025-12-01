import { supabase } from './supabase';
import { Trip, Day, Place, RecommendedPlace } from '../types';

// --- Helper to map DB rows to App Types ---

function mapPlace(row: any): Place {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    category: row.category || [],
    description: row.description,
    images: row.images || [],
    timeToReach: row.time_to_reach,
    price: parseFloat(row.price),
    currency: row.currency || 'OMR',
    accommodationType: row.accommodation_type,
    location: row.location,
    distanceFromUser: row.distance_from_user,
    timeCategory: row.time_category,
    time: row.time,
    needsApproval: row.needs_approval || false,
    approvedBy: row.approved_by || [],
    totalTravelers: row.total_travelers || 6,
  };
}

function mapDay(row: any, places: Place[] = []): Day {
  return {
    id: row.id,
    tripId: row.trip_id,
    date: new Date(row.date),
    dayNumber: row.day_number,
    places: places,
  };
}

function mapTrip(row: any, days: Day[] = []): Trip {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    days: days,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// --- Trip Operations ---

export async function getAllTrips(): Promise<Trip[]> {
  // Fetch trips
  const { data: tripsData, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (tripsError) {
    console.error('Error fetching trips:', tripsError);
    return [];
  }

  // For each trip, we need its days and places. 
  // This is N+1 query problem, but for a simple app it's fine. 
  // Better approach: use Supabase deep nesting if relations are set up correctly.

  const trips: Trip[] = [];

  for (const tripRow of tripsData) {
    const fullTrip = await getTrip(tripRow.id);
    if (fullTrip) {
      trips.push(fullTrip);
    }
  }

  return trips;
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  // 1. Get Trip
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (tripError || !tripData) return undefined;

  // 2. Get Days
  const { data: daysData, error: daysError } = await supabase
    .from('days')
    .select('*')
    .eq('trip_id', id)
    .order('day_number', { ascending: true });

  if (daysError) return undefined;

  // 3. Get Places for all days
  const dayIds = daysData.map(d => d.id);
  let placesData: any[] = [];

  if (dayIds.length > 0) {
    const { data: places, error: placesError } = await supabase
      .from('places')
      .select('*')
      .in('day_id', dayIds);

    if (!placesError && places) {
      placesData = places;
    }
  }

  // 4. Assemble
  const days: Day[] = daysData.map(dayRow => {
    const dayPlaces = placesData
      .filter(p => p.day_id === dayRow.id)
      .map(mapPlace);
    return mapDay(dayRow, dayPlaces);
  });

  return mapTrip(tripData, days);
}

export async function createTrip(
  name: string,
  location: string,
  startDate: Date,
  endDate: Date
): Promise<Trip> {
  // 1. Insert Trip
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .insert({
      name,
      location,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
    .select()
    .single();

  if (tripError) throw tripError;

  // 2. Create Days
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysToInsert = [];

  for (let i = 0; i < dayCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    daysToInsert.push({
      trip_id: tripData.id,
      date: date.toISOString(),
      day_number: i + 1,
    });
  }

  const { data: daysData, error: daysError } = await supabase
    .from('days')
    .insert(daysToInsert)
    .select();

  if (daysError) throw daysError;

  // Return full trip object
  const days = daysData.map(d => mapDay(d, []));
  return mapTrip(tripData, days);
}

export async function saveTrip(trip: Trip): Promise<void> {
  // In Supabase, we usually update specific fields, but here we might just update the trip details
  await supabase
    .from('trips')
    .update({
      name: trip.name,
      location: trip.location,
      start_date: trip.startDate.toISOString(),
      end_date: trip.endDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', trip.id);
}

export async function deleteTrip(id: string): Promise<void> {
  await supabase.from('trips').delete().eq('id', id);
}

// --- Day Operations ---

export async function addDay(tripId: string): Promise<Day | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const lastDay = trip.days[trip.days.length - 1];
  const newDate = new Date(lastDay.date);
  newDate.setDate(newDate.getDate() + 1);
  const newDayNumber = trip.days.length + 1;

  const { data: dayData, error } = await supabase
    .from('days')
    .insert({
      trip_id: tripId,
      date: newDate.toISOString(),
      day_number: newDayNumber,
    })
    .select()
    .single();

  if (error) return null;

  // Update trip end date
  await supabase
    .from('trips')
    .update({ end_date: newDate.toISOString() })
    .eq('id', tripId);

  return mapDay(dayData, []);
}

export async function deleteDay(tripId: string, dayId: string): Promise<void> {
  // 1. Get trip start date first (needed for date recalculation)
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('start_date')
    .eq('id', tripId)
    .single();

  if (tripError || !trip) throw new Error('Trip not found');

  // 2. Delete the day
  const { error: deleteError } = await supabase.from('days').delete().eq('id', dayId);
  if (deleteError) throw deleteError;

  // 3. Fetch remaining days ordered by day_number
  const { data: remainingDays, error: fetchError } = await supabase
    .from('days')
    .select('id, day_number, date')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (fetchError || !remainingDays) return;

  // 4. Reorder days sequentially with proper dates
  const startDate = new Date(trip.start_date);
  const updates = remainingDays.map((day, index) => {
    const newDayNumber = index + 1;
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + index);

    // Always update to ensure both day_number and date are correct
    return supabase
      .from('days')
      .update({ 
        day_number: newDayNumber,
        date: newDate.toISOString()
      })
      .eq('id', day.id);
  });

  // 5. Execute all updates in parallel
  await Promise.all(updates);

  // 6. Update trip end date
  if (remainingDays.length > 0) {
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + remainingDays.length - 1);

    await supabase
      .from('trips')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', tripId);
  }
}

// --- Place Operations ---

export async function addPlaceToDay(
  _tripId: string,
  dayId: string,
  place: Omit<Place, 'id'>
): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places')
    .insert({
      day_id: dayId,
      name: place.name,
      type: place.type,
      category: place.category,
      description: place.description,
      images: place.images,
      time_to_reach: place.timeToReach,
      price: place.price,
      currency: place.currency || 'OMR',
      accommodation_type: place.accommodationType,
      location: place.location,
      distance_from_user: place.distanceFromUser,
      time_category: place.timeCategory,
      time: place.time,
      needs_approval: place.needsApproval || false,
      approved_by: place.approvedBy || [],
      total_travelers: place.totalTravelers || 6,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding place:', error);
    return null;
  }

  return mapPlace(data);
}

// Approve a place (add current user to approvedBy list)
export async function approvePlace(placeId: string, travelerId: string): Promise<void> {
  // First get the current approved list
  const { data: place, error: fetchError } = await supabase
    .from('places')
    .select('approved_by')
    .eq('id', placeId)
    .single();

  if (fetchError || !place) return;

  const currentApproved = place.approved_by || [];
  if (!currentApproved.includes(travelerId)) {
    await supabase
      .from('places')
      .update({ approved_by: [...currentApproved, travelerId] })
      .eq('id', placeId);
  }
}

// Remove approval from a place
export async function unapprovePlace(placeId: string, travelerId: string): Promise<void> {
  const { data: place, error: fetchError } = await supabase
    .from('places')
    .select('approved_by')
    .eq('id', placeId)
    .single();

  if (fetchError || !place) return;

  const currentApproved = place.approved_by || [];
  await supabase
    .from('places')
    .update({ approved_by: currentApproved.filter((id: string) => id !== travelerId) })
    .eq('id', placeId);
}

export async function updatePlace(
  _tripId: string,
  _dayId: string,
  placeId: string,
  updates: Partial<Place>
): Promise<void> {
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.price) dbUpdates.price = updates.price;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.location) dbUpdates.location = updates.location;
  if (updates.time) dbUpdates.time = updates.time;
  if (updates.timeCategory) dbUpdates.time_category = updates.timeCategory;
  // ... map other fields as needed

  await supabase
    .from('places')
    .update(dbUpdates)
    .eq('id', placeId);
}

export async function deletePlace(
  _tripId: string,
  _dayId: string,
  placeId: string
): Promise<void> {
  await supabase.from('places').delete().eq('id', placeId);
}

export async function reorderPlaces(
  _tripId: string,
  _dayId: string,
  _placeIds: string[]
): Promise<void> {
  // This requires a 'order_index' column in the DB which we didn't add yet.
  // For now, we can skip or implement it if needed.
}

// --- Recommendations Functions ---

function mapRecommendation(row: any): RecommendedPlace {
  return {
    name: row.name,
    type: row.type,
    category: row.category || [],
    description: row.description || '',
    images: row.images || [],
    timeToReach: row.time_to_reach || 0,
    price: parseFloat(row.price) || 0,
    currency: row.currency || 'OMR',
    location: row.location,
    distanceFromUser: row.distance_from_user,
    dateRange: row.date_range,
    featured: row.featured || false,
    timeCategory: row.time_category,
    accommodationType: row.accommodation_type,
  };
}

export async function fetchRecommendations(): Promise<RecommendedPlace[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('featured', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }

  return data.map(mapRecommendation);
}

// --- Image Upload ---

export async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `place-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}
