import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types';
import { Share2, Mail, Copy, Check, X, Loader2, UserPlus, Globe, Lock } from 'lucide-react';

interface ShareTripProps {
  trip: Trip;
  onClose: () => void;
  onUpdate: () => void;
}

export function ShareTrip({ trip, onClose, onUpdate }: ShareTripProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<string[]>(trip.sharedWith || []);
  const [isPublic, setIsPublic] = useState(trip.isPublic || false);
  
  const shareUrl = `${window.location.origin}/trip/${trip.id}`;

  const handleShareWithEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        alert('User not found. Make sure they have an account.');
        return;
      }

      // Update trip's shared_with array
      const updatedSharedWith = [...(trip.sharedWith || []), user.id];
      
      const { error } = await supabase
        .from('trips')
        .update({ shared_with: updatedSharedWith })
        .eq('id', trip.id);

      if (error) throw error;

      // Send notification email (optional - requires email service setup)
      // For now, just show success
      setSharedUsers([...sharedUsers, user.email]);
      setEmail('');
      onUpdate();
      
      alert(`Trip shared with ${user.full_name || user.email}`);
    } catch (error) {
      console.error('Error sharing trip:', error);
      alert('Failed to share trip');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_public: !isPublic })
        .eq('id', trip.id);

      if (error) throw error;
      
      setIsPublic(!isPublic);
      onUpdate();
    } catch (error) {
      console.error('Error updating trip visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveUser = async (userEmail: string) => {
    setLoading(true);
    try {
      // Get user ID from email
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (user) {
        const updatedSharedWith = (trip.sharedWith || []).filter(id => id !== user.id);
        
        const { error } = await supabase
          .from('trips')
          .update({ shared_with: updatedSharedWith })
          .eq('id', trip.id);

        if (error) throw error;
        
        setSharedUsers(sharedUsers.filter(email => email !== userEmail));
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-auto sm:min-w-[380px] max-w-lg sm:rounded-2xl rounded-t-3xl p-4 sm:p-6 pb-8 safe-bottom animate-slide-up sm:mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5A1B1C20' }}>
              <Share2 size={18} className="sm:hidden" style={{ color: '#5A1B1C' }} />
              <Share2 size={20} className="hidden sm:block" style={{ color: '#5A1B1C' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Share Trip</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{trip.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
            <X size={22} />
          </button>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {isPublic ? (
                <Globe size={18} className="text-green-600 flex-shrink-0" />
              ) : (
                <Lock size={18} className="text-gray-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {isPublic ? 'Public Trip' : 'Private Trip'}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {isPublic 
                    ? 'Anyone with the link can view' 
                    : 'Only invited people can view'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                isPublic ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Link */}
          {isPublic && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Share this link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-lg text-[10px] sm:text-xs text-gray-600 min-w-0"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 sm:px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check size={14} className="text-green-600 sm:hidden" />
                  ) : (
                    <Copy size={14} className="text-gray-600 sm:hidden" />
                  )}
                  {copied ? (
                    <Check size={16} className="text-green-600 hidden sm:block" />
                  ) : (
                    <Copy size={16} className="text-gray-600 hidden sm:block" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share with Email */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <UserPlus size={12} className="inline mr-1 sm:hidden" />
            <UserPlus size={14} className="hidden sm:inline mr-1" />
            Share with specific people
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#5A1B1C' } as any}
              />
            </div>
            <button
              onClick={handleShareWithEmail}
              disabled={loading || !email}
              className="px-4 py-2.5 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#5A1B1C' }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Share'
              )}
            </button>
          </div>
        </div>

        {/* Shared Users List */}
        {sharedUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Shared with</p>
            <div className="space-y-2">
              {sharedUsers.map((userEmail) => (
                <div key={userEmail} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{userEmail}</span>
                  <button
                    onClick={() => handleRemoveUser(userEmail)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors text-gray-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
