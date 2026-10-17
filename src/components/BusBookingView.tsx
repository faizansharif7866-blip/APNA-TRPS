import React, { useState } from 'react';
import { 
  Bus, 
  SlidersHorizontal, 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Wifi, 
  Coffee, 
  Zap, 
  Compass, 
  Filter, 
  Search,
  CheckCircle2,
  Mic,
  ArrowRight
} from 'lucide-react';
import { BusTrip, Seat } from '../types';
import { LanguageCode } from '../services/localization';
import { RedBusSeatDetailsModal } from './RedBusSeatDetailsModal';
import { generateBusSeats } from '../data/mockData';
import { showToast } from './Toast';

interface BusBookingViewProps {
  trips: BusTrip[];
  lang: LanguageCode;
  searchParams: {
    source: string;
    destination: string;
    date: string;
    passengers: number;
    womenOnly?: boolean;
  } | null;
  onClearSearch: () => void;
  onSelectRoute: (source: string, destination: string) => void;
  onOpenGpsModal: (tripId: string) => void;
  onInitiateCheckout: (data: {
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
        id: `srisai-1`,
        supplierId: 'sup-001',
        operatorName: 'SRI SAI TRAVELS',
        busNumber: 'KA-01-EQ-9876',
        busType: 'Volvo 9600 Multi-Axle Luxury Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '22:30',
        arrivalTime: '05:40',
        duration: '7h 10m',
        rating: 4.9,
        reviewCount: 1383,
        totalSeats: 30,
        availableSeatsCount: 9,
        fareStartingFrom: 1599,
        amenities: ['Live GPS Tracking', 'Toilet', 'Personal AC Vents', 'Charging Point', 'Blanket & Pillow', 'Reading Light', 'Primo Lounge'],
        boardingPoints: [
          { location: `${source} Central Omni Bus Terminus`, time: '22:30' },
          { location: `${source} Highway Toll Bypass`, time: '23:15' },
        ],
        droppingPoints: [
          { location: `${dest} Main City Junction`, time: '05:00' },
          { location: `${dest} Central Railway Terminus`, time: '05:40' },
        ],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-001',
        seats: generateBusSeats(1599),
      },
      {
        id: `humsafar-2`,
        supplierId: 'sup-002',
        operatorName: 'Humsafar Travels Royal Class',
        busNumber: 'MH-12-RN-7711',
        busType: 'BharatBenz A/C Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '21:00',
        arrivalTime: '04:30',
        duration: '7h 30m',
        rating: 4.8,
        reviewCount: 942,
        totalSeats: 30,
        availableSeatsCount: 12,
        fareStartingFrom: 1450,
        amenities: ['Live GPS Tracking', 'Toilet', 'WiFi Hotspot', 'Snack Pack', 'Emergency SOS'],
        boardingPoints: [
          { location: `${source} Swargate Private Bus Stand`, time: '21:00' },
        ],
        droppingPoints: [
          { location: `${dest} City Bypass Dropoff`, time: '04:30' },
        ],
        cancellationPolicy: 'Full refund up to 7 hours before journey.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-002',
        seats: generateBusSeats(1450),
      },
      {
        id: `zingbus-3`,
        supplierId: 'sup-003',
        operatorName: 'Zingbus Primo Lounge',
        busNumber: 'DL-01-EQ-9876',
        busType: 'Scania Metrolink Multi-Axle AC Sleeper',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '23:30',
        arrivalTime: '06:45',
        duration: '7h 15m',
        rating: 4.9,
        reviewCount: 2120,
        totalSeats: 30,
        availableSeatsCount: 14,
        fareStartingFrom: 1699,
        amenities: ['Primo Lounge Access', 'Toilet', 'Live GPS Tracking', 'Clean Restroom Guarantee'],
        boardingPoints: [
          { location: `${source} Primo Express Lounge`, time: '23:30' },
        ],
        droppingPoints: [
          { location: `${dest} Metro Station Gate 2`, time: '06:45' },
        ],
        cancellationPolicy: '100% refund if cancelled 6 hours prior.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-003',
        seats: generateBusSeats(1699),
      },
    ];
  };

  const activeTripsList = React.useMemo(() => {
    if (!searchParams || !searchParams.source || !searchParams.destination) {
      return trips;
    }

    const s = searchParams.source.trim().toLowerCase();
    const d = searchParams.destination.trim().toLowerCase();

    const matched = trips.filter((trip) => 
      trip.sourceCity.toLowerCase().includes(s) && trip.destinationCity.toLowerCase().includes(d)
    );

    if (matched.length > 0) {
      return matched;
    }

    return generateDynamicTripsForRoute(searchParams.source.trim(), searchParams.destination.trim(), searchParams.date);
  }, [trips, searchParams]);

  // Filters
  const filteredTrips = activeTripsList.filter((trip) => {
    if (filterType === 'volvo' && !trip.busType.toLowerCase().includes('volvo')) {
      return false;
    }
    if (filterType === 'sleeper' && !trip.busType.toLowerCase().includes('sleeper')) {
      return false;
    }
    if (filterType === 'toilet' && !trip.amenities.some((a) => a.toLowerCase().includes('toilet'))) {
      return false;
    }
    if (filterType === 'primo' && !trip.operatorName.toLowerCase().includes('primo') && !trip.operatorName.toLowerCase().includes('sai') && trip.rating < 4.8) {
      return false;
    }
    if (filterType === 'single' && trip.availableSeatsCount < 3) {
      return false;
    }
    if (aiFilterQuery.trim()) {
      const q = aiFilterQuery.toLowerCase();
      const match = trip.operatorName.toLowerCase().includes(q) ||
                    trip.busType.toLowerCase().includes(q) ||
                    trip.amenities.some((a) => a.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenSeatModal = (trip: BusTrip) => {
    setSelectedTripForModal(trip);
    setSelectedSeats([]);
  };

  const handleToggleSeat = (seat: Seat) => {
    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        showToast('Maximum 6 seats can be selected per booking.', 'warning');
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

  const displaySource = searchParams ? searchParams.source : 'Chennai';
  const displayDest = searchParams ? searchParams.destination : 'Bengaluru';

  return (
    <div id="buses-available-section" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 scroll-mt-20">
      
      {/* Route Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>{displaySource}</span>
              <span className="text-emerald-600">➜</span>
              <span>{displayDest}</span>
            </h1>
            <span className="text-xs text-slate-400 font-semibold">
              · {filteredTrips.length} Available Buses
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
            {searchParams?.date === '2026-10-17' ? 'Sat 17-Oct' : 'Fri 16-Oct'}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-6 mt-4 border-b border-slate-200 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveCategoryTab('buses')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeCategoryTab === 'buses'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Buses ({filteredTrips.length})
          </button>

          <button
            type="button"
            onClick={() => showToast("Hotels & Stays with Up to 70% Off available in Hotel tab", "info")}
            className="pb-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>Hotels</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
              Upto 70% Off
            </span>
          </button>
        </div>
      </div>

      {/* Promos Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 overflow-x-auto pb-1">
        
        {/* Banner 1: Tigra Edition */}
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

        {/* Banner 2: Primo Rising Stars */}
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

        {/* Banner 3: Free Cancellation */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-950 p-3.5 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-800">Free Cancellation</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Get full refund if you cancel up to 6h prior
            </div>
          </div>
          <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
            ₹
          </span>
        </div>

      </div>

      {/* Filter Chips */}
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
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>Toilet on Board</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'primo' ? 'all' : 'primo')}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 whitespace-nowrap border transition-all ${
            filterType === 'primo'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
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
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
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
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>Single Berths</span>
        </button>
      </div>

      {/* AI Smart Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-emerald-200 shadow-sm mb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Smart Route Filter</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
          <input
            type="text"
            value={aiFilterQuery}
            onChange={(e) => setAiFilterQuery(e.target.value)}
            placeholder="Search 'Sri Sai Travels', 'Volvo with toilet', or 'Primo'"
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button 
            type="button" 
            onClick={() => setAiFilterQuery('Sri Sai')}
            className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
          >
            Sri Sai
          </button>
        </div>
      </div>

      {/* Bus Cards Listing */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/50"
          >
            {/* Top Tag: Direct Bus */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Direct Express Bus
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

            {/* Timing & Price Row */}
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
                  {trip.duration} · <strong className="text-slate-700">{trip.availableSeatsCount} Seats Left (1 Single)</strong>
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

            {/* Operator & Bus Model */}
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

              {/* View Seats Button in Emerald Green (Red replaced!) */}
              <button
                type="button"
                onClick={() => handleOpenSeatModal(trip)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>View Seats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-[11px]">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                Comfort score: 8.8/10
              </span>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                New Bus
              </span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-medium">
                98% On Time
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Floating Ask Ray Companion Button */}
      <button
        type="button"
        onClick={() => showToast("Ask Ray: Sri Sai Travels 22:30 Volvo Sleeper has highest on-time punctuality with clean restroom guarantee.", "info")}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Ask Ray</span>
      </button>

      {/* Interactive Seat Details Modal matching user's uploaded screenshot */}
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
