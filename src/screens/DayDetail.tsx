import { useState } from 'react';
import { Trip, Day, Place, TimeCategory } from '../types';
import { deletePlace } from '../lib/db';
import { AddPlaces } from './AddPlaces.tsx';
import { Coffee, Sun, MapPin, Moon, Hotel, UtensilsCrossed, Trash2 } from 'lucide-react';

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

export function DayDetail({ trip, day, onUpdate, onDeleteDay }: DayDetailProps) {
  const [showAddPlaces, setShowAddPlaces] = useState(false);

  const handleDeletePlace = async (placeId: string) => {
    if (window.confirm('Remove this place from your day?')) {
      await deletePlace(trip.id, day.id, placeId);
      onUpdate();
    }
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
              />
            </div>
          ))}

          {/* Add More Button */}
          <button
            onClick={() => setShowAddPlaces(true)}
            className="w-full py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors mt-4"
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
            className="w-full py-3 border-2 border-red-600 text-red-600 rounded-full font-medium hover:bg-red-50 transition-colors"
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
}

function TimelinePlace({ place, number, onDelete }: TimelinePlaceProps) {
  const timeCategory = place.timeCategory || 'visit';
  const config = timeCategoryConfig[timeCategory];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4">
      {/* Number Badge */}
      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
        {number}
      </div>

      <div className="flex-1">
        {/* Time Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <Icon size={14} />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
          <button
            onClick={onDelete}
            className="ml-auto p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Place Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{place.name}</h3>

        {/* Location & Price */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {place.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-red-500" />
              {place.location}
            </span>
          )}
          {place.price > 0 && (
            <span className="font-medium text-red-600">
              {place.price} {place.currency}
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
