import { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Trip, Day, PlaceCategory, TimeCategory } from '../types';
import { addPlaceToDay } from '../lib/db';
import { recommendedPlaces } from '../data/recommendations';

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
  { value: 'All', label: 'All Day', icon: '🌍' },
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'visit', label: 'Visit', icon: '🏛️' },
  { value: 'prayer', label: 'Prayer', icon: '🕌' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️' },
  { value: 'activity', label: 'Activity', icon: '⚡' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
];

export function AddPlaces({ trip, day, onClose }: AddPlacesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'All'>('All');
  const [selectedTimeCategory, setSelectedTimeCategory] = useState<TimeCategory | 'All'>('All');
  const [showCustomForm, setShowCustomForm] = useState(false);
  
  // Custom place form state
  const [customPlace, setCustomPlace] = useState({
    name: '',
    description: '',
    location: '',
    price: 0,
    currency: 'QAR',
    timeCategory: 'visit' as TimeCategory,
    imageUrl: '',
  });

  const filteredPlaces = recommendedPlaces.filter((place) => {
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
      currency: customPlace.currency,
      location: customPlace.location || 'Custom Location',
      distanceFromUser: 0,
      timeCategory: customPlace.timeCategory,
    };

    await addPlaceToDay(trip.id, day.id, newPlace);
    
    // Reset form
    setCustomPlace({
      name: '',
      description: '',
      location: '',
      price: 0,
      currency: 'QAR',
      timeCategory: 'visit',
      imageUrl: '',
    });
    setShowCustomForm(false);
    onClose();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-200 safe-top">
        <button onClick={onClose} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Add Places - Day {day.dayNumber}</h1>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for a place"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-0"
          />
        </div>
      </div>

      {/* Create Custom Place Button */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="w-full py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors mb-4"
        >
          + Create Your Own Place
        </button>
      </div>

      {/* Custom Place Form */}
      {showCustomForm && (
        <div className="px-6 pb-4 bg-gray-50 py-4 border-y border-gray-200">
          <h3 className="font-bold text-lg mb-4">Create Custom Place</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Place Name *"
              value={customPlace.name}
              onChange={(e) => setCustomPlace({ ...customPlace, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <textarea
              placeholder="Description"
              value={customPlace.description}
              onChange={(e) => setCustomPlace({ ...customPlace, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
            />
            
            <input
              type="text"
              placeholder="Location"
              value={customPlace.location}
              onChange={(e) => setCustomPlace({ ...customPlace, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Price"
                value={customPlace.price}
                onChange={(e) => setCustomPlace({ ...customPlace, price: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={customPlace.currency}
                onChange={(e) => setCustomPlace({ ...customPlace, currency: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="QAR">QAR</option>
                <option value="SAR">SAR</option>
                <option value="KWD">KWD</option>
                <option value="OMR">OMR</option>
              </select>
            </div>
            
            <select
              value={customPlace.timeCategory}
              onChange={(e) => setCustomPlace({ ...customPlace, timeCategory: e.target.value as TimeCategory })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="breakfast">🌅 Breakfast</option>
              <option value="visit">🏛️ Visit</option>
              <option value="prayer">🕌 Prayer</option>
              <option value="lunch">🍽️ Lunch</option>
              <option value="activity">⚡ Activity</option>
              <option value="dinner">🌙 Dinner</option>
              <option value="hotel">🏨 Hotel</option>
            </select>
            
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={customPlace.imageUrl}
              onChange={(e) => setCustomPlace({ ...customPlace, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleAddCustomPlace}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Add Custom Place
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Header */}
      <div className="px-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Or Choose from Recommendations</h2>
        
        {/* Time Category Filters */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-3">
          {timeCategories.map((tc) => (
            <button
              key={tc.value}
              onClick={() => setSelectedTimeCategory(tc.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-2 ${
                selectedTimeCategory === tc.value
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              <span>{tc.icon}</span>
              <span>{tc.label}</span>
            </button>
          ))}
        </div>

        {/* Place Category Filters */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
              selectedCategory === 'All'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                selectedCategory === category
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="px-6 pb-32">
        {filteredPlaces.length > 0 ? (
          <div className="space-y-4">
            {filteredPlaces.map((place, index) => {
              return (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  <div className="flex gap-3 p-3">
                    {/* Image */}
                    {place.images.length > 0 && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {place.location || 'Gulf Region'}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{place.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{place.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        {place.price > 0 && (
                          <span className="font-medium text-red-600">
                            {place.price} {place.currency}
                          </span>
                        )}
                        {place.price === 0 && (
                          <span className="font-medium text-green-600">Free</span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                          {place.category[0]}
                        </span>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={async () => {
                        const timeCategory = place.timeCategory || 'visit';
                        await addPlaceToDay(trip.id, day.id, { ...place, timeCategory });
                        onClose();
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors h-fit"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500">
            No places found matching your search.
          </div>
        )}
      </div>

      {/* Info Message - No Done Button Needed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-bottom">
        <p className="text-center text-sm text-gray-600">
          Click "Add" on any place to add it to your day
        </p>
      </div>
    </div>
  );
}
