import { Trip } from '../types';
import { addPlaceToDay } from './db';
import { recommendedPlaces } from '../data/recommendations';

// Pre-populate the 10-day Gulf road trip itinerary
export async function populateGulfItinerary(trip: Trip): Promise<void> {
  // Day 1: Travel day from Sohar to Doha (no places, just driving)
  
  // Day 2: Doha - First day
  if (trip.days[1]) {
    await addPlaceToDay(trip.id, trip.days[1].id, recommendedPlaces[0]); // The Pearl-Qatar
    await addPlaceToDay(trip.id, trip.days[1].id, recommendedPlaces[1]); // Museum of Islamic Art
  }
  
  // Day 3: Doha - Second day
  if (trip.days[2]) {
    await addPlaceToDay(trip.id, trip.days[2].id, recommendedPlaces[2]); // Souq Waqif
    await addPlaceToDay(trip.id, trip.days[2].id, recommendedPlaces[3]); // Katara Cultural Village
  }
  
  // Day 4: Al-Ahsa - First day (travel + arrive)
  if (trip.days[3]) {
    await addPlaceToDay(trip.id, trip.days[3].id, recommendedPlaces[4]); // Al-Ahsa Oasis
  }
  
  // Day 5: Al-Ahsa - Exploration
  if (trip.days[4]) {
    await addPlaceToDay(trip.id, trip.days[4].id, recommendedPlaces[5]); // Qasr Ibrahim
  }
  
  // Day 6: Travel day to Kuwait (no places, just driving)
  
  // Day 7: Kuwait City - Exploration
  if (trip.days[6]) {
    await addPlaceToDay(trip.id, trip.days[6].id, recommendedPlaces[6]); // Kuwait Towers
    await addPlaceToDay(trip.id, trip.days[6].id, recommendedPlaces[7]); // The Avenues Mall
  }
  
  // Day 8: Travel day to Hail (no places, just driving)
  
  // Day 9: Hail - Exploration
  if (trip.days[8]) {
    await addPlaceToDay(trip.id, trip.days[8].id, recommendedPlaces[8]); // Jubbah Rock Art
    await addPlaceToDay(trip.id, trip.days[8].id, recommendedPlaces[9]); // Qishlah Palace
  }
  
  // Day 10: Riyadh then back to Sohar
  if (trip.days[9]) {
    await addPlaceToDay(trip.id, trip.days[9].id, recommendedPlaces[10]); // Masmak Fortress
    await addPlaceToDay(trip.id, trip.days[9].id, recommendedPlaces[11]); // Kingdom Centre
  }
}

// Helper to get day description
export function getDayDescription(dayNumber: number): string {
  const descriptions: Record<number, string> = {
    1: "Travel Day: Sohar, Oman → Doha, Qatar (8 hour drive)",
    2: "Doha Exploration - Day 1",
    3: "Doha Exploration - Day 2",
    4: "Doha → Al-Ahsa, Saudi Arabia (3 hour drive) + Exploration",
    5: "Al-Ahsa Exploration",
    6: "Al-Ahsa → Kuwait City (4-5 hour drive)",
    7: "Kuwait City Exploration",
    8: "Kuwait City → Hail, Saudi Arabia (7-8 hour drive)",
    9: "Hail Exploration",
    10: "Hail → Riyadh → Sohar, Oman (Long drive or overnight in Riyadh)"
  };
  
  return descriptions[dayNumber] || `Day ${dayNumber}`;
}

// Helper to get recommended places for a specific day
export function getPlacesForDay(dayNumber: number): number[] {
  const dayPlaces: Record<number, number[]> = {
    1: [], // Travel day
    2: [0, 1], // The Pearl, Museum of Islamic Art
    3: [2, 3], // Souq Waqif, Katara
    4: [4], // Al-Ahsa Oasis
    5: [5], // Qasr Ibrahim
    6: [], // Travel day
    7: [6, 7], // Kuwait Towers, The Avenues
    8: [], // Travel day
    9: [8, 9], // Jubbah, Qishlah Palace
    10: [10, 11], // Masmak, Kingdom Centre
  };
  
  return dayPlaces[dayNumber] || [];
}
