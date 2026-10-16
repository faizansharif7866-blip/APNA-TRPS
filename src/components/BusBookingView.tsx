import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  Wifi, 
  Zap, 
  Shield, 
  Navigation, 
  Check, 
  AlertCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Filter,
  Mic,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ThumbsUp,
  Heart,
  Percent
} from 'lucide-react';
import { BusTrip, Seat } from '../types';
import { LanguageCode, translations } from '../services/localization';
import { generateBusSeats } from '../data/mockData';
import { RedBusSeatDetailsModal } from './RedBusSeatDetailsModal';

export interface BusSearchParams {
  source: string;
  destination: string;
  date: string;
  passengers: number;
  womenOnly?: boolean;
}

interface BusBookingViewProps {
  trips: BusTrip[];
  lang: LanguageCode;
  searchParams?: BusSearchParams | null;
  onClearSearch?: () => void;
  onSelectRoute?: (source: string, destination: string) => void;
  onOpenGpsModal: (tripId: string) => void;
  onInitiateCheckout: (bookingData: {
    trip: BusTrip;
    selectedSeats: Seat[];
    boardingPoint: string;
    droppingPoint: string;
  }) => void;
}

export const BusBookingView: React.FC<BusBookingViewProps> = ({
  trips,
  lang,
  searchParams,
  onClearSearch,
  onSelectRoute,
  onOpenGpsModal,
  onInitiateCheckout,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [aiFilterQuery, setAiFilterQuery] = useState('');
  const [selectedTripForModal, setSelectedTripForModal] = useState<BusTrip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'buses' | 'hotels'>('buses');

  // Dynamic trip generator for custom routes
  const generateDynamicTripsForRoute = (source: string, dest: string, date: string): BusTrip[] => {
    return [
      {
        id: `humsafar-1`,
        supplierId: 'sup-001',
        operatorName: 'Humsafar Travels',
        busNumber: 'MH-12-RN-7711',
        busType: 'Bharat Benz A/C Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '23:00',
        arrivalTime: '06:00',
        duration: '7h 00m',
        rating: 4.6,
        reviewCount: 867,
        totalSeats: 30,
        availableSeatsCount: 11,
        fareStartingFrom: 1150,
        amenities: ['Live GPS Tracking', 'Toilet', 'Personal AC Vents', 'Charging Point', 'Blanket & Pillow', 'Reading Light'],
        boardingPoints: [
          { location: `${source} Swargate Private Bus Stand`, time: '23:00' },
          { location: `${source} Viman Nagar Bypass`, time: '23:45' },
        ],
        droppingPoints: [
          { location: `${dest} CIDCO Bus Stand`, time: '05:30' },
          { location: `${dest} Central Railway Station`, time: '06:00' },
        ],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-001',
        seats: generateBusSeats(1150),
      },
      {
        id: `vbus-2`,
        supplierId: 'sup-002',
        operatorName: 'V Bus Holidays Royal',
        busNumber: 'MH-20-EQ-5522',
        busType: 'Scania Metrolink Multi-Axle AC Sleeper',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '22:00',
        arrivalTime: '05:00',
        duration: '7h 00m',
        rating: 4.9,
        reviewCount: 1374,
        totalSeats: 30,
        availableSeatsCount: 7,
        fareStartingFrom: 1180,
        amenities: ['Live GPS Tracking', 'Toilet', 'WiFi Hotspot', 'Snack Pack', 'Emergency SOS', 'Comfort Sleep Berths'],
        boardingPoints: [
          { location: `${source} Wakad Highway Toll`, time: '22:00' },
          { location: `${source} Shivaji Nagar`, time: '22:45' },
        ],
        droppingPoints: [
          { location: `${dest} Kranti Chowk`, time: '04:30' },
          { location: `${dest} Central Terminus`, time: '05:00' },
        ],
        cancellationPolicy: 'Full refund up to 7 hours before journey.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-002',
        seats: generateBusSeats(1180),
      },
      {
        id: `zingbus-3`,
        supplierId: 'sup-003',
        operatorName: 'Zingbus Luxury Primo Lounge',
        busNumber: 'DL-01-EQ-9876',
        busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '21:30',
        arrivalTime: '05:15',
        duration: '7h 45m',
        rating: 4.8,
        reviewCount: 2120,
        totalSeats: 30,
        availableSeatsCount: 16,
        fareStartingFrom: 1250,
        amenities: ['Primo Lounge Access', 'Toilet', 'Live GPS Tracking', 'Clean Restroom Guarantee', 'CCTV Surveillance'],
        boardingPoints: [
          { location: `${source} Zingbus Express Lounge`, time: '21:30' },
        ],
        droppingPoints: [
          { location: `${dest} City Bypass Dropoff`, time: '05:15' },
        ],
        cancellationPolicy: '100% refund if cancelled 6 hours prior.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-003',
        seats: generateBusSeats(1250),
      },
      {
        id: `humsafar-4`,
        supplierId: 'sup-001',
        operatorName: 'Humsafar Travels Superfast',
        busNumber: 'MH-14-BT-9900',
        busType: 'Bharat Benz A/C Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '23:30',
        arrivalTime: '06:45',
        duration: '7h 15m',
        rating: 4.6,
        reviewCount: 694,
        totalSeats: 30,
        availableSeatsCount: 14,
        fareStartingFrom: 1120,
        amenities: ['Live GPS Tracking', 'AC Vents', 'Charging Point', 'Blanket & Pillow'],
        boardingPoints: [
          { location: `${source} Swargate Station`, time: '23:30' },
        ],
        droppingPoints: [
          { location: `${dest} CIDCO Terminal`, time: '06:45' },
        ],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-001',
        seats: generateBusSeats(1120),
      },
    ];
  };

  const activeTripsList = React.useMemo(() => {
    if (!searchParams || !searchParams.source || !searchParams.destination) {
      return trips;
    }

    const s = searchParams.source.trim().toLowerCase();
    const d = searchParams.destination.trim().toLowerCase();

    const matched = trips.filter(trip => 
      trip.sourceCity.toLowerCase().includes(s) && trip.destinationCity.toLowerCase().includes(d)
    );

    if (matched.length > 0) {
      return matched;
    }

    return generateDynamicTripsForRoute(searchParams.source.trim(), searchParams.destination.trim(), searchParams.date);
  }, [trips, searchParams]);

  // Apply quick filter chips & AI smart query
  const filteredTrips = activeTripsList.filter((trip) => {
    if (filterType === 'volvo' && !trip.busType.toLowerCase().includes('volvo')) {
      return false;
    }
    if (filterType === 'sleeper' && !trip.busType.toLowerCase().includes('sleeper')) {
      return false;
    }
    if (filterType === 'toilet' && !trip.amenities.some(a => a.toLowerCase().includes('toilet'))) {
      return false;
    }
    if (filterType === 'primo' && !trip.operatorName.toLowerCase().includes('primo') && !trip.operatorName.toLowerCase().includes('zingbus') && trip.rating < 4.8) {
      return false;
    }
    if (filterType === 'single' && trip.availableSeatsCount < 3) {
      return false;
    }
    if (aiFilterQuery.trim()) {
      const q = aiFilterQuery.toLowerCase();
      const match = trip.operatorName.toLowerCase().includes(q) ||
                    trip.busType.toLowerCase().includes(q) ||
                    trip.amenities.some(a => a.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenSeatModal = (trip: BusTrip) => {
    setSelectedTripForModal(trip);
    setSelectedSeats([]);
  };

  const handleToggleSeat = (seat: Seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 seats can be selected per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceedCheckoutFromModal = () => {
    if (!selectedTripForModal || selectedSeats.length === 0) return;
    onInitiateCheckout({
      trip: selectedTripForModal,
      selectedSeats,
      boardingPoint: selectedTripForModal.boardingPoints[0]?.location || '',
      droppingPoint: selectedTripForModal.droppingPoints[0]?.location || '',
    });
    setSelectedTripForModal(null);
  };

  return (
    <div id="buses-available-section" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 scroll-mt-20">
      
      {/* Route Header matching redBus Image 5 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>{searchParams ? searchParams.source : 'Pune'}</span>
              <span className="text-[#D84E55]">➜</span>
              <span>{searchParams ? searchParams.destination : 'Aurangabad (Maharashtra)'}</span>
            </h1>
            <span className="text-xs text-slate-400 font-semibold">
              · {filteredTrips.length} Buses
            </span>
          </div>

          <div className="bg-red-50 border border-red-200 text-[#D84E55] px-3 py-1 rounded-full text-xs font-bold font-mono">
            16 Oct Fri
          </div>
        </div>

        {/* Buses vs Hotels Switcher Tabs (Image 5) */}
        <div className="flex items-center gap-6 mt-4 border-b border-slate-200 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveCategoryTab('buses')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeCategoryTab === 'buses'
                ? 'border-[#D84E55] text-[#D84E55]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Buses
          </button>

          <button
            type="button"
            onClick={() => alert("Hotels & Stays with Up to 70% Off powered by APNA TRIPS")}
            className="pb-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>Hotels</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
              Upto 70% Off
            </span>
          </button>
        </div>
      </div>

      {/* Promos Carousel matching Image 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 overflow-x-auto pb-1">
        
        {/* Banner 1: Tigra Edition (Image 5) */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 p-3.5 rounded-2xl shadow-sm border border-amber-300 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-black text-amber-400 px-1.5 py-0.5 rounded">
              NEW TIGRA
            </span>
            <div className="text-xs font-extrabold mt-1">EDITION BUSES</div>
            <div className="text-[10px] text-slate-800 font-medium">Next level comfort</div>
          </div>
          <span className="text-2xl">🚌</span>
        </div>

        {/* Banner 2: Primo Rising Stars (Image 5) */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E293B] text-white p-3.5 rounded-2xl shadow-sm border border-blue-900 flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-amber-400 flex items-center gap-1">
              <span>★</span> Primo
            </span>
            <div className="text-[11px] text-slate-200 font-medium mt-0.5">
              Rising Stars on APNA TRIPS
            </div>
            <div className="text-[9px] text-blue-300">Top-rated operators</div>
          </div>
          <span className="text-xl">⭐</span>
        </div>

        {/* Banner 3: Free Cancellation (Image 5) */}
        <div className="bg-gradient-to-r from-rose-50 to-red-100 text-rose-950 p-3.5 rounded-2xl shadow-sm border border-red-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-700">Free Cancellation</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Get a full refund if you cancel up to 6h prior
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs">
            ₹
          </span>
        </div>

      </div>

      {/* Filter Chips matching Image 5 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap border transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter & Sort</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'toilet' ? 'all' : 'toilet')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${
            filterType === 'toilet'
              ? 'bg-[#D84E55] text-white border-[#D84E55] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>Toilet</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'primo' ? 'all' : 'primo')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${
            filterType === 'primo'
              ? 'bg-[#D84E55] text-white border-[#D84E55] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>★ Primo Bus</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'sleeper' ? 'all' : 'sleeper')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${
            filterType === 'sleeper'
              ? 'bg-[#D84E55] text-white border-[#D84E55] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>AC Sleeper</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'single' ? 'all' : 'single')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${
            filterType === 'single'
              ? 'bg-[#D84E55] text-white border-[#D84E55] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>Single Berths</span>
        </button>
      </div>

      {/* AI Smart Filter Bar (Exact matching Image 5) */}
      <div className="bg-white rounded-2xl p-3 border border-purple-200 shadow-sm mb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Smart filter</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
          <input
            type="text"
            value={aiFilterQuery}
            onChange={(e) => setAiFilterQuery(e.target.value)}
            placeholder="Search 'Primo buses with toilet' or 'Humsafar'"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button 
            type="button" 
            onClick={() => setAiFilterQuery('toilet')}
            className="text-slate-400 hover:text-slate-700" 
            title="Voice search filter"
          >
            <Mic className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* RedBus-Style Bus Cards Listing (Exact matching Image 5) */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-[#D84E55]/40"
          >
            {/* Top Tag: Direct Bus */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Direct Bus
              </span>
              <button
                type="button"
                onClick={() => onOpenGpsModal(trip.gpsTripId || 'gps-trip-001')}
                className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live GPS Tracking</span>
              </button>
            </div>

            {/* Timing & Price Row (Exact Image 5) */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 tabular-nums">
                    {trip.departureTime}
                  </span>
                  <span className="text-slate-400 font-bold">──</span>
                  <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 tabular-nums">
                    {trip.arrivalTime}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {trip.duration} · <strong className="text-slate-700">{trip.availableSeatsCount} Seats (1 Single)</strong>
                </div>
              </div>

              {/* Price & Onwards */}
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 tabular-nums">
                  ₹{trip.fareStartingFrom.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Onwards
                </span>
              </div>
            </div>

            {/* Operator & Bus Model (Exact Image 5) */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{trip.operatorName}</span>
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.2 rounded flex items-center gap-0.5">
                    ★ {trip.rating}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({trip.reviewCount})</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {trip.busType}
                </div>
              </div>

              {/* View Seats Button */}
              <button
                type="button"
                onClick={() => handleOpenSeatModal(trip)}
                className="px-4 py-2 bg-[#D84E55] hover:bg-[#C23C43] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>View Seats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Badges Strip: Comfort score, New Bus, 95% On Time (Exact Image 5) */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-[11px]">
              <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-medium">
                Comfort score: 8.2/10
              </span>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                New Bus
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                95% On Time
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Floating "✦ Ask Ray" RedBus AI Assistant Button (Image 5 & 9) */}
      <button
        type="button"
        onClick={() => alert("Ask Ray (APNA TRIPS AI Travel Companion): 'Buses from Pune to Aurangabad have high on-time performance with Humsafar and V Bus Holidays. Top recommendation: 23:00 sleeper with in-bus toilet.'")}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-[#D84E55] text-white font-bold text-xs shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Ask Ray</span>
      </button>

      {/* Interactive Seat Details Modal matching Image 7, 8, 9, 10 */}
      {selectedTripForModal && (
        <RedBusSeatDetailsModal
          isOpen={true}
          trip={selectedTripForModal}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          onProceedToCheckout={handleProceedCheckoutFromModal}
          onClose={() => setSelectedTripForModal(null)}
        />
      )}

    </div>
  );
};
