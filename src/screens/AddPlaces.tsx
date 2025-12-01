import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Clock, MapPin, Plus, X } from 'lucide-react';
import { Trip, Day, PlaceCategory, TimeCategory, RecommendedPlace } from '../types';
import { addPlaceToDay, fetchRecommendations } from '../lib/db';

interface AddPlacesProps {
  trip: Trip;
  day: Day;
  onClose: () => void;
}

const categories: PlaceCategory[] = [
  'Attractions',
  'Museums',
  'Shopping',
  'Restaurants',
  'Activities',
  'Lifestyle',
  'Entertainment',
  'Events',
  'Hotels',
  'Prayer',
];

const timeCategories: { value: TimeCategory | 'All'; label: string; icon: string }[] = [
  { value: 'All', label: 'All', icon: '🌍' },
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'visit', label: 'Visit', icon: '🏛️' },
  { value: 'prayer', label: 'Prayer', icon: '🕌' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'activity', label: 'Activity', icon: '⚡' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'gas', label: 'Gas Stop', icon: '⛽' },
];

const timeCategoryOptions: { value: TimeCategory; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'visit', label: 'Visit', icon: '🏛️' },
  { value: 'prayer', label: 'Prayer', icon: '🕌' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'activity', label: 'Activity', icon: '⚡' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'gas', label: 'Gas', icon: '⛽' },
];

