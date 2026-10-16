import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Settings, 
  ChevronRight, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  Users, 
  ListOrdered, 
  Gift, 
  ShieldCheck, 
  Train, 
  CreditCard,
  LogOut,
  Sparkles,
  Ticket,
  Percent,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';
import { Booking, CoPassenger, UserPreferences, UserProfile } from '../types';
import { 
  getStoredUserPreferences, 
  saveUserPreferences, 
  getStoredCoPassengers, 
  saveCoPassengers,
  setCurrentUser
} from '../services/storage';
import { LanguageCode } from '../services/localization';

interface RedBusAccountModalProps {
  currentUser: UserProfile;
  bookings: Booking[];
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenMyBookings: () => void;
  onOpenPublicLogin: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogOut: () => void;
  onNavigateTab?: (tab: 'home' | 'bookings' | 'offers' | 'getaways' | 'help') => void;
}

export const RedBusAccountModal: React.FC<RedBusAccountModalProps> = ({
  currentUser,
  bookings,
  currentLang,
  onSelectLang,
  isOpen,
  onClose,
  onOpenMyBookings,
  onOpenPublicLogin,
  onUserUpdated,
  onLogOut,
  onNavigateTab,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(getStoredUserPreferences());
  const [coPassengers, setCoPassengers] = useState<CoPassenger[]>(getStoredCoPassengers());
  const [bookingForWomen, setBookingForWomen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeSubView, setActiveSubView] = useState<'main' | 'passengers' | 'irctc' | 'personal'>('main');

  // New Co-passenger form
  const [newPassName, setNewPassName] = useState('');
  const [newPassAge, setNewPassAge] = useState(26);
  const [newPassGender, setNewPassGender] = useState<'M' | 'F' | 'O'>('F');

  if (!isOpen) return null;

  const handleToggleWomenBooking = () => {
    setBookingForWomen(!bookingForWomen);
  };

  const handleAddCoPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    const newPass: CoPassenger = {
      id: `copass-${Date.now()}`,
      name: newPassName,
      age: Number(newPassAge),
      gender: newPassGender,
      berthPreference: 'lower',
    };
    const updated = [...coPassengers, newPass];
    setCoPassengers(updated);
    saveCoPassengers(updated);
    setNewPassName('');
  };

  const handleDeleteCoPassenger = (id: string) => {
    const updated = coPassengers.filter(p => p.id !== id);
    setCoPassengers(updated);
    saveCoPassengers(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 text-slate-800">
        
        {/* Header Bar matching Image 1 & 4 */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={activeSubView === 'main' ? onClose : () => setActiveSubView('main')}
              className="p-1.5 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {activeSubView === 'passengers' ? 'Saved Passengers' : 'My Account'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto">
          
          {activeSubView === 'main' && (
            <div className="p-4 sm:p-5 space-y-6">
              
              {/* Login Banner matching Image 4 */}
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {currentUser.isVerified ? `Hello, ${currentUser.name}!` : 'Log in to manage your bookings'}
                </h3>
                
                {!currentUser.isVerified ? (
                  <div className="mt-3.5 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPublicLogin();
                      }}
                      className="w-full py-3 px-4 bg-[#D84E55] hover:bg-[#C23C43] text-white font-bold rounded-xl shadow-md transition-all text-sm tracking-wide active:scale-[0.99]"
                    >
                      Log in
                    </button>
                    <div className="text-center text-xs text-slate-500 pt-1">
                      Don't have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => { onClose(); onOpenPublicLogin(); }}
                        className="text-[#D84E55] font-bold underline"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{currentUser.phone}</span>
                      <span className="text-slate-500 block text-[11px]">{currentUser.email}</span>
                    </div>
                    <span className="bg-[#D84E55] text-white px-2 py-0.5 rounded font-bold text-[10px]">
                      VERIFIED
                    </span>
                  </div>
                )}
              </div>

              {/* Try APNA TRIPS in your language (Exact Image 4) */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2.5">
                  Try APNA TRIPS in your language
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ta', label: 'தமிழ் (Tamil)' },
                    { code: 'mr', label: 'मराठी (Marathi)' },
                    { code: 'hi', label: 'हिंदी (Hindi)' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => onSelectLang(l.code === 'mr' ? 'hi' : (l.code as LanguageCode))}
                      className={`px-3 py-1.5 rounded-lg font-medium border transition-all ${
                        currentLang === l.code || (l.code === 'mr' && currentLang === 'hi')
                          ? 'bg-[#D84E55] text-white border-[#D84E55] shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* My Details Section (Exact Image 4) */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-2">My details</h4>
                
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
                  
                  {/* Bookings */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMyBookings();
                    }}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ListOrdered className="w-5 h-5 text-slate-700 group-hover:text-[#D84E55]" />
                      <span className="font-medium text-slate-800">Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bookings.length > 0 && (
                        <span className="bg-[#D84E55] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {bookings.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {/* Personal information */}
                  <button
                    type="button"
                    onClick={() => setActiveSubView('personal')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-700 group-hover:text-[#D84E55]" />
                      <span className="font-medium text-slate-800">Personal information</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Passengers */}
                  <button
                    type="button"
                    onClick={() => setActiveSubView('passengers')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-700 group-hover:text-[#D84E55]" />
                      <span className="font-medium text-slate-800">Passengers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">{coPassengers.length} saved</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {/* IRCTC Details */}
                  <button
                    type="button"
                    onClick={() => setActiveSubView('irctc')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                        IR
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">IRCTC Details</div>
                        <div className="text-[11px] text-emerald-600 font-medium">Create IRCTC ID & get a reward</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                </div>
              </div>

              {/* Payments Section (Exact Image 4) */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Payments</h4>
                <div className="border-t border-b border-slate-100 text-sm">
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-slate-700" />
                      <span className="font-medium text-slate-800">Gift Card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 text-xs font-semibold">New</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section (Exact matching Image 1 & 2) */}
              <div className="pt-2">
                <h4 className="text-base font-bold text-slate-900 mb-2">Preferences</h4>

                <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
                  
                  {/* Country */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇮🇳</span>
                      <div>
                        <div className="font-medium text-slate-800">Country</div>
                        <div className="text-xs text-slate-400">India</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Currency */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-slate-800 px-1">₹</span>
                      <div>
                        <div className="font-medium text-slate-800">Currency</div>
                        <div className="text-xs text-slate-400">INR</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Language */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-slate-700 px-1 font-serif">Aa</span>
                      <div>
                        <div className="font-medium text-slate-800">Language</div>
                        <div className="text-xs text-slate-400">English</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Appearance */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <Moon className="w-4 h-4 text-slate-700" />
                      <div>
                        <div className="font-medium text-slate-800">Appearance</div>
                        <div className="text-xs text-slate-400">Choose light or dark theme</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                      className="text-xs text-[#D84E55] font-semibold px-2 py-1 bg-red-50 rounded"
                    >
                      {themeMode === 'light' ? 'Light' : 'Dark'}
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-slate-700" />
                      <span className="font-medium text-slate-800">Notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.whatsappAlerts}
                      onChange={() => {
                        const updated = { ...prefs, whatsappAlerts: !prefs.whatsappAlerts };
                        setPrefs(updated);
                        saveUserPreferences(updated);
                      }}
                      className="w-4 h-4 text-[#D84E55] rounded focus:ring-[#D84E55]"
                    />
                  </div>

                  {/* Booking for women (Image 1 & 2) */}
                  <div className="py-3.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👩</span>
                      <div>
                        <div className="font-medium text-slate-800">Booking for women</div>
                        <div className="text-xs text-slate-400">{bookingForWomen ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleWomenBooking}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        bookingForWomen ? 'bg-[#D84E55]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          bookingForWomen ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                </div>
              </div>

              {/* Help & Account Settings (Image 1) */}
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateTab) onNavigateTab('help');
                  }}
                  className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 px-1"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-slate-700" />
                    <span className="font-medium text-slate-800">Help</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Version & Logout */}
              <div className="text-center pt-2 pb-4 space-y-3">
                <div className="text-xs text-slate-400 font-mono">
                  V82.6.1 · APNA TRIPS
                </div>

                {currentUser.isVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogOut();
                      onClose();
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 py-2 px-4 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                )}
              </div>

            </div>
          )}

          {/* SubView: Co-Passengers Manifest */}
          {activeSubView === 'passengers' && (
            <div className="p-4 sm:p-5 space-y-5">
              <form onSubmit={handleAddCoPassenger} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900">Add New Co-Passenger</div>
                <div>
                  <label className="block text-slate-600 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={newPassName}
                    onChange={(e) => setNewPassName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Age</label>
                    <input
                      type="number"
                      value={newPassAge}
                      onChange={(e) => setNewPassAge(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      min={1}
                      max={110}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Gender</label>
                    <select
                      value={newPassGender}
                      onChange={(e) => setNewPassGender(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#D84E55] text-white font-bold rounded-lg shadow-sm mt-1"
                >
                  Save Passenger
                </button>
              </form>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Saved Travelers</h5>
                {coPassengers.map((p) => (
                  <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-slate-500">{p.gender === 'F' ? 'Female' : 'Male'}, {p.age} years</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoPassenger(p.id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubView: Personal Info */}
          {activeSubView === 'personal' && (
            <div className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Traveler Name</label>
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={currentUser.phone}
                  readOnly
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="text"
                  value={currentUser.email}
                  readOnly
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
            </div>
          )}

          {/* SubView: IRCTC Details */}
          {activeSubView === 'irctc' && (
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                IR
              </div>
              <h4 className="text-base font-bold text-slate-900">Link your IRCTC Account</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Authorized partner with Indian Railways. Link your username to book Tatkal and express train tickets with 1-click OTP verification.
              </p>
              <input
                type="text"
                placeholder="Enter IRCTC Username"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                className="w-full py-2.5 bg-[#D84E55] text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Verify IRCTC ID
              </button>
            </div>
          )}

        </div>

        {/* Bottom Tab Bar matching Image 1, 4, 6 */}
        <div className="bg-white border-t border-slate-200 p-2 grid grid-cols-5 text-center shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab('home');
            }}
            className="flex flex-col items-center justify-center gap-1 text-[#D84E55] py-1"
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMyBookings();
            }}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 py-1"
          >
            <Ticket className="w-4 h-4" />
            <span className="text-[10px] font-medium">Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab('offers');
            }}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 py-1"
          >
            <Percent className="w-4 h-4" />
            <span className="text-[10px] font-medium">Offers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab('getaways');
            }}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 py-1 relative"
          >
            <span className="absolute -top-1 right-2 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-full">
              New
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-medium">Getaways</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab('help');
            }}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 py-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px] font-medium">Help</span>
          </button>
        </div>

      </div>
    </div>
  );
};
