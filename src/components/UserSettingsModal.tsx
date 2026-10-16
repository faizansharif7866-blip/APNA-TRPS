import React, { useState } from 'react';
import { 
  X, 
  User, 
  Ticket, 
  Settings, 
  ShieldCheck, 
  Bell, 
  MessageSquare, 
  Wallet, 
  Users, 
  Sliders, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  PhoneCall, 
  Building, 
  Globe, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
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

interface UserSettingsModalProps {
  currentUser: UserProfile;
  bookings: Booking[];
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenMyBookings: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogOut: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  currentUser,
  bookings,
  currentLang,
  onSelectLang,
  isOpen,
  onClose,
  onOpenMyBookings,
  onUserUpdated,
  onLogOut,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'passengers' | 'preferences' | 'profile'>('metrics');
  
  // Settings & Co-passengers local state
  const [prefs, setPrefs] = useState<UserPreferences>(getStoredUserPreferences());
  const [coPassengers, setCoPassengers] = useState<CoPassenger[]>(getStoredCoPassengers());

  // Edit Profile fields
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // New Co-passenger form
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [newPassName, setNewPassName] = useState('');
  const [newPassAge, setNewPassAge] = useState(28);
  const [newPassGender, setNewPassGender] = useState<'M' | 'F' | 'O'>('F');
  const [newPassBerth, setNewPassBerth] = useState<'lower' | 'upper' | 'window' | 'any'>('lower');

  if (!isOpen) return null;

  // Booking Statistics Calculations (Prominent as requested)
  const totalBookingsCount = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const refundedBookings = bookings.filter(b => b.status === 'REFUNDED' || b.status === 'CANCELLED');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.financials?.totalPayableAmount || 0), 0);

  // Save Preferences
  const handleTogglePref = (key: keyof UserPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key],
    };
    setPrefs(updated);
    saveUserPreferences(updated);
  };

  const handleUpdateBerthPreference = (val: 'lower' | 'upper' | 'window' | 'any') => {
    const updated = { ...prefs, seatPreference: val };
    setPrefs(updated);
    saveUserPreferences(updated);
  };

  const handleUpdateGst = (name: string, gstin: string) => {
    const updated = { ...prefs, companyName: name, companyGstin: gstin };
    setPrefs(updated);
    saveUserPreferences(updated);
  };

  const handleUpdateSos = (name: string, phone: string) => {
    const updated = { ...prefs, emergencyContactName: name, emergencyContactPhone: phone };
    setPrefs(updated);
    saveUserPreferences(updated);
  };

  // Add Co-passenger
  const handleAddCoPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    const newPass: CoPassenger = {
      id: `copass-${Date.now()}`,
      name: newPassName,
      age: Number(newPassAge),
      gender: newPassGender,
      berthPreference: newPassBerth,
    };
    const updated = [...coPassengers, newPass];
    setCoPassengers(updated);
    saveCoPassengers(updated);
    setNewPassName('');
    setIsAddingPassenger(false);
  };

  // Delete Co-passenger
  const handleDeleteCoPassenger = (id: string) => {
    const updated = coPassengers.filter(p => p.id !== id);
    setCoPassengers(updated);
    saveCoPassengers(updated);
  };

  // Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    };
    setCurrentUser(updatedUser);
    onUserUpdated(updatedUser);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  My Account — APNA TRIPS
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-bold font-mono">
                  {currentUser.role === 'customer' ? 'VERIFIED TRAVELER' : currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                RedBus-style account: Bookings, M-Tickets, ApnaCash Wallet, Co-passengers & Journey Alerts
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'metrics'
                ? 'border-amber-500 text-slate-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-600" />
            <span>My Bookings & Metrics ({totalBookingsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'passengers'
                ? 'border-amber-500 text-slate-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Co-Passengers Manifest ({coPassengers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'border-amber-500 text-slate-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Travel Preferences & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-slate-900 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: BOOKINGS METRICS & TICKET OVERVIEW (Requested explicitly by User) */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                {/* Total Tickets Booked */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between text-amber-800 text-xs">
                    <span className="font-semibold">Total Tickets Booked</span>
                    <Ticket className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">
                    {totalBookingsCount}
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium mt-1">
                    All-time reservations
                  </div>
                </div>

                {/* Confirmed Active Journeys */}
                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-emerald-800 text-xs">
                    <span className="font-semibold">Confirmed Trips</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold font-display text-emerald-700 mt-2">
                    {confirmedBookings.length}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    Ready for travel
                  </div>
                </div>

                {/* Cancelled / Refunded */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600 text-xs">
                    <span className="font-semibold">Refunds & Cancelled</span>
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-3xl font-extrabold font-display text-slate-800 mt-2">
                    {refundedBookings.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Disbursed to source
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between text-blue-800 text-xs">
                    <span className="font-semibold">ApnaCash Wallet</span>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold font-display text-blue-900 mt-2 tabular-nums">
                    ₹{prefs.walletBalance}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-1">
                    Instant discount eligible
                  </div>
                </div>

              </div>

              {/* Total Spend & Quick Actions */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                    Total Booking Value
                  </span>
                  <div className="text-2xl font-bold font-display text-amber-400 mt-0.5 tabular-nums">
                    ₹{totalSpent.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    GST invoices automatically generated and sent to {currentUser.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyBookings();
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-slate-950" />
                  <span>View Full Tickets & E-Passes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Recent Bookings Snapshot */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Recent Booking Records
                </h4>

                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No tickets booked yet. Book your first bus, resort or cab!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {bookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                              {b.category}
                            </span>
                            <span className="font-bold text-slate-900">{b.tripDetails.title}</span>
                          </div>
                          <div className="text-slate-500 mt-1 flex items-center gap-3 text-[11px]">
                            <span>Travel: {b.tripDetails.travelDate}</span>
                            <span>·</span>
                            <span>PNR: {b.pnrNumber}</span>
                            <span>·</span>
                            <span>{b.passengers.length} Passenger(s)</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                          <div className="font-bold font-display text-slate-900 mt-1 tabular-nums">
                            ₹{b.financials.totalPayableAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SAVED CO-PASSENGERS MANIFEST (RedBus Feature) */}
          {activeTab === 'passengers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Saved Co-Passengers & Family Members
                  </h4>
                  <p className="text-xs text-slate-500">
                    Save frequent travelers for 1-click checkout without retyping names and ages
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPassenger(!isAddingPassenger)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingPassenger ? 'Cancel' : 'Add Co-Passenger'}</span>
                </button>
              </div>

              {/* Add Passenger Form */}
              {isAddingPassenger && (
                <form onSubmit={handleAddCoPassenger} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-amber-950 text-sm">New Co-Passenger Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={newPassName}
                        onChange={(e) => setNewPassName(e.target.value)}
                        placeholder="e.g. Rohan Mehra"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Age</label>
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
                      <label className="block text-slate-700 font-semibold mb-1">Gender</label>
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

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Berth / Seat Preference</label>
                    <select
                      value={newPassBerth}
                      onChange={(e) => setNewPassBerth(e.target.value as any)}
                      className="w-full sm:w-64 p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="lower">Lower Deck Sleeper (Recommended)</option>
                      <option value="upper">Upper Deck Sleeper</option>
                      <option value="window">Window Seat</option>
                      <option value="any">No Preference</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/80">
                    <button
                      type="button"
                      onClick={() => setIsAddingPassenger(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-amber-100 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-amber-400 font-bold rounded-lg shadow-sm"
                    >
                      Save Passenger
                    </button>
                  </div>
                </form>
              )}

              {/* Co-passengers List */}
              <div className="space-y-2.5">
                {coPassengers.map((pass) => (
                  <div
                    key={pass.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                        {pass.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{pass.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {pass.gender === 'F' ? 'Female' : 'Male'}, {pass.age} years · Prefers {pass.berthPreference} berth
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoPassenger(pass.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Passenger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REDBUS-STYLE PREFERENCES & ALERTS */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 text-xs">
              
              {/* Notification & Ticket Alerts */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Live Notifications & Journey Alerts
                </h4>

                <div className="space-y-3">
                  
                  {/* WhatsApp Alerts Toggle */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">WhatsApp Ticket & GPS Alerts</div>
                        <div className="text-[11px] text-slate-500">
                          Receive live PDF e-tickets and live bus GPS tracking links on WhatsApp
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.whatsappAlerts}
                      onChange={() => handleTogglePref('whatsappAlerts')}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* SMS Booking Alerts */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">SMS Booking Confirmations</div>
                        <div className="text-[11px] text-slate-500">
                          Receive operator emergency alerts and PNR status changes via SMS
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.smsAlerts}
                      onChange={() => handleTogglePref('smsAlerts')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Boarding Station Reminder Alarm */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">2-Hour Boarding Station Alarm</div>
                        <div className="text-[11px] text-slate-500">
                          Automatic reminder alert 120 minutes prior to scheduled bus departure
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.boardingReminder}
                      onChange={() => handleTogglePref('boardingReminder')}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                </div>
              </div>

              {/* Default Berth / Seat Preference */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Preferred Travel Berth
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'lower', label: 'Lower Sleeper' },
                    { id: 'upper', label: 'Upper Sleeper' },
                    { id: 'window', label: 'Window Seat' },
                    { id: 'any', label: 'Any Berth' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateBerthPreference(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                        prefs.seatPreference === item.id
                          ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency SOS Relative Contact (RedBus Safety Compliance) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                  <PhoneCall className="w-4 h-4 text-red-600" />
                  <span>Emergency Relative Contact (SOS Broadcast)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Contact Name & Relation</label>
                    <input
                      type="text"
                      value={prefs.emergencyContactName}
                      onChange={(e) => handleUpdateSos(e.target.value, prefs.emergencyContactPhone)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Emergency Phone Number</label>
                    <input
                      type="text"
                      value={prefs.emergencyContactPhone}
                      onChange={(e) => handleUpdateSos(prefs.emergencyContactName, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Corporate GST Invoicing Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Corporate GST Details for Tax Invoicing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Registered Company Name</label>
                    <input
                      type="text"
                      value={prefs.companyName}
                      onChange={(e) => handleUpdateGst(e.target.value, prefs.companyGstin)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={prefs.companyGstin}
                      onChange={(e) => handleUpdateGst(prefs.companyName, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PROFILE & ACCOUNT ACTIONS */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto space-y-5">
              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Number (+91)</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
                    required
                  />
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Display Language</label>
                  <select
                    value={currentLang}
                    onChange={(e) => onSelectLang(e.target.value as LanguageCode)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="en">English (Default)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>

                {profileSaveSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile settings updated successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg transition-colors shadow-sm"
                >
                  Save Profile Changes
                </button>
              </form>

              {/* Sign Out Action */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onLogOut();
                    onClose();
                  }}
                  className="w-full py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of ApnaTrips Account</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
