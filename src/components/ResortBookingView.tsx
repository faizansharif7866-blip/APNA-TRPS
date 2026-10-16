import React, { useState } from 'react';
import { 
  Building2, 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  Sparkles, 
  Check, 
  Users, 
  Bed, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ResortProperty, ResortRoom } from '../types';
import { LanguageCode, translations } from '../services/localization';

interface ResortBookingViewProps {
  resorts: ResortProperty[];
  lang: LanguageCode;
  onInitiateResortBooking: (resort: ResortProperty, room: ResortRoom) => void;
}

export const ResortBookingView: React.FC<ResortBookingViewProps> = ({
  resorts,
  lang,
  onInitiateResortBooking,
}) => {
  const t = translations[lang];
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredResorts = resorts.filter(r => {
    if (selectedCity !== 'all' && r.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header and Destination Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            <span>Luxury Heritage Resorts & Boutique Palaces</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Handpicked 5-star royal sanctuaries, lakefront retreats, and Himalayan hill resorts with instant reservation
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Destination:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCity === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All India
            </button>
            <button
              onClick={() => setSelectedCity('Udaipur')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCity === 'Udaipur' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Udaipur
            </button>
            <button
              onClick={() => setSelectedCity('Kumarakom')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCity === 'Kumarakom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kerala
            </button>
            <button
              onClick={() => setSelectedCity('Shimla')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCity === 'Shimla' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shimla
            </button>
          </div>
        </div>
      </div>

      {/* Resorts Grid */}
      <div className="space-y-8">
        {filteredResorts.map((resort) => (
          <div
            key={resort.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
              
              {/* Photo Showcase */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
                <img
                  src={resort.coverImage}
                  alt={resort.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5-Star Luxury</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-slate-950/80 to-transparent p-3 rounded-lg text-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{resort.location}, {resort.city}, {resort.state}</span>
                  </div>
                </div>
              </div>

              {/* Resort Details & Policies */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-display text-slate-900">{resort.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-emerald-600">{resort.starRating}.0 Rating</span>
                        <span>·</span>
                        <span>{resort.reviewsCount} verified traveler reviews</span>
                        <span>·</span>
                        <span className="text-slate-400">Check-in: {resort.checkInTime}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Starting from</div>
                      <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                        ₹{resort.startingPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">{t.resort.perNight}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {resort.description}
                  </p>

                  {/* Amenities Strip */}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Resort Highlights & Inclusions:</div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      {resort.amenities.map((am, i) => (
                        <span key={i} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px]">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{am}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/80 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resort.cancellationPolicy}</span>
                  </div>
                </div>

                {/* Available Suites and Rooms Selection */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Available Suites & Villa Inventory:
                  </div>

                  <div className="space-y-3">
                    {resort.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{room.name}</h4>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {room.availableUnits} units left
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-slate-400" />
                              <span>{room.bedType}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Up to {room.maxOccupancy} Guests</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                          <div className="text-right">
                            <div className="text-base font-bold font-display text-slate-900 tabular-nums">
                              ₹{room.pricePerNight.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400">+18% GST</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onInitiateResortBooking(resort, room)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{t.resort.selectRoom}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
