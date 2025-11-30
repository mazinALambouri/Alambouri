import { useState, useEffect } from 'react';
import { Trip } from '../types';
import { FloatingButton } from '../components/FloatingButton';
import { addDay, deleteDay } from '../lib/db';
import { calculateTripStats } from '../lib/utils';
import { DayDetail } from './DayDetail';

interface TripOverviewProps {
  trip: Trip;
  onTripUpdate: () => void;
}

export function TripOverview({ trip, onTripUpdate }: TripOverviewProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    trip.days.length > 0 ? trip.days[0].id : null
  );
  const stats = calculateTripStats(trip);

  const selectedDay = trip.days.find(d => d.id === selectedDayId);

  const handleAddDay = async () => {
    await addDay(trip.id);
    onTripUpdate();
  };

  const handleDeleteDay = async (dayId: string) => {
    if (window.confirm('Are you sure you want to delete this day?')) {
      await deleteDay(trip.id, dayId);
      // Select the first day after deletion
      if (trip.days.length > 1) {
        const remainingDays = trip.days.filter(d => d.id !== dayId);
        setSelectedDayId(remainingDays[0].id);
      } else {
        setSelectedDayId(null);
      }
      onTripUpdate();
    }
  };

  useEffect(() => {
    // Ensure we have a valid selected day
    if (!selectedDayId && trip.days.length > 0) {
      setSelectedDayId(trip.days[0].id);
    }
  }, [trip.days, selectedDayId]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1200&auto=format&fit=crop"
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        {/* Trip Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
          <div className="text-white/90 text-sm">{trip.days.length} Days • {stats.totalPlaces} Experiences</div>
        </div>
      </div>

      {/* Trip Info Card */}
      <div className="bg-white -mt-6 relative z-10 px-6 pt-6 pb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">Road Trip</span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">Cultural</span>
          <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">Adventure</span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">GCC Tour</span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          Embark on an epic 10-day road trip across the Gulf Cooperation Council (GCC) countries. Starting from Sohar, Oman, journey through Qatar's modern marvels, Saudi Arabia's ancient heritage sites, and Kuwait's iconic landmarks before returning home. Experience diverse cultures, UNESCO World Heritage sites, and the warm hospitality of the Arabian Peninsula.
        </p>
      </div>

      {/* Day Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex overflow-x-auto scrollbar-hide px-6">
          {trip.days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`flex-shrink-0 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedDayId === day.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              DAY {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Day Detail */}
      {selectedDay ? (
        <DayDetail 
          trip={trip}
          day={selectedDay} 
          onUpdate={onTripUpdate}
          onDeleteDay={handleDeleteDay}
        />
      ) : (
        <div className="p-8 text-center text-gray-500">
          No days created yet. Click the + button to add a day.
        </div>
      )}

      {/* Floating Add Day Button */}
      <FloatingButton onClick={handleAddDay} />
    </div>
  );
}
