import { useState, useRef } from 'react';
import { Trip, Day, Place, TimeCategory, PlaceCategory } from '../types';
import { deletePlace, approvePlace, unapprovePlace, updatePlace, uploadImage, movePlaceToDay } from '../lib/db';
import { AddPlaces } from './AddPlaces.tsx';
import { Coffee, Sun, MapPin, Moon, Hotel, UtensilsCrossed, Trash2, Clock, Check, AlertCircle, Fuel, Pencil, X, Upload, ExternalLink, Map, ArrowRightLeft } from 'lucide-react';
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

  // Edit place modal state
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    location: '',
    mapUrl: '',
    price: 0,
    time: '',
    timeCategory: 'visit' as TimeCategory,
  });
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editImagesToDelete, setEditImagesToDelete] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // Move place modal state
  const [movingPlace, setMovingPlace] = useState<Place | null>(null);
  const [movingToDay, setMovingToDay] = useState(false);

  const handleMovePlace = async (targetDayId: string) => {
    if (!movingPlace) return;
    setMovingToDay(true);
    await movePlaceToDay(movingPlace.id, targetDayId);
    setMovingToDay(false);
    setMovingPlace(null);
    onUpdate();
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setEditImageFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const openEditModal = (place: Place) => {
    setEditingPlace(place);
    setEditForm({
      name: place.name,
      description: place.description,
      location: place.location || '',
      mapUrl: place.mapUrl || '',
      price: place.price,
      time: place.time || '',
      timeCategory: place.timeCategory || 'visit',
    });
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditImagesToDelete([]);
  };

  const handleSaveEdit = async () => {
    if (!editingPlace) return;

    setSavingEdit(true);

    // Upload new images
    const newUploadedUrls: string[] = [];
    for (const file of editImageFiles) {
      const url = await uploadImage(file);
      if (url) newUploadedUrls.push(url);
    }

    // Filter out deleted images and add new ones
    const remainingImages = editingPlace.images.filter(img => !editImagesToDelete.includes(img));
    const updatedImages = [...newUploadedUrls, ...remainingImages];

    await updatePlace(trip.id, day.id, editingPlace.id, {
      name: editForm.name,
      description: editForm.description,
      location: editForm.location,
      mapUrl: editForm.mapUrl || undefined,
      price: editForm.price,
      time: editForm.time || undefined,
      timeCategory: editForm.timeCategory,
      images: updatedImages,
    });

    setSavingEdit(false);
    setEditingPlace(null);
    onUpdate();
  };

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
                onEdit={() => openEditModal(place)}
                onMove={() => setMovingPlace(place)}
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

      {/* Edit Place Modal */}
      {editingPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setEditingPlace(null)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Place</h3>
                <p className="text-sm text-gray-500">Update details for {editingPlace.name}</p>
              </div>
              <button
                onClick={() => setEditingPlace(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-8 safe-bottom space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Google Maps URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Map size={14} className="inline mr-1" />
                  Google Maps Link
                </label>
                <input
                  type="url"
                  placeholder="Paste Google Maps URL here..."
                  value={editForm.mapUrl}
                  onChange={(e) => setEditForm({ ...editForm, mapUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Open Google Maps, find the place, tap Share → Copy link
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (OMR)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={editForm.price === 0 ? '' : editForm.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setEditForm({ ...editForm, price: value === '' ? 0 : Number(value) || value as any });
                      }
                    }}
                    onBlur={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      setEditForm({ ...editForm, price: num });
                    }}
                    className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': '#5A1B1C' } as any}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">OMR</span>
                </div>
              </div>

              {/* Time Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(timeCategoryConfig).map(([key, cfg]) => {
                    const CategoryIcon = cfg.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, timeCategory: key as TimeCategory })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          editForm.timeCategory === key
                            ? 'text-white border-transparent'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                        style={editForm.timeCategory === key ? { backgroundColor: '#5A1B1C' } : {}}
                      >
                        <CategoryIcon size={18} className="mx-auto mb-0.5" />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
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
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-lg font-semibold text-center bg-white border"
                  style={{ borderColor: '#5A1B1C30', '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images {editingPlace.images.length > 0 && `(${editingPlace.images.length - editImagesToDelete.length + editImagePreviews.length})`}
                </label>
                
                {/* Existing Images */}
                {editingPlace.images.length > 0 && (
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 mb-2">
                    {editingPlace.images.map((img, idx) => {
                      const isMarkedForDeletion = editImagesToDelete.includes(img);
                      return (
                        <div 
                          key={idx} 
                          className={`relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 ${
                            isMarkedForDeletion ? 'opacity-50' : ''
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isMarkedForDeletion ? (
                            <button
                              type="button"
                              onClick={() => setEditImagesToDelete(prev => prev.filter(url => url !== img))}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium"
                            >
                              Undo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditImagesToDelete(prev => [...prev, img])}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New Image Previews */}
                {editImagePreviews.length > 0 && (
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 mb-2">
                    {editImagePreviews.map((preview, idx) => (
                      <div 
                        key={idx} 
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-green-500"
                      >
                        <img
                          src={preview}
                          alt={`New image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded font-medium">New</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditImageFiles(prev => prev.filter((_, i) => i !== idx));
                            setEditImagePreviews(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <input
                  type="file"
                  ref={editImageInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editImageInputRef.current?.click()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {editingPlace.images.length > 0 || editImagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editForm.name.trim()}
                  className="flex-1 py-3 text-white rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingPlace(null)}
                  disabled={savingEdit}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Place Modal */}
      {movingPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setMovingPlace(null)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8 safe-bottom animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5A1B1C20' }}>
                <ArrowRightLeft size={24} style={{ color: '#5A1B1C' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Move Place</h3>
                <p className="text-sm text-gray-500">Move "{movingPlace.name}" to another day</p>
              </div>
            </div>

            {/* Current Day Info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Currently in</p>
              <p className="font-semibold text-gray-900">Day {day.dayNumber}</p>
            </div>

            {/* Day Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select destination day</label>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {trip.days.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleMovePlace(d.id)}
                    disabled={d.id === day.id || movingToDay}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      d.id === day.id
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg font-bold block">{d.dayNumber}</span>
                    <span className="text-[10px] text-gray-500">
                      {d.places.length} place{d.places.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {movingToDay && (
              <div className="flex items-center justify-center gap-2 py-3 text-gray-600 mb-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-current rounded-full animate-spin" style={{ borderTopColor: '#5A1B1C' }}></div>
                <span className="text-sm">Moving place...</span>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setMovingPlace(null)}
              disabled={movingToDay}
              className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
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
  onEdit: () => void;
  onMove: () => void;
  currentUserId: string;
}

function TimelinePlace({ place, number, onDelete, onApprove, onEdit, onMove, currentUserId }: TimelinePlaceProps) {
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
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onMove}
              className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100 hover:text-purple-500"
              title="Move to another day"
            >
              <ArrowRightLeft size={16} />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 flex-wrap">
          {place.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} style={{ color: '#5A1B1C' }} />
              {place.location}
            </span>
          )}
          {place.mapUrl && (
            <a
              href={place.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4285F4' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              Open in Maps
            </a>
          )}
          {place.price > 0 && (
            <span className="font-medium" style={{ color: '#5A1B1C' }}>
              {place.price} OMR
            </span>
          )}
        </div>

        {/* Image Gallery - Show all images */}
        {place.images.length > 0 && (
          <div className="mb-4">
            {place.images.length === 1 ? (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={place.images[0]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : place.images.length === 2 ? (
              <div className="grid grid-cols-2 gap-2">
                {place.images.map((img, idx) => (
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
            ) : (
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
                {place.images.map((img, idx) => (
                  <div key={idx} className="w-40 h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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
            {place.images.length > 2 && (
              <p className="text-xs text-gray-400 mt-1 text-center">{place.images.length} photos</p>
            )}
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
