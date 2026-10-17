import React, { useState, useEffect } from 'react';
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
  PhoneCall,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Check
} from 'lucide-react';
import { 
  OperatorOrganization, 
  BusFleetConfiguration, 
  BusTrip, 
  Booking 
} from '../../packages/shared-types/index.js';
import { BusLayoutBuilder } from '../../src/components/BusLayoutBuilder.js';
import { ToastContainer, showToast } from '../../src/components/Toast.js';

type OperatorTab = 'fleet' | 'routes' | 'bookings' | 'settlements' | 'compliance';

export const PartnerApp: React.FC = () => {
  // Authentication & Session
  const [operatorToken, setOperatorToken] = useState<string | null>(() => localStorage.getItem('apnatrips_op_token'));
  const [currentOperator, setCurrentOperator] = useState<OperatorOrganization | null>(() => {
    const saved = localStorage.getItem('apnatrips_op_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auth UI mode: 'login' | 'register' | 'pending_verification'
  const [authView, setAuthView] = useState<'login' | 'register' | 'pending_verification'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('operations@srisaitravels.in');
  const [loginPassword, setLoginPassword] = useState('OperatorPass@2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [regForm, setRegForm] = useState({
    businessName: '',
    tradeName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    gstin: '',
    panNumber: '',
    bankName: 'HDFC Bank',
    bankAccount: '',
    bankIfsc: '',
    headOfficeAddress: '',
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Operator Data States
  const [activeTab, setActiveTab] = useState<OperatorTab>('fleet');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [buses, setBuses] = useState<BusFleetConfiguration[]>([]);
  const [trips, setTrips] = useState<BusTrip[]>([]);
  const [selectedTripForManifest, setSelectedTripForManifest] = useState<BusTrip | null>(null);
  const [manifestData, setManifestData] = useState<any[]>([]);
  const [loadingManifest, setLoadingManifest] = useState(false);

  // Fetch operator's scoped dashboard from backend
  const loadOperatorData = async (token = operatorToken) => {
    if (!token) return;
    try {
      const res = await fetch('/api/operator/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.operator) {
        setCurrentOperator(data.operator);
        setDashboardStats(data.stats);
        if (data.buses) setBuses(data.buses);
        if (data.trips) setTrips(data.trips);
      }
    } catch (err) {
      console.error('Failed to load operator records:', err);
    }
  };

  useEffect(() => {
    if (operatorToken && currentOperator) {
      loadOperatorData();
    }
  }, [operatorToken]);

  // Handle Partner Login
  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (data.isPending) {
        setCurrentOperator(data.operator);
        setAuthView('pending_verification');
        setLoginLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Login failed. Please check credentials.');
        setLoginLoading(false);
        return;
      }

      setOperatorToken(data.token);
      setCurrentOperator(data.operator);
      localStorage.setItem('apnatrips_op_token', data.token);
      localStorage.setItem('apnatrips_op_user', JSON.stringify(data.operator));
      showToast(`Welcome, ${data.operator.businessName}!`, 'success');
      loadOperatorData(data.token);
    } catch {
      setLoginError('Error connecting to operator authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Partner Registration
  const handleOperatorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/operator/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          bankAccountMasked: `${regForm.bankName} ··· ${regForm.bankAccount.slice(-4) || '9981'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegError(data.message || 'Registration failed. Please check details.');
        setRegLoading(false);
        return;
      }

      setCurrentOperator(data.operator);
      setAuthView('pending_verification');
      showToast('Registration submitted! Awaiting KYC verification.', 'success');
    } catch {
      setRegError('Error submitting registration.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleOperatorLogout = () => {
    setOperatorToken(null);
    setCurrentOperator(null);
    localStorage.removeItem('apnatrips_op_token');
    localStorage.removeItem('apnatrips_op_user');
    showToast('Signed out of partner portal.', 'info');
  };

  // View Trip Passenger Manifest
  const handleViewManifest = async (trip: BusTrip) => {
    setSelectedTripForManifest(trip);
    setLoadingManifest(true);
    try {
      const res = await fetch(`/api/operator/trips/${trip.id}/manifest`, {
        headers: { Authorization: `Bearer ${operatorToken}` },
      });
      const data = await res.json();
      if (data.manifest) {
        setManifestData(data.manifest);
      }
    } catch {
      showToast('Error loading manifest.', 'error');
    } finally {
      setLoadingManifest(false);
    }
  };

  // Callback when bus is published in layout builder
  const handleBusPublished = (config: BusFleetConfiguration) => {
    setIsBuilderOpen(false);
    loadOperatorData();
    showToast(`Bus ${config.busName} (${config.registrationNumber}) added to active fleet!`, 'success');
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED PARTNER AUTHENTICATION (LOGIN & REGISTRATION)
  // -------------------------------------------------------------
  if (!operatorToken || !currentOperator || currentOperator.kycStatus === 'PENDING_VERIFICATION') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-purple-600 selection:text-white">
        <ToastContainer />

        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/30 text-purple-400 mb-4 shadow-xl">
              <Building2 className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-display">
              Apna<span className="text-purple-400">Trips</span> Partner Network
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              partners.apnatrips.com · Bus Operator & Fleet Management Portal
            </p>
          </div>

          {/* Pending Verification Notice Screen */}
          {authView === 'pending_verification' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Clock className="w-8 h-8" />
              </div>

              <h2 className="text-lg font-bold text-white">Application Pending Verification</h2>
              
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
                <div><span className="text-slate-500">BUSINESS:</span> <span className="text-white font-bold">{currentOperator?.businessName}</span></div>
                <div><span className="text-slate-500">GSTIN:</span> <span className="text-purple-400 font-bold">{currentOperator?.gstin}</span></div>
                <div><span className="text-slate-500">STATUS:</span> <span className="text-amber-400 font-bold">PENDING COMPLIANCE CHECK</span></div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you for applying to the ApnaTrips Partner Network. In accordance with Ministry of Road Transport regulations, our fleet compliance desk is verifying your registration and tax credentials.
              </p>

              <div className="pt-2 text-xs text-slate-400">
                <span>Need expedited onboarding? Contact Partner Desk: </span>
                <a href="tel:180027628747" className="text-emerald-400 font-bold hover:underline">
                  1800-APNA-TRIP (Option 3)
                </a>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Sign In Screen */}
          {authView === 'login' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Partner Sign In
                </h2>
                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Apply as New Operator ➜
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleOperatorLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Operator Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="operations@srisaitravels.in"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Operator Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>Access Operator Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Verified Operator Demo Helper */}
              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1.5">Verified Fleet Demo Account:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('operations@srisaitravels.in');
                    setLoginPassword('OperatorPass@2026');
                  }}
                  className="w-full p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left text-purple-300 font-mono text-[11px] flex items-center justify-between"
                >
                  <span>🚌 Sri Sai Travels (KYC Approved)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Auto-Fill</span>
                </button>
              </div>
            </div>
          )}

          {/* Registration Screen */}
          {authView === 'register' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Partner & Fleet Registration
                </h2>
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Existing Operator? Sign In
                </button>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {regError}
                </div>
              )}

              <form onSubmit={handleOperatorRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Business / Legal Entity Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.businessName}
                    onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                    placeholder="Sri Balaji Roadlines Private Limited"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Owner / Director Name</label>
                    <input
                      type="text"
                      required
                      value={regForm.ownerName}
                      onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                      placeholder="M. Balaji"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Operations Phone</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+91 98400 12345"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Official Email</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="ops@balajitravels.in"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Create Password</label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={regForm.gstin}
                      onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value.toUpperCase() })}
                      placeholder="33AAAAA0000A1Z5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">PAN Number</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={regForm.panNumber}
                      onChange={(e) => setRegForm({ ...regForm, panNumber: e.target.value.toUpperCase() })}
                      placeholder="AAAAA0000A"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Bank Settlement Account</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={regForm.bankAccount}
                      onChange={(e) => setRegForm({ ...regForm, bankAccount: e.target.value })}
                      placeholder="Account Number"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                    <input
                      type="text"
                      required
                      value={regForm.bankIfsc}
                      onChange={(e) => setRegForm({ ...regForm, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="IFSC Code"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 mt-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2"
                >
                  {regLoading ? 'Submitting Application...' : 'Submit Partner Application for Approval'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: OPERATOR PORTAL & DASHBOARD (APPROVED OPERATORS)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <ToastContainer />

      {/* Top Operator Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-display">
                Apna<span className="text-purple-400">Trips</span>
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                PARTNER PORTAL
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                KYC APPROVED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentOperator.businessName} · GSTIN: {currentOperator.gstin}
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
            onClick={() => setIsBuilderOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Configure New Bus</span>
          </button>

          <button
            onClick={handleOperatorLogout}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title="Sign out of operator portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6 flex-1">

        {/* Operator Financial KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Total Fleet Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              ₹{(currentOperator.totalEarnings || 2845000).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
              Net operator settlement after commission
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Pending Settlement</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              ₹{(currentOperator.pendingSettlement || 142800).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-amber-400 mt-1 font-mono">
              Next batch payout: Tuesday 11:00 AM
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Configured Fleet</span>
              <Bus className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {buses.length || 1} Registered
            </div>
            <div className="text-[10px] text-purple-400 mt-1">
              Verified seat layouts with safety exits
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Platform Commission</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {currentOperator.commissionPercentage || 10}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Pre-negotiated partner tier rate
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Fleet & Visual Layouts</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Scheduled Trips & Availability</span>
          </button>

          <button
            onClick={() => setActiveTab('settlements')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'settlements'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bank Settlements & Deductions</span>
          </button>
        </div>

        {/* TAB 1: FLEET & VISUAL CABIN BUILDER */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Your Bus Fleet Configurations</h3>
                <p className="text-xs text-slate-400">
                  Visual layout definitions, seat numbers, upper/lower decks, and certified safety compliance.
                </p>
              </div>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bus with Layout Editor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buses.map((bus) => (
                <div key={bus.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{bus.busName}</h4>
                      <span className="font-mono text-purple-400 text-xs font-bold">{bus.registrationNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SAFETY AUDIT PASSED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TYPE</span>
                      <span className="capitalize text-slate-200">{bus.category}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">DECKS</span>
                      <span className="capitalize text-slate-200">{bus.deckType} Deck</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">CAPACITY</span>
                      <span className="text-emerald-400 font-bold">
                        {bus.positions.filter((p) => ['seater', 'semi_sleeper', 'single_sleeper', 'double_sleeper'].includes(p.type)).length} Berths
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setIsBuilderOpen(true)}
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit Cabin Layout in Visual Editor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULED TRIPS */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Active Bus Trips</h3>
              <p className="text-xs text-slate-400">
                Scheduled departures, seat availability, and authorized passenger manifests.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {trip.sourceCity} ➜ {trip.destinationCity}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Vehicle: {trip.busNumber} · {trip.busType}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewManifest(trip)}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>View Passenger Manifest</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">DEPARTURE</span>
                      <span className="font-bold text-emerald-400">{trip.departureTime} HRS</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">AVAILABLE SEATS</span>
                      <span className="font-bold text-white">{trip.availableSeatsCount} / {trip.totalSeats}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">BASE FARE</span>
                      <span className="font-bold text-white">₹{trip.fareStartingFrom}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">RATINGS</span>
                      <span className="font-bold text-amber-400">★ {trip.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SETTLEMENTS */}
        {activeTab === 'settlements' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Financial Settlements & Payouts</h3>
              <p className="text-xs text-slate-400">
                Transparent accounting of gross bookings, platform commission deduction, and bank remittances.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-mono">REGISTERED BANK</span>
                  <span className="font-bold text-white">{currentOperator.bankName || 'HDFC Bank'}</span>
                  <span className="text-slate-400 block font-mono mt-0.5">{currentOperator.bankAccountMasked}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-mono">IFSC CODE</span>
                  <span className="font-bold text-purple-400 font-mono">{currentOperator.bankIfsc || 'HDFC0001234'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-mono">SETTLEMENT CYCLE</span>
                  <span className="font-bold text-emerald-400">T+2 Rolling Settlement</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-300">
                <p>All remittances are processed directly through RBI NEFT/RTGS gateway to the verified bank account.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Manifest Modal */}
      {selectedTripForManifest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Passenger Manifest · {selectedTripForManifest.sourceCity} ➜ {selectedTripForManifest.destinationCity}
                </h3>
                <p className="text-xs text-slate-400">
                  Trip ID: {selectedTripForManifest.id} · Vehicle: {selectedTripForManifest.busNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedTripForManifest(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingManifest ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Loading Authoritative Manifest...</span>
                </div>
              ) : manifestData.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No confirmed passengers booked for this scheduled trip yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">SEAT</th>
                      <th className="p-3">PASSENGER NAME</th>
                      <th className="p-3">PNR</th>
                      <th className="p-3">BOARDING POINT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {manifestData.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-850">
                        <td className="p-3 font-mono font-bold text-purple-400">{m.seatNumber}</td>
                        <td className="p-3 font-bold text-white">{m.passengerName}</td>
                        <td className="p-3 font-mono text-slate-300">{m.pnrNumber}</td>
                        <td className="p-3 text-slate-400">{m.boardingPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Bus Layout Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-2 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Close Editor</span>
              </button>
            </div>
            <BusLayoutBuilder
              onClose={() => setIsBuilderOpen(false)}
              onBusPublished={handleBusPublished}
            />
          </div>
        </div>
      )}

    </div>
  );
};
export default PartnerApp;
