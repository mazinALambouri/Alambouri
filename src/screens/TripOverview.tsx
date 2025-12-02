import { useState, useEffect, useRef } from 'react';
import { Trip } from '../types';
import { FloatingButton } from '../components/FloatingButton';
import { addDay, deleteDay, updateTripStartDate } from '../lib/db';
import { calculateTripStats } from '../lib/utils';
import { DayDetail } from './DayDetail';
import { Clock, MapPin, Calendar, List, DollarSign, Route, Compass, CheckSquare, Square, Plus, X, Package, Utensils, Car, Heart, Zap, User, ArrowLeft, ClipboardList, CalendarDays } from 'lucide-react';

interface TripOverviewProps {
  trip: Trip;
  onTripUpdate: () => void;
}

// Checklist item type
interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  type: 'essentials' | 'food' | 'car' | 'health' | 'electronics' | 'personal';
  assignedTo?: string;
}

// Item type config - using brand colors only (dark red, black, white)
const itemTypeConfig = {
  essentials: { label: 'Essentials', icon: Package },
  food: { label: 'Food & Drinks', icon: Utensils },
  car: { label: 'Car', icon: Car },
  health: { label: 'Health', icon: Heart },
  electronics: { label: 'Electronics', icon: Zap },
  personal: { label: 'Personal', icon: User },
};

// Default road trip essentials
const defaultChecklist: ChecklistItem[] = [
  { id: '1', name: 'Driving License & Car Registration', checked: false, type: 'essentials' },
  { id: '2', name: 'ID/Passport', checked: false, type: 'essentials' },
  { id: '3', name: 'Cash & Cards', checked: false, type: 'essentials' },
  { id: '4', name: 'Phone Charger & Power Bank', checked: false, type: 'electronics' },
  { id: '5', name: 'First Aid Kit', checked: false, type: 'health' },
  { id: '6', name: 'Water Bottles (6L minimum)', checked: false, type: 'food' },
  { id: '7', name: 'Snacks & Food', checked: false, type: 'food' },
  { id: '8', name: 'Cooler Box with Ice', checked: false, type: 'food' },
  { id: '9', name: 'Spare Tire & Jack', checked: false, type: 'car' },
  { id: '10', name: 'Jumper Cables', checked: false, type: 'car' },
  { id: '11', name: 'Flashlight & Batteries', checked: false, type: 'essentials' },
  { id: '12', name: 'Sunglasses & Sunscreen', checked: false, type: 'personal' },
  { id: '13', name: 'Medications', checked: false, type: 'health' },
  { id: '14', name: 'Paper Maps (backup)', checked: false, type: 'essentials' },
  { id: '15', name: 'Car Phone Mount', checked: false, type: 'electronics' },
  { id: '16', name: 'Blankets & Pillows', checked: false, type: 'personal' },
  { id: '17', name: 'Tissues & Wet Wipes', checked: false, type: 'personal' },
  { id: '18', name: 'Trash Bags', checked: false, type: 'essentials' },
  { id: '19', name: 'Umbrella / Rain Gear', checked: false, type: 'personal' },
  { id: '20', name: 'Tire Pressure Gauge', checked: false, type: 'car' },
];

