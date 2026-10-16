import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw, 
  Navigation,
  FileText
} from 'lucide-react';
import { Booking } from '../types';
import { recordRefundInLedger, saveBookings } from '../services/storage';

interface CustomerBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onViewTicket: (booking: Booking) => void;
  onTrackGps: (tripId: string) => void;
  onBookingCancelled: () => void;
}

export const CustomerBookingsModal: React.FC<CustomerBookingsModalProps> = ({
  bookings,
  onClose,
  onViewTicket,
  onTrackGps,
  onBookingCancelled,
}) => {
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const handleConfirmCancellation = (booking: Booking) => {
    const deduction = Math.round(booking.financials.baseFare * 0.1); // 10% standard cancellation fee
    const refund = booking.financials.totalPayableAmount - deduction;

    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          status: 'REFUNDED' as const,
          updatedAt: new Date().toISOString(),
          cancellationDetails: {
            requestedAt: new Date().toISOString(),
            refundAmount: refund,
            deductionAmount: deduction,
            processedAt: new Date().toISOString(),
          },
        };
      }
      return b;
    });

    saveBookings(updatedBookings);
    recordRefundInLedger(booking, refund, deduction);
    setCancellingBookingId(null);
    onBookingCancelled();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Ticket className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                My ApnaTrips Travel Records
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active tickets, past travel histories and cancellation refunds
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

        {/* Bookings List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-base font-bold text-slate-800">No Bookings Found</div>
              <p className="text-xs mt-1">Book your first bus, resort or cab to view your itinerary here.</p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const isRefunded = booking.status === 'REFUNDED';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {booking.category.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {booking.bookingReference}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-mono text-slate-600 font-medium">
                          PNR: {booking.pnrNumber}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {booking.tripDetails.title}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {booking.tripDetails.operatorOrHost}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                        isConfirmed 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {booking.status}
                      </span>
                      <div className="text-sm font-bold font-display text-slate-900 mt-1 tabular-nums">
                        ₹{booking.financials.totalPayableAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Travel Date & Passengers */}
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>{booking.tripDetails.travelDate} ({booking.tripDetails.departureTime})</span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-800">Passengers: </span>
                      <span>{booking.passengers.map(p => p.name).join(', ')}</span>
                      {booking.tripDetails.seatNumbers && (
                        <span className="font-mono text-slate-900 font-bold ml-1">
                          [Seats: {booking.tripDetails.seatNumbers.join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cancellation prompt if requested */}
                  {cancellingBookingId === booking.id && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl my-2 text-xs text-red-950">
                      <div className="font-bold flex items-center gap-1.5 text-red-800 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Confirm Instant Booking Cancellation?</span>
                      </div>
                      <p className="leading-relaxed">
                        Total Paid: ₹{booking.financials.totalPayableAmount}. Standard cancellation deduction: ₹{Math.round(booking.financials.baseFare * 0.1)}. 
                        Refund amount <strong>₹{booking.financials.totalPayableAmount - Math.round(booking.financials.baseFare * 0.1)}</strong> will be credited to original Razorpay payment source within 2 hours.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleConfirmCancellation(booking)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs"
                        >
                          Yes, Cancel & Refund
                        </button>
                        <button
                          onClick={() => setCancellingBookingId(null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium text-xs"
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cancellation detail if already refunded */}
                  {isRefunded && booking.cancellationDetails && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg my-2 text-xs text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Refund Disbursed: ₹{booking.cancellationDetails.refundAmount}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Deduction: ₹{booking.cancellationDetails.deductionAmount}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      onClick={() => onViewTicket(booking)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View & Print E-Ticket</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {booking.category === 'bus' && isConfirmed && (
                        <button
                          onClick={() => {
                            onClose();
                            onTrackGps('gps-trip-001');
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-600" />
                          <span>Track GPS</span>
                        </button>
                      )}

                      {isConfirmed && cancellingBookingId !== booking.id && (
                        <button
                          onClick={() => setCancellingBookingId(booking.id)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
