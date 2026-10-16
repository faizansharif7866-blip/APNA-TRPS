import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  X, 
  Star, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Info,
  Calendar,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  User,
  Coffee,
  Wifi,
  Tv,
  Zap,
  Luggage,
  Ban
} from 'lucide-react';
import { BusTrip, Seat } from '../types';

interface RedBusSeatDetailsModalProps {
  isOpen: boolean;
  trip: BusTrip;
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
}

export const RedBusSeatDetailsModal: React.FC<RedBusSeatDetailsModalProps> = ({
  isOpen,
  trip,
  selectedSeats,
  onToggleSeat,
  onProceedToCheckout,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'seats' | 'rest_stops' | 'bus_route' | 'policies'>('seats');
  const [activeDeck, setActiveDeck] = useState<'both' | 'lower' | 'upper'>('both');

  if (!isOpen) return null;

  const lowerDeckSeats = trip.seats.filter(s => s.deck === 'lower');
  const upperDeckSeats = trip.seats.filter(s => s.deck === 'upper');
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-1 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200 text-slate-800">
        
        {/* Top Header matching Images 7, 8, 9 */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Select Seats
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {trip.sourceCity} ➜ {trip.destinationCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Exclusive 5% OFF Gold Voucher Pill (Image 7, 8, 9) */}
            <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <span>Exclusive 5% OFF</span>
            </div>

            <button
              type="button"
              onClick={() => alert(`Share ${trip.operatorName} bus itinerary with friends`)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100"
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation matching Images 7, 8, 10 */}
        <div className="flex items-center gap-1 px-3 sm:px-4 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('seats')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'seats'
                ? 'border-[#D84E55] text-[#D84E55] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Seat Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rest_stops')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'rest_stops'
                ? 'border-[#D84E55] text-[#D84E55] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Rest Stops & Features
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bus_route')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'bus_route'
                ? 'border-[#D84E55] text-[#D84E55] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Bus Route & Punctuality
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'policies'
                ? 'border-[#D84E55] text-[#D84E55] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Other Policies
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* TAB 1: SEAT LAYOUT (Exact Image 9) */}
          {activeTab === 'seats' && (
            <div className="space-y-6">
              
              {/* Legend matching redBus Image 9 */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-6 rounded border-2 border-emerald-600 bg-white" />
                    <span className="text-[11px] text-slate-700">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-6 rounded border-2 border-blue-600 bg-blue-50 text-[10px] flex items-center justify-center font-bold text-blue-800">
                      ●
                    </div>
                    <span className="text-[11px] text-slate-700">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-6 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      ✕
                    </div>
                    <span className="text-[11px] text-slate-400">Sold</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-6 rounded border border-rose-300 bg-rose-50 flex items-center justify-center text-[10px] text-rose-500">
                      👩
                    </div>
                    <span className="text-[11px] text-rose-600">Female</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedSeats.length} / 6 max seats
                </span>
              </div>

              {/* Dual Deck Sleeper Layout (Exact Image 9) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Lower Deck */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Lower deck
                    </span>
                    {/* Steering Wheel Icon for Driver Side (Image 9) */}
                    <div className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center text-[11px] font-bold text-slate-600" title="Driver's Steering Wheel">
                      🛞
                    </div>
                  </div>

                  {/* Toilet Indicator Icon if available (Image 9) */}
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="text-sm">🚻</span>
                    <span>Toilet</span>
                  </div>

                  {/* Lower Deck Berths Matrix */}
                  <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto">
                    {lowerDeckSeats.map((seat, idx) => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      const isSold = seat.status === 'booked';
                      const isFemaleSold = isSold && (idx % 3 === 0);

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isSold}
                          onClick={() => onToggleSeat(seat)}
                          className={`h-16 rounded-xl transition-all flex flex-col items-center justify-center relative p-1 ${
                            isSold
                              ? isFemaleSold
                                ? 'bg-rose-50/70 border border-rose-200 text-rose-400 cursor-not-allowed'
                                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                              : isSelected
                                ? 'bg-blue-50 border-2 border-blue-600 shadow-md text-blue-900 font-bold scale-[1.03]'
                                : 'bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-slate-800 shadow-sm'
                          }`}
                        >
                          {isSold ? (
                            <>
                              <span className="text-[10px] text-slate-400">Sold</span>
                              {isFemaleSold && <span className="text-[10px]">👩</span>}
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold font-mono">{seat.number}</span>
                              <span className="text-[10px] text-slate-600 font-medium mt-0.5 tabular-nums">
                                ₹{seat.price}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1" />
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upper Deck */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Upper deck
                    </span>
                    <span className="text-[11px] text-slate-400">Sleep Berths</span>
                  </div>

                  {/* Upper Deck Berths Matrix */}
                  <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto mt-6">
                    {upperDeckSeats.map((seat, idx) => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      const isSold = seat.status === 'booked';
                      const isFemaleSold = isSold && (idx % 2 === 1);

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isSold}
                          onClick={() => onToggleSeat(seat)}
                          className={`h-16 rounded-xl transition-all flex flex-col items-center justify-center relative p-1 ${
                            isSold
                              ? isFemaleSold
                                ? 'bg-rose-50/70 border border-rose-200 text-rose-400 cursor-not-allowed'
                                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                              : isSelected
                                ? 'bg-blue-50 border-2 border-blue-600 shadow-md text-blue-900 font-bold scale-[1.03]'
                                : 'bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-slate-800 shadow-sm'
                          }`}
                        >
                          {isSold ? (
                            <>
                              <span className="text-[10px] text-slate-400">Sold</span>
                              {isFemaleSold && <span className="text-[10px]">👩</span>}
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold font-mono">{seat.number}</span>
                              <span className="text-[10px] text-slate-600 font-medium mt-0.5 tabular-nums">
                                ₹{seat.price}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1" />
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom Trip Info Card (Exact matching bottom of Image 9) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{trip.operatorName}</span>
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      ★ {trip.rating}
                    </span>
                    <span className="text-xs text-slate-400">{trip.reviewCount}</span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1 font-medium">
                    {trip.departureTime} ── {trip.arrivalTime} · Fri, 16 Oct
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                      Highly On Time (1037 of 1092 past trips)
                    </span>
                    <span className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-200">
                      Women's Choice (Highly rated by women)
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REST STOPS & FEATURES (Exact Image 7) */}
          {activeTab === 'rest_stops' && (
            <div className="space-y-6 text-xs">
              
              {/* No rest stop notice (Image 7) */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                <div className="font-bold text-sm">No rest stop</div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  This bus will not stop at any rest stops. Boarding to dropping is direct express.
                </div>
              </div>

              {/* Bus features (Image 7) */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">Bus features</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Pillow',
                    'CCTV',
                    'Toilet',
                    'Water Bottle',
                    'Blankets',
                    'Charging Point',
                    'Reading Light',
                  ].map((feat) => (
                    <span
                      key={feat}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1.5"
                    >
                      <span>✔</span>
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ratings & reviews (Image 7) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Ratings & reviews</h4>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      ✔ Real feedback from verified travelers
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700 font-display">★ 4.9</div>
                    <div className="text-[11px] text-slate-400">1371 Ratings</div>
                  </div>
                </div>

                {/* Rating percentages (Image 7) */}
                <div className="space-y-1.5 max-w-sm my-3 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span>5★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700" style={{ width: '94%' }} />
                    </div>
                    <span>94%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700" style={{ width: '5%' }} />
                    </div>
                    <span>5%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700" style={{ width: '1%' }} />
                    </div>
                    <span>1%</span>
                  </div>
                </div>

                {/* Loved by travellers pills (Image 7) */}
                <div className="mt-4">
                  <div className="font-bold text-slate-900 mb-2">Loved by travellers</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {[
                      'Rest stop hygiene (500)',
                      'Seat / Sleep Comfort (1151)',
                      'Punctuality (1337)',
                      'Staff behavior (1320)',
                      'AC (1008)',
                      'Live tracking (952)',
                      'Cleanliness (1248)',
                      'Driving (1245)',
                    ].map((pill) => (
                      <span key={pill} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: BUS ROUTE & PUNCTUALITY (Exact Image 8) */}
          {activeTab === 'bus_route' && (
            <div className="space-y-5 text-xs">
              
              {/* Route Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Bus route</span>
                  <span className="font-mono">332 km · 6h 50m</span>
                </div>
                <div className="text-slate-900 font-semibold leading-relaxed">
                  {trip.sourceCity} ➜ Kanchipuram ➜ Walajapet ➜ Vellore ➜ Krishnagiri ➜ Hosur ➜ {trip.destinationCity}
                </div>
              </div>

              {/* Highly on time 95% Donut Card (Image 8) */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-800 font-medium">Reaches {trip.destinationCity}</div>
                  <div className="text-lg font-bold text-emerald-950 font-display">Highly on time</div>
                  <div className="text-[11px] text-emerald-800 mt-1">1037 of 1092 trips on time in the last 60 days</div>
                </div>

                {/* 95% On Time Donut Chart */}
                <div className="w-16 h-16 rounded-full border-4 border-emerald-600 flex items-center justify-center bg-white shadow-sm font-bold text-emerald-800 text-sm">
                  95%
                </div>
              </div>

              {/* Date change policy (Image 8) */}
              <div className="pt-2">
                <h4 className="font-bold text-sm text-slate-900 mb-2">Date change policy</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 bg-slate-100 p-2 font-bold text-slate-700">
                    <span>Time window</span>
                    <span>Fees</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 text-slate-800 border-t border-slate-200 items-center">
                    <div>
                      <div className="font-semibold">Up to 7h before departure</div>
                      <div className="text-[10px] text-slate-400">Until 16 Oct, 16:10</div>
                    </div>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: OTHER POLICIES (Exact Image 10) */}
          {activeTab === 'policies' && (
            <div className="space-y-4 text-xs">
              
              {/* Bus insurance & Fitness Validations (Image 10) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Bus insurance</span>
                    <span className="font-bold text-slate-900">Valid till Apr 2027</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Bus fitness</span>
                    <span className="font-bold text-slate-900">Valid till Jun 2027</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Policy List matching Image 10 */}
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-1 space-y-2">
                
                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>👶</span>
                    <span>Child passenger policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    Children above the age of 3 will need an individual seat ticket.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-slate-700" />
                    <span>Luggage policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    1 piece of personal luggage accepted free of charge per passenger. Excess items are chargeable.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>🐾</span>
                    <span>Pets Policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    Pets are not allowed on this interstate coach.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>🚻</span>
                    <span>Toilet Usage Policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    In-Bus Toilet with Urinal facility available on active highway transit.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-600" />
                    <span>Liquor Policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    Carrying or consuming liquor inside the bus is strictly prohibited. Bus operator reserves the right to deboard intoxicated passengers.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>Pick up time policy</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 pl-6">
                    Bus operator is not obligated to wait beyond the scheduled departure time. Please arrive 15 minutes before departure.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Bottom Booking Checkout Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-slate-500">
              {selectedSeats.length > 0 ? (
                <>Selected: <strong className="text-slate-900">{selectedSeats.map(s => s.number).join(', ')}</strong></>
              ) : (
                'Select seats above'
              )}
            </div>
            <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            type="button"
            disabled={selectedSeats.length === 0}
            onClick={onProceedToCheckout}
            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
              selectedSeats.length > 0
                ? 'bg-[#D84E55] hover:bg-[#C23C43] text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
