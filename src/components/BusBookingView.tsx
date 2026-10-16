import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  Wifi, 
  Zap, 
  Coffee, 
  Shield, 
  Navigation, 
  Check, 
  AlertCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { BusTrip, Seat } from '../types';
import { LanguageCode, translations } from '../services/localization';
import { generateBusSeats } from '../data/mockData';

export interface BusSearchParams {
  source: string;
  destination: string;
  date: string;
  passengers: number;
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
  const t = translations[lang];

  // Helper to generate dynamic trip if custom route searched
  const generateDynamicTripsForRoute = (source: string, dest: string, date: string): BusTrip[] => {
    return [
      {
        id: `dyn-${source}-${dest}-1`,
        supplierId: 'sup-001',
        operatorName: 'Zingbus Luxury Premium Lounge',
        busNumber: 'DL-01-EQ-9876',
        busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '20:30',
        arrivalTime: '07:15',
        duration: '10h 45m',
        rating: 4.8,
        reviewCount: 1820,
        totalSeats: 30,
        availableSeatsCount: 22,
        fareStartingFrom: 1350,
        amenities: ['Live GPS Tracking', 'Personal AC Vents', 'Reading Lights', 'USB Fast Charger', 'Blanket & Pillow', 'Mineral Water'],
        boardingPoints: [
          { location: `${source} Central Inter-State Bus Terminal`, time: '20:30' },
          { location: `${source} Highway Express Toll Plaza`, time: '21:15' },
        ],
        droppingPoints: [
          { location: `${dest} Main City Junction`, time: '06:45' },
          { location: `${dest} Central Bus Stand`, time: '07:15' },
        ],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure. 50% refund between 2 to 6 hours.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-001',
        seats: generateBusSeats(1350),
      },
      {
        id: `dyn-${source}-${dest}-2`,
        supplierId: 'sup-002',
        operatorName: 'Parveen Travels Royal Class',
        busNumber: 'MH-04-AZ-4521',
        busType: 'Scania Metrolink Multi-Axle AC Sleeper',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '21:45',
        arrivalTime: '08:30',
        duration: '10h 45m',
        rating: 4.9,
        reviewCount: 2450,
        totalSeats: 30,
        availableSeatsCount: 16,
        fareStartingFrom: 1480,
        amenities: ['Live GPS Tracking', 'WiFi Hotspot', 'Snack Pack', 'Emergency SOS', 'Comfort Sleep Berths', 'Movie Screen'],
        boardingPoints: [
          { location: `${source} Ring Road Boarding Point`, time: '21:45' },
          { location: `${source} Airport Bypass Circle`, time: '22:30' },
        ],
        droppingPoints: [
          { location: `${dest} Bypass Dropoff Point`, time: '08:00' },
          { location: `${dest} Private Bus Stand`, time: '08:30' },
        ],
        cancellationPolicy: 'Full refund up to 12 hours before journey. Nominal 10% fee thereafter.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-002',
        seats: generateBusSeats(1480),
      },
      {
        id: `dyn-${source}-${dest}-3`,
        supplierId: 'sup-003',
        operatorName: 'IntrCity SmartBus Executive',
        busNumber: 'KA-01-MJ-8833',
        busType: 'BharatBenz Club Class AC Sleeper',
        sourceCity: source,
        destinationCity: dest,
        departureTime: '23:00',
        arrivalTime: '09:45',
        duration: '10h 45m',
        rating: 4.7,
        reviewCount: 1120,
        totalSeats: 30,
        availableSeatsCount: 26,
        fareStartingFrom: 1190,
        amenities: ['SmartBus Lounge Access', 'Live GPS Tracking', 'Clean Restroom Guarantee', 'CCTV Surveillance'],
        boardingPoints: [
          { location: `${source} SmartBus Exclusive Lounge`, time: '23:00' },
        ],
        droppingPoints: [
          { location: `${dest} Central Terminus`, time: '09:45' },
        ],
        cancellationPolicy: '100% refund if cancelled 4 hours prior. Free reschedule.',
        hasLiveGps: true,
        gpsTripId: 'gps-trip-003',
        seats: generateBusSeats(1190),
      },
    ];
  };

  // Determine base trips matching source & destination
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

