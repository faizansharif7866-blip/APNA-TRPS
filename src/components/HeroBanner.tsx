import React, { useState } from 'react';
import { 
  Bus, 
  Train, 
  Building2, 
  Car, 
  Bike, 
  ArrowRightLeft, 
  Calendar, 
  Users, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TravelCategory } from '../types';
import { BRAND_IMAGES } from '../assets/imagePaths';
import { LanguageCode, translations } from '../services/localization';

import { ApnaTripsLogo } from './ApnaTripsLogo';

interface HeroBannerProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  lang: LanguageCode;
  onSearch: (params: { source: string; destination: string; date: string; passengers: number }) => void;
}

const POPULAR_ROUTES = [
  { from: 'New Delhi', to: 'Manali', type: 'bus' },
  { from: 'Mumbai', to: 'Goa', type: 'bus' },
  { from: 'Bengaluru', to: 'Chennai', type: 'bus' },
  { from: 'Hyderabad', to: 'Vijayawada', type: 'bus' },
  { from: 'Pune', to: 'Mumbai', type: 'bus' },
  { from: 'New Delhi', to: 'Jaipur', type: 'bus' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
  onSearch,
}) => {
  const t = translations[lang];
  const [source, setSource] = useState('New Delhi');
  const [destination, setDestination] = useState('Manali');
  const [date, setDate] = useState('2026-10-18');
  const [passengers, setPassengers] = useState(1);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ source, destination, date, passengers });
    setTimeout(() => {
      const target = document.getElementById('buses-available-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  return (
    <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
      {/* Background Hero Image with Measured Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={BRAND_IMAGES.heroCoach}
          alt="ApnaTrips Luxury Travel Fleet"
          className="w-full h-full object-cover object-center opacity-30 lg:opacity-35 scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-18">
        
        {/* Top Header Kicker with Official Logo Badge */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <ApnaTripsLogo variant="header" size="md" showSubtitle={true} />
          
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Verified Indian Travel Booking Network
            </span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-300 hidden sm:inline">Live GPS Telemetry & Razorpay Verified</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white leading-tight">
            Seamless Journeys Across India.
            <span className="block text-amber-400 mt-1 font-semibold">
              Verified Fleets, Palaces & Express Transit.
            </span>
          </h1>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/80 max-w-2xl mb-4 overflow-x-auto">
          <button
            onClick={() => onSelectCategory('bus')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === 'bus'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus Tickets</span>
          </button>

          <button
            onClick={() => onSelectCategory('train')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === 'train'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Trains (IRCTC)</span>
          </button>

          <button
            onClick={() => onSelectCategory('resort')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === 'resort'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Resorts & Stays</span>
          </button>

          <button
            onClick={() => onSelectCategory('taxi')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === 'taxi'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Cabs & Airport</span>
          </button>

          <button
            onClick={() => onSelectCategory('auto')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === 'auto'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Auto & Bikes</span>
          </button>
        </div>

        {/* Master Universal Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 border border-slate-200 text-slate-900">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* Source Origin */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeCategory === 'resort' ? 'Destination City' : t.search.from}</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            {/* Swap Button (for transit) */}
            {activeCategory !== 'resort' && (
              <div className="hidden md:flex md:col-span-1 justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Destination Target */}
            <div className={activeCategory === 'resort' ? 'md:col-span-4' : 'md:col-span-3'}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeCategory === 'resort' ? 'Resort Area / Landmark' : t.search.to}</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={activeCategory === 'resort' ? 'e.g. Lake Pichola, Candolim Beach' : 'e.g. Manali, Goa, Chennai'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            {/* Travel Date with RedBus-style Today/Tomorrow shortcuts */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeCategory === 'resort' ? 'Check-in Date' : t.search.date}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDate('2026-10-16')}
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium transition-colors ${
                      date === '2026-10-16' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate('2026-10-17')}
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium transition-colors ${
                      date === '2026-10-17' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            {/* Passengers / Guests */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Qty</span>
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-2 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
              </select>
            </div>

            {/* Search CTA */}
            <div className={activeCategory === 'resort' ? 'md:col-span-2' : 'md:col-span-2'}>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>{t.search.searchButton}</span>
              </button>
            </div>
          </form>

          {/* Quick Popular Indian Routes Strip */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Popular Express Routes:</span>
            {POPULAR_ROUTES.map((route, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSource(route.from);
                  setDestination(route.to);
                  onSearch({ source: route.from, destination: route.to, date, passengers });
                  setTimeout(() => {
                    const target = document.getElementById('buses-available-section');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 120);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 rounded-md text-slate-700 transition-colors"
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>

        {/* Key Operational Guarantees Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Zero Booking Hidden Surcharges</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Real-Time GPS Vehicle Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Instant Cancellation & Refunds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>24/7 Helpline: 1800-APNA-TRIP</span>
          </div>
        </div>

      </div>
    </div>
  );
};
