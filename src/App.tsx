import { useState, useEffect } from 'react';
import { Trip } from './types';
import { getAllTrips, getTrip, createTrip } from './lib/db';
import { populateGulfItinerary } from './lib/itinerary-helper';
import { TripOverview } from './screens/TripOverview';
import { Button } from './components/Button';
import { Plane } from 'lucide-react';

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const allTrips = await getAllTrips();
      setTrips(allTrips);
      
      // Auto-select the first trip or create a demo trip
      if (allTrips.length > 0) {
        setSelectedTrip(allTrips[0]);
      } else {
        // Create a 10-day Gulf road trip
        const startDate = new Date('2024-12-15');
        const endDate = new Date('2024-12-24');
        const demoTrip = await createTrip(
          'Gulf Road Trip Adventure',
          'Oman, Qatar, Saudi Arabia, Kuwait',
          startDate,
          endDate
        );
        
        // Pre-populate with itinerary
        await populateGulfItinerary(demoTrip);
        
        // Reload the trip to get the populated places
        const populatedTrip = await getTrip(demoTrip.id);
        
        setTrips([populatedTrip || demoTrip]);
        setSelectedTrip(populatedTrip || demoTrip);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentTrip = async () => {
    if (selectedTrip) {
      const updatedTrip = await getTrip(selectedTrip.id);
      if (updatedTrip) {
        setSelectedTrip(updatedTrip);
        // Update the trip in the list as well
        setTrips(prevTrips => 
          prevTrips.map(t => t.id === updatedTrip.id ? updatedTrip : t)
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Plane size={48} className="text-accent-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (selectedTrip) {
    return (
      <TripOverview 
        trip={selectedTrip} 
        onTripUpdate={refreshCurrentTrip}
      />
    );
  }

  // Empty state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Plane size={64} className="text-accent-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Trip Planner</h1>
        <p className="text-gray-600 mb-8">
          Start planning your perfect trip. Add places, organize days, and track your adventures.
        </p>
        <Button 
          onClick={loadTrips}
          size="lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

export default App;
