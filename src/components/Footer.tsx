import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Lock, 
  Building,
  Bus,
  Sparkles
} from 'lucide-react';
import { TravelCategory } from '../types';
import { ApnaTripsLogo } from './ApnaTripsLogo';

interface FooterProps {
  onSelectCategory: (cat: TravelCategory) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Column with Official Logo Component */}
          <div className="lg:col-span-2 space-y-3">
            <ApnaTripsLogo variant="navbar" size="md" showSubtitle={true} />

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              APNA TRIPS is India’s premier all-in-one bus booking network. Experience authoritative real-time seat inventory, Volvo multi-axle sleepers, live GPS vehicle tracking, and bank-grade secure checkout.
            </p>

            <div className="pt-2 text-slate-300 space-y-2 font-medium">
              <a 
                href="tel:180027628747"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                title="Call ApnaTrip-Support"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call ApnaTrip-Support: 1800-APNA-TRIP (1800 2762 8747)</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@apnatrips.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Apna Trip Head Office:</span>
                  <span className="text-slate-300">Athanavur, Yelagiri Hills, Tirupattur D.T., Tamil Nadu, 635853</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Booking Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-amber-400" />
              <span>Bus Travel Network</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectCategory('bus')} className="hover:text-amber-400 transition-colors">
                  Volvo 9600 Multi-Axle Sleepers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bus')} className="hover:text-amber-400 transition-colors">
                  Scania AC Sleeper (2+1)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bus')} className="hover:text-amber-400 transition-colors">
                  BharatBenz Club Class Coaches
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bus')} className="hover:text-amber-400 transition-colors">
                  Single Berths & Ladies Reserved
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('train')} className="hover:text-amber-400 transition-colors">
                  IRCTC Express Schedules
                </button>
              </li>
            </ul>
          </div>

          {/* Top Bus Operators (Replaced Partners & Operators) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Top Fleet Operators
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors">
                  Zingbus Premium Lounges
                </span>
              </li>
              <li>
                <span className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors">
                  IntrCity SmartBus Club Class
                </span>
              </li>
              <li>
                <span className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors">
                  Parveen Travels Royal Class
                </span>
              </li>
              <li>
                <span className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors">
                  Orange Tours & Multi-Axles
                </span>
              </li>
              <li>
                <span className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors">
                  SRS & VRL Express Fleets
                </span>
              </li>
            </ul>
          </div>

          {/* Compliance & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Safety & Guarantee
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-amber-400 cursor-pointer">Instant Refund & Cancellation Policy</span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer">Terms & Conditions</span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer">Privacy & Data Protection Notice</span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer">Indian Consumer Grievance Officer</span>
              </li>
              <li>
                <span className="hover:text-amber-400 cursor-pointer">GST Invoice Compliance</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Trust Badges & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Bank Grade Encryption</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Verified Indian Payment Gateway</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Building className="w-3.5 h-3.5 text-amber-500" />
              <span>Compliant with Ministry of Consumer Affairs Norms</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} APNA TRIPS Private Limited. All rights reserved.</span>
            {/* Discrete separated administrative access point with security */}
            <button
              onClick={onOpenAdmin}
              className="text-slate-600 hover:text-amber-400 text-[10px] flex items-center gap-1 border-l border-slate-800 pl-3 transition-colors"
              title="Super Admin Security Access Gate"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
