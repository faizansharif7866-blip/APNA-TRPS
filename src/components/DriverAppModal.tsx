import React, { useState } from 'react';
import { 
  X, 
  Navigation, 
  UserCheck, 
  MapPin, 
  ShieldCheck, 
  Play, 
  Square, 
  Check, 
  PhoneCall, 
  AlertTriangle,
  BatteryCharging,
  Gauge
} from 'lucide-react';
import { UserProfile } from '../types';

interface DriverAppModalProps {
  currentUser: UserProfile;
  onClose: () => void;
}

export const DriverAppModal: React.FC<DriverAppModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [tripStarted, setTripStarted] = useState(true);
  const [speed, setSpeed] = useState(68);
  const [checkedPassengers, setCheckedPassengers] = useState<string[]>(['L1A', 'L1B']);

  const manifest = [
    { seat: 'L1A', name: 'Ananya Sharma', phone: '+91 98765 43210', boarded: true },
    { seat: 'L1B', name: 'Rohan Mehra', phone: '+91 98112 33445', boarded: true },
    { seat: 'L2A', name: 'Suman Lata (Senior Citizen)', phone: '+91 98223 99881', boarded: false },
    { seat: 'U1A', name: 'Kavita Verma', phone: '+91 94112 00991', boarded: false },
  ];

  const toggleBoarding = (seat: string) => {
    if (checkedPassengers.includes(seat)) {
      setCheckedPassengers(checkedPassengers.filter(s => s !== seat));
    } else {
      setCheckedPassengers([...checkedPassengers, seat]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Driver Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  ApnaTrips Driver Cabin Terminal
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  DUTY ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Captain: Rajesh Sharma · Bus DL-01-EQ-9876
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Broadcast Telemetry Status */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${tripStarted ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span className="font-semibold text-slate-800">
              {tripStarted ? 'GPS Broadcaster Active (NavIC / Satellite)' : 'Journey Paused'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-600" />
              <span>{speed} km/h</span>
            </span>
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>94%</span>
            </span>
          </div>
        </div>

        {/* Assigned Route Card */}
        <div className="p-5 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Assigned Highway Route
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              New Delhi (Kashmere Gate) ➜ Manali (Private Bus Stand)
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Next Checkpoint: Kullu Toll Plaza (~45 min)</span>
            </div>
          </div>

          {/* Passenger Boarding Manifest Checklist */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <span>Passenger Boarding Manifest</span>
              <span className="text-emerald-700 font-normal">
                {checkedPassengers.length} of {manifest.length} Boarded
              </span>
            </div>

            <div className="space-y-2">
              {manifest.map((item, idx) => {
                const isBoarded = checkedPassengers.includes(item.seat);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleBoarding(item.seat)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isBoarded
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                        isBoarded ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isBoarded && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Seat {item.seat} · {item.phone}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {isBoarded ? 'Checked In' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls: Start/End Journey */}
          <div className="pt-2">
            {tripStarted ? (
              <button
                onClick={() => {
                  setTripStarted(false);
                  setSpeed(0);
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Square className="w-4 h-4" />
                <span>Complete Journey & Deactivate Live Tracking</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTripStarted(true);
                  setSpeed(68);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Resume Journey & Broadcast GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ApnaTrips Driver Safety Compliance • Emergency SOS Enabled</span>
        </div>

      </div>
    </div>
  );
};
