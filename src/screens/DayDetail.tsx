import { useState } from 'react';
import { Trip, Day, Place, TimeCategory, PlaceCategory } from '../types';
import { deletePlace, approvePlace, unapprovePlace } from '../lib/db';
import { AddPlaces } from './AddPlaces.tsx';
import { Coffee, Sun, MapPin, Moon, Hotel, UtensilsCrossed, Trash2, Clock, Check, AlertCircle, Fuel } from 'lucide-react';
import { addPlaceToDay } from '../lib/db';

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

// Brand color style for all categories
const brandStyle = { bgColor: 'bg-[#5A1B1C]/10', textColor: 'text-[#5A1B1C]', borderColor: 'border-[#5A1B1C]/30' };

const timeCategoryConfig: Record<TimeCategory, { label: string; icon: any; bgColor: string; textColor: string; borderColor: string }> = {
  breakfast: { label: 'Breakfast', icon: Coffee, ...brandStyle },
  visit: { label: 'Visit', icon: MapPin, ...brandStyle },
  prayer: { label: 'Prayer', icon: Sun, ...brandStyle },
  lunch: { label: 'Lunch', icon: UtensilsCrossed, ...brandStyle },
  activity: { label: 'Activity', icon: Sun, ...brandStyle },
  dinner: { label: 'Dinner', icon: Moon, ...brandStyle },
  hotel: { label: 'Hotel', icon: Hotel, ...brandStyle },
  gas: { label: 'Gas Stop', icon: Fuel, ...brandStyle },
};

// For demo purposes - in production this would come from auth
const CURRENT_USER_ID = 'user-1';

export function DayDetail({ trip, day, onUpdate, onDeleteDay }: DayDetailProps) {
  const [showAddPlaces, setShowAddPlaces] = useState(false);
  const [showGasModal, setShowGasModal] = useState(false);
  const [gasStopName, setGasStopName] = useState('');
  const [gasStopTime, setGasStopTime] = useState('');
  const [gasStopCost, setGasStopCost] = useState<number>(0);

  const handleAddGasStop = async () => {
    const gasPlace = {
      name: gasStopName || 'Gas Station',
      type: 'activity' as const,
      category: ['Activities'] as PlaceCategory[],
      description: 'Fuel stop',
      images: [],
      timeToReach: 5,
      price: gasStopCost,
      currency: 'OMR',
      location: '',
      distanceFromUser: 0,
      timeCategory: 'gas' as const,
      time: gasStopTime || undefined,
      needsApproval: false,
      approvedBy: [],
      totalTravelers: 6,
    };
    await addPlaceToDay(trip.id, day.id, gasPlace);
    setShowGasModal(false);
    setGasStopName('');
    setGasStopTime('');
    setGasStopCost(0);
    onUpdate();
  };

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

          {/* Quick Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAddPlaces(true)}
              className="flex-1 py-3 text-white rounded-full font-medium transition-colors" style={{ backgroundColor: '#5A1B1C' }}
            >
              + Add Place
            </button>
            <button
              onClick={() => setShowGasModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 text-white rounded-full font-medium transition-colors"
              style={{ backgroundColor: '#5A1B1C' }}
            >
              <Fuel size={18} />
              Gas
            </button>
          </div>
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

      {/* Gas Stop Modal */}
      {showGasModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowGasModal(false)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8 safe-bottom animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5A1B1C20' }}>
                <Fuel size={24} style={{ color: '#5A1B1C' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Gas Stop</h3>
                <p className="text-sm text-gray-500">Quick fuel stop for your trip</p>
              </div>
            </div>

            {/* Station Name (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Station Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Shell, OOMCO, Al Maha..."
                value={gasStopName}
                onChange={(e) => setGasStopName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Cost Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost (OMR)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={gasStopCost || ''}
                  onChange={(e) => setGasStopCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">OMR</span>
              </div>
            </div>

            {/* Time Input */}
            <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: '#5A1B1C10', borderColor: '#5A1B1C30' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5A1B1C' }}>
                <Clock size={14} className="inline mr-1" />
                Scheduled Time (Optional)
              </label>
              <input
                type="time"
                value={gasStopTime}
                onChange={(e) => setGasStopTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-semibold text-center bg-white border"
                style={{ borderColor: '#5A1B1C30', '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddGasStop}
                className="flex-1 py-3 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#5A1B1C' }}
              >
                <Fuel size={18} />
                Add Gas Stop
              </button>
              <button
                onClick={() => {
                  setShowGasModal(false);
                  setGasStopName('');
                  setGasStopTime('');
                  setGasStopCost(0);
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
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
