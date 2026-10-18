import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Bus, 
  Building2, 
  Car, 
  FileSpreadsheet, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Download,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  Sliders,
  Check,
  Star
} from 'lucide-react';
import { 
  Booking, 
  FinancialLedgerEntry, 
  SupplierPartner, 
  SupportTicket, 
  UserProfile,
  BusTrip,
  ResortProperty,
  ResortRoom,
  Seat
} from '../types';
import { 
  getStoredLedger, 
  getStoredSuppliers, 
  getStoredTickets, 
  saveSuppliers, 
  saveTickets,
  getStoredBusTrips,
  saveBusTrips,
  getStoredResorts,
  saveResorts,
  getAdminPassword,
  setAdminPassword,
  verifyAdminPassword,
  isAdminAuthenticated,
  setAdminAuthenticated
} from '../services/storage';
import { ApnaTripsLogo } from './ApnaTripsLogo';
import { BRAND_IMAGES } from '../assets/imagePaths';
import { SupplierPortal } from './SupplierPortal';

interface AdminPortalProps {
  bookings: Booking[];
  currentUser: UserProfile;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  bookings,
  currentUser,
  onClose,
  onRefreshData,
}) => {
  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminAuthenticated());
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'kpi' | 'buses' | 'resorts' | 'suppliers' | 'bookings' | 'ledger' | 'security'>('kpi');
  
  // Data States
  const [busTrips, setBusTrips] = useState<BusTrip[]>(getStoredBusTrips());
  const [resorts, setResorts] = useState<ResortProperty[]>(getStoredResorts());
  const [suppliers, setSuppliers] = useState<SupplierPartner[]>(getStoredSuppliers());
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>(getStoredLedger());
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets());
  const [searchBookingQuery, setSearchBookingQuery] = useState('');

  // Password Change Modal / State
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Modals for Adding / Editing Fleets & Resorts
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [busFormData, setBusFormData] = useState({
    operatorName: 'Zingbus Premium Lounge',
    busNumber: 'DL-01-EQ-9876',
    busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    sourceCity: 'New Delhi',
    destinationCity: 'Manali',
    departureTime: '20:30',
    arrivalTime: '08:45',
    duration: '12h 15m',
    fareStartingFrom: 1450,
    hasLiveGps: true,
  });

  const [isResortModalOpen, setIsResortModalOpen] = useState(false);
  const [editingResortId, setEditingResortId] = useState<string | null>(null);
  const [resortFormData, setResortFormData] = useState({
    name: 'The Royal Haveli & Heritage Palace',
    city: 'Udaipur',
    state: 'Rajasthan',
    location: 'Lake Pichola Promenade',
    starRating: 5,
    startingPrice: 12500,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    description: 'Immerse in timeless royal grandeur with hand-carved jharokhas and marble courtyards.',
  });

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [inspectingPartner, setInspectingPartner] = useState<SupplierPartner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    businessName: '',
    ownerName: '',
    category: 'bus_operator' as 'bus_operator' | 'resort_hotel' | 'fleet_owner',
    phone: '+91 ',
    email: '',
    gstin: '',
    panNumber: '',
    commissionPercentage: 10,
    bankAccountMasked: 'HDFC Bank ••••••8821',
  });

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(loginPassword)) {
      setIsAuthenticated(true);
      setAdminAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Access Denied. Incorrect administrator password.');
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAdminAuthenticated(false);
    setLoginPassword('');
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!verifyAdminPassword(oldPasswordInput)) {
      setPasswordChangeError('Current master password does not match.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New password confirmation does not match.');
      return;
    }

    setAdminPassword(newPasswordInput);
    setPasswordChangeSuccess('Administrator password updated successfully! Please use this new password for next login.');
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  // Helper to generate default bus seats
  const generateSeats = (basePrice: number): Seat[] => {
    const seats: Seat[] = [];
    for (let i = 1; i <= 6; i++) {
      seats.push({ id: `L${i}A`, number: `L${i}A`, deck: 'lower', type: 'sleeper', status: 'available', price: basePrice + 200 });
      seats.push({ id: `L${i}B`, number: `L${i}B`, deck: 'lower', type: 'sleeper', status: 'available', price: basePrice + 200 });
      seats.push({ id: `U${i}A`, number: `U${i}A`, deck: 'upper', type: 'sleeper', status: 'available', price: basePrice + 350 });
      seats.push({ id: `U${i}B`, number: `U${i}B`, deck: 'upper', type: 'sleeper', status: 'available', price: basePrice + 350 });
    }
    for (let i = 1; i <= 6; i++) {
      seats.push({ id: `LS${i}`, number: `S${i}`, deck: 'lower', type: 'seater', status: 'available', price: basePrice });
    }
    return seats;
  };

  // Save or Update Bus Fleet
  const handleSaveBusFleet = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBusId) {
      const updated = busTrips.map(b => {
        if (b.id === editingBusId) {
          return {
            ...b,
            ...busFormData,
          };
        }
        return b;
      });
      setBusTrips(updated);
      saveBusTrips(updated);
    } else {
      const newTrip: BusTrip = {
        id: `bus-trip-${Date.now()}`,
        supplierId: 'sup-001',
        ...busFormData,
        rating: 4.8,
        reviewCount: 1,
        totalSeats: 30,
        availableSeatsCount: 30,
        amenities: ['Live GPS Tracking', 'Personal AC Vents', 'Reading Lights', 'USB Fast Charger', 'Blanket & Pillow', 'Mineral Water'],
        boardingPoints: [
          { location: `${busFormData.sourceCity} Main Terminal`, time: busFormData.departureTime },
        ],
        droppingPoints: [
          { location: `${busFormData.destinationCity} Stand`, time: busFormData.arrivalTime },
        ],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        gpsTripId: 'gps-trip-001',
        seats: generateSeats(busFormData.fareStartingFrom),
      };
      const updated = [newTrip, ...busTrips];
      setBusTrips(updated);
      saveBusTrips(updated);
    }

    setIsBusModalOpen(false);
    setEditingBusId(null);
    onRefreshData();
  };

  // Delete Bus Fleet
  const handleDeleteBusFleet = (id: string) => {
    if (confirm('Are you sure you want to delete this bus fleet schedule?')) {
      const updated = busTrips.filter(b => b.id !== id);
      setBusTrips(updated);
      saveBusTrips(updated);
      onRefreshData();
    }
  };

  // Save or Update Resort / Hotel
  const handleSaveResort = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResortId) {
      const updated = resorts.map(r => {
        if (r.id === editingResortId) {
          return {
            ...r,
            ...resortFormData,
          };
        }
        return r;
      });
      setResorts(updated);
      saveResorts(updated);
    } else {
      const newResort: ResortProperty = {
        id: `resort-${Date.now()}`,
        supplierId: 'sup-004',
        ...resortFormData,
        reviewsCount: 1,
        coverImage: BRAND_IMAGES.luxuryResort,
        amenities: ['Swimming Pool', 'Ayurvedic Spa', 'Complimentary Breakfast', 'WiFi', 'Airport Transfer'],
        cancellationPolicy: 'Complimentary cancellation up to 48 hours prior to check-in.',
        rooms: [
          {
            id: `room-${Date.now()}-1`,
            name: 'Royal Heritage Deluxe Room',
            description: 'Spacious royal room with private balcony.',
            bedType: '1 King Bed',
            maxOccupancy: 3,
            pricePerNight: resortFormData.startingPrice,
            amenities: ['Private Balcony', 'Bathtub', 'Luxury Rain Shower'],
            availableUnits: 5,
            photos: [BRAND_IMAGES.luxuryResort],
          },
        ],
      };
      const updated = [newResort, ...resorts];
      setResorts(updated);
      saveResorts(updated);
    }

    setIsResortModalOpen(false);
    setEditingResortId(null);
    onRefreshData();
  };

  // Delete Resort / Hotel
  const handleDeleteResort = (id: string) => {
    if (confirm('Are you sure you want to delete this hotel/resort listing?')) {
      const updated = resorts.filter(r => r.id !== id);
      setResorts(updated);
      saveResorts(updated);
      onRefreshData();
    }
  };

  // Save or Update Partner / Operator
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartnerId) {
      const updated = suppliers.map(s => {
        if (s.id === editingPartnerId) {
          return {
            ...s,
            businessName: partnerFormData.businessName,
            ownerName: partnerFormData.ownerName,
            category: partnerFormData.category,
            phone: partnerFormData.phone,
            email: partnerFormData.email,
            gstin: partnerFormData.gstin,
            panNumber: partnerFormData.panNumber,
            commissionPercentage: partnerFormData.commissionPercentage,
            bankAccountMasked: partnerFormData.bankAccountMasked,
          };
        }
        return s;
      });
      setSuppliers(updated);
      saveSuppliers(updated);
      setEditingPartnerId(null);
    } else {
      const newPartner: SupplierPartner = {
        id: `sup-${Date.now()}`,
        businessName: partnerFormData.businessName,
        ownerName: partnerFormData.ownerName,
        category: partnerFormData.category,
        phone: partnerFormData.phone,
        email: partnerFormData.email,
        gstin: partnerFormData.gstin,
        panNumber: partnerFormData.panNumber,
        kycStatus: 'APPROVED',
        commissionPercentage: partnerFormData.commissionPercentage,
        bankAccountMasked: partnerFormData.bankAccountMasked,
        totalTripsCount: 0,
        totalEarnings: 0,
        pendingSettlement: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [newPartner, ...suppliers];
      setSuppliers(updated);
      saveSuppliers(updated);
    }
    setIsPartnerModalOpen(false);
    onRefreshData();
  };

  // Delete Partner / Operator
  const handleDeletePartner = (id: string) => {
    if (confirm('Are you sure you want to remove this operator/partner?')) {
      const updated = suppliers.filter(s => s.id !== id);
      setSuppliers(updated);
      saveSuppliers(updated);
      onRefreshData();
    }
  };

  // Toggle KYC status
  const handleToggleKyc = (supplierId: string, currentStatus: string) => {
    const updated = suppliers.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          kycStatus: (currentStatus === 'APPROVED' ? 'REJECTED' : 'APPROVED') as 'APPROVED' | 'REJECTED',
        };
      }
      return s;
    });
    setSuppliers(updated);
    saveSuppliers(updated);
    onRefreshData();
  };

  // Export Financial Ledger as CSV
  const handleExportLedgerCsv = () => {
    const headers = 'ID,BookingID,Timestamp,Type,Account,Amount(INR),Description,ReferenceID\n';
    const rows = ledgerEntries
      .map(e => `"${e.id}","${e.bookingId}","${e.timestamp}","${e.type}","${e.account}",${e.amount},"${e.description}","${e.referenceId}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaTrips_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <ApnaTripsLogo variant="badge" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  ApnaTrips Super Admin & Operations Portal
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-mono font-bold">
                  {isAuthenticated ? 'ADMIN AUTHORIZED' : 'SECURE LOGIN GATE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exclusive Rights: Bus Fleet Management • Resort & Hotel Listings • Partner KYC & Commission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Log out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. PASSWORD AUTHENTICATION SCREEN (When not logged in) */}
        {!isAuthenticated && (
          <div className="p-8 max-w-md mx-auto my-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Administrator Password Required
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Only verified platform administrators have the authority to register new bus fleets, list hotels/resorts, manage operator partnerships, and modify commissions.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 pt-2 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Enter Master Password</span>
                  <span className="text-[10px] text-amber-600 font-normal">Default: Admin@ApnaTrips2026 or admin123</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Password & Open Admin Suite</span>
              </button>
            </form>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              🔒 <strong>Security Policy:</strong> Changes made here directly reflect across customer live inventory.
            </div>
          </div>
        )}

        {/* 2. AUTHENTICATED ADMIN WORKSPACE */}
        {isAuthenticated && (
          <>
            {/* Top Navigation Bar with Exclusive Admin Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('kpi')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'kpi'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview KPIs
              </button>
              
              <button
                onClick={() => setActiveTab('buses')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'buses'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bus className="w-3.5 h-3.5 text-amber-600" />
                <span>Bus Fleets & Schedules ({busTrips.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('resorts')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'resorts'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Hotels & Resorts ({resorts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('suppliers')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'suppliers'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Partners & Operators ({suppliers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Bookings Oversight ({bookings.length})
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'ledger'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Financial Ledger
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'border-amber-500 text-slate-900 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Password & Security</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: OVERVIEW KPIS */}
              {activeTab === 'kpi' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Total Fleet Schedules</span>
                        <Bus className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-bold font-display text-slate-900 mt-2">
                        {busTrips.length} Fleets
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                        Active on Delhi, Mumbai, Bengaluru routes
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Hotels & Luxury Resorts</span>
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold font-display text-slate-900 mt-2">
                        {resorts.length} Properties
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Palaces, Backwater villas, Hills
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Verified Partners</span>
                        <Users className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-bold font-display text-slate-900 mt-2">
                        {suppliers.length} Operators
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                        KYC Approved & Commission active
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>Gross Bookings Value</span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold font-display text-slate-900 mt-2 tabular-nums">
                        ₹{bookings.reduce((sum, b) => sum + b.financials.totalPayableAmount, 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Across {bookings.length} reservations
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-amber-900">
                        Admin Exclusive Privileges Enforced
                      </div>
                      <p className="mt-1 leading-relaxed text-amber-800">
                        Only authenticated administrators have write permissions to register new bus schedules, add luxury palace hotels/resorts, adjust ticket/room prices, update partner commission rates, and review operator documents.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUS FLEETS & SCHEDULES MANAGEMENT (ADMIN EXCLUSIVE) */}
              {activeTab === 'buses' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Bus Fleet Schedules & Dynamic Pricing
                      </h4>
                      <p className="text-xs text-slate-500">
                        Only Admin has right to add, update, and remove fleet inventory
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingBusId(null);
                        setBusFormData({
                          operatorName: 'Zingbus Premium Lounge',
                          busNumber: 'DL-01-XX-9900',
                          busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
                          sourceCity: 'New Delhi',
                          destinationCity: 'Manali',
                          departureTime: '21:00',
                          arrivalTime: '09:00',
                          duration: '12h 00m',
                          fareStartingFrom: 1450,
                          hasLiveGps: true,
                        });
                        setIsBusModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New Bus Fleet</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Operator & Reg #</th>
                          <th className="p-3">Route (From ➜ To)</th>
                          <th className="p-3">Timings</th>
                          <th className="p-3">Bus Specification</th>
                          <th className="p-3">Base Fare</th>
                          <th className="p-3">Live GPS</th>
                          <th className="p-3 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {busTrips.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{b.operatorName}</div>
                              <div className="text-[11px] font-mono text-slate-500">{b.busNumber}</div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-800">{b.sourceCity}</span>
                              <span className="text-slate-400 mx-1">➜</span>
                              <span className="font-semibold text-slate-800">{b.destinationCity}</span>
                            </td>
                            <td className="p-3 font-mono">
                              <div>{b.departureTime} - {b.arrivalTime}</div>
                              <div className="text-[10px] text-slate-400">{b.duration}</div>
                            </td>
                            <td className="p-3 max-w-[200px] truncate text-slate-600">
                              {b.busType}
                            </td>
                            <td className="p-3 font-bold font-mono text-slate-900 tabular-nums">
                              ₹{b.fareStartingFrom}
                            </td>
                            <td className="p-3">
                              {b.hasLiveGps ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-emerald-200">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[10px]">No</span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingBusId(b.id);
                                  setBusFormData({
                                    operatorName: b.operatorName,
                                    busNumber: b.busNumber,
                                    busType: b.busType,
                                    sourceCity: b.sourceCity,
                                    destinationCity: b.destinationCity,
                                    departureTime: b.departureTime,
                                    arrivalTime: b.arrivalTime,
                                    duration: b.duration,
                                    fareStartingFrom: b.fareStartingFrom,
                                    hasLiveGps: !!b.hasLiveGps,
                                  });
                                  setIsBusModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 rounded bg-slate-100 hover:bg-slate-200"
                                title="Edit Fleet"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBusFleet(b.id)}
                                className="p-1.5 text-red-600 hover:text-red-700 rounded bg-red-50 hover:bg-red-100"
                                title="Delete Fleet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RESORTS & HOTELS MANAGEMENT (ADMIN EXCLUSIVE) */}
              {activeTab === 'resorts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Luxury Resorts & Heritage Stays Inventory
                      </h4>
                      <p className="text-xs text-slate-500">
                        Only Admin has right to list new hotels, update suites, and adjust pricing
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingResortId(null);
                        setResortFormData({
                          name: 'Jaipur Royal Haveli Resort & Spa',
                          city: 'Jaipur',
                          state: 'Rajasthan',
                          location: 'Amer Fort Road',
                          starRating: 5,
                          startingPrice: 10500,
                          checkInTime: '14:00',
                          checkOutTime: '11:00',
                          description: 'Stunning royal palace retreat with private pool suites and cultural Mewari dining.',
                        });
                        setIsResortModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>List New Hotel / Resort</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Property Name</th>
                          <th className="p-3">Location & City</th>
                          <th className="p-3">Star Rating</th>
                          <th className="p-3">Starting Rate</th>
                          <th className="p-3">Rooms / Suites</th>
                          <th className="p-3 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resorts.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{r.name}</div>
                              <div className="text-[10px] text-slate-500 truncate max-w-xs">{r.description}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{r.city}, {r.state}</div>
                              <div className="text-[10px] text-slate-500">{r.location}</div>
                            </td>
                            <td className="p-3">
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {r.starRating}-Star
                              </span>
                            </td>
                            <td className="p-3 font-bold font-mono text-slate-900 tabular-nums">
                              ₹{r.startingPrice.toLocaleString('en-IN')}/night
                            </td>
                            <td className="p-3 font-semibold text-slate-700">
                              {r.rooms.length} Suite Type(s)
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingResortId(r.id);
                                  setResortFormData({
                                    name: r.name,
                                    city: r.city,
                                    state: r.state,
                                    location: r.location,
                                    starRating: r.starRating,
                                    startingPrice: r.startingPrice,
                                    checkInTime: r.checkInTime,
                                    checkOutTime: r.checkOutTime,
                                    description: r.description,
                                  });
                                  setIsResortModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 rounded bg-slate-100 hover:bg-slate-200"
                                title="Edit Property"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteResort(r.id)}
                                className="p-1.5 text-red-600 hover:text-red-700 rounded bg-red-50 hover:bg-red-100"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PARTNERS & OPERATORS MANAGEMENT (ADMIN EXCLUSIVE) */}
              {activeTab === 'suppliers' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Registered Operators & Partners Roster
                      </h4>
                      <p className="text-xs text-slate-500">
                        Verify business GSTIN, approve/suspend KYC, and configure commission rates
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPartnerId(null);
                        setPartnerFormData({
                          businessName: '',
                          ownerName: '',
                          category: 'bus_operator',
                          phone: '+91 ',
                          email: '',
                          gstin: '',
                          panNumber: '',
                          commissionPercentage: 10,
                          bankAccountMasked: 'HDFC Bank ••••••8821',
                        });
                        setIsPartnerModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Onboard New Partner / Operator</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Partner Company</th>
                          <th className="p-3">Domain</th>
                          <th className="p-3">Tax Identification</th>
                          <th className="p-3">KYC Status</th>
                          <th className="p-3">Commission %</th>
                          <th className="p-3">Pending Escrow</th>
                          <th className="p-3 text-right">Admin Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {suppliers.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{s.businessName}</div>
                              <div className="text-[10px] text-slate-500">Owner: {s.ownerName} · {s.phone}</div>
                            </td>
                            <td className="p-3 uppercase font-mono text-[10px] text-slate-600">
                              {s.category.replace('_', ' ')}
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <div>GST: {s.gstin}</div>
                              <div className="text-[10px] text-slate-400">PAN: {s.panNumber}</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.kycStatus === 'APPROVED' 
                                   ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {s.kycStatus}
                              </span>
                            </td>
                            <td className="p-3 font-bold font-mono">
                              {s.commissionPercentage}%
                            </td>
                            <td className="p-3 font-bold font-mono text-slate-900 tabular-nums">
                              ₹{s.pendingSettlement.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              {/* Preview operator console */}
                              <button
                                onClick={() => setInspectingPartner(s)}
                                className="p-1.5 text-slate-600 hover:text-amber-600 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                                title="Inspect Operator Console"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Edit partner info */}
                              <button
                                onClick={() => {
                                  setEditingPartnerId(s.id);
                                  setPartnerFormData({
                                    businessName: s.businessName,
                                    ownerName: s.ownerName,
                                    category: s.category,
                                    phone: s.phone,
                                    email: s.email,
                                    gstin: s.gstin,
                                    panNumber: s.panNumber,
                                    commissionPercentage: s.commissionPercentage,
                                    bankAccountMasked: s.bankAccountMasked,
                                  });
                                  setIsPartnerModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                                title="Edit Partner Details & Commission"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle KYC Status */}
                              <button
                                onClick={() => handleToggleKyc(s.id, s.kycStatus)}
                                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                                  s.kycStatus === 'APPROVED'
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                }`}
                              >
                                {s.kycStatus === 'APPROVED' ? 'Suspend' : 'Approve'}
                              </button>

                              {/* Delete partner */}
                              <button
                                onClick={() => handleDeletePartner(s.id)}
                                className="p-1.5 text-red-600 hover:text-red-700 rounded bg-red-50 hover:bg-red-100 transition-colors"
                                title="Delete Operator / Partner"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: BOOKINGS OVERSIGHT */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchBookingQuery}
                        onChange={(e) => setSearchBookingQuery(e.target.value)}
                        placeholder="Search by PNR, Booking Reference, Customer Name..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Reference / PNR</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Trip / Service</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings
                          .filter(b => 
                            b.bookingReference.toLowerCase().includes(searchBookingQuery.toLowerCase()) ||
                            b.pnrNumber.toLowerCase().includes(searchBookingQuery.toLowerCase()) ||
                            b.customerName.toLowerCase().includes(searchBookingQuery.toLowerCase())
                          )
                          .map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-mono font-bold text-slate-900">
                                <div>{b.bookingReference}</div>
                                <div className="text-[10px] text-slate-500 font-normal">PNR: {b.pnrNumber}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-slate-800">{b.customerName}</div>
                                <div className="text-[10px] text-slate-500">{b.customerPhone}</div>
                              </td>
                              <td className="p-3 uppercase font-mono text-[10px] font-semibold text-slate-700">
                                {b.category}
                              </td>
                              <td className="p-3 max-w-[200px] truncate">
                                <div className="font-medium text-slate-800 truncate">{b.tripDetails.title}</div>
                                <div className="text-[10px] text-slate-500">{b.tripDetails.travelDate}</div>
                              </td>
                              <td className="p-3 font-bold tabular-nums">
                                ₹{b.financials.totalPayableAmount.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === 'CONFIRMED' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: FINANCIAL LEDGER */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Immutable Financial Ledger Records
                      </h4>
                      <p className="text-xs text-slate-500">
                        Double-entry accounting journal with GST & Gateway reconciliations
                      </p>
                    </div>

                    <button
                      onClick={handleExportLedgerCsv}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Journal</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Entry ID</th>
                          <th className="p-3">Account Domain</th>
                          <th className="p-3">D/C</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              {entry.timestamp}
                            </td>
                            <td className="p-3 font-mono text-slate-900 font-semibold">
                              {entry.id}
                            </td>
                            <td className="p-3 font-mono text-[11px] font-bold text-slate-700">
                              {entry.account}
                            </td>
                            <td className="p-3 font-bold font-mono">
                              <span className={entry.type === 'CREDIT' ? 'text-emerald-700' : 'text-red-700'}>
                                {entry.type}
                              </span>
                            </td>
                            <td className="p-3 font-bold tabular-nums font-mono text-slate-900">
                              ₹{entry.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 text-slate-600 max-w-xs truncate">
                              {entry.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: ADMIN PASSWORD & SECURITY MANAGEMENT */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-5 py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-display">
                      Change Administrator Master Password
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ensure your privileged admin credentials remain secure
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
                      <input
                        type="password"
                        value={oldPasswordInput}
                        onChange={(e) => setOldPasswordInput(e.target.value)}
                        placeholder="Enter current password..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">New Administrator Password</label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Min 6 characters..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-type new password..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>

                    {passwordChangeError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                        {passwordChangeError}
                      </div>
                    )}

                    {passwordChangeSuccess && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{passwordChangeSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      Update Admin Password
                    </button>
                  </form>
                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* --- MODAL 1: REGISTER / EDIT BUS FLEET --- */}
      {isBusModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-4 h-4 text-amber-600" />
                <span>{editingBusId ? 'Edit Bus Fleet Details' : 'Register New Bus Fleet (Admin)'}</span>
              </h4>
              <button onClick={() => setIsBusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBusFleet} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={busFormData.operatorName}
                    onChange={(e) => setBusFormData({ ...busFormData, operatorName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registration #</label>
                  <input
                    type="text"
                    value={busFormData.busNumber}
                    onChange={(e) => setBusFormData({ ...busFormData, busNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bus Model / Specification</label>
                <input
                  type="text"
                  value={busFormData.busType}
                  onChange={(e) => setBusFormData({ ...busFormData, busType: e.target.value })}
                  placeholder="e.g. Volvo 9600 Multi-Axle AC Sleeper"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source City (Origin)</label>
                  <input
                    type="text"
                    value={busFormData.sourceCity}
                    onChange={(e) => setBusFormData({ ...busFormData, sourceCity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination City</label>
                  <input
                    type="text"
                    value={busFormData.destinationCity}
                    onChange={(e) => setBusFormData({ ...busFormData, destinationCity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Departure</label>
                  <input
                    type="text"
                    value={busFormData.departureTime}
                    onChange={(e) => setBusFormData({ ...busFormData, departureTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Arrival</label>
                  <input
                    type="text"
                    value={busFormData.arrivalTime}
                    onChange={(e) => setBusFormData({ ...busFormData, arrivalTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={busFormData.fareStartingFrom}
                    onChange={(e) => setBusFormData({ ...busFormData, fareStartingFrom: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBusModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg shadow-sm"
                >
                  Save Bus Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER / EDIT HOTEL OR RESORT --- */}
      {isResortModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>{editingResortId ? 'Edit Property Details' : 'List New Hotel / Resort (Admin)'}</span>
              </h4>
              <button onClick={() => setIsResortModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResort} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hotel / Resort Name</label>
                <input
                  type="text"
                  value={resortFormData.name}
                  onChange={(e) => setResortFormData({ ...resortFormData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={resortFormData.city}
                    onChange={(e) => setResortFormData({ ...resortFormData, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={resortFormData.state}
                    onChange={(e) => setResortFormData({ ...resortFormData, state: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location / Landmark Area</label>
                <input
                  type="text"
                  value={resortFormData.location}
                  onChange={(e) => setResortFormData({ ...resortFormData, location: e.target.value })}
                  placeholder="e.g. Lake Pichola Promenade"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Star Category</label>
                  <select
                    value={resortFormData.starRating}
                    onChange={(e) => setResortFormData({ ...resortFormData, starRating: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value={3}>3-Star Comfort</option>
                    <option value={4}>4-Star Premium</option>
                    <option value={5}>5-Star Royal Palace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Starting Price / Night (₹)</label>
                  <input
                    type="number"
                    value={resortFormData.startingPrice}
                    onChange={(e) => setResortFormData({ ...resortFormData, startingPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Heritage Ambiance</label>
                <textarea
                  value={resortFormData.description}
                  onChange={(e) => setResortFormData({ ...resortFormData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResortModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg shadow-sm"
                >
                  Save Hotel / Resort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ONBOARD NEW PARTNER --- */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>{editingPartnerId ? 'Edit Operator & Partner Details (Admin)' : 'Onboard New Travel Partner (Admin)'}</span>
              </h4>
              <button 
                onClick={() => {
                  setIsPartnerModalOpen(false);
                  setEditingPartnerId(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company / Legal Name</label>
                  <input
                    type="text"
                    value={partnerFormData.businessName}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, businessName: e.target.value })}
                    placeholder="e.g. Parveen Travels Pvt Ltd"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Director / Owner Name</label>
                  <input
                    type="text"
                    value={partnerFormData.ownerName}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, ownerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category Domain</label>
                  <select
                    value={partnerFormData.category}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="bus_operator">Bus Operator</option>
                    <option value="resort_hotel">Resort & Hotel Trust</option>
                    <option value="fleet_owner">Cab & Auto Fleet Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    value={partnerFormData.commissionPercentage}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, commissionPercentage: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={partnerFormData.gstin}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, gstin: e.target.value })}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={partnerFormData.panNumber}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, panNumber: e.target.value })}
                    placeholder="AAAAA0000A"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={partnerFormData.phone}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={partnerFormData.email}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                    placeholder="partners@example.com"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsPartnerModalOpen(false);
                    setEditingPartnerId(null);
                  }}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg shadow-sm"
                >
                  {editingPartnerId ? 'Save Changes' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW OPERATOR CONSOLE (ISOLATED INSIDE ADMIN PORTAL) --- */}
      {inspectingPartner && (
        <SupplierPortal
          currentUser={currentUser}
          supplier={inspectingPartner}
          onClose={() => setInspectingPartner(null)}
        />
      )}

    </div>
  );
};
