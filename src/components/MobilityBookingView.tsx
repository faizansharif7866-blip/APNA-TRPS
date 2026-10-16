import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Navigation, 
  UserCheck, 
  Zap, 
  Fuel, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MobilityVehicle } from '../types';
import { LanguageCode, translations } from '../services/localization';

interface MobilityBookingViewProps {
  vehicles: MobilityVehicle[];
  activeSubCategory: 'taxi' | 'auto' | 'bike';
  onSelectSubCategory: (cat: 'taxi' | 'auto' | 'bike') => void;
  lang: LanguageCode;
  onInitiateMobilityBooking: (vehicle: MobilityVehicle, pickup: string, dropoff: string, estKm: number) => void;
}

export const MobilityBookingView: React.FC<MobilityBookingViewProps> = ({
  vehicles,
  activeSubCategory,
  onSelectSubCategory,
  lang,
  onInitiateMobilityBooking,
}) => {
  const t = translations[lang];
  const [pickupLocation, setPickupLocation] = useState('New Delhi Airport Terminal 3');
  const [dropoffLocation, setDropoffLocation] = useState('Gurugram Cyber City Phase 2');
  const [estimatedKm, setEstimatedKm] = useState(25);

  const filteredVehicles = vehicles.filter(v => v.category === activeSubCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Subcategory Segmented Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            {activeSubCategory === 'taxi' && <Car className="w-6 h-6 text-amber-600" />}
            {activeSubCategory === 'auto' && <Car className="w-6 h-6 text-emerald-600" />}
            {activeSubCategory === 'bike' && <Bike className="w-6 h-6 text-amber-600" />}
            <span>
              {activeSubCategory === 'taxi' && 'Airport & Outstation Chauffeur Fleets'}
              {activeSubCategory === 'auto' && 'Smart City Electric Auto Rickshaws'}
              {activeSubCategory === 'bike' && 'Verified Two-Wheeler Rentals (Goa & Hill Hubs)'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative fleet inventory with police-verified chauffeurs, transparent meter rates, and emergency SOS integration
          </p>
        </div>

        {/* Mobility Category Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onSelectSubCategory('taxi')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubCategory === 'taxi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Chauffeur Cabs</span>
          </button>
          <button
            onClick={() => onSelectSubCategory('auto')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubCategory === 'auto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>City Auto</span>
          </button>
          <button
            onClick={() => onSelectSubCategory('bike')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubCategory === 'bike' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Bike Rentals</span>
          </button>
        </div>
      </div>

      {/* Route & Distance Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Pickup Address / Terminal</span>
          </label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          />
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Dropoff Destination / Hotel</span>
          </label>
          <input
            type="text"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trip Distance (km)
          </label>
          <select
            value={estimatedKm}
            onChange={(e) => setEstimatedKm(Number(e.target.value))}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          >
            <option value={15}>15 km (Local)</option>
            <option value={25}>25 km (Airport/City)</option>
            <option value={50}>50 km (Outstation)</option>
            <option value={150}>150 km (Intercity)</option>
            <option value={250}>250 km (Long Haul)</option>
          </select>
        </div>
      </div>

      {/* Vehicle Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const estimatedTotal = vehicle.perKmRate === 0
            ? vehicle.fareBase // Day rental for bikes
            : vehicle.fareBase + (vehicle.perKmRate * estimatedKm);

          return (
            <div
              key={vehicle.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Vehicle Thumbnail */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    {vehicle.fuelType === 'EV' ? (
                      <>
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>100% Electric EV</span>
                      </>
                    ) : (
                      <>
                        <Fuel className="w-3 h-3 text-amber-400" />
                        <span>{vehicle.fuelType}</span>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-amber-400 text-xs px-2.5 py-1 rounded-md font-mono font-bold">
                    {vehicle.vehicleNumber}
                  </div>
                </div>

                {/* Specs */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                        {vehicle.subType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{vehicle.model}</h3>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {vehicle.capacity} Seats
                    </span>
                  </div>

                  {vehicle.driverName && (
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium">{vehicle.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{vehicle.driverRating}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Hubs: </span>
                    {vehicle.availableLocations.slice(0, 2).join(' · ')}
                  </div>
                </div>
              </div>

              {/* Price & Checkout CTA */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {vehicle.perKmRate > 0 ? `₹${vehicle.perKmRate}/km base rate` : 'Daily rental fee'}
                  </div>
                  <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onInitiateMobilityBooking(vehicle, pickupLocation, dropoffLocation, estimatedKm)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{t.mobility.bookRide}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
