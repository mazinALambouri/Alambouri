import { Trip } from '../types';
import { formatDateCard, formatDay } from '../lib/utils';

interface TripHeaderProps {
  trip: Trip;
  selectedDayId: string | null;
  onDaySelect: (dayId: string) => void;
}

export function TripHeader({ trip, selectedDayId, onDaySelect }: TripHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-gray-300 to-gray-200 relative">
      {/* Trip Name in Script */}
      <div className="pt-20 pb-6 px-6 text-center">
        <div className="text-6xl text-gray-400 mb-2" style={{ fontFamily: 'cursive', fontWeight: 300 }}>
          {trip.location}
        </div>
        <div className="text-gray-600 text-sm mb-2">(Set)</div>
        <div className="text-gray-700 font-semibold">{trip.days.length} DAYS</div>
      </div>

      {/* Date Cards */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <div className="bg-red-600 text-white rounded-lg px-6 py-4 text-center shadow-lg">
          <div className="text-xs uppercase opacity-90">{formatDateCard(trip.startDate)}</div>
          <div className="text-4xl font-bold my-1">{formatDay(trip.startDate)}</div>
          <div className="text-xs opacity-90">2025</div>
        </div>
        <div className="w-8 h-0.5 bg-gray-400"></div>
        <div className="bg-red-600 text-white rounded-lg px-6 py-4 text-center shadow-lg">
          <div className="text-xs uppercase opacity-90">{formatDateCard(trip.endDate)}</div>
          <div className="text-4xl font-bold my-1">{formatDay(trip.endDate)}</div>
          <div className="text-xs opacity-90">2025</div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="bg-white rounded-t-3xl">
        <div className="flex overflow-x-auto scrollbar-hide px-6 pt-4">
          {trip.days.map((day) => (
            <button
              key={day.id}
              onClick={() => onDaySelect(day.id)}
              className={`flex-shrink-0 px-6 py-3 font-bold text-sm border-b-4 transition-colors ${
                selectedDayId === day.id
                  ? 'border-red-600 text-gray-900'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div>Day {day.dayNumber}</div>
              <div className="text-xs font-normal text-gray-500">{formatDay(day.date)} {formatDateCard(day.date)} 2025</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
