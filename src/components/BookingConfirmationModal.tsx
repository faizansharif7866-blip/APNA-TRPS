import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  Navigation, 
  Download, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  QrCode
} from 'lucide-react';
import { Booking } from '../types';
import { ApnaTripsLogo } from './ApnaTripsLogo';

interface BookingConfirmationModalProps {
  booking: Booking;
  onClose: () => void;
  onTrackGps: (tripId: string) => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
  onTrackGps,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Top Success Banner */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="font-bold text-sm">Booking Confirmed & Payment Verified!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E-Ticket Body */}
        <div className="p-6 space-y-6" id="printable-eticket">
          
          {/* Brand & Reference Header with Styled ApnaTrips Logo */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <ApnaTripsLogo variant="ticket" size="md" showSubtitle={true} />

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Booking Reference
              </span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {booking.bookingReference}
              </span>
              <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                PNR: {booking.pnrNumber}
              </div>
            </div>
          </div>

          {/* Trip Summary Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Service & Route</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{booking.tripDetails.title}</span>
              <span className="text-slate-600 block mt-0.5">{booking.tripDetails.operatorOrHost}</span>
            </div>

            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Travel Schedule</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{booking.tripDetails.travelDate}</span>
                <Clock className="w-3.5 h-3.5 text-amber-600 ml-2" />
                <span>{booking.tripDetails.departureTime}</span>
              </div>
            </div>

            {booking.tripDetails.boardingPoint && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Boarding Point</span>
                <span className="text-slate-800 font-medium">{booking.tripDetails.boardingPoint}</span>
              </div>
            )}
          </div>

          {/* Passenger Details & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            <div className="sm:col-span-8">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Passenger Manifest
              </h4>
              <div className="space-y-1.5">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      <span className="text-slate-500">({p.gender}, {p.age} yrs)</span>
                    </div>
                    {p.seatNumber && (
                      <span className="font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                        Seat {p.seatNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in QR Code */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-20 h-20 bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 font-medium">
                Scan for Conductor / Hotel Check-in
              </span>
            </div>

          </div>

          {/* Financial Breakdown Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500">Total Paid (Razorpay UPI / Card):</span>
              <div className="text-base font-bold font-display text-slate-900 tabular-nums">
                ₹{booking.financials.totalPayableAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Order ID: {booking.paymentDetails.orderId}
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <div>Includes 18% GST (₹{booking.financials.gstAmount})</div>
              <div className="text-emerald-600 font-semibold">Payment Status: CAPTURED & VERIFIED</div>
            </div>
          </div>

          {/* Security & Cancellation note */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200/50">
            <strong>Cancellation Notice:</strong> Free cancellation is supported in accordance with operator guidelines up to 6 hours before departure from your ApnaTrips account.
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print E-Ticket</span>
            </button>
            {booking.category === 'bus' && (
              <button
                onClick={() => {
                  onClose();
                  onTrackGps('gps-trip-001');
                }}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Track Live Bus GPS</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
