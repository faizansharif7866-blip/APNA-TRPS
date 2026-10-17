import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  PhoneCall,
  User,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { setCurrentUser } from '../services/storage';
import { AnimatedBus } from './AnimatedBus';

interface PublicLoginModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const PublicLoginModal: React.FC<PublicLoginModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'options' | 'phone_otp' | 'google_verify' | 'apple_verify'>('options');
  const [phone, setPhone] = useState('9876543210');
  const [userName, setUserName] = useState('Ananya Sharma');
  const [userEmail, setUserEmail] = useState('ananya.sharma@gmail.com');
  const [otpCode, setOtpCode] = useState('4829');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedProvider, setVerifiedProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google Sign-In Simulation
  const handleGoogleSignIn = () => {
    setAuthMethod('google_verify');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedProvider('Google Account (Google Identity Services)');
      setTimeout(() => {
        const user: UserProfile = {
          id: `usr-google-${Date.now()}`,
          name: 'Ananya Sharma',
          email: 'ananya.sharma@gmail.com',
          phone: '+91 98765 43210',
          role: 'customer',
          isVerified: true,
          authProvider: 'google',
        };
        setCurrentUser(user);
        onLoginSuccess(user);
        onClose();
      }, 700);
    }, 1200);
  };

  // Apple Sign-In Simulation
  const handleAppleSignIn = () => {
    setAuthMethod('apple_verify');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedProvider('Apple ID (Face ID / Passkey Verified)');
      setTimeout(() => {
        const user: UserProfile = {
          id: `usr-apple-${Date.now()}`,
          name: 'Ananya Sharma',
          email: 'ananya.sharma@icloud.com',
          phone: '+91 98765 43210',
          role: 'customer',
          isVerified: true,
          authProvider: 'apple',
        };
        setCurrentUser(user);
        onLoginSuccess(user);
        onClose();
      }, 700);
    }, 1200);
  };

  // Phone OTP Verification
  const handlePhoneOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const user: UserProfile = {
        id: `usr-phone-${Date.now()}`,
        name: userName || 'Ananya Sharma',
        email: userEmail || 'ananya.travels@example.com',
        phone: `+91 ${phone}`,
        role: 'customer',
        isVerified: true,
        authProvider: 'phone',
      };
      setCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    }, 900);
  };

  // Continue as Guest
  const handleGuestContinue = () => {
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Guest Traveler',
      email: 'guest@apnatrips.com',
      phone: '+91 98000 00000',
      role: 'customer',
      isVerified: false,
      authProvider: 'guest',
    };
    setCurrentUser(guestUser);
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 rounded-xl p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AnimatedBus size="sm" showRoad={false} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                <span>Welcome to ApnaTrips</span>
              </h3>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                Sign in to book tickets, unlock wallet cash & track fleets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Main Options View */}
          {authMethod === 'options' && (
            <div className="space-y-3.5">
              
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 hover:border-slate-400 group"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple Sign In Button */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-xl border border-black shadow-sm transition-all flex items-center justify-center gap-3 group"
              >
                {/* Official Apple Logo */}
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.72-13.97-6.53-9.9-11.45-20.9-14.75-32.99-3.3-12.08-4.95-23.75-4.95-35 0-14.79 3.73-27.18 11.2-37.16 7.47-9.98 17.07-15.09 28.8-15.34 4.58 0 9.8 1.18 15.65 3.53 5.86 2.36 9.87 3.59 12.04 3.69 1.8 0 5.87-1.3 12.21-3.9 6.34-2.6 11.77-3.77 16.29-3.52 13.92.74 24.62 5.76 32.1 15.06-11.53 7.02-17.18 16.54-16.94 28.56.24 10.02 4.09 18.25 11.56 24.69 7.47 6.44 16.28 10.05 26.43 10.83-2.09 6.32-4.58 12.44-7.47 18.37zm-29.4-106.18c0-7.39 2.65-14.4 7.95-21.03 5.3-6.63 11.93-11.02 19.89-13.17.65 2.18.98 4.35.98 6.52 0 7.39-2.73 14.51-8.19 21.36-5.46 6.85-12.15 11.16-20.08 12.93-.16-2.17-.55-4.37-.55-6.61z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider relative">
                  or sign in with mobile
                </span>
              </div>

              {/* Phone OTP Login Option */}
              <button
                type="button"
                onClick={() => setAuthMethod('phone_otp')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Sign In with Phone Number (+91 OTP)</span>
              </button>

              {/* Explore as Guest Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
                >
                  Skip for now & Continue as Guest
                </button>
              </div>

              {/* RedBus-Style Benefits Banner */}
              <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Member Privileges on ApnaTrips:</span>
                </div>
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  <li>₹450 Welcome Travel Cash in your wallet</li>
                  <li>Instant WhatsApp ticket delivery & live GPS updates</li>
                  <li>Manage co-passengers for 1-click booking</li>
                </ul>
              </div>

            </div>
          )}

          {/* Google Verification Animation */}
          {authMethod === 'google_verify' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto">
                {isVerifying ? (
                  <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isVerifying ? 'Connecting to Google Accounts...' : 'Google Account Verified!'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {verifiedProvider || 'Verifying ananya.sharma@gmail.com...'}
              </p>
            </div>
          )}

          {/* Apple ID Verification Animation */}
          {authMethod === 'apple_verify' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center mx-auto">
                {isVerifying ? (
                  <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isVerifying ? 'Verifying Apple ID with Passkey...' : 'Apple ID Verified!'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {verifiedProvider || 'Face ID Authenticated'}
              </p>
            </div>
          )}

          {/* Phone Number + OTP Input View */}
          {authMethod === 'phone_otp' && (
            <form onSubmit={handlePhoneOtpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Traveler Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Indian Mobile Number (+91)</label>
                <div className="flex gap-2">
                  <div className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email for E-Ticket Delivery</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Demo OTP Display */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center justify-between">
                <span>Demo SMS OTP sent: <strong>{otpCode}</strong></span>
                <span className="font-mono text-emerald-700 font-bold">Auto-filled</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('options')}
                  className="px-3.5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Enter ApnaTrips</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Public Traveler Trust Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official 256-bit encrypted SSL login</span>
            </span>

            <span className="text-slate-400">
              ApnaTrips Verified Network
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
