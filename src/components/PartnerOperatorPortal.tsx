import React, { useState } from 'react';
import { 
  Building2, 
  Bus, 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Edit3, 
  Search,
  Eye,
  FileText,
  MapPin,
  X,
  Sparkles,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { BusFleetConfiguration, BusTrip, SupplierPartner, UserProfile } from '../types';
import { getStoredBusTrips, getStoredSuppliers } from '../services/storage';
import { BusLayoutBuilder } from './BusLayoutBuilder';
import { showToast } from './Toast';

interface PartnerOperatorPortalProps {
  currentUser: UserProfile;
  onClose?: () => void;
  onNavigateToCustomerApp: () => void;
}

export const PartnerOperatorPortal: React.FC<PartnerOperatorPortalProps> = ({
  currentUser,
  onClose,
  onNavigateToCustomerApp,
}) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'bookings' | 'settlements' | 'partner_program'>('fleet');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [trips, setTrips] = useState<BusTrip[]>(getStoredBusTrips());
  const [suppliers] = useState<SupplierPartner[]>(getStoredSuppliers());
  const [selectedOperator] = useState<SupplierPartner>(suppliers[0] || {
    id: 'sup-001',
    businessName: 'Sri Sai Travels Private Limited',
    ownerName: 'S. Rajagopalan',
    category: 'bus_operator',
    phone: '+91 98401 23456',
    email: 'operations@srisaitravels.in',
    gstin: '33AABCS1429B1Z8',
    panNumber: 'AABCS1429B',
    kycStatus: 'APPROVED',
    commissionPercentage: 10,
    bankAccountMasked: 'HDFC **** **** 4812',
    totalTripsCount: 1534,
    totalEarnings: 2845000,
    pendingSettlement: 142800,
    createdAt: '2025-01-15',
  });

  const handleBusPublished = (config: BusFleetConfiguration) => {
    setTrips(getStoredBusTrips());
    showToast(`Bus ${config.busName} (${config.registrationNumber}) added to active fleet!`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-display">
                Apna<span className="text-emerald-400">Trips</span>
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                PARTNER & OPERATOR PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedOperator.businessName} · GSTIN: {selectedOperator.gstin}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 text-xs">
          <a
            href="tel:180027628747"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl border border-slate-700/80 transition-colors"
            title="Call ApnaTrip-Support (24/7 Helpline)"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call ApnaTrip-Support</span>
          </a>

          <button
            type="button"
            onClick={() => setIsBuilderOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus & Layout</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToCustomerApp}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Return to Customer Travel App"
          >
            <span>Customer App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'fleet', label: 'Bus Fleet & Seat Layouts', icon: Bus },
            { id: 'routes', label: 'Active Routes & Schedules', icon: Calendar },
            { id: 'bookings', label: 'Passenger Manifests', icon: Users },
            { id: 'settlements', label: 'Settlements & Statements', icon: DollarSign },
            { id: 'partner_program', label: 'Partner Referrals & Commission', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* KPI Metric Cards matching reference images */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Total Registered Fleet</span>
            <div className="text-2xl font-bold font-display text-white mt-1">
              {trips.length} Buses
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">100% Verified Layouts</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Weekly Passenger Bookings</span>
            <div className="text-2xl font-bold font-display text-white mt-1">
              3,568 Seats
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">+14.2% from last week</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Gross Fare Revenue</span>
            <div className="text-2xl font-bold font-display text-white mt-1">
              ₹{(selectedOperator.totalEarnings / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Direct Settlement via Escrow</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">On-Time Performance</span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              98.7%
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">1,334 of 1,534 trips punctual</span>
          </div>
        </div>

        {/* Tab 1: Bus Fleet & Seat Layouts */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Bus Fleet Configuration & Physical Seat Architecture
                </h3>
                <p className="text-xs text-slate-400">
                  Each bus maintains an authoritative cabin seat layout, lower/upper deck configuration, and pricing tiers
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBuilderOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Seat Layout Builder</span>
              </button>
            </div>

            {/* Bus Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-3.5 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{bus.operatorName}</div>
                      <div className="text-xs font-mono text-emerald-400">{bus.busNumber}</div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      APPROVED
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model:</span>
                      <strong className="text-white">{bus.busType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Berths:</span>
                      <strong className="text-white">{bus.totalSeats} Passenger Spaces</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Fare:</span>
                      <strong className="text-emerald-400">₹{bus.fareStartingFrom}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                    {bus.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {amenity}
                      </span>
                    ))}
                    {bus.amenities.length > 3 && (
                      <span className="text-slate-500 self-center">+{bus.amenities.length - 3} more</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {bus.sourceCity} ➜ {bus.destinationCity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBuilderOpen(true)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Layout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Routes & Schedules */}
        {activeTab === 'routes' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Daily Departures</h3>
            <div className="divide-y divide-slate-800 text-xs">
              {trips.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <strong className="text-white text-sm">{t.sourceCity} ➜ {t.destinationCity}</strong>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Departs {t.departureTime} · Arrives {t.arrivalTime} · {t.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold font-mono">₹{t.fareStartingFrom}</span>
                    <span className="text-[10px] text-slate-500 block">Authoritative Base Fare</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Passenger Manifests */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Passenger Reservations</h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-2">Passenger</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Departure Date</th>
                    <th className="pb-2">Allocated Berths</th>
                    <th className="pb-2">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="py-2.5">
                    <td className="py-2.5 font-bold text-white">Md. Shiraj</td>
                    <td className="text-slate-300">Chennai ➜ Bengaluru</td>
                    <td className="text-slate-400">16 Oct 2026</td>
                    <td className="font-mono text-emerald-400">L1A (Lower Sleeper)</td>
                    <td><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">PAID</span></td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-2.5 font-bold text-white">Ananya Iyer</td>
                    <td className="text-slate-300">Chennai ➜ Bengaluru</td>
                    <td className="text-slate-400">16 Oct 2026</td>
                    <td className="font-mono text-emerald-400">U2B (Upper Ladies)</td>
                    <td><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">PAID</span></td>
                  </tr>
                  <tr className="py-2.5">
                    <td className="py-2.5 font-bold text-white">Karthik Narayanan</td>
                    <td className="text-slate-300">Chennai ➜ Bengaluru</td>
                    <td className="text-slate-400">16 Oct 2026</td>
                    <td className="font-mono text-emerald-400">L3A, L3B</td>
                    <td><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">PAID</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Settlements & Statements */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Settlement Ledger & Escrow</h3>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Escrow Account Settlement Schedule:</span>
                <strong className="text-white text-sm">Next Payout: Friday, 23 Oct 2026 (Direct NEFT)</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Pending Escrow Balance:</span>
                <strong className="text-amber-400 text-base font-mono">₹{selectedOperator.pendingSettlement.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Partner Program */}
        {activeTab === 'partner_program' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Affiliate & Partner Commission System</h3>
            <p className="text-xs text-slate-400">
              Approved travel agents and corporate partners earn 10% commission on all completed bookings.
            </p>
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-200">
              Your Partner Referral Link: <code className="text-white bg-slate-900 px-2 py-0.5 rounded">https://app.apnatrips.com/?ref=SST-SOUTH</code>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Bus Layout Builder Modal */}
      {isBuilderOpen && (
        <BusLayoutBuilder
          operatorId={selectedOperator.id}
          operatorName={selectedOperator.businessName}
          onClose={() => setIsBuilderOpen(false)}
          onBusPublished={handleBusPublished}
        />
      )}

    </div>
  );
};
