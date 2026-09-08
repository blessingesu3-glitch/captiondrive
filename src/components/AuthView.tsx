import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onAuthenticate: (data: { mode: 'login' | 'signup'; name?: string; email: string; password?: string }) => Promise<void>;
  onBackToLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signup',
  onAuthenticate,
  onBackToLanding
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      await onAuthenticate({ mode, name: name.trim(), email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div 
          onClick={onBackToLanding}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E94B35] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4.5 h-4.5 fill-current" />
          </div>
          <span className="font-display text-xl font-black tracking-tight text-[#111111] group-hover:text-[#E94B35] transition-colors">
            CaptionDrive
          </span>
        </div>

        <button
          onClick={onBackToLanding}
          className="text-xs font-bold text-gray-500 hover:text-[#111111] transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Website
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-10">
        <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-premium p-8 sm:p-10 space-y-6">
          
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center mx-auto border border-[#FADCD5]">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {mode === 'signup' 
                ? 'Start turning your Google Drive content into captions worth posting.' 
                : 'Log in to access your brand voice, media library, and captions.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Blessing Esu"
                    className="w-full pl-10 pr-4 h-11 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] focus:ring-1 focus:ring-[#E94B35]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] focus:ring-1 focus:ring-[#E94B35]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] focus:ring-1 focus:ring-[#E94B35]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Processing...' : mode === 'signup' ? 'Continue →' : 'Log In →'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#EAE6DF] text-center text-xs text-gray-500">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-[#E94B35] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-[#E94B35] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-gray-400">
        © {new Date().getFullYear()} CaptionDrive. All rights reserved.
      </div>
    </div>
  );
};
