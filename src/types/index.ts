export type PlaceType = 'restaurant' | 'hotel' | 'attraction' | 'beach' | 'shopping' | 'event' | 'workshop' | 'activity' | 'entertainment' | 'prayer' | 'meal';

export type PlaceCategory = 'Attractions' | 'Restaurants' | 'Events' | 'Beaches' | 'Shopping' | 'Activities' | 'Workshops' | 'Entertainment' | 'Business' | 'Museums' | 'Lifestyle' | 'Hotels' | 'Prayer';

export type TimeCategory = 'breakfast' | 'lunch' | 'dinner' | 'prayer' | 'hotel' | 'visit' | 'activity' | 'gas';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  category: PlaceCategory[];
  description: string;
  images: string[];
  timeToReach: number; // in minutes
  price: number; // in OMR
  currency: string;
  accommodationType?: string;
  location?: string;
  distanceFromUser?: number; // in km
  timeCategory?: TimeCategory; // When during the day this place is for
  time?: string; // Specific time for the place (e.g., "09:00", "14:30")
  needsApproval?: boolean; // Whether this place needs approval from all travelers
  approvedBy?: string[]; // List of traveler IDs who approved this place
  totalTravelers?: number; // Total number of travelers for approval tracking
}

export interface Day {
  id: string;
  tripId: string;
  date: Date;
  dayNumber: number;
  places: Place[];
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  days: Day[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendedPlace extends Omit<Place, 'id'> {
  id?: string; // Optional ID for updating recommendations
  dateRange?: string;
  featured?: boolean;
}

export interface TripStats {
  totalCost: number;
  totalDistance: number; // in minutes
  totalPlaces: number;
  currency: string;
}
