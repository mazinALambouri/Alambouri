import { useState, useEffect } from 'react';
import { Trip, User } from './types';
import { getTrip } from './lib/db';
import { supabase } from './lib/supabase';
import { TripOverview } from './screens/TripOverview';
import { Auth } from './screens/Auth';
import { TripsDashboard } from './screens/TripsDashboard';
import { ShareTrip } from './screens/ShareTrip';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tripsNeedRefresh, setTripsNeedRefresh] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || '',
          createdAt: new Date(session.user.created_at)
        };
        setUser(userData);
      } else {
        setUser(null);
        setSelectedTrip(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || '',
          createdAt: new Date(session.user.created_at)
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = async (trip: Trip) => {
    setLoading(true);
    try {
      // Load full trip data with days and places
      const fullTrip = await getTrip(trip.id);
      if (fullTrip) {
        setSelectedTrip(fullTrip);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentTrip = async () => {
    if (selectedTrip) {
      const updatedTrip = await getTrip(selectedTrip.id);
      if (updatedTrip) {
        setSelectedTrip(updatedTrip);
      }
    }
  };

  const handleBackToTrips = () => {
    setSelectedTrip(null);
    setTripsNeedRefresh(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedTrip(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#5A1B1C' }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth screen
  if (!user) {
    return <Auth onAuthSuccess={() => checkAuth()} />;
  }

  // User authenticated, trip selected - show trip overview
  if (selectedTrip) {
    return (
      <>
        <TripOverview 
          trip={selectedTrip} 
          onTripUpdate={refreshCurrentTrip}
          onBack={handleBackToTrips}
          onShare={() => setShowShareModal(true)}
          onSignOut={handleSignOut}
        />

        {showShareModal && (
          <ShareTrip
            trip={selectedTrip}
            onClose={() => setShowShareModal(false)}
            onUpdate={() => {
              refreshCurrentTrip();
              setTripsNeedRefresh(true);
            }}
          />
        )}
      </>
    );
  }

  // User authenticated, no trip selected - show trips dashboard
  return (
    <TripsDashboard 
      userId={user.id}
      onSelectTrip={handleSelectTrip}
      onSignOut={handleSignOut}
      key={tripsNeedRefresh ? 'refresh' : 'normal'}
    />
  );
}

export default App;
