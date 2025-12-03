import { useState, useEffect } from 'react';
import { Trip, TripType, TripPurpose } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, MapPin, Car, Plane, Ship, Train, Backpack, Briefcase, Share2, Globe, Lock, ArrowRight, Loader2, LogOut } from 'lucide-react';

interface TripsDashboardProps {
  userId: string;
  onSelectTrip: (trip: Trip) => void;
  onSignOut?: () => void;
}

const tripTypeConfig: Record<TripType, { label: string; icon: any; bgColor: string }> = {
  road_trip: { label: 'Road Trip', icon: Car, bgColor: 'bg-blue-500' },
  plane_trip: { label: 'Plane Trip', icon: Plane, bgColor: 'bg-sky-500' },
  cruise: { label: 'Cruise', icon: Ship, bgColor: 'bg-cyan-500' },
  train_trip: { label: 'Train Trip', icon: Train, bgColor: 'bg-purple-500' },
  backpacking: { label: 'Backpacking', icon: Backpack, bgColor: 'bg-green-500' },
  business: { label: 'Business', icon: Briefcase, bgColor: 'bg-gray-500' },
  other: { label: 'Other', icon: MapPin, bgColor: 'bg-orange-500' }
};

const purposeOptions: { value: TripPurpose; label: string; emoji: string }[] = [
  { value: 'leisure', label: 'Leisure', emoji: '🏖️' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'honeymoon', label: 'Honeymoon', emoji: '💑' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'religious', label: 'Religious', emoji: '🕌' },
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'other', label: 'Other', emoji: '✨' }
];