    // If custom route requested, synthesize live express fleets for that route!
    return generateDynamicTripsForRoute(searchParams.source.trim(), searchParams.destination.trim(), searchParams.date);
  }, [trips, searchParams]);

  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOperator, setFilterOperator] = useState<string>('all');

  // Update default expanded trip when search changes
  useEffect(() => {
    if (activeTripsList.length > 0) {
      setExpandedTripId(activeTripsList[0].id);
    } else {
      setExpandedTripId(null);
    }
  }, [activeTripsList]);

  const activeTrip = activeTripsList.find(t => t.id === expandedTripId);

  // Initialize boarding & dropping point when expanding a trip
  useEffect(() => {
    if (activeTrip) {
      setSelectedBoardingPoint(activeTrip.boardingPoints[0]?.location || '');
      setSelectedDroppingPoint(activeTrip.droppingPoints[0]?.location || '');
      setSelectedSeatIds([]);
    }
  }, [expandedTripId, activeTrip]);

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === 'booked') return;
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 6) {
        alert('Maximum 6 seats can be selected per booking.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const selectedSeatsList = activeTrip 
    ? activeTrip.seats.filter(s => selectedSeatIds.includes(s.id))
    : [];

  const totalSeatsPrice = selectedSeatsList.reduce((acc, s) => acc + s.price, 0);

  // Filter trips based on type and operator
  const filteredTrips = activeTripsList.filter(trip => {
    if (filterOperator !== 'all' && !trip.operatorName.toLowerCase().includes(filterOperator.toLowerCase())) {
      return false;
    }
    if (filterType === 'volvo' && !trip.busType.toLowerCase().includes('volvo')) {
      return false;
    }
    if (filterType === 'sleeper' && !trip.busType.toLowerCase().includes('sleeper')) {
      return false;
    }
    return true;
  });

  return (
    <div id="buses-available-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      
      {/* Dynamic Search Banner when user tapped Search */}
      {searchParams && searchParams.source && searchParams.destination && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-amber-400/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono">
                LIVE FLEET RESULTS
              </span>
              <span className="text-xs text-slate-300">
                Travel Date: <strong>{searchParams.date}</strong> · {searchParams.passengers} Passenger(s)
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-display text-white mt-1 flex items-center gap-2">
              <span className="text-amber-400">{searchParams.source}</span>
              <span className="text-slate-400 text-lg">➜</span>
              <span className="text-amber-400">{searchParams.destination}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Found <strong>{filteredTrips.length} available luxury buses</strong> for this route with instant seat allocation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                View All Indian Routes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Bus className="w-6 h-6 text-amber-600" />
            <span>Available Express & Sleeper Buses</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {filteredTrips.length} verified interstate fleets with guaranteed seat reservation and real-time GPS
          </p>
        </div>

        {/* RedBus-Style Comprehensive Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Buses
            </button>
            <button
              onClick={() => setFilterType('volvo')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'volvo' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volvo 9600
            </button>
            <button
              onClick={() => setFilterType('sleeper')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'sleeper' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AC Sleeper (2+1)
            </button>
            <button
              onClick={() => setFilterType('night')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'night' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Night Buses (6 PM+)
            </button>
            <button
              onClick={() => setFilterType('single')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'single' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Berths
            </button>
          </div>
        </div>
      </div>

      {/* Bus Trips Listing */}
      <div className="space-y-5">
        {filteredTrips.map((trip) => {
          const isExpanded = expandedTripId === trip.id;
          const lowerDeckSeats = trip.seats.filter(s => s.deck === 'lower');
          const upperDeckSeats = trip.seats.filter(s => s.deck === 'upper');

          return (
            <div
              key={trip.id}
              className={`bg-white rounded-xl border transition-all ${
                isExpanded ? 'border-amber-400 shadow-md ring-1 ring-amber-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Main Bus Summary Row */}
              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  
                  {/* Operator Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 hover:text-amber-600 transition-colors">
                        {trip.operatorName}
                      </h3>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        {trip.rating}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      {trip.busType}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Reg: {trip.busNumber}
                    </div>

                    {/* Amenities Icons */}
                    <div className="flex flex-wrap gap-2 mt-3 text-slate-500 text-[11px]">
                      {trip.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {amenity}
                        </span>
                      ))}
                      {trip.amenities.length > 3 && (
                        <span className="text-slate-400 self-center">+{trip.amenities.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Route & Timing Schedule */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center justify-between max-w-sm">
                      <div className="text-left">
                        <div className="text-lg font-bold text-slate-900 tabular-nums">
                          {trip.departureTime}
                        </div>
                        <div className="text-xs font-semibold text-slate-700">{trip.sourceCity}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[110px]">
                          {trip.boardingPoints[0]?.location.split(' ')[0]}
                        </div>
                      </div>

                      <div className="flex flex-col items-center px-4">
                        <div className="text-[11px] text-slate-400 font-medium tabular-nums">{trip.duration}</div>
                        <div className="w-24 sm:w-32 h-0.5 bg-slate-300 relative my-1">
                          <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-slate-400" />
                          <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">Direct Highway Express</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 tabular-nums">
                          {trip.arrivalTime}
                        </div>
                        <div className="text-xs font-semibold text-slate-700">{trip.destinationCity}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[110px]">
                          {trip.droppingPoints[0]?.location.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Primary Selection CTAs */}
                  <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-400">{t.bus.fare}</div>
                      <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                        ₹{trip.fareStartingFrom.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {trip.availableSeatsCount} seats available
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {trip.hasLiveGps && (
                        <button
                          type="button"
                          onClick={() => onOpenGpsModal(trip.gpsTripId || 'gps-trip-001')}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors border border-slate-200"
                          title="Track Live Bus Coordinates"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-500" />
                          <span>GPS Track</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
                          isExpanded 
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
                            : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{isExpanded ? 'Hide Seat Map' : t.bus.selectSeats}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Interactive Seat Selection Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-5 rounded-b-xl">
                  
                  {/* Legend & 10-Minute Hold Notice */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 text-xs">
                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                        <span>{t.bus.available}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-amber-400 border border-amber-500" />
                        <span>{t.bus.selected}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300 text-slate-400" />
                        <span>{t.bus.booked}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                      <Timer className="w-4 h-4 text-amber-600" />
                      <span>{t.bus.holdTimerNotice}</span>
                    </div>
                  </div>

                  {/* Seat Decks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Lower Deck */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
                        <span>Lower Deck (Berths & Pushback)</span>
                        <span className="text-[11px] text-slate-400 font-normal">Front ➜ Driver Side</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2.5">
                        {lowerDeckSeats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isBooked = seat.status === 'booked';
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={isBooked}
                              onClick={() => toggleSeatSelection(seat)}
                              className={`p-2 rounded-lg text-center font-mono text-xs transition-all flex flex-col items-center justify-center ${
                                isBooked 
                                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                  : isSelected
                                    ? 'bg-amber-400 border-2 border-amber-500 text-slate-950 font-bold shadow-sm scale-105'
                                    : 'bg-white border border-slate-300 hover:border-amber-400 text-slate-800 hover:shadow'
                              }`}
                            >
                              <span className="text-xs">{seat.number}</span>
                              <span className="text-[10px] tabular-nums mt-0.5">₹{seat.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upper Deck */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
                        <span>Upper Deck (Luxury Sleepers)</span>
                        <span className="text-[11px] text-slate-400 font-normal">Panaromic Window View</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        {upperDeckSeats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isBooked = seat.status === 'booked';
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={isBooked}
                              onClick={() => toggleSeatSelection(seat)}
                              className={`p-2 rounded-lg text-center font-mono text-xs transition-all flex flex-col items-center justify-center ${
                                isBooked 
                                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                  : isSelected
                                    ? 'bg-amber-400 border-2 border-amber-500 text-slate-950 font-bold shadow-sm scale-105'
                                    : 'bg-white border border-slate-300 hover:border-amber-400 text-slate-800 hover:shadow'
                              }`}
                            >
                              <span className="text-xs">{seat.number}</span>
                              <span className="text-[10px] tabular-nums mt-0.5">₹{seat.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Boarding & Dropping Points and Proceed CTA */}
                  <div className="mt-5 p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Boarding point selection */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Boarding Location & Time
                      </label>
                      <select
                        value={selectedBoardingPoint}
                        onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        {trip.boardingPoints.map((bp, i) => (
                          <option key={i} value={bp.location}>
                            {bp.time} — {bp.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dropping point selection */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Dropping Location & Time
                      </label>
                      <select
                        value={selectedDroppingPoint}
                        onChange={(e) => setSelectedDroppingPoint(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        {trip.droppingPoints.map((dp, i) => (
                          <option key={i} value={dp.location}>
                            {dp.time} — {dp.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Summary and Proceed CTA */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div>
                        <div className="text-[11px] text-slate-500">
                          {selectedSeatsList.length} seat(s) selected: {selectedSeatsList.map(s => s.number).join(', ') || 'None'}
                        </div>
                        <div className="text-lg font-bold font-display text-slate-900 tabular-nums">
                          ₹{totalSeatsPrice.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={selectedSeatsList.length === 0}
                        onClick={() => {
                          onInitiateCheckout({
                            trip,
                            selectedSeats: selectedSeatsList,
                            boardingPoint: selectedBoardingPoint || trip.boardingPoints[0].location,
                            droppingPoint: selectedDroppingPoint || trip.droppingPoints[0].location,
                          });
                        }}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow ${
                          selectedSeatsList.length > 0
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {t.bus.continueToCheckout}
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
