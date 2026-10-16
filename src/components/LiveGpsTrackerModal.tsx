import React, { useState, useEffect } from 'react';
import { 
  X, 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Gauge, 
  RefreshCw,
  Compass
} from 'lucide-react';
import { MOCK_GPS_TELEMETRY } from '../data/mockData';
import { GpsTelemetry } from '../types';

interface LiveGpsTrackerModalProps {
  tripId: string;
  onClose: () => void;
}

export const LiveGpsTrackerModal: React.FC<LiveGpsTrackerModalProps> = ({
  tripId,
  onClose,
}) => {
  const [telemetry, setTelemetry] = useState<GpsTelemetry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    // Load initial telemetry
    const initial = MOCK_GPS_TELEMETRY[tripId] || MOCK_GPS_TELEMETRY['gps-trip-001'];
    setTelemetry(initial);

    // Live update interval simulating vehicle movement along route
    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
      setTelemetry(prev => {
        if (!prev) return prev;
        const speedDelta = Math.floor(Math.random() * 5) - 2;
        const newSpeed = Math.max(55, Math.min(80, prev.speedKmh + speedDelta));
        return {
          ...prev,
          speedKmh: newSpeed,
          lastUpdated: 'Just now (via NavIC / GPS)',
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [tripId]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (telemetry) {
        setTelemetry({ ...telemetry, lastUpdated: '1 second ago (Verified)' });
      }
    }, 500);
  };

  if (!telemetry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">Live Fleet Telemetry Radar</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  LIVE STREAM
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Vehicle: {telemetry.vehicleNumber} · Driver: {telemetry.driverName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="Ping Vehicle Transponder"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-100 border-b border-slate-200 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Speed</span>
              <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
                {telemetry.speedKmh} km/h
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Stop ETA</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">
                ~{telemetry.estimatedArrivalMinutes} mins
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Heading</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {telemetry.headingDegrees}° North
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signal Status</span>
              <span className="font-bold text-emerald-600 text-xs">
                {telemetry.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Simulated Map Canvas */}
        <div className="relative h-64 sm:h-72 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Subtle Topographical grid lines */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Route Path */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 600 300" preserveAspectRatio="none">
            {/* Road route line */}
            <path
              d="M 50 250 Q 200 200 320 140 T 550 50"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Traveled route line */}
            <path
              d="M 50 250 Q 200 200 320 140"
              fill="none"
              stroke="#d4af37"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Origin marker */}
            <circle cx="50" cy="250" r="6" fill="#10b981" />
            {/* Destination marker */}
            <circle cx="550" cy="50" r="6" fill="#ef4444" />
            {/* Active bus vehicle pulse */}
            <circle cx="320" cy="140" r="14" fill="#f59e0b" opacity="0.3" className="animate-ping" />
            <circle cx="320" cy="140" r="8" fill="#d4af37" />
          </svg>

          {/* Overlay Map Floating Badges */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-white text-xs max-w-xs shadow-lg">
            <div className="text-[10px] text-amber-400 font-semibold uppercase">Currently Approaching</div>
            <div className="font-bold text-sm mt-0.5">{telemetry.nextStopName}</div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Coords: {telemetry.currentLat.toFixed(4)}°N, {telemetry.currentLng.toFixed(4)}°E</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-white text-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400">Assigned Driver</div>
              <div className="font-bold text-xs">{telemetry.driverName}</div>
            </div>
            <a
              href={`tel:${telemetry.driverPhone}`}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1 text-[11px] transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Route Waypoints List */}
        <div className="p-4 overflow-y-auto flex-1 bg-white">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Journey Stops & Live Transit Progress
          </h4>
          
          <div className="space-y-3">
            {telemetry.routeStops.map((stop, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    stop.passed ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}>
                    {stop.passed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`font-medium ${stop.passed ? 'text-slate-800' : 'text-slate-500'}`}>
                    {stop.name}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-medium text-slate-500">
                  {stop.eta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info & close */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted GPS transponder feed verified by ApnaTrips Fleet Operations</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium text-xs transition-colors"
          >
            Close Radar
          </button>
        </div>

      </div>
    </div>
  );
};
