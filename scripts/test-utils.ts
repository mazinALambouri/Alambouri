
import { calculateTripStats, calculateDayStats } from '../src/lib/utils';
import { Trip, Day, Place } from '../src/types';

// Mock data
const mockPlace1: Place = {
    id: '1',
    name: 'Place 1',
    type: 'attraction',
    category: ['Attractions'],
    description: 'Desc',
    images: [],
    timeToReach: 30,
    price: 100,
    currency: 'QAR', // 103 SAR
};

const mockPlace2: Place = {
    id: '2',
    name: 'Place 2',
    type: 'attraction',
    category: ['Attractions'],
    description: 'Desc',
    images: [],
    timeToReach: 60,
    price: 10,
    currency: 'KWD', // 122.5 SAR
};

const mockDay: Day = {
    id: 'd1',
    tripId: 't1',
    date: new Date(),
    dayNumber: 1,
    places: [mockPlace1, mockPlace2],
};

const mockTrip: Trip = {
    id: 't1',
    name: 'Test Trip',
    location: 'Gulf',
    startDate: new Date(),
    endDate: new Date(),
    days: [mockDay],
    createdAt: new Date(),
    updatedAt: new Date(),
};

console.log('Testing calculateTripStats...');
const tripStats = calculateTripStats(mockTrip);
console.log('Trip Stats:', tripStats);

// Expected:
// Cost: (100 * 1.03) + (10 * 12.25) = 103 + 122.5 = 225.5 -> rounded to 226
// Distance: 30 + 60 = 90
// Places: 2

if (tripStats.totalCost === 226 && tripStats.totalDistance === 90) {
    console.log('✅ calculateTripStats passed');
} else {
    console.error('❌ calculateTripStats failed');
}

console.log('\nTesting calculateDayStats...');
const dayStats = calculateDayStats(mockDay);
console.log('Day Stats:', dayStats);

if (dayStats.totalCost === 226 && dayStats.totalDistance === 90) {
    console.log('✅ calculateDayStats passed');
} else {
    console.error('❌ calculateDayStats failed');
}
