import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { setCurrentUser } from '../services/storage';

interface AuthModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onUserUpdated,
}) => {
  const [authMethod, setAuthMethod] = useState<'otp' | 'password' | 'role_switch'>('role_switch');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [email, setEmail] = useState(currentUser.email || 'ananya.sharma@example.com');
  const [name, setName] = useState(currentUser.name || 'Ananya Sharma');
  const [otp, setOtp] = useState('4829');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      phone,
      name,
      isVerified: true,
      role: selectedRole,
    };
    setCurrentUser(updated);
    onUserUpdated(updated);
    onClose();
  };

  const handleQuickRoleSwitch = (role: UserRole, customName: string) => {
    const updated: UserProfile = {
      ...currentUser,
      role,
      name: customName,
      isVerified: true,
    };
    setCurrentUser(updated);
    onUserUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                ApnaTrips Account & Role Access
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified Authentication • Multi-Role Authorization
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => setAuthMethod('role_switch')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              authMethod === 'role_switch'
                ? 'border-amber-500 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Switch Role / Persona
          </button>
          <button
            onClick={() => setAuthMethod('otp')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              authMethod === 'otp'
                ? 'border-amber-500 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Phone OTP
          </button>
        </div>

        <div className="p-5 sm:p-6">
          
          {/* Persona quick switch */}
          {authMethod === 'role_switch' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Test and inspect ApnaTrips under different authenticated roles as required by Section 6 (Role-Based Access Control):
              </p>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('customer', 'Ananya Sharma')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentUser.role === 'customer'
                      ? 'border-amber-500 bg-amber-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Customer (Ananya Sharma)</div>
                    <div className="text-[11px] text-slate-500">Book trips, view personal e-tickets, request cancellations</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Active
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('super_admin', 'Founder / Super Admin')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentUser.role === 'super_admin'
                      ? 'border-amber-500 bg-amber-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Super Admin / Platform Founder</div>
                    <div className="text-[11px] text-slate-500">Full platform governance, supplier approvals, double-entry financial ledger</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Super Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('supplier', 'Prashant Kumar (Zingbus)')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentUser.role === 'supplier'
                      ? 'border-amber-500 bg-amber-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Supplier / Bus Operator (Zingbus)</div>
                    <div className="text-[11px] text-slate-500">Manage own fleet schedules, dynamic fares, review settlement payouts</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Operator
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('driver', 'Rajesh Sharma (Driver)')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentUser.role === 'driver'
                      ? 'border-amber-500 bg-amber-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">Driver Terminal (Rajesh Sharma)</div>
                    <div className="text-[11px] text-slate-500">Assigned trip manifest, boarding check-in, live GPS broadcast</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Driver
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Phone OTP Verification */}
          {authMethod === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Indian Mobile Number (+91)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Send SMS OTP via MSG91 Gateway</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                    6-digit verification code sent to <strong>{phone}</strong> (Demo OTP: 4829)
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Enter OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-center text-lg tracking-widest font-bold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Verify & Sign In to ApnaTrips
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
