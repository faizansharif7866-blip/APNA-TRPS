import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Info,
  Clock
} from 'lucide-react';
import { TravelCategory } from '../types';
import { LanguageCode } from '../services/localization';
import { CitySearchModal } from './CitySearchModal';
import { BRAND_IMAGES } from '../assets/imagePaths';
import { showToast } from './Toast';

interface HeroBannerProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  lang: LanguageCode;
  onSearch: (params: { source: string; destination: string; date: string; passengers: number; womenOnly?: boolean }) => void;
  initialSource?: string;
  initialDestination?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
  onSearch,
  initialSource = 'Chennai',
  initialDestination = 'Bengaluru',
}) => {
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState('2026-10-16');
  const [passengers, setPassengers] = useState(1);
  const [womenOnly, setWomenOnly] = useState(false);
  const [activeOfferTab, setActiveOfferTab] = useState<'all' | 'bus' | 'train' | 'cab'>('bus');

  // City Picker Modal State
  const [cityModalType, setCityModalType] = useState<'from' | 'to' | null>(null);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    showToast(`Swapped route: ${destination} ➜ ${temp}`, 'info');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ source, destination, date, passengers, womenOnly });
    showToast(`Searching available buses: ${source} ➜ ${destination}`, 'success');
    setTimeout(() => {
      const target = document.getElementById('buses-available-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  // Real Photographic Navigation Categories (No Cartoon Vectors!)
  const categoriesList = [
    {
      id: 'bus' as TravelCategory,
      title: 'Bus Tickets',
      subtitle: 'Volvo Sleepers',
      discount: '₹300 off',
      image: BRAND_IMAGES.heroCoach,
    },
    {
      id: 'train' as TravelCategory,
      title: 'IRCTC Trains',
      subtitle: 'Vande Bharat',
      discount: '₹300 Off',
      image: BRAND_IMAGES.vandeBharatTrain,
    },
    {
      id: 'resort' as TravelCategory,
      title: 'Hotels & Stays',
      subtitle: 'Luxury Resorts',
      discount: 'Save 70%',
      image: BRAND_IMAGES.luxuryResort,
    },
    {
      id: 'taxi' as TravelCategory,
      title: 'Cabs & Autos',
      subtitle: 'City & Airport',
      discount: '20% Off',
      image: BRAND_IMAGES.executiveTaxi,
    },
  ];

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      
      {/* Top 4 Service Category Cards with REAL PHOTOGRAPHIC VEHICLES (No Cartoons!) */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`p-2 rounded-2xl flex flex-col items-center justify-between relative transition-all group overflow-hidden ${
                  isActive
                    ? 'bg-white shadow-md border-2 border-emerald-600 scale-[1.02]'
                    : 'bg-white shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow'
                }`}
              >
                {/* Discount Tag */}
                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                  {cat.discount}
                </span>

                {/* Real Photographic Image Container */}
                <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden relative mb-2">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 text-white text-[11px] font-bold leading-tight drop-shadow-md">
                    {cat.subtitle}
                  </div>
                </div>

                <div className="w-full text-center pb-1">
                  <span className={`text-xs sm:text-sm font-bold block ${
                    isActive ? 'text-emerald-900' : 'text-slate-800'
                  }`}>
                    {cat.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bus Search Section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        
        {/* Section Heading */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
            Book Bus Tickets
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            India's Direct Verified Fleets
          </span>
        </div>

        {/* Search Card Container with Zero Convenience Fee Banner */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Blue Header Tag: ZERO convenience fee* */}
          <div className="bg-[#1D3E74] text-white py-2 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ZERO convenience fee* on all ApnaTrips direct bookings</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 space-y-4">
            
            {/* From & To with Swap Button */}
            <div className="relative border border-slate-200 rounded-xl divide-y divide-slate-200">
              
              {/* FROM Input */}
              <div 
                onClick={() => setCityModalType('from')}
                className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 font-medium block">From (Boarding Point)</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">{source}</span>
                </div>
              </div>

              {/* Central Swap Icon Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwap();
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shadow-sm z-10 transition-transform active:rotate-180"
                title="Swap Route"
              >
                <ArrowRightLeft className="w-4 h-4 rotate-90 text-emerald-700" />
              </button>

              {/* TO Input */}
              <div 
                onClick={() => setCityModalType('to')}
                className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 font-medium block">To (Dropping Destination)</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">{destination}</span>
                </div>
              </div>

            </div>

            {/* Date of Journey with Today and Tomorrow Quick Pills */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Date of Journey</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {date === '2026-10-16' ? 'Fri, 16-Oct' : date === '2026-10-17' ? 'Sat, 17-Oct' : date}
                  </span>
                </div>
              </div>

              {/* Today / Tomorrow Quick Select Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDate('2026-10-16')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    date === '2026-10-16'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDate('2026-10-17')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    date === '2026-10-17'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Booking for women Toggle */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👩</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Booking for women</div>
                  <button 
                    type="button"
                    onClick={() => showToast("Booking for women ensures seat allocation adjacent to female travelers only.", "info")}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline"
                  >
                    Know safety guarantee
                  </button>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setWomenOnly(!womenOnly)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  womenOnly ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    womenOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Primary Search CTA Button in Emerald Green (Red replaced!) */}
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all text-base tracking-wide flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Search className="w-5 h-5 text-white" />
              <span>Search Available Buses</span>
            </button>

          </form>

        </div>

        {/* Promo Offers Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">Special Travel Offers</h3>
            <span className="text-xs font-bold text-emerald-700">Auto-Applied at Checkout</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Save on India's top luxury sleeper bus lines</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  APNAFIRST
                </span>
                <div className="font-bold text-slate-900 text-sm mt-1.5">
                  Save ₹300 on First Bus Journey
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Valid till 31 Oct · Instant discount
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                ₹300
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="bg-blue-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  ZERO CANCEL
                </span>
                <div className="font-bold text-slate-900 text-sm mt-1.5">
                  100% Free Cancellation Guarantee
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Cancel up to 6 hours prior for full refund
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                100%
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* City Picker Modal */}
      <CitySearchModal
        isOpen={cityModalType !== null}
        title={cityModalType === 'from' ? 'Boarding Point' : 'Dropping Point'}
        currentValue={cityModalType === 'from' ? source : destination}
        onSelectCity={(city) => {
          if (cityModalType === 'from') setSource(city);
          if (cityModalType === 'to') setDestination(city);
          setCityModalType(null);
        }}
        onClose={() => setCityModalType(null)}
      />

    </div>
  );
};
