import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Mail, Loader2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.fullName },
            emailRedirectTo: undefined
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: formData.fullName
            });
          
          if (profileError && profileError.code !== '23505') {
            console.error('Profile creation error:', profileError);
          }
          
          if (!data.session) {
            await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password
            });
          }
          
          onAuthSuccess();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[200px] sm:h-[280px]">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop"
          alt="Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        
        {/* Logo */}
       
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {isSignUp ? 'Create an account to plan amazing trips' : 'Sign in to continue planning'}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white -mt-4 rounded-t-3xl relative z-10 px-6 pt-8 pb-safe">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required={isSignUp}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all"
                  style={{ '--tw-ring-color': '#5A1B1C' } as any}
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all"
                style={{ '--tw-ring-color': '#5A1B1C' } as any}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all"
                style={{ '--tw-ring-color': '#5A1B1C' } as any}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-400 mt-2">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#5A1B1C' }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{isSignUp ? 'Creating...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setFormData({ email: '', password: '', fullName: '' });
            }}
            className="mt-2 font-semibold text-sm hover:underline"
            style={{ color: '#5A1B1C' }}
          >
            {isSignUp ? 'Sign In Instead' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
