import React, { useState } from 'react';
import { 
  Bus, 
  Train, 
  Building2, 
  Car, 
  ArrowRightLeft, 
  Calendar, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Percent,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { TravelCategory } from '../types';
import { LanguageCode, translations } from '../services/localization';
import { CitySearchModal } from './CitySearchModal';

interface HeroBannerProps {
  activeCategory: TravelCategory;
  onSelectCategory: (cat: TravelCategory) => void;
  lang: LanguageCode;
  onSearch: (params: { source: string; destination: string; date: string; passengers: number; womenOnly?: boolean }) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
  onSearch,
}) => {
  const [source, setSource] = useState('Pune');
  const [destination, setDestination] = useState('Aurangabad (Maharashtra)');
  const [date, setDate] = useState('2026-10-16');
  const [passengers, setPassengers] = useState(1);
  const [womenOnly, setWomenOnly] = useState(false);
  const [activeOfferTab, setActiveOfferTab] = useState<'all' | 'bus' | 'train' | 'metro'>('bus');

  // City Picker Modal State
  const [cityModalType, setCityModalType] = useState<'from' | 'to' | null>(null);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ source, destination, date, passengers, womenOnly });
    setTimeout(() => {
      const target = document.getElementById('buses-available-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      
      {/* Top 4 Service Category Cards matching redBus Image 6 */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Bus */}
          <button
            type="button"
            onClick={() => onSelectCategory('bus')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
              activeCategory === 'bus'
                ? 'bg-white shadow-md border-2 border-[#D84E55] scale-[1.02]'
                : 'bg-white shadow-sm border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              ₹300 off
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 text-[#D84E55] flex items-center justify-center mt-1">
              <Bus className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Bus</span>
          </button>

          {/* Train */}
          <button
            type="button"
            onClick={() => onSelectCategory('train')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
              activeCategory === 'train'
                ? 'bg-white shadow-md border-2 border-[#D84E55] scale-[1.02]'
                : 'bg-white shadow-sm border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              ₹300 Off
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mt-1">
              <Train className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Train</span>
          </button>

          {/* Hotel */}
          <button
            type="button"
            onClick={() => onSelectCategory('resort')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
              activeCategory === 'resort'
                ? 'bg-white shadow-md border-2 border-[#D84E55] scale-[1.02]'
                : 'bg-white shadow-sm border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Save 70%
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mt-1">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Hotel</span>
          </button>

          {/* Metro */}
          <button
            type="button"
            onClick={() => onSelectCategory('taxi')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center relative transition-all ${
              activeCategory === 'taxi'
                ? 'bg-white shadow-md border-2 border-[#D84E55] scale-[1.02]'
                : 'bg-white shadow-sm border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              20% Off
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mt-1">
              <Car className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Cab/Metro</span>
          </button>

        </div>
      </div>

      {/* Main Bus Search Section matching Image 6 */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        
        {/* Section Heading */}
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
            Book bus tickets
          </h2>
        </div>

        {/* Search Card Container with Zero Convenience Fee Banner */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Blue Header Tag: ZERO convenience fee* (Exact Image 6) */}
          <div className="bg-[#1D3E74] text-white py-1.5 px-4 text-center text-xs font-bold tracking-wide">
            ZERO convenience fee*
          </div>

          <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 space-y-4">
            
            {/* From & To with Swap Button */}
            <div className="relative border border-slate-200 rounded-xl divide-y divide-slate-200">
              
              {/* FROM Input */}
              <div 
                onClick={() => setCityModalType('from')}
                className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="text-slate-500">
                  <Bus className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 font-medium block">From</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">{source}</span>
                </div>
              </div>

              {/* Central Swap Icon Button (Exact Image 6) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwap();
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shadow-sm z-10 transition-transform active:rotate-180"
                title="Swap Route"
              >
                <ArrowRightLeft className="w-4 h-4 rotate-90" />
              </button>

              {/* TO Input */}
              <div 
                onClick={() => setCityModalType('to')}
                className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="text-slate-500">
                  <Bus className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 font-medium block">To</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">{destination}</span>
                </div>
              </div>

            </div>

            {/* Date of Journey with Today and Tomorrow Quick Pills (Exact Image 6) */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-700" />
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Date of Journey</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {date === '2026-10-16' ? 'Fri 16-Oct' : date === '2026-10-17' ? 'Sat 17-Oct' : date}
                  </span>
                </div>
              </div>

              {/* Today / Tomorrow Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDate('2026-10-16')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    date === '2026-10-16'
                      ? 'bg-red-50 text-[#D84E55] border border-red-200 font-bold'
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
                      ? 'bg-red-50 text-[#D84E55] border border-red-200 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Booking for women (Exact Image 6) */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👩</span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Booking for women</div>
                  <button 
                    type="button"
                    onClick={() => alert("Booking for women ensures seat allocation adjacent to female travelers only, compliant with redBus and APNA TRIPS safety guidelines.")}
                    className="text-[11px] text-[#D84E55] font-semibold hover:underline"
                  >
                    Know more
                  </button>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setWomenOnly(!womenOnly)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  womenOnly ? 'bg-[#D84E55]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    womenOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Primary Big Red CTA Button (Exact Image 6) */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#D84E55] hover:bg-[#C23C43] text-white font-bold rounded-xl shadow-lg transition-all text-base tracking-wide flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Search className="w-5 h-5 text-white" />
              <span>Search buses</span>
            </button>

          </form>

        </div>

        {/* Offers Section (Exact Image 6) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900">Offers</h3>
            <button
              type="button"
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              View all
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">Get best deals with great offers</p>

          {/* Offer Category Tabs (Image 6) */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            {['all', 'bus', 'train', 'metro'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveOfferTab(tab as any)}
                className={`px-3.5 py-1 rounded-full capitalize font-semibold transition-all ${
                  activeOfferTab === tab
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Offer Promo Cards Carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Promo 1 */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Bus
                </span>
                <div className="font-bold text-slate-900 text-sm mt-1.5">
                  Save up to Rs 300 on bus tickets
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Valid till: 25 Oct · Use code: <strong>APNAFIRST</strong>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                ₹300
              </div>
            </div>

            {/* Promo 2 */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="bg-[#D84E55] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Bus
                </span>
                <div className="font-bold text-slate-900 text-sm mt-1.5">
                  Save up to Rs 200 on first booking
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Valid till: 31 Oct · Zero cancellation fee
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 text-[#D84E55] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                ₹200
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
