import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Bus, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { BusTrip, SupplierPartner, UserProfile } from '../types';
import { MOCK_BUS_TRIPS, MOCK_SUPPLIERS } from '../data/mockData';

interface SupplierPortalProps {
  currentUser: UserProfile;
  supplier?: SupplierPartner;
  onClose: () => void;
}

export const SupplierPortal: React.FC<SupplierPortalProps> = ({
  currentUser,
  supplier: propSupplier,
  onClose,
}) => {
  const [supplier] = useState<SupplierPartner>(propSupplier || MOCK_SUPPLIERS[0]); // Default or provided operator
  const [trips, setTrips] = useState<BusTrip[]>(MOCK_BUS_TRIPS);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [newFare, setNewFare] = useState<number>(1450);

  const handleUpdateFare = (tripId: string) => {
    setTrips(trips.map(t => {
      if (t.id === tripId) {
        return { ...t, fareStartingFrom: newFare };
      }
      return t;
    }));
    setEditingTripId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  {supplier.businessName}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  KYC VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized Supplier Portal • GSTIN: {supplier.gstin} • Bank: {supplier.bankAccountMasked}
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

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Total Lifetime Earnings</span>
            <div className="text-xl font-bold font-display text-slate-900 mt-1 tabular-nums">
              ₹{supplier.totalEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Net of 10% ApnaTrips Platform Fee</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Pending Escrow Settlement</span>
            <div className="text-xl font-bold font-display text-amber-600 mt-1 tabular-nums">
              ₹{supplier.pendingSettlement.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Scheduled for Direct Bank Deposit (NEFT)</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Scheduled Trips Managed</span>
            <div className="text-xl font-bold font-display text-slate-900 mt-1 tabular-nums">
              {supplier.totalTripsCount} Trips
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Average Punctuality: 98.7%</div>
          </div>
        </div>

        {/* Active Route Inventory Management */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Operator Mode: Viewing assigned fleets. Fleet registrations & hotel listings are restricted to <strong>Super Admin</strong>.</span>
            <span className="text-[10px] text-amber-600 font-mono font-semibold">Admin Protected</span>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assigned Fleet Schedules & Dynamic Fares
            </h4>
            <span className="text-xs text-slate-500">
              Only authorized operators can adjust seat inventory
            </span>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{trip.sourceCity} ➜ {trip.destinationCity}</span>
                    <span className="text-xs text-slate-500 font-mono">({trip.busNumber})</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dept: {trip.departureTime}</span>
                    </span>
                    <span>·</span>
                    <span>Total Seats: {trip.totalSeats} (Available: {trip.availableSeatsCount})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {editingTripId === trip.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newFare}
                        onChange={(e) => setNewFare(Number(e.target.value))}
                        className="w-20 p-1.5 text-xs border border-amber-400 rounded font-bold font-mono"
                      />
                      <button
                        onClick={() => handleUpdateFare(trip.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] text-slate-400 text-right">Base Seat Fare</div>
                      <div className="text-base font-bold font-display text-slate-900 tabular-nums">
                        ₹{trip.fareStartingFrom}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setEditingTripId(trip.id);
                      setNewFare(trip.fareStartingFrom);
                    }}
                    className="p-2 text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Edit Dynamic Fare"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct Payouts processed via RBI-compliant settlement channels</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Close Partner Hub
          </button>
        </div>

      </div>
    </div>
  );
};