export function TripOverview({ trip, onTripUpdate }: TripOverviewProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    trip.days.length > 0 ? trip.days[0].id : null
  );
  const [viewMode, setViewMode] = useState<'detail' | 'timeline'>('detail');
  const stats = calculateTripStats(trip);
  
  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(`checklist-${trip.id}`);
    return saved ? JSON.parse(saved) : defaultChecklist;
  });
  const [showChecklistPage, setShowChecklistPage] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'essentials' as ChecklistItem['type'], assignedTo: '' });
  
  // Start date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [updatingDate, setUpdatingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Save checklist to localStorage
  useEffect(() => {
    localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(checklist));
  }, [checklist, trip.id]);

  // Sort checklist - unchecked first
  const sortedChecklist = [...checklist].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const item: ChecklistItem = {
      id: Date.now().toString(),
      name: newItem.name,
      type: newItem.type,
      checked: false,
      assignedTo: newItem.assignedTo || undefined,
    };
    setChecklist(prev => [...prev, item]);
    setNewItem({ name: '', type: 'essentials', assignedTo: '' });
    setShowAddItem(false);
  };

  const deleteItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const checkedCount = checklist.filter(i => i.checked).length;

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

  const handleStartDateChange = async (newDate: string) => {
    if (!newDate) return;
    setUpdatingDate(true);
    await updateTripStartDate(trip.id, new Date(newDate));
    setShowDatePicker(false);
    setUpdatingDate(false);
    onTripUpdate();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
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

  // Show checklist page
  if (showChecklistPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white sticky top-0 z-30 border-b border-gray-200 pt-safe">
          <div className="px-4 py-3 flex items-center gap-3">
            <button 
              onClick={() => setShowChecklistPage(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Road Trip Checklist</h1>
              <p className="text-xs text-gray-500">{checkedCount}/{checklist.length} items packed</p>
            </div>
            {/* Progress Circle */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle 
                  cx="24" cy="24" r="20" fill="none" stroke="#5A1B1C" strokeWidth="4"
                  strokeDasharray={`${(checkedCount / checklist.length) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#5A1B1C' }}>
                {Math.round((checkedCount / checklist.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {Object.entries(itemTypeConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = checklist.filter(i => i.type === key && !i.checked).length;
              return (
                <div
                  key={key}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{ backgroundColor: '#5A1B1C15', borderColor: '#5A1B1C40', color: '#5A1B1C' }}
                >
                  <Icon size={12} />
                  {config.label}
                  {count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: '#5A1B1C' }}>{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Add Item Button */}
          {!showAddItem ? (
            <button
              onClick={() => setShowAddItem(true)}
              className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-gray-400 hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add New Item
            </button>
          ) : (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Item name..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2" 
                style={{ '--tw-ring-color': '#5A1B1C' } as any}
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ChecklistItem['type'] })}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                >
                  {Object.entries(itemTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Assigned to..."
                  value={newItem.assignedTo}
                  onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  className="flex-1 py-2.5 text-white rounded-xl font-medium" 
                  style={{ backgroundColor: '#5A1B1C' }}
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Checklist Items */}
          <div className="space-y-2">
            {sortedChecklist.map((item) => {
              const typeConfig = itemTypeConfig[item.type];
              const Icon = typeConfig.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    item.checked 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex-shrink-0"
                  >
                    {item.checked ? (
                      <CheckSquare size={24} style={{ color: '#5A1B1C' }} />
                    ) : (
                      <Square size={24} className="text-gray-400" />
                    )}
                  </button>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Type Badge */}
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                        style={{ backgroundColor: '#5A1B1C15', borderColor: '#5A1B1C40', color: '#5A1B1C' }}
                      >
                        <Icon size={10} />
                        {typeConfig.label}
                      </span>
                      {/* Assigned Badge */}
                      {item.assignedTo && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <User size={10} />
                          {item.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ '--hover-color': '#5A1B1C' } as any}
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section - Responsive height */}
      <div className="relative h-[280px] sm:h-[350px] md:h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1200&auto=format&fit=crop"
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        {/* Checklist Icon - Top Right */}
        <button
          onClick={() => setShowChecklistPage(true)}
          className="absolute top-safe right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <ClipboardList size={22} style={{ color: '#5A1B1C' }} />
          {/* Badge showing unchecked count */}
          {checklist.length - checkedCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: '#5A1B1C' }}
            >
              {checklist.length - checkedCount}
            </span>
          )}
        </button>
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

        {/* Trip Dates - Clickable to change */}
        <button
          onClick={() => setShowDatePicker(true)}
          className="w-full rounded-xl p-3 mb-4 border flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          style={{ borderColor: '#5A1B1C30' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5A1B1C' }}>
            <CalendarDays size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Trip Dates</p>
            <p className="text-sm font-semibold" style={{ color: '#5A1B1C' }}>
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </p>
          </div>
          <span className="text-xs text-gray-400">Tap to change</span>
        </button>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          Embark on an epic road trip across the Gulf Cooperation Council (GCC) countries. Experience diverse cultures, UNESCO World Heritage sites, and the warm hospitality of the Arabian Peninsula.
        </p>
      </div>

      {/* View Toggle & Day Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20 safe-top">
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowDatePicker(false)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8 safe-bottom animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5A1B1C20' }}>
                <CalendarDays size={24} style={{ color: '#5A1B1C' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Set Start Date</h3>
                <p className="text-sm text-gray-500">Choose when your trip begins</p>
              </div>
            </div>

            {/* Current Dates Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Start</p>
                  <p className="font-semibold text-gray-900">{formatDate(trip.startDate)}</p>
                </div>
                <div className="text-gray-300">→</div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Current End</p>
                  <p className="font-semibold text-gray-900">{formatDate(trip.endDate)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">{trip.days.length} days total</p>
            </div>

            {/* Date Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Start Date</label>
              <input
                ref={dateInputRef}
                type="date"
                defaultValue={formatDateForInput(trip.startDate)}
                onChange={(e) => handleStartDateChange(e.target.value)}
                disabled={updatingDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-lg font-semibold text-center"
                style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                All day dates will be recalculated based on the new start date
              </p>
            </div>

            {/* Loading State */}
            {updatingDate && (
              <div className="flex items-center justify-center gap-2 py-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-current rounded-full animate-spin" style={{ borderTopColor: '#5A1B1C' }}></div>
                <span className="text-sm">Updating dates...</span>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setShowDatePicker(false)}
              disabled={updatingDate}
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
          <div className="flex items-center gap-3 mb-4 sticky top-20 safe-top bg-white py-2 z-10">
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
