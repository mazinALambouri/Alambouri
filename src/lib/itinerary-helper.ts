import { Trip } from '../types';
import { addPlaceToDay, fetchRecommendations } from './db';

// Pre-populate the 10-day Gulf road trip itinerary
export async function populateGulfItinerary(trip: Trip): Promise<void> {
  // Fetch recommendations from Supabase
  const recommendedPlaces = await fetchRecommendations();
  
  if (recommendedPlaces.length === 0) {
    console.log('No recommendations found in database');
    return;
  }
  
  // Helper to find place by name
  const findPlace = (name: string) => recommendedPlaces.find(p => p.name.includes(name));
  
  // Day 1: Travel day from Sohar to Doha (no places, just driving)
  
  // Day 2: Doha - First day
  if (trip.days[1]) {
    const pearl = findPlace('Pearl-Qatar');
    const museum = findPlace('Museum of Islamic Art');
    if (pearl) await addPlaceToDay(trip.id, trip.days[1].id, pearl);
    if (museum) await addPlaceToDay(trip.id, trip.days[1].id, museum);
  }
  
  // Day 3: Doha - Second day
  if (trip.days[2]) {
    const souq = findPlace('Souq Waqif');
    const katara = findPlace('Katara');
    if (souq) await addPlaceToDay(trip.id, trip.days[2].id, souq);
    if (katara) await addPlaceToDay(trip.id, trip.days[2].id, katara);
  }
  
  // Day 4: Al-Ahsa - First day (travel + arrive)
  if (trip.days[3]) {
    const oasis = findPlace('Al-Ahsa Oasis');
    if (oasis) await addPlaceToDay(trip.id, trip.days[3].id, oasis);
  }
  
  // Day 5: Al-Ahsa - Exploration
  if (trip.days[4]) {
    const qasr = findPlace('Qasr Ibrahim');
    if (qasr) await addPlaceToDay(trip.id, trip.days[4].id, qasr);
  }
  
  // Day 6: Travel day to Kuwait (no places, just driving)
  
  // Day 7: Kuwait City - Exploration
  if (trip.days[6]) {
    const towers = findPlace('Kuwait Towers');
    const avenues = findPlace('Avenues Mall');
    if (towers) await addPlaceToDay(trip.id, trip.days[6].id, towers);
    if (avenues) await addPlaceToDay(trip.id, trip.days[6].id, avenues);
  }
  
  // Day 8: Travel day to Hail (no places, just driving)
  
  // Day 9: Hail - Exploration  
  if (trip.days[8]) {
    const jubbah = findPlace('Jubbah');
    const qishlah = findPlace('Qishlah');
    if (jubbah) await addPlaceToDay(trip.id, trip.days[8].id, jubbah);
    if (qishlah) await addPlaceToDay(trip.id, trip.days[8].id, qishlah);
  }
  
  // Day 10: Riyadh then back to Sohar
  if (trip.days[9]) {
    const masmak = findPlace('Masmak');
    const kingdom = findPlace('Kingdom Centre');
    if (masmak) await addPlaceToDay(trip.id, trip.days[9].id, masmak);
    if (kingdom) await addPlaceToDay(trip.id, trip.days[9].id, kingdom);
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
