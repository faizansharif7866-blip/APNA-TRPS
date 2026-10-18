import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound,
  RotateCcw,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import { setCurrentUser } from '../services/storage';
import { AnimatedBus } from './AnimatedBus';
import { 
  signInWithGoogle, 
  setupRecaptcha, 
  sendPhoneOtp, 
  verifyPhoneOtp 
} from '../services/firebase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

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
  // Navigation views: 'options' | 'phone_input' | 'otp_verify'
  const [view, setView] = useState<'options' | 'phone_input' | 'otp_verify'>('options');
  
  // Phone form state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  
  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  
  // Status & Error
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setView('options');
      setErrorMessage(null);
      setSuccessMessage(null);
      setLoading(false);
      setOtpDigits(['', '', '', '', '', '']);
    } else {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'otp_verify' && resendCountdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, resendCountdown]);

  if (!isOpen) return null;

  // Initialize reCAPTCHA on container
  const getOrCreateRecaptcha = (): RecaptchaVerifier => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = setupRecaptcha('firebase-recaptcha-container');
    }
    return recaptchaVerifierRef.current;
  };

  /**
   * 1. Real Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Connecting with Google Account...');

    try {
      const { user, profile } = await signInWithGoogle();
      
      const appUser: UserProfile = {
        id: user.uid,
        name: profile.name || user.displayName || 'Valued Traveler',
        email: profile.email || user.email || 'traveler@apnatrips.com',
        phone: profile.phoneNumber || user.phoneNumber || '+91 98000 00000',
        avatarUrl: profile.photoURL || user.photoURL || undefined,
        role: 'customer',
        isVerified: true,
        authProvider: 'google',
        createdAt: profile.createdAt,
      };

      setCurrentUser(appUser);
      setSuccessMessage(`Welcome, ${appUser.name}!`);
      
      setTimeout(() => {
        onLoginSuccess(appUser);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Google Sign-In Failed:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. The Google popup was closed before completion.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Previous login attempt was cancelled.');
      } else if (err?.code === 'auth/network-request-failed') {
        setErrorMessage('Network connection error. Please verify your internet connection.');
      } else {
        setErrorMessage(err?.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  /**
   * 2. Send Phone OTP
   */
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Sending 6-digit OTP via carrier SMS...');

    try {
      const verifier = getOrCreateRecaptcha();
      const fullNumber = `${countryCode}${cleanPhone}`;
      const confirmation = await sendPhoneOtp(fullNumber, verifier);
      
      setConfirmationResult(confirmation);
      setView('otp_verify');
      setResendCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      
      // Auto-focus first digit input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      console.error('Send OTP Failed:', err);
      // Reset reCAPTCHA verifier on failure so user can retry cleanly
      recaptchaVerifierRef.current = null;

      if (err?.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format. Please check the country code and number.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Too many OTP requests from this device. Please wait a few minutes or sign in with Google.');
      } else if (err?.code === 'auth/quota-exceeded') {
        setErrorMessage('SMS quota exceeded for test project. Please use Google Sign-In.');
      } else {
        setErrorMessage(err?.message || 'Failed to send SMS OTP. Please check your number.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  /**
   * 3. Resend OTP
   */
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullNumber = `${countryCode}${cleanPhone}`;

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Resending new SMS OTP...');

    try {
      const verifier = getOrCreateRecaptcha();
      const confirmation = await sendPhoneOtp(fullNumber, verifier);
      setConfirmationResult(confirmation);
      setResendCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setStatusMessage('New OTP sent successfully!');
      setTimeout(() => setStatusMessage(''), 2500);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      recaptchaVerifierRef.current = null;
      setErrorMessage(err?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4. Handle OTP Digit Input & Paste
   */
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // User pasted full code
      const pasted = val.replace(/\D/g, '').slice(0, 6);
      if (pasted) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const focusIndex = Math.min(pasted.length, 5);
        otpInputRefs.current[focusIndex]?.focus();
      }
      return;
    }

    const digit = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 5. Verify Phone OTP
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');

    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code sent to your phone.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Verification session expired. Please request a new OTP.');
      setView('phone_input');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Verifying OTP with secure authentication server...');

    try {
      const { user, profile } = await verifyPhoneOtp(confirmationResult, fullCode);

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const displayName = fullName.trim() || profile.name || `Traveler ${cleanPhone.slice(-4)}`;

      const appUser: UserProfile = {
        id: user.uid,
        name: displayName,
        email: profile.email || `${cleanPhone}@apnatrips.com`,
        phone: user.phoneNumber || `${countryCode} ${cleanPhone}`,
        role: 'customer',
        isVerified: true,
        authProvider: 'phone',
        createdAt: profile.createdAt,
      };

      setCurrentUser(appUser);
      setSuccessMessage(`Phone verified! Welcome ${appUser.name}`);

      setTimeout(() => {
        onLoginSuccess(appUser);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Verify OTP Failed:', err);
      if (err?.code === 'auth/invalid-verification-code') {
        setErrorMessage('Incorrect OTP code. Please check the SMS and re-enter.');
      } else if (err?.code === 'auth/code-expired') {
        setErrorMessage('This OTP code has expired. Please click Resend OTP.');
      } else {
        setErrorMessage(err?.message || 'OTP verification failed. Please check the code.');
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  /**
   * 6. Guest Bypass
   */
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
      
      {/* Invisible reCAPTCHA container required by Firebase Phone Auth */}
      <div id="firebase-recaptcha-container"></div>

      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-6 relative">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 rounded-2xl p-1.5 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AnimatedBus size="sm" showRoad={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-white tracking-tight">Apna</span>
                <span className="text-lg font-black text-amber-400 tracking-tight">Trips</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold ml-1">
                  Traveler Login
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {view === 'otp_verify' ? 'Enter 6-digit verification code' : 'Sign in to access your tickets, wallet & live GPS'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <div className="font-medium">{statusMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* VIEW 1: Main Options (Google or Phone) */}
          {view === 'options' && (
            <div className="space-y-4">
              
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 hover:border-slate-400 active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider relative">
                  or sign in with mobile OTP
                </span>
              </div>

              {/* Phone OTP Login Option */}
              <button
                type="button"
                onClick={() => setView('phone_input')}
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99]"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Verify Phone Number via SMS OTP</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {/* RedBus-Style Benefits Card */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-2 mt-4">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Real Traveler Privileges:</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-amber-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real-time WhatsApp & SMS E-Ticket confirmation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Live GPS bus tracker with pinpoint boarding location</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Save co-passengers for lightning-fast 1-click booking</span>
                  </div>
                </div>
              </div>

              {/* Skip for Guest */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
                >
                  Skip for now & Continue as Guest
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: Phone Number Input Form */}
          {view === 'phone_input' && (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4 animate-in fade-in">
              <button
                type="button"
                onClick={() => setView('options')}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to login options</span>
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Mobile Number for OTP Verification</span>
                  <span className="text-rose-500">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {/* Country code selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={12}
                      className="w-full h-11 pl-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 tracking-wide"
                      autoFocus
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  A 6-digit SMS verification code will be sent to this number.
                </p>
              </div>

              {/* Optional Traveler Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Traveler Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-11 pl-3 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Send OTP button */}
              <button
                type="submit"
                disabled={loading || !phoneNumber.trim()}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send SMS OTP</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Firebase Enterprise SMS Verification</span>
              </div>
            </form>
          )}

          {/* VIEW 3: 6-Digit OTP Verification Form */}
          {view === 'otp_verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('phone_input')}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Change number</span>
                </button>
                <span className="text-xs font-bold text-slate-700">
                  {countryCode} {phoneNumber}
                </span>
              </div>

              <div className="text-center py-1">
                <p className="text-xs text-slate-600">
                  Enter the 6-digit code sent to <strong className="text-slate-900">{countryCode} {phoneNumber}</strong>
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              {/* Resend OTP Timer & Button */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="text-slate-500">Didn't receive the SMS?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 underline underline-offset-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span className="font-semibold text-slate-400">
                    Resend in <span className="text-amber-600 font-mono font-bold">{resendCountdown}s</span>
                  </span>
                )}
              </div>
            </form>
          )}

        </div>

        {/* Modal Trust Bar Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted Auth</span>
          </div>
          <span>ApnaTrips Verified Network</span>
        </div>

      </div>

    </div>
  );
};
export default PublicLoginModal;