export function AddPlaces({ trip, day, onClose }: AddPlacesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'All'>('All');
  const [selectedTimeCategory, setSelectedTimeCategory] = useState<TimeCategory | 'All'>('All');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedPlace[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  
  // Edit modal state for recommended places
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendedPlace | null>(null);
  const [editedRecommendation, setEditedRecommendation] = useState<{
    name: string;
    description: string;
    price: number;
    time: string;
    imageUrl: string;
    location: string;
  }>({
    name: '',
    description: '',
    price: 0,
    time: '',
    imageUrl: '',
    location: '',
  });
  
  // Fetch recommendations from Supabase
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      const data = await fetchRecommendations();
      setRecommendations(data);
      setLoadingRecommendations(false);
    };
    loadRecommendations();
  }, []);
  
  // Custom place form state
  const [customPlace, setCustomPlace] = useState({
    name: '',
    description: '',
    location: '',
    price: 0,
    currency: 'OMR',
    timeCategory: 'visit' as TimeCategory,
    time: '',
    imageUrl: '',
    needsApproval: false,
  });

  const filteredPlaces = recommendations.filter((place: RecommendedPlace) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || place.category.includes(selectedCategory);
    const matchesTimeCategory = selectedTimeCategory === 'All' || place.timeCategory === selectedTimeCategory;
    return matchesSearch && matchesCategory && matchesTimeCategory;
  });

  const handleAddCustomPlace = async () => {
    if (!customPlace.name.trim()) {
      alert('Please enter a place name');
      return;
    }

    const newPlace = {
      name: customPlace.name,
      type: customPlace.timeCategory === 'breakfast' || customPlace.timeCategory === 'lunch' || customPlace.timeCategory === 'dinner' ? 'meal' as const :
            customPlace.timeCategory === 'hotel' ? 'hotel' as const :
            customPlace.timeCategory === 'prayer' ? 'prayer' as const : 'attraction' as const,
      category: [customPlace.timeCategory === 'breakfast' || customPlace.timeCategory === 'lunch' || customPlace.timeCategory === 'dinner' ? 'Restaurants' :
                 customPlace.timeCategory === 'hotel' ? 'Hotels' :
                 customPlace.timeCategory === 'prayer' ? 'Prayer' : 'Attractions'] as PlaceCategory[],
      description: customPlace.description || 'Custom place',
      images: customPlace.imageUrl ? [customPlace.imageUrl] : ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'],
      timeToReach: 30,
      price: customPlace.price,
      currency: 'OMR',
      location: customPlace.location || 'Custom Location',
      distanceFromUser: 0,
      timeCategory: customPlace.timeCategory,
      time: customPlace.time || undefined,
      needsApproval: customPlace.needsApproval,
      approvedBy: [],
      totalTravelers: 6, // Default to 6 travelers
    };

    await addPlaceToDay(trip.id, day.id, newPlace);
    
    // Reset form
    setCustomPlace({
      name: '',
      description: '',
      location: '',
      price: 0,
      currency: 'OMR',
      timeCategory: 'visit',
      time: '',
      imageUrl: '',
      needsApproval: false,
    });
    setShowCustomForm(false);
    onClose();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Add to Day {day.dayNumber}</h1>
            <p className="text-xs text-gray-500">
              {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white border border-transparent" style={{ '--tw-ring-color': '#5A1B1C' } as any}
            />
          </div>
        </div>
      </div>

      {/* Create Custom Place Section */}
      <div className="p-4">
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            showCustomForm 
              ? 'bg-gray-200 text-gray-700' 
              : 'text-white shadow-sm'
          }`}
          style={!showCustomForm ? { backgroundColor: '#5A1B1C' } : {}}
        >
          {showCustomForm ? (
            <>
              <X size={18} />
              Close Form
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Custom Place
            </>
          )}
        </button>
      </div>

      {/* Custom Place Form */}
      {showCustomForm && (
        <div className="mx-4 mb-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4" style={{ background: 'linear-gradient(to right, #5A1B1C, #7A2B2C)' }}>
            <h3 className="font-bold text-white text-lg">New Custom Place</h3>
            <p className="text-white/80 text-sm">Add your own destination</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Place Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Place Name <span style={{ color: '#5A1B1C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., The Pearl Qatar"
                value={customPlace.name}
                onChange={(e) => setCustomPlace({ ...customPlace, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                placeholder="Briefly describe this place..."
                value={customPlace.description}
                onChange={(e) => setCustomPlace({ ...customPlace, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm h-20 resize-none" style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin size={14} className="inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Doha, Qatar"
                value={customPlace.location}
                onChange={(e) => setCustomPlace({ ...customPlace, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>
            
            {/* Time - Prominent */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: '#5A1B1C10', borderColor: '#5A1B1C30' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5A1B1C' }}>
                <Clock size={14} className="inline mr-1" />
                Scheduled Time
              </label>
              <input
                type="time"
                value={customPlace.time}
                onChange={(e) => setCustomPlace({ ...customPlace, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-semibold text-center bg-white" style={{ borderColor: '#5A1B1C50', '--tw-ring-color': '#5A1B1C' } as any}
              />
              <p className="text-xs mt-1.5 text-center" style={{ color: '#5A1B1C' }}>Set a specific time for this activity (HH:MM)</p>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {timeCategoryOptions.map((tc) => (
                  <button
                    key={tc.value}
                    type="button"
                    onClick={() => setCustomPlace({ ...customPlace, timeCategory: tc.value })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      customPlace.timeCategory === tc.value
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                    style={customPlace.timeCategory === tc.value ? { backgroundColor: '#5A1B1C' } : {}}
                  >
                    <span className="text-lg block mb-0.5">{tc.icon}</span>
                    <span className="text-xs font-medium">{tc.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price in OMR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price in OMR (Optional)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={customPlace.price || ''}
                  onChange={(e) => setCustomPlace({ ...customPlace, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">OMR</span>
              </div>
            </div>
            
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={customPlace.imageUrl}
                onChange={(e) => setCustomPlace({ ...customPlace, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>

            {/* Needs Approval Toggle */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-amber-800">Needs Group Approval</span>
                  <p className="text-xs text-amber-600 mt-0.5">All travelers must approve this place</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={customPlace.needsApproval}
                    onChange={(e) => setCustomPlace({ ...customPlace, needsApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </div>
              </label>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddCustomPlace}
                className="flex-1 py-3 text-white rounded-xl font-semibold transition-colors shadow-sm" style={{ backgroundColor: '#5A1B1C' }}
              >
                Add Place
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm font-medium text-gray-500">Or browse recommendations</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 space-y-3">
        {/* Time Category Filters */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1">
          {timeCategories.map((tc) => (
            <button
              key={tc.value}
              onClick={() => setSelectedTimeCategory(tc.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedTimeCategory === tc.value
                  ? 'text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
              style={selectedTimeCategory === tc.value ? { backgroundColor: '#5A1B1C' } : {}}
            >
              <span>{tc.icon}</span>
              <span>{tc.label}</span>
            </button>
          ))}
        </div>

        {/* Place Category Filters */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="px-4 pb-24">
        {loadingRecommendations ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-gray-300 rounded-full mx-auto mb-3" style={{ borderTopColor: '#5A1B1C' }}></div>
            <p className="text-gray-500 text-sm">Loading recommendations...</p>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="space-y-3">
            {filteredPlaces.map((place: RecommendedPlace, index: number) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="flex gap-3 p-3">
                  {/* Image */}
                  {place.images.length > 0 && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{place.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {place.location || 'Gulf Region'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRecommendation(place);
                          setEditedRecommendation({
                            name: place.name,
                            description: place.description,
                            price: place.price,
                            time: '',
                            imageUrl: place.images[0] || '',
                            location: place.location || '',
                          });
                        }}
                        className="flex-shrink-0 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition-colors" style={{ backgroundColor: '#5A1B1C' }}
                      >
                        + Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{place.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {place.price > 0 ? (
                        <span className="text-xs font-semibold" style={{ color: '#5A1B1C' }}>
                          {place.price} {place.currency}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-green-600">Free</span>
                      )}
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {place.category[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">No places found matching your search.</p>
          </div>
        )}
      </div>

      {/* Bottom Tip */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-200">
        <p className="text-center text-xs text-gray-500">
          Tap <span className="font-semibold" style={{ color: '#5A1B1C' }}>+ Add</span> to add a place to your itinerary
        </p>
      </div>

      {/* Edit & Add Modal for Recommendations */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setSelectedRecommendation(null)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit & Add Place</h3>
                <p className="text-sm text-gray-500">Customize before adding</p>
              </div>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Image Preview & Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                <div className="flex gap-3 items-start">
                  {editedRecommendation.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={editedRecommendation.imageUrl}
                        alt={editedRecommendation.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Image URL..."
                    value={editedRecommendation.imageUrl}
                    onChange={(e) => setEditedRecommendation({ ...editedRecommendation, imageUrl: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" 
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                  />
                </div>
              </div>

              {/* Place Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Place Name</label>
                <input
                  type="text"
                  value={editedRecommendation.name}
                  onChange={(e) => setEditedRecommendation({ ...editedRecommendation, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" 
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editedRecommendation.description}
                  onChange={(e) => setEditedRecommendation({ ...editedRecommendation, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm h-20 resize-none" 
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={editedRecommendation.location}
                  onChange={(e) => setEditedRecommendation({ ...editedRecommendation, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" 
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (OMR)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedRecommendation.price || ''}
                    onChange={(e) => setEditedRecommendation({ ...editedRecommendation, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm" 
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">OMR</span>
                </div>
              </div>

              {/* Time Input */}
              <div className="p-4 rounded-xl border" style={{ backgroundColor: '#5A1B1C10', borderColor: '#5A1B1C30' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5A1B1C' }}>
                  <Clock size={14} className="inline mr-1" />
                  Scheduled Time
                </label>
                <input
                  type="time"
                  value={editedRecommendation.time}
                  onChange={(e) => setEditedRecommendation({ ...editedRecommendation, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-semibold text-center bg-white border" 
                  style={{ borderColor: '#5A1B1C50', '--tw-ring-color': '#5A1B1C' } as any}
                />
                <p className="text-xs mt-1.5 text-center" style={{ color: '#5A1B1C' }}>Set a specific time for this activity (optional)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    const timeCategory = selectedRecommendation.timeCategory || 'visit';
                    const updatedImages = editedRecommendation.imageUrl 
                      ? [editedRecommendation.imageUrl, ...selectedRecommendation.images.slice(1)]
                      : selectedRecommendation.images;
                    await addPlaceToDay(trip.id, day.id, { 
                      ...selectedRecommendation, 
                      name: editedRecommendation.name,
                      description: editedRecommendation.description,
                      price: editedRecommendation.price,
                      location: editedRecommendation.location,
                      images: updatedImages,
                      timeCategory,
                      time: editedRecommendation.time || undefined 
                    });
                    setSelectedRecommendation(null);
                    onClose();
                  }}
                  className="flex-1 py-3 text-white rounded-xl font-semibold transition-colors shadow-sm" 
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  Add to Day {day.dayNumber}
                </button>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
