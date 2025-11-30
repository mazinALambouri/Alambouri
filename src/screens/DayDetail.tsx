import { useState } from 'react';
import { Trip, Day, Place, TimeCategory } from '../types';
import { deletePlace, approvePlace, unapprovePlace } from '../lib/db';
import { AddPlaces } from './AddPlaces.tsx';
import { Coffee, Sun, MapPin, Moon, Hotel, UtensilsCrossed, Trash2, Clock, Check, AlertCircle } from 'lucide-react';

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

interface DayDetailProps {
  trip: Trip;
  day: Day;
  onUpdate: () => void;
  onDeleteDay: (dayId: string) => void;
}

const timeCategoryConfig: Record<TimeCategory, { label: string; icon: any; bgColor: string; textColor: string; borderColor: string }> = {
  breakfast: { label: 'Breakfast', icon: Coffee, bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  visit: { label: 'Visit', icon: MapPin, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  prayer: { label: 'Prayer', icon: Sun, bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  lunch: { label: 'Lunch', icon: UtensilsCrossed, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
  activity: { label: 'Activity', icon: Sun, bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
  dinner: { label: 'Dinner', icon: Moon, bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  hotel: { label: 'Hotel', icon: Hotel, bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' },
};

// For demo purposes - in production this would come from auth
const CURRENT_USER_ID = 'user-1';

export function DayDetail({ trip, day, onUpdate, onDeleteDay }: DayDetailProps) {
  const [showAddPlaces, setShowAddPlaces] = useState(false);

  const handleDeletePlace = async (placeId: string) => {
    if (window.confirm('Remove this place from your day?')) {
      await deletePlace(trip.id, day.id, placeId);
      onUpdate();
    }
  };

  const handleApprovePlace = async (place: Place) => {
    const approvedBy = place.approvedBy || [];
    const hasUserApproved = approvedBy.includes(CURRENT_USER_ID);
    
    if (hasUserApproved) {
      await unapprovePlace(place.id, CURRENT_USER_ID);
    } else {
      await approvePlace(place.id, CURRENT_USER_ID);
    }
    onUpdate();
  };

  if (showAddPlaces) {
    return (
      <AddPlaces
        trip={trip}
        day={day}
        onClose={() => {
          setShowAddPlaces(false);
          onUpdate();
        }}
      />
    );
  }

  return (
    <div className="px-6 py-4">
      {/* Timeline Layout - Flexible Ordering */}
      {day.places.length > 0 ? (
        <div className="space-y-6 mb-6">
          {day.places.map((place, index) => (
            <div key={place.id} className="relative">
              {/* Timeline connector */}
              {index < day.places.length - 1 && (
                <div className="absolute left-4 top-16 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300" style={{ height: 'calc(100% + 1.5rem)' }} />
              )}
              
              <TimelinePlace 
                place={place} 
                number={index + 1}
                onDelete={() => handleDeletePlace(place.id)}
                onApprove={() => handleApprovePlace(place)}
                currentUserId={CURRENT_USER_ID}
              />
            </div>
          ))}

          {/* Add More Button */}
          <button
            onClick={() => setShowAddPlaces(true)}
            className="w-full py-3 text-white rounded-full font-medium transition-colors mt-4" style={{ backgroundColor: '#5A1B1C' }}
          >
            + Add More Places
          </button>
        </div>
      ) : (
        <div className="py-12">
          <p className="text-gray-500 text-sm mb-6 text-center">Your day is empty. Start adding places.</p>
          
          {/* Empty state dashed box */}
          <div className="relative">
            <div className="absolute left-4 w-0.5 border-l-2 border-dashed border-gray-300 top-0 bottom-0" />
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <button
                onClick={() => setShowAddPlaces(true)}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg py-12 text-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                + Add a new place
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Day Button */}
      {trip.days.length > 1 && (
        <div className="pt-6 pb-4">
          <button
            onClick={() => onDeleteDay(day.id)}
            className="w-full py-3 border-2 rounded-full font-medium transition-colors" style={{ borderColor: '#5A1B1C', color: '#5A1B1C' }}
          >
            Delete Day {day.dayNumber}
          </button>
        </div>
      )}
    </div>
  );
}

interface TimelinePlaceProps {
  place: Place;
  number: number;
  onDelete: () => void;
  onApprove: () => void;
  currentUserId: string;
}

function TimelinePlace({ place, number, onDelete, onApprove, currentUserId }: TimelinePlaceProps) {
  const timeCategory = place.timeCategory || 'visit';
  const config = timeCategoryConfig[timeCategory];
  const Icon = config.icon;
  
  // Check approval status
  const needsApproval = place.needsApproval || false;
  const approvedBy = place.approvedBy || [];
  const totalTravelers = place.totalTravelers || 6;
  const approvalCount = approvedBy.length;
  const disapprovalCount = totalTravelers - approvalCount;
  const isApproved = approvalCount >= totalTravelers;
  const hasUserApproved = approvedBy.includes(currentUserId);

  return (
    <div className="flex items-start gap-4">
      {/* Number Badge */}
      <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 z-10" style={{ backgroundColor: '#5A1B1C' }}>
        {number}
      </div>

      <div className="flex-1">
        {/* Time Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          {place.time && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              <Clock size={12} />
              <span className="text-xs font-medium">{formatTime(place.time)}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <Icon size={14} />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
          <button
            onClick={onDelete}
            className="ml-auto p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Place Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{place.name}</h3>

        {/* Approval Badge */}
        {needsApproval && (
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Approve/Unapprove Button */}
              <button
                onClick={onApprove}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  hasUserApproved
                    ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-green-200'
                }`}
              >
                <Check size={14} />
                {hasUserApproved ? 'You approved' : 'Tap to approve'}
              </button>

              {/* Approval Count */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
                <Check size={12} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">{approvalCount}</span>
              </div>

              {/* Disapproval Count */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full border" style={{ backgroundColor: '#5A1B1C10', borderColor: '#5A1B1C30' }}>
                <AlertCircle size={12} style={{ color: '#5A1B1C' }} />
                <span className="text-xs font-semibold" style={{ color: '#5A1B1C' }}>{disapprovalCount}</span>
              </div>

              {/* Status */}
              {isApproved ? (
                <span className="text-xs font-medium text-green-600">✓ All approved!</span>
              ) : (
                <span className="text-xs text-gray-500">Need {disapprovalCount} more</span>
              )}
            </div>
          </div>
        )}

        {/* Location & Price */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {place.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} style={{ color: '#5A1B1C' }} />
              {place.location}
            </span>
          )}
          {place.price > 0 && (
            <span className="font-medium" style={{ color: '#5A1B1C' }}>
              {place.price} OMR
            </span>
          )}
        </div>

        {/* Image Grid */}
        {place.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {place.images.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={img}
                  alt={`${place.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {place.description}
        </p>
      </div>
    </div>
  );
}