export function TripsDashboard({ userId, onSelectTrip, onSignOut }: TripsDashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  
  const [newTrip, setNewTrip] = useState({
    name: '',
    location: '',
    tripType: 'road_trip' as TripType,
    purpose: 'leisure' as TripPurpose,
    description: '',
    startDate: '',
    endDate: '',
    isPublic: false
  });

  useEffect(() => {
    loadTrips();
  }, [userId]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      // Load user's own trips
      const { data: ownTrips, error: ownError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Load trips shared with the user
      const { data: shared, error: sharedError } = await supabase
        .from('trips')
        .select('*')
        .contains('shared_with', [userId])
        .order('created_at', { ascending: false });

      if (sharedError && sharedError.code !== 'PGRST116') {
        console.error('Error loading shared trips:', sharedError);
      }

      // Map trips to proper format
      const mapTrip = (trip: any): Trip => ({
        id: trip.id,
        name: trip.name,
        location: trip.location,
        tripType: trip.trip_type,
        purpose: trip.purpose,
        description: trip.description,
        startDate: new Date(trip.start_date),
        endDate: new Date(trip.end_date),
        userId: trip.user_id,
        sharedWith: trip.shared_with || [],
        isPublic: trip.is_public || false,
        coverImage: trip.cover_image,
        days: [],
        createdAt: new Date(trip.created_at),
        updatedAt: new Date(trip.updated_at)
      });

      setTrips(ownTrips?.map(mapTrip) || []);
      setSharedTrips(shared?.map(mapTrip) || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    setCreating(true);
    try {
      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          name: newTrip.name,
          location: newTrip.location,
          trip_type: newTrip.tripType,
          purpose: newTrip.purpose,
          description: newTrip.description,
          start_date: newTrip.startDate,
          end_date: newTrip.endDate,
          user_id: userId,
          is_public: newTrip.isPublic,
          shared_with: []
        })
        .select()
        .single();

      if (error) throw error;

      // Create days for the trip
      const startDate = new Date(newTrip.startDate);
      const endDate = new Date(newTrip.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const days = [];
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({
          trip_id: trip.id,
          day_number: i + 1,
          date: date.toISOString()
        });
      }

      const { error: daysError } = await supabase
        .from('days')
        .insert(days);

      if (daysError) throw daysError;

      // Reload trips
      await loadTrips();
      
      // Reset form
      setNewTrip({
        name: '',
        location: '',
        tripType: 'road_trip',
        purpose: 'leisure',
        description: '',
        startDate: '',
        endDate: '',
        isPublic: false
      });
      setStep(1);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setCreating(false);
    }
  };

  const calculateDays = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5A1B1C' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Header */}
      <div className="relative h-[160px] sm:h-[200px]">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop"
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        
        {/* Sign Out Button - top right with safe area */}
        {onSignOut && (
          <div className="absolute top-0 right-0 p-3 sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)' }}>
            <button
              onClick={onSignOut}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all"
            >
              <LogOut size={18} className="sm:hidden" />
              <LogOut size={20} className="hidden sm:block" />
            </button>
          </div>
        )}
        
        {/* Header Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Trips</h1>
          <p className="text-white/80 text-sm mt-1">Plan and manage your adventures</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white -mt-4 rounded-t-3xl relative z-10 px-4 sm:px-6 pt-6 pb-safe">
        {/* Create New Trip Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 p-4 rounded-2xl text-white group hover:shadow-lg transition-all active:scale-[0.98]"
          style={{ backgroundColor: '#5A1B1C' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus size={22} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Create New Trip</h3>
                <p className="text-white/70 text-xs">Start planning your next adventure</p>
              </div>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* My Trips */}
        {trips.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">My Trips</h2>
            <div className="space-y-3">
              {trips.map((trip) => {
                const TripIcon = tripTypeConfig[trip.tripType]?.icon || MapPin;
                const days = calculateDays(trip.startDate, trip.endDate);
                
                return (
                  <button
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className="w-full bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: '#5A1B1C' }}
                      >
                        <TripIcon size={22} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate max-w-[100px]">{trip.location}</span>
                          </span>
                          <span>•</span>
                          <span className="font-medium">{days} days</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {trip.isPublic ? (
                          <Globe size={16} className="text-gray-400" />
                        ) : (
                          <Lock size={16} className="text-gray-400" />
                        )}
                        <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shared with Me */}
        {sharedTrips.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Shared with Me</h2>
            <div className="space-y-3">
              {sharedTrips.map((trip) => {
                const TripIcon = tripTypeConfig[trip.tripType]?.icon || MapPin;
                const days = calculateDays(trip.startDate, trip.endDate);
                
                return (
                  <button
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className="w-full bg-blue-50 rounded-2xl p-4 hover:bg-blue-100 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <TripIcon size={22} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
                          <Share2 size={14} className="text-blue-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate max-w-[100px]">{trip.location}</span>
                          </span>
                          <span>•</span>
                          <span className="font-medium">{days} days</span>
                        </div>
                      </div>

                      <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trips.length === 0 && sharedTrips.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-500 text-sm">Create your first trip to get started</p>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-auto sm:min-w-[400px] max-w-lg sm:rounded-2xl rounded-t-3xl p-4 sm:p-6 pb-8 safe-bottom animate-slide-up max-h-[90vh] sm:max-h-[85vh] overflow-y-auto sm:mx-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {step === 1 ? 'Choose Trip Type' : step === 2 ? 'Trip Details' : 'Final Details'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setStep(1);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Plus size={22} className="rotate-45" />
              </button>
            </div>

            {/* Step 1: Trip Type */}
            {step === 1 && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">What type of trip are you planning?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {Object.entries(tripTypeConfig).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewTrip({ ...newTrip, tripType: type as TripType })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          newTrip.tripType === type
                            ? 'border-[#5A1B1C] bg-[#5A1B1C]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} className={`sm:hidden ${newTrip.tripType === type ? 'text-[#5A1B1C]' : 'text-gray-400'}`} />
                        <Icon size={24} className={`hidden sm:block ${newTrip.tripType === type ? 'text-[#5A1B1C]' : 'text-gray-400'}`} />
                        <p className={`text-xs sm:text-sm font-medium mt-1.5 sm:mt-2 ${newTrip.tripType === type ? 'text-[#5A1B1C]' : 'text-gray-700'}`}>
                          {config.label}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                    {purposeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNewTrip({ ...newTrip, purpose: option.value })}
                        className={`p-2 sm:p-3 rounded-lg border text-[10px] sm:text-xs font-medium transition-all ${
                          newTrip.purpose === option.value
                            ? 'border-[#5A1B1C] bg-[#5A1B1C]/5 text-[#5A1B1C]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-base sm:text-lg mb-0.5 sm:mb-1 block">{option.emoji}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 sm:py-3 text-white rounded-xl font-semibold text-sm sm:text-base"
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Trip Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Name</label>
                  <input
                    type="text"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                    placeholder="Summer Road Trip 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination</label>
                  <input
                    type="text"
                    value={newTrip.location}
                    onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                    placeholder="Oman"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={newTrip.description}
                    onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 resize-none h-20"
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                    placeholder="Describe your trip..."
                  />
                </div>

                <button
                  onClick={() => setStep(3)}
                  disabled={!newTrip.name || !newTrip.location}
                  className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Dates and Privacy */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#5A1B1C' } as any}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                      min={newTrip.startDate}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#5A1B1C' } as any}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTrip.isPublic}
                      onChange={(e) => setNewTrip({ ...newTrip, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#5A1B1C' }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">Make this trip public</p>
                      <p className="text-xs text-gray-500">Others can view but not edit your trip</p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleCreateTrip}
                  disabled={creating || !newTrip.startDate || !newTrip.endDate}
                  className="w-full py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  {creating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating Trip...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
