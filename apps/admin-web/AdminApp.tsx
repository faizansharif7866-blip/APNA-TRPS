import React, { useState, useEffect } from 'react';
import { 
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
  Star,
  Compass,
  FileText,
  MapPin,
  Clock,
  Ticket,
  Mail,
  PhoneCall,
  Activity,
  Layers,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Settings,
  HelpCircle
} from 'lucide-react';
import { 
  AdminUser, 
  AdminRole, 
  OperatorOrganization, 
  BusFleetConfiguration, 
  BusTrip, 
  Booking, 
  PaymentTransaction, 
  RefundRecord, 
  CouponOffer, 
  SupportTicket, 
  AuditLogEntry 
} from '../../packages/shared-types/index.js';
import { ApnaTripsLogo } from '../../src/components/ApnaTripsLogo.js';
import { ToastContainer, showToast } from '../../src/components/Toast.js';

type AdminTab = 
  | 'overview' 
  | 'operators' 
  | 'fleet' 
  | 'routes' 
  | 'trips' 
  | 'bookings' 
  | 'payments' 
  | 'refunds' 
  | 'commissions' 
  | 'coupons' 
  | 'support' 
  | 'audit' 
  | 'settings';

export const AdminApp: React.FC = () => {
  // Session & Authentication
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('apnatrips_admin_token'));
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('apnatrips_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@apnatrips.com');
  const [loginPassword, setLoginPassword] = useState('ApnaTripsAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Authoritative data states loaded from shared backend
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [operators, setOperators] = useState<OperatorOrganization[]>([]);
  const [busConfigs, setBusConfigs] = useState<BusFleetConfiguration[]>([]);
  const [trips, setTrips] = useState<BusTrip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<CouponOffer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Quick Action Modals
  const [selectedOperatorForReview, setSelectedOperatorForReview] = useState<OperatorOrganization | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customCommissionRate, setCustomCommissionRate] = useState<number>(10);
  const [showNewCouponModal, setShowNewCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all backend data with admin bearer token
  const loadAdminData = async (token = adminToken) => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const [resOverview, resOps, resBuses, resBookings, resCoupons, resTickets, resAudit] = await Promise.all([
        fetch('/api/admin/overview', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/operators', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/buses', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/bookings', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/coupons', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/tickets', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/audit-logs', { headers }).then((r) => r.json()).catch(() => null),
      ]);

      if (resOverview?.kpi) setOverviewStats(resOverview.kpi);
      if (resOps?.operators) setOperators(resOps.operators);
      if (resBuses?.buses) setBusConfigs(resBuses.buses);
      if (resBuses?.trips) setTrips(resBuses.trips);
      if (resBookings?.bookings) setBookings(resBookings.bookings);
      if (resCoupons?.coupons) setCoupons(resCoupons.coupons);
      if (resTickets?.tickets) setTickets(resTickets.tickets);
      if (resAudit?.auditLogs) setAuditLogs(resAudit.auditLogs);
    } catch (err) {
      console.error('Failed to load admin records:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (adminToken && currentAdmin) {
      loadAdminData();
    }
  }, [adminToken]);

  // Handle Dedicated Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Authentication failed. Please verify credentials.');
        setLoginLoading(false);
        return;
      }

      setAdminToken(data.token);
      setCurrentAdmin(data.user);
      localStorage.setItem('apnatrips_admin_token', data.token);
      localStorage.setItem('apnatrips_admin_user', JSON.stringify(data.user));
      showToast(`Welcome, ${data.user.name} (${data.user.role})!`, 'success');
      loadAdminData(data.token);
    } catch (err: any) {
      setLoginError('Could not connect to authentication server. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setCurrentAdmin(null);
    localStorage.removeItem('apnatrips_admin_token');
    localStorage.removeItem('apnatrips_admin_user');
    showToast('Administrator session closed securely.', 'info');
  };

  // Operator Approval Action
  const handleApproveOperator = async (id: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/operators/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setSelectedOperatorForReview(null);
        loadAdminData();
      } else {
        showToast(data.message || 'Failed to approve operator', 'error');
      }
    } catch {
      showToast('Error approving operator.', 'error');
    }
  };

  // Operator Rejection Action
  const handleRejectOperator = async (id: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/operators/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'info');
        setSelectedOperatorForReview(null);
        setRejectionReason('');
        loadAdminData();
      }
    } catch {
      showToast('Error rejecting operator.', 'error');
    }
  };

  // Commission Update Action
  const handleUpdateCommission = async (id: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/operators/${id}/commission`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ percentage: customCommissionRate }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        loadAdminData();
      }
    } catch {
      showToast('Error updating commission rate.', 'error');
    }
  };

  // Process Verified Refund Action
  const handleProcessRefund = async (bookingId: string) => {
    if (!adminToken) return;
    if (!confirm('Are you sure you want to approve this verified refund?')) return;
    try {
      const res = await fetch(`/api/admin/refunds/${bookingId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ reason: 'Admin approved customer cancellation' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        loadAdminData();
      } else {
        showToast(data.message || 'Refund processing failed', 'error');
      }
    } catch {
      showToast('Error communicating with payment gateway.', 'error');
    }
  };

  // Create Promo Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newCouponCode) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: newCouponCode,
          title: newCouponTitle || `${newCouponCode} Promo`,
          discountPercentage: 0,
          maxDiscount: newCouponDiscount,
          minBookingAmount: 500,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${newCouponCode} active!`, 'success');
        setShowNewCouponModal(false);
        setNewCouponCode('');
        setNewCouponTitle('');
        loadAdminData();
      }
    } catch {
      showToast('Failed to create coupon.', 'error');
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED ADMINISTRATOR LOGIN PAGE
  // -------------------------------------------------------------
  if (!adminToken || !currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
        <ToastContainer />

        <div className="w-full max-w-md">
          {/* Logo & Portal Identity */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-4 shadow-xl">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-display">
              Apna<span className="text-blue-500">Trips</span> Operations Console
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              admin.apnatrips.com · Dedicated Administrative Gateway
            </p>
          </div>

          {/* Secure Login Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Authorized Personnel Only
                </span>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-mono">
                256-Bit SSL
              </span>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Administrator Work Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@apnatrips.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Authenticate & Enter Console</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <span className="font-semibold text-slate-300 block">Pre-Provisioned Admin Roles:</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => { setLoginEmail('admin@apnatrips.com'); setLoginPassword('ApnaTripsAdmin@2026'); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left text-blue-300"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('ops@apnatrips.com'); setLoginPassword('ApnaTripsAdmin@2026'); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left text-emerald-300"
                >
                  🛠️ Operations
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('finance@apnatrips.com'); setLoginPassword('ApnaTripsAdmin@2026'); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left text-amber-300"
                >
                  💰 Finance
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('support.lead@apnatrips.com'); setLoginPassword('ApnaTripsAdmin@2026'); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left text-purple-300"
                >
                  🎧 Support Lead
                </button>
              </div>
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="mt-6 text-center text-[10px] text-slate-500 space-y-1">
            <p>Protected by ApnaTrips Identity & Access Management (IAM).</p>
            <p>Unauthorized access attempts are monitored and recorded with client IP.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FULL ADMINISTRATOR APP & DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ToastContainer />

      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-display">
                Apna<span className="text-blue-500">Trips</span>
              </span>
              <span className="bg-blue-950 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-800 font-bold">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              admin.apnatrips.com · Connected to Core API (api.apnatrips.com)
            </p>
          </div>
        </div>

        {/* User Session Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white">{currentAdmin.name}</span>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
              {currentAdmin.role.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={() => loadAdminData()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh All Server Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
            title="Sign out of administrative session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Administrative Layout with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation Modules
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('operators')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'operators'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" />
              <span>Operator & KYC</span>
            </div>
            {operators.filter((o) => o.kycStatus === 'PENDING_VERIFICATION').length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                {operators.filter((o) => o.kycStatus === 'PENDING_VERIFICATION').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'fleet'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Fleet & Seat Layouts</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'trips'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Trips & Schedules</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Bookings & Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('refunds')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'refunds'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Refunds & Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Coupons & Offers</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Customer Grievances</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Security & Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Roles & Permissions</span>
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Executive KPI Dashboard</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verified financial records and operations telemetry synchronized across all platforms.
                </p>
              </div>

              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Gross Booking Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    ₹{overviewStats ? Number(overviewStats.totalGrossRevenue).toLocaleString('en-IN') : '3,598'}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                    100% verified payment records
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Confirmed Bookings</span>
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {overviewStats ? overviewStats.confirmedBookings : bookings.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Live tickets with issued PNRs
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Registered Operators</span>
                    <Building2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {operators.length}
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1 font-semibold">
                    {operators.filter((o) => o.kycStatus === 'PENDING_VERIFICATION').length} pending approval
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Active Fleet Buses</span>
                    <Bus className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {busConfigs.length}
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-1">
                    Validated seat configurations
                  </div>
                </div>
              </div>

              {/* Pending Operator Approvals Alert Box */}
              {operators.some((o) => o.kycStatus === 'PENDING_VERIFICATION') && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">
                        Pending Partner Verification Action Required
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {operators.filter((o) => o.kycStatus === 'PENDING_VERIFICATION').length} bus operator application(s) awaiting KYC and tax compliance review.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('operators')}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition-colors"
                  >
                    Review Applications
                  </button>
                </div>
              )}

              {/* Recent Booking Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-400" />
                    <span>Recent Customer Bookings</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All ({bookings.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono">
                        <th className="pb-3 font-semibold">PNR NUMBER</th>
                        <th className="pb-3 font-semibold">PASSENGER</th>
                        <th className="pb-3 font-semibold">ROUTE</th>
                        <th className="pb-3 font-semibold">SEAT(S)</th>
                        <th className="pb-3 font-semibold">FARE</th>
                        <th className="pb-3 font-semibold">STATUS</th>
                        <th className="pb-3 font-semibold">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-850/50">
                          <td className="py-3 font-mono font-bold text-blue-400">{b.pnrNumber}</td>
                          <td className="py-3 font-medium text-white">{b.passengerName || 'Traveler'}</td>
                          <td className="py-3 text-slate-300">{b.source} ➜ {b.destination}</td>
                          <td className="py-3 font-mono text-emerald-400">
                            {b.seatNumbers?.join(', ') || 'Auto'}
                          </td>
                          <td className="py-3 font-bold text-white">₹{b.totalFare}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              b.bookingStatus === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            {b.bookingStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => handleProcessRefund(b.id)}
                                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                              >
                                Issue Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATOR & KYC MANAGEMENT */}
          {activeTab === 'operators' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Bus Operator & Partner Management</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Review legal documents, verify GSTIN/PAN compliance, and approve partner access.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {operators.map((op) => (
                  <div
                    key={op.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{op.businessName}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            op.kycStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : op.kycStatus === 'PENDING_VERIFICATION'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {op.kycStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Owner: {op.ownerName} · Phone: {op.phone} · Email: {op.email}
                        </p>
                      </div>

                      {/* Approval / Rejection Controls */}
                      <div className="flex items-center gap-2">
                        {op.kycStatus === 'PENDING_VERIFICATION' && (
                          <>
                            <button
                              onClick={() => handleApproveOperator(op.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/20"
                            >
                              Approve Partner
                            </button>
                            <button
                              onClick={() => setSelectedOperatorForReview(op)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {op.kycStatus === 'APPROVED' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Commission:</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono text-xs font-bold">
                              {op.commissionPercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-mono">GSTIN NUMBER</span>
                        <span className="font-mono font-bold text-slate-200">{op.gstin}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-mono">PAN NUMBER</span>
                        <span className="font-mono font-bold text-slate-200">{op.panNumber}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-mono">BANK SETTLEMENT</span>
                        <span className="font-medium text-slate-200">{op.bankAccountMasked}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-mono">REGISTERED BUSES</span>
                        <span className="font-bold text-blue-400">{op.registeredBusCount || 0} Vehicles</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FLEET & SEAT LAYOUTS OVERSIGHT */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Bus Fleet & Seat Layout Oversight</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect bus configurations, upper/lower decks, and verify server-certified safety compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {busConfigs.map((bus) => (
                  <div key={bus.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{bus.busName}</h3>
                        <p className="text-xs text-blue-400 font-mono font-bold">{bus.registrationNumber}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Operator: {bus.operatorName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        SAFETY CERTIFIED
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">CATEGORY</span>
                        <span className="capitalize text-slate-200">{bus.category}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">DECK TYPE</span>
                        <span className="capitalize text-slate-200">{bus.deckType}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">SEATS COUNT</span>
                        <span className="text-emerald-400 font-bold">
                          {bus.positions.filter((p) => ['seater', 'semi_sleeper', 'single_sleeper', 'double_sleeper'].includes(p.type)).length} Berths
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Safety markers: Emergency Exits, Staircases & Doors Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRIPS & SCHEDULES */}
          {activeTab === 'trips' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Trips & Operational Schedules</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active journeys, departure windows, and live passenger availability.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {trip.sourceCity} ➜ {trip.destinationCity}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {trip.busNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {trip.operatorName} · {trip.busType}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">DEPARTURE</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">{trip.departureTime} HRS</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">TOTAL SEATS</span>
                        <span className="font-bold text-white">{trip.totalSeats}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">AVAILABLE</span>
                        <span className="font-bold text-emerald-400">{trip.availableSeatsCount}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">STARTING FARE</span>
                        <span className="font-bold text-white font-mono">₹{trip.fareStartingFrom}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">OPERATIONAL RATING</span>
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          ★ {trip.rating} ({trip.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BOOKINGS & REFUNDS */}
          {(activeTab === 'bookings' || activeTab === 'refunds') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Bookings & Financial Transactions</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Master ledger of customer bookings, payment gateway IDs, and verified refund authorizations.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-4 font-semibold">PNR</th>
                      <th className="p-4 font-semibold">PASSENGER DETAILS</th>
                      <th className="p-4 font-semibold">OPERATOR</th>
                      <th className="p-4 font-semibold">JOURNEY DATE</th>
                      <th className="p-4 font-semibold">SEAT(S)</th>
                      <th className="p-4 font-semibold">TOTAL FARE</th>
                      <th className="p-4 font-semibold">STATUS</th>
                      <th className="p-4 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-850">
                        <td className="p-4 font-mono font-bold text-blue-400">{b.pnrNumber}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{b.passengerName || 'Passenger'}</div>
                          <div className="text-[11px] text-slate-400">{b.passengerPhone}</div>
                        </td>
                        <td className="p-4 text-slate-300">{b.operatorOrHost}</td>
                        <td className="p-4 font-mono text-slate-400">{b.travelDate}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          {b.seatNumbers?.join(', ') || 'Auto'}
                        </td>
                        <td className="p-4 font-mono font-bold text-white">₹{b.totalFare}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {b.bookingStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => handleProcessRefund(b.id)}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Authorize Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Coupons & Promotional Offers</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage active discount vouchers and marketing incentives.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewCouponModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-lg">
                        {c.code}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">ACTIVE</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400">
                      Max discount: ₹{c.maxDiscount} · Min booking: ₹{c.minBookingAmount}
                    </p>
                    <div className="pt-2 text-[10px] text-slate-500 font-mono">
                      Usage count: {c.usageCount} redemptions
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Coupon Modal */}
              {showNewCouponModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
                    <h3 className="text-base font-bold text-white">Create New Coupon</h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Coupon Code</label>
                        <input
                          type="text"
                          required
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          placeholder="FESTIVE100"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={newCouponTitle}
                          onChange={(e) => setNewCouponTitle(e.target.value)}
                          placeholder="Festival Special Discount"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Discount Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowNewCouponModal(false)}
                          className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                        >
                          Save Coupon
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CUSTOMER GRIEVANCES & SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Customer Support & Grievance Tickets</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Complaints and inquiries routed directly to the Grievance Officer under Consumer Protection Act.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-400 text-xs">{t.ticketNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {t.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{t.subject}</h3>
                    <p className="text-xs text-slate-300">{t.message}</p>
                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Customer: {t.customerName} ({t.customerPhone})</span>
                      <span>Assigned to: {t.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT & SECURITY LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Security & Audit Logs</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable chronological log of all sensitive administrative actions and security verifications.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">by {log.actorEmail}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ROLES & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">System Settings & Role-Based Permissions</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Authorization matrix enforcing strict separation of duties.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white text-sm">Super Administrator</h3>
                  <p className="text-slate-400">Full system oversight, operator approval, fee configuration, server settings.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white text-sm">Operations Manager</h3>
                  <p className="text-slate-400">Fleet compliance, route scheduling, passenger manifests, trip monitoring.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white text-sm">Finance Manager</h3>
                  <p className="text-slate-400">Transaction reconciliation, refund execution, ledger audits, partner payouts.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <h3 className="font-bold text-white text-sm">Customer Support Lead</h3>
                  <p className="text-slate-400">Grievance ticket resolution, PNR verification, customer contact desk.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
export default AdminApp;
