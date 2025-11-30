import { useState, useEffect } from 'react';
import { Trip } from '../types';
import { FloatingButton } from '../components/FloatingButton';
import { addDay, deleteDay } from '../lib/db';
import { calculateTripStats } from '../lib/utils';
import { DayDetail } from './DayDetail';
import { Clock, MapPin, Calendar, List, DollarSign, Route, Compass } from 'lucide-react';

interface TripOverviewProps {
  trip: Trip;
  onTripUpdate: () => void;
}

export function TripOverview({ trip, onTripUpdate }: TripOverviewProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    trip.days.length > 0 ? trip.days[0].id : null
  );
  const [viewMode, setViewMode] = useState<'detail' | 'timeline'>('detail');
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
    // If the selected day no longer exists (was deleted), select the first day
    if (selectedDayId && !trip.days.find(d => d.id === selectedDayId)) {
      setSelectedDayId(trip.days.length > 0 ? trip.days[0].id : null);
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
      <div className="bg-white -mt-6 relative z-10 px-6 pt-6 pb-4 rounded-t-3xl">
        {/* Tags - Brand color scheme */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: '#5A1B1C' }}>Road Trip</span>
          <span className="px-3 py-1.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: '#5A1B1C' }}>Cultural</span>
          <span className="px-3 py-1.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: '#5A1B1C' }}>Adventure</span>
          <span className="px-3 py-1.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: '#5A1B1C' }}>GCC Tour</span>
        </div>

        {/* Trip Stats - Brand Design */}
        <div className="rounded-2xl p-4 mb-4 border" style={{ backgroundColor: '#5A1B1C10', borderColor: '#5A1B1C30' }}>
          <div className="grid grid-cols-3 gap-4">
            {/* Total Cost */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#5A1B1C' }}>
                <DollarSign size={18} className="text-white" />
              </div>
              <p className="text-xl font-bold" style={{ color: '#5A1B1C' }}>
                {stats.totalCost.toFixed(2)}
              </p>
              <p className="text-xs font-medium" style={{ color: '#5A1B1C99' }}>{stats.currency}</p>
            </div>

            {/* Divider */}
            <div className="text-center" style={{ borderLeft: '1px solid #5A1B1C30', borderRight: '1px solid #5A1B1C30' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#5A1B1C' }}>
                <Route size={18} className="text-white" />
              </div>
              <p className="text-xl font-bold" style={{ color: '#5A1B1C' }}>
                {stats.totalDistance >= 60 
                  ? `${Math.floor(stats.totalDistance / 60)}h ${stats.totalDistance % 60}m`
                  : `${stats.totalDistance}m`
                }
              </p>
              <p className="text-xs font-medium" style={{ color: '#5A1B1C99' }}>Travel Time</p>
            </div>

            {/* Total Places */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#5A1B1C' }}>
                <Compass size={18} className="text-white" />
              </div>
              <p className="text-xl font-bold" style={{ color: '#5A1B1C' }}>
                {stats.totalPlaces}
              </p>
              <p className="text-xs font-medium" style={{ color: '#5A1B1C99' }}>Places</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          Embark on an epic road trip across the Gulf Cooperation Council (GCC) countries. Experience diverse cultures, UNESCO World Heritage sites, and the warm hospitality of the Arabian Peninsula.
        </p>
      </div>

      {/* View Toggle & Day Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('detail')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'detail'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={viewMode === 'detail' ? { backgroundColor: '#5A1B1C' } : {}}
            >
              <List size={16} />
              Day View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={viewMode === 'timeline' ? { backgroundColor: '#5A1B1C' } : {}}
            >
              <Calendar size={16} />
              Timeline
            </button>
          </div>
        </div>
        {viewMode === 'detail' && (
          <div className="flex overflow-x-auto scrollbar-hide px-6">
            {trip.days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`flex-shrink-0 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  selectedDayId === day.id
                    ? ''
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={selectedDayId === day.id ? { color: '#5A1B1C', borderBottomColor: '#5A1B1C' } : {}}
              >
                DAY {day.dayNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === 'detail' ? (
        selectedDay ? (
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
        )
      ) : (
        <TimelineOverview trip={trip} />
      )}

      {/* Floating Add Day Button */}
      <FloatingButton onClick={handleAddDay} />
    </div>
  );
}

// Timeline Overview Component
interface TimelineOverviewProps {
  trip: Trip;
}

// Format time to HH:mm format
const formatTime = (time: string): string => {
  if (!time) return '';
  // If time is already in HH:mm format, return it
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  // Otherwise, try to parse and format it
  const [hours, minutes] = time.split(':');
  const h = hours.padStart(2, '0');
  const m = minutes?.padStart(2, '0') || '00';
  return `${h}:${m}`;
};

function TimelineOverview({ trip }: TimelineOverviewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-6 py-6 space-y-8">
      {trip.days.map((day, dayIndex) => (
        <div key={day.id} className="relative">
          {/* Day Header */}
          <div className="flex items-center gap-3 mb-4 sticky top-16 bg-white py-2 z-10">
            <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: '#5A1B1C' }}>
              {day.dayNumber}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Day {day.dayNumber}</h3>
              <p className="text-sm text-gray-500">{formatDate(day.date)}</p>
            </div>
          </div>

          {/* Places Timeline */}
          {day.places.length > 0 ? (
            <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-6">
              {day.places.map((place) => (
                <div key={place.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[27px] w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#5A1B1C' }} />
                  
                  {/* Place Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    {/* Time Badge - Always show */}
                    <div className="flex items-center gap-1 mb-2">
                      <Clock size={16} className={place.time ? '' : 'text-gray-300'} style={place.time ? { color: '#5A1B1C' } : {}} />
                      <span className={`text-sm font-semibold ${place.time ? '' : 'text-gray-400'}`} style={place.time ? { color: '#5A1B1C' } : {}}>
                        {place.time ? formatTime(place.time) : 'No time set'}
                      </span>
                    </div>
                    
                    {/* Place Name */}
                    <h4 className="font-bold text-gray-900 mb-2">{place.name}</h4>
                    
                    {/* Location & Price */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {place.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} style={{ color: '#5A1B1C' }} />
                          {place.location}
                        </span>
                      )}
                      {place.price > 0 && (
                        <span className="font-medium" style={{ color: '#5A1B1C' }}>
                          {place.price} {place.currency}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    {place.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-6 pl-6 text-sm text-gray-400 italic">
              No places added yet
            </div>
          )}

          {/* Day Separator */}
          {dayIndex < trip.days.length - 1 && (
            <div className="mt-8 border-t border-gray-100" />
          )}
        </div>
      ))}

      {trip.days.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No days created yet. Start planning your trip!
        </div>
      )}
    </div>
  );
}
