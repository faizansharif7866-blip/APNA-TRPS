import React, { useState } from 'react';
import { 
  Bus, 
  Train, 
  Building2, 
  Car, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Globe, 
  Ticket, 
  MapPin, 
  Menu, 
  X,
  Compass,
  Lock,
  KeyRound
} from 'lucide-react';
import { TravelCategory, UserProfile } from '../types';
import { LanguageCode } from '../services/localization';
import { ApnaTripsLogo } from './ApnaTripsLogo';

interface NavbarProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  currentUser: UserProfile;
  bookingsCount?: number;
  onOpenAuth: () => void;
  onOpenMyBookings: () => void;
  onOpenMyAccount: () => void;
  onOpenAdminPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  currentLang,
  onSelectLang,
  currentUser,
  bookingsCount = 0,
  onOpenAuth,
  onOpenMyBookings,
  onOpenMyAccount,
  onOpenAdminPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Primary Top Bar adhering to strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Wordmark Brand Zone (APNA TRIPS) with Official Logo Component */}
        <div className="flex items-center gap-3 shrink-0">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onSelectCategory('bus'); }}
            className="flex items-center shrink-0"
          >
            <ApnaTripsLogo variant="navbar" size="md" showSubtitle={true} />
          </a>
        </div>

        {/* Zone 2: RedBus-Style Travel Categories */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectCategory('bus')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeCategory === 'bus' 
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' 
                : 'hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus Tickets</span>
          </button>

          <button
            onClick={() => onSelectCategory('train')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeCategory === 'train' 
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' 
                : 'hover:text-white'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Trains (IRCTC)</span>
          </button>

          <button
            onClick={() => onSelectCategory('resort')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeCategory === 'resort' 
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' 
                : 'hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Resorts & Stays</span>
          </button>

          <button
            onClick={() => onSelectCategory('taxi')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeCategory === 'taxi' 
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' 
                : 'hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Airport & Cabs</span>
          </button>
        </nav>

        {/* Zone 3: Actions - My Bookings, My Account (RedBus style) & Separate Secured Admin Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Language Selector */}
          <div className="hidden sm:flex items-center border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 bg-slate-800/80">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
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
            onClick={onOpenMyBookings}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            title="View Confirmed E-Tickets"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">My Bookings</span>
            {bookingsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* RedBus-Style Separate (My Account) Button */}
          <button
            onClick={onOpenMyAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 shadow-sm"
            title="RedBus-Style My Account: Tickets, Wallet, Passengers & Settings"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap font-semibold">
              {currentUser.name ? currentUser.name.split(' ')[0] : 'My Account'}
            </span>
          </button>

          {/* SEPARATE ADMIN ICON WITH SECURITY (Admin Can Access Only) */}
          <button
            onClick={onOpenAdminPortal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-lg transition-all shadow-sm hover:border-amber-400 group"
            title="Super Admin Security Access Portal (Password Protected)"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-mono text-[11px] font-bold">Admin</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
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
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'bus' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Bus className="w-4 h-4" />
              <span>Bus Tickets</span>
            </button>
            <button
              onClick={() => { onSelectCategory('train'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'train' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Train className="w-4 h-4" />
              <span>Trains</span>
            </button>
            <button
              onClick={() => { onSelectCategory('resort'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'resort' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Resorts</span>
            </button>
            <button
              onClick={() => { onSelectCategory('taxi'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${activeCategory === 'taxi' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}
            >
              <Car className="w-4 h-4" />
              <span>Cabs & Autos</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
            <button
              onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }}
              className="text-amber-400 flex items-center gap-1.5 font-medium"
            >
              <Ticket className="w-4 h-4" />
              <span>Bookings ({bookingsCount})</span>
            </button>
            <button
              onClick={() => { onOpenMyAccount(); setMobileMenuOpen(false); }}
              className="text-slate-200 hover:text-white flex items-center gap-1.5 font-medium"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>My Account</span>
            </button>
            <button
              onClick={() => { onOpenAdminPortal(); setMobileMenuOpen(false); }}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
