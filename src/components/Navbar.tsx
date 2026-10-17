import React, { useState } from 'react';
import { 
  Bus, 
  Train, 
  Building2, 
  Car, 
  Ticket, 
  User, 
  Menu, 
  X,
  Globe,
  Lock,
  Building,
  ShieldCheck,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { TravelCategory, UserProfile, PortalMode } from '../types';
import { LanguageCode } from '../services/localization';
import { ApnaTripsLogo } from './ApnaTripsLogo';

interface NavbarProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  currentUser: UserProfile;
  bookingsCount: number;
  onOpenAuth: () => void;
  onOpenMyBookings: () => void;
  onOpenMyAccount: () => void;
  currentPortal: PortalMode;
  onSelectPortal: (portal: PortalMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  currentLang,
  onSelectLang,
  currentUser,
  bookingsCount,
  onOpenAuth,
  onOpenMyBookings,
  onOpenMyAccount,
  currentPortal,
  onSelectPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-slate-100 shadow-md">
      
      {/* Top 3-Application System Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-slate-400 hidden md:inline font-mono">ApnaTrips Ecosystem:</span>
          
          {/* App 1: Customer App */}
          <button
            type="button"
            onClick={() => onSelectPortal('customer')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
              currentPortal === 'customer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            1. Customer App <span className="font-mono text-[9px] opacity-75">(app.apnatrips.com)</span>
          </button>

          {/* App 2: Admin Portal */}
          <button
            type="button"
            onClick={() => onSelectPortal('admin')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
              currentPortal === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>2. Admin Portal</span>
            <span className="font-mono text-[9px] opacity-75 hidden sm:inline">(admin.apnatrips.com)</span>
          </button>

          {/* App 3: Partner & Operator Portal */}
          <button
            type="button"
            onClick={() => onSelectPortal('partner')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
              currentPortal === 'partner'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-2.5 h-2.5" />
            <span>3. Partner & Bus Operator</span>
            <span className="font-mono text-[9px] opacity-75 hidden sm:inline">(partners.apnatrips.com)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px]">
          <a
            href="tel:180027628747"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            title="Click to Call ApnaTrip-Support 24/7"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>Call ApnaTrip-Support: 1800-APNA-TRIP</span>
          </a>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span 
            className="hidden lg:flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-help" 
            title="Apna Trip Head Office: Athanavur, Yelagiri Hills, Tirupattur D.T., Tamil Nadu, 635853"
          >
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Head Office: Athanavur, Yelagiri Hills, TN</span>
          </span>
        </div>
      </div>

      {/* Main Top Navigation Bar (Customer App) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Branding Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <ApnaTripsLogo size="md" />
        </div>

        {/* Zone 2: Navigation Categories */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => onSelectCategory('bus')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1.5 ${
              activeCategory === 'bus' 
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
                : 'hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Bus Tickets</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('train')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1.5 ${
              activeCategory === 'train' 
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
                : 'hover:text-white'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>IRCTC Trains</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('resort')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1.5 ${
              activeCategory === 'resort' 
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
                : 'hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Resorts & Stays</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('taxi')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1.5 ${
              activeCategory === 'taxi' 
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
                : 'hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Airport & Cabs</span>
          </button>
        </nav>

        {/* Zone 3: Actions - My Bookings & My Account */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Language Selector */}
          <div className="hidden sm:flex items-center border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 bg-slate-800/80">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <select
              value={currentLang}
              onChange={(e) => onSelectLang(e.target.value as LanguageCode)}
              aria-label="Select Language"
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* My Bookings Action */}
          <button
            type="button"
            onClick={onOpenMyBookings}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            title="View Confirmed E-Tickets"
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
            <span className="whitespace-nowrap">My Bookings</span>
            {bookingsCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* RedBus-Style (My Account) Button */}
          <button
            type="button"
            onClick={onOpenMyAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
            title="My Account: Tickets, Wallet, Passengers & Settings"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="whitespace-nowrap font-semibold">
              {currentUser.name ? currentUser.name.split(' ')[0] : 'My Account'}
            </span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => { onSelectCategory('bus'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'bus' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Bus className="w-4 h-4" />
              <span>Bus Tickets</span>
            </button>
            <button
              onClick={() => { onSelectCategory('train'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'train' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Train className="w-4 h-4" />
              <span>Trains</span>
            </button>
            <button
              onClick={() => { onSelectCategory('resort'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'resort' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Resorts</span>
            </button>
            <button
              onClick={() => { onSelectCategory('taxi'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'taxi' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Car className="w-4 h-4" />
              <span>Cabs & Autos</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
            <button
              onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }}
              className="text-emerald-400 flex items-center gap-1.5 font-medium py-1"
            >
              <Ticket className="w-4 h-4" />
              <span>My Bookings ({bookingsCount})</span>
            </button>

            <button
              onClick={() => { onOpenMyAccount(); setMobileMenuOpen(false); }}
              className="text-slate-300 flex items-center gap-1.5 font-medium py-1"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
