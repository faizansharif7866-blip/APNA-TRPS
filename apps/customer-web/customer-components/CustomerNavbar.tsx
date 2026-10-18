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
  PhoneCall, 
  MapPin,
  ChevronDown
} from 'lucide-react';
import { TravelCategory, UserProfile } from '../../../packages/shared-types/index.js';
import { LanguageCode } from '../../../src/services/localization.js';
import { ApnaTripsLogo } from '../../../src/components/ApnaTripsLogo.js';

interface CustomerNavbarProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  currentUser: UserProfile;
  bookingsCount: number;
  onOpenAuth: () => void;
  onOpenMyBookings: () => void;
  onOpenMyAccount: () => void;
  onOpenSplash?: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  activeCategory,
  onSelectCategory,
  currentLang,
  onSelectLang,
  currentUser,
  bookingsCount,
  onOpenAuth,
  onOpenMyBookings,
  onOpenMyAccount,
  onOpenSplash,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-slate-100 shadow-lg">
      
      {/* Top Customer Support & Trust Bar (Pure Customer Website) */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 sm:gap-4 text-slate-300">
          <a
            href="tel:180027628747"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            title="24/7 Helpline: 1800-APNA-TRIP (1800 2762 8747)"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Call ApnaTrip-Support: 1800-APNA-TRIP</span>
          </a>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span 
            className="hidden md:flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors" 
            title="Apna Trip Head Office: Athanavur, Yelagiri Hills, Tirupattur D.T., Tamil Nadu, 635853"
          >
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Head Office: Athanavur, Yelagiri Hills, TN - 635853</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-slate-400">
          {onOpenSplash && (
            <button
              type="button"
              onClick={onOpenSplash}
              className="text-amber-400 hover:text-amber-300 text-[10px] bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30 transition-colors flex items-center gap-1 font-semibold"
              title="View Welcome Splash Screen"
            >
              <span>✦ Splash</span>
            </button>
          )}

          <span className="hidden sm:inline text-slate-400 text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            India's Leading Travel Network
          </span>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-slate-800"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="uppercase font-medium text-[10px]">{currentLang}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLang(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      currentLang === l.code ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Customer Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Customer Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <ApnaTripsLogo size="md" />
        </div>

        {/* Travel Categories */}
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
            <Train className="w-4 h-4 text-amber-400" />
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
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Getaways & Resorts</span>
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
            <Car className="w-4 h-4 text-purple-400" />
            <span>Mobility & Cabs</span>
          </button>
        </nav>

        {/* Customer Action Buttons */}
        <div className="flex items-center gap-3">
          {/* My Bookings Button */}
          <button
            type="button"
            onClick={onOpenMyBookings}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm relative group"
            title="View your e-tickets and travel history"
          >
            <Ticket className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">My Bookings</span>
            {bookingsCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Button */}
          <button
            type="button"
            onClick={currentUser.isVerified ? onOpenMyAccount : onOpenAuth}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-md ${
              currentUser.isVerified 
                ? 'bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/30 ring-2 ring-emerald-500/20'
            }`}
          >
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-5 h-5 rounded-full object-cover border border-white/30" 
              />
            ) : (
              <User className="w-4 h-4 shrink-0 text-emerald-300" />
            )}
            <span className="max-w-[120px] truncate hidden sm:inline">
              {currentUser.isVerified ? currentUser.name.split(' ')[0] : 'Sign In / OTP'}
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => { onSelectCategory('bus'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                activeCategory === 'bus' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Bus className="w-4 h-4 text-emerald-400" />
              <span>Bus Tickets</span>
            </button>
            <button
              onClick={() => { onSelectCategory('train'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                activeCategory === 'train' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Train className="w-4 h-4 text-amber-400" />
              <span>IRCTC Trains</span>
            </button>
            <button
              onClick={() => { onSelectCategory('resort'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                activeCategory === 'resort' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Resorts</span>
            </button>
            <button
              onClick={() => { onSelectCategory('taxi'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                activeCategory === 'taxi' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Car className="w-4 h-4 text-purple-400" />
              <span>Cabs & Taxis</span>
            </button>
          </div>
          
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
            <a href="tel:180027628747" className="flex items-center gap-2 text-emerald-400 py-1">
              <PhoneCall className="w-4 h-4" />
              <span>Helpline: 1800-APNA-TRIP (24/7)</span>
            </a>
          </div>
        </div>
      )}

    </header>
  );
};
