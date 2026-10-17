import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  X, 
  Star, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  User, 
  Info,
  Calendar,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { BusTrip, Seat } from '../types';
import { showToast } from './Toast';

interface RedBusSeatDetailsModalProps {
  isOpen: boolean;
  trip: BusTrip;
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
}

export const RedBusSeatDetailsModal: React.FC<RedBusSeatDetailsModalProps> = ({
  isOpen,
  trip,
  selectedSeats,
  onToggleSeat,
  onProceedToCheckout,
  onClose,
}) => {
  if (!isOpen) return null;

  const lowerDeckSeats = trip.seats.filter((s) => s.deck === 'lower');
  const upperDeckSeats = trip.seats.filter((s) => s.deck === 'upper');
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // Group lower and upper seats into rows of [left single berth, right 1, right 2]
  const rowsCount = Math.max(6, Math.ceil(lowerDeckSeats.length / 3));

  const getSeatAt = (deck: 'lower' | 'upper', rowIdx: number, colType: 'left' | 'right1' | 'right2'): Seat => {
    const list = deck === 'lower' ? lowerDeckSeats : upperDeckSeats;
    const baseIdx = rowIdx * 3;
    let targetSeat: Seat | undefined;

    if (colType === 'left') {
      targetSeat = list[baseIdx];
    } else if (colType === 'right1') {
      targetSeat = list[baseIdx + 1];
    } else {
      targetSeat = list[baseIdx + 2];
    }

    if (targetSeat) return targetSeat;

    // Fallback deterministic seat object
    const label = `${deck === 'lower' ? 'L' : 'U'}${rowIdx + 1}${colType === 'left' ? 'A' : colType === 'right1' ? 'B' : 'C'}`;
    return {
      id: `seat-${deck}-${label}`,
      number: label,
      deck,
      type: 'sleeper',
      status: rowIdx <= 3 ? 'booked' : 'available',
      price: deck === 'lower' ? 1599 : 1699,
      isWindow: colType === 'left' || colType === 'right2',
      isLadies: rowIdx === 2 && colType === 'right1',
    };
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') {
      showToast('This berth has already been booked by another traveler.', 'warning');
      return;
    }
    if (selectedSeats.length >= 6 && !selectedSeats.some((s) => s.id === seat.id)) {
      showToast('Maximum 6 seats can be reserved per booking.', 'warning');
      return;
    }
    onToggleSeat(seat);
  };

  const handleShare = () => {
    showToast(`Bus itinerary link for ${trip.operatorName} copied to clipboard!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-1 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border border-slate-200 text-slate-800 relative">
        
        {/* Top Header matching user's uploaded screenshot */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Select Seats
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {trip.sourceCity} ➜ {trip.destinationCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Exclusive 10% OFF Gold Voucher Pill (Exact user image) */}
            <div className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded-lg text-[11px] font-bold flex flex-col items-center leading-none shadow-sm">
              <span>Exclusive</span>
              <span className="font-extrabold text-[10px] mt-0.5">10% OFF</span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100"
              title="Share Trip"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dual Deck Side-by-Side Container matching user's uploaded image */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* LEFT CARD: Lower Deck (with Steering Wheel) */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-sm flex flex-col">
              
              {/* Lower Deck Header with Steering Wheel Icon */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Lower deck</span>
                
                {/* Steering Wheel Icon matching screenshot */}
                <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center p-0.5 text-slate-500" title="Driver Cabin">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-400" />
                </div>
              </div>

              {/* Rows of berths in Lower Deck */}
              <div className="space-y-3.5">
                {Array.from({ length: rowsCount }).map((_, rIdx) => {
                  const leftSeat = getSeatAt('lower', rIdx, 'left');
                  const right1Seat = getSeatAt('lower', rIdx, 'right1');
                  const right2Seat = getSeatAt('lower', rIdx, 'right2');

                  return (
                    <div key={rIdx} className="flex items-center justify-between gap-1.5">
                      
                      {/* Left Window Sleeper Berth */}
                      <SeatBerthCard
                        seat={leftSeat}
                        isSelected={selectedSeats.some((s) => s.id === leftSeat.id)}
                        onClick={() => handleSeatClick(leftSeat)}
                      />

                      {/* Aisle Space */}
                      <div className="w-2" />

                      {/* Right Double Seats/Berths */}
                      <div className="flex items-center gap-1.5">
                        <SeatBerthCard
                          seat={right1Seat}
                          isSelected={selectedSeats.some((s) => s.id === right1Seat.id)}
                          onClick={() => handleSeatClick(right1Seat)}
                        />
                        <SeatBerthCard
                          seat={right2Seat}
                          isSelected={selectedSeats.some((s) => s.id === right2Seat.id)}
                          onClick={() => handleSeatClick(right2Seat)}
                        />
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT CARD: Upper Deck */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-sm flex flex-col">
              
              {/* Upper Deck Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Upper deck</span>
                <span className="text-[10px] font-mono text-slate-400">ROOF LEVEL</span>
              </div>

              {/* Rows of berths in Upper Deck */}
              <div className="space-y-3.5">
                {Array.from({ length: rowsCount }).map((_, rIdx) => {
                  const leftSeat = getSeatAt('upper', rIdx, 'left');
                  const right1Seat = getSeatAt('upper', rIdx, 'right1');
                  const right2Seat = getSeatAt('upper', rIdx, 'right2');

                  return (
                    <div key={rIdx} className="flex items-center justify-between gap-1.5">
                      
                      {/* Left Window Sleeper Berth */}
                      <SeatBerthCard
                        seat={leftSeat}
                        isSelected={selectedSeats.some((s) => s.id === leftSeat.id)}
                        onClick={() => handleSeatClick(leftSeat)}
                      />

                      {/* Aisle Space */}
                      <div className="w-2" />

                      {/* Right Double Sleeper Berths */}
                      <div className="flex items-center gap-1.5">
                        <SeatBerthCard
                          seat={right1Seat}
                          isSelected={selectedSeats.some((s) => s.id === right1Seat.id)}
                          onClick={() => handleSeatClick(right1Seat)}
                        />
                        <SeatBerthCard
                          seat={right2Seat}
                          isSelected={selectedSeats.some((s) => s.id === right2Seat.id)}
                          onClick={() => handleSeatClick(right2Seat)}
                        />
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Legend Strip */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center justify-around text-[10px] text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border-2 border-emerald-600 bg-white" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-slate-200 bg-slate-100 text-[8px] flex items-center justify-center text-slate-400">✕</div>
              <span>Sold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-pink-400 bg-pink-50" />
              <span>Ladies</span>
            </div>
          </div>

        </div>

        {/* BOTTOM SHEET CARD (Exact layout from user's screenshot) */}
        <div className="bg-white border-t border-slate-200 rounded-t-3xl shadow-[0_-8px_25px_rgba(0,0,0,0.06)] p-4 shrink-0 space-y-3 relative">
          
          {/* Drag handle at top center */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1" />

          {/* Operator Name & Timing Row */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-display">
                {trip.operatorName || 'SRI SAI TRAVELS'}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {trip.departureTime} - {trip.arrivalTime} · Fri, 16 Oct
              </p>
            </div>

            {/* Rating badge matching screenshot: Green card with star & reviews */}
            <div className="bg-emerald-600 text-white rounded-xl px-2.5 py-1 text-center shrink-0 shadow-sm">
              <div className="text-xs font-black flex items-center justify-center gap-0.5">
                <span>★</span> {trip.rating}
              </div>
              <div className="text-[10px] text-emerald-100 font-mono mt-0.5">
                {trip.reviewCount}
              </div>
            </div>
          </div>

          {/* Badges Strip matching user's uploaded screenshot */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            
            {/* Bus Photo & New Bus Tag */}
            <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2.5">
              {/* Real luxury bus photo preview */}
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-blue-200">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=150&q=80"
                  alt="Luxury Bus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <strong className="text-slate-900 text-xs block">New Bus</strong>
                <span className="text-[11px] text-slate-500">5 months old</span>
              </div>
            </div>

            {/* Highly On Time Badge */}
            <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col justify-center">
              <strong className="text-slate-900 text-xs">Highly On Time</strong>
              <span className="text-[11px] text-slate-500 mt-0.5">1334 of 1534 past trips</span>
            </div>

          </div>

          {/* Booking Summary & Continue CTA */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">
                {selectedSeats.length > 0 ? (
                  <span>Selected Seats: <strong className="text-slate-900">{selectedSeats.map((s) => s.number).join(', ')}</strong></span>
                ) : (
                  <span>Select at least 1 seat</span>
                )}
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-display">
                ₹{totalPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={onProceedToCheckout}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-1.5 ${
                selectedSeats.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue ({selectedSeats.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

// Sub-component for individual sleeper berth / seat card matching user's screenshot
interface SeatBerthCardProps {
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
}

const SeatBerthCard: React.FC<SeatBerthCardProps> = ({ seat, isSelected, onClick }) => {
  const isSold = seat.status === 'booked';
  const isLadies = seat.isLadies;

  if (isSold) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-9 sm:w-11 h-16 sm:h-20 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-center relative cursor-not-allowed">
          {/* Subtle faint cross matching screenshot */}
          <div className="absolute inset-2 flex items-center justify-center text-slate-300 font-light text-base select-none">
            ✕
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium mt-1">Sold</span>
      </div>
    );
  }

  if (isSelected) {
    return (
      <div className="flex flex-col items-center" onClick={onClick}>
        {/* Clean Emerald Green border matching screenshot */}
        <div className="w-9 sm:w-11 h-16 sm:h-20 rounded-xl border-2 border-emerald-600 bg-white flex items-center justify-center relative shadow-sm cursor-pointer transform scale-105 transition-transform">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
        </div>
        <span className="text-[10px] text-emerald-800 font-bold mt-1 font-mono">
          ₹{seat.price}
        </span>
      </div>
    );
  }

  if (isLadies) {
    return (
      <div className="flex flex-col items-center" onClick={onClick}>
        <div className="w-9 sm:w-11 h-16 sm:h-20 rounded-xl border border-pink-400 bg-pink-50/60 hover:bg-pink-100 flex items-center justify-center relative cursor-pointer transition-all">
          <span className="text-[10px] text-pink-600 font-bold">👩</span>
        </div>
        <span className="text-[10px] text-pink-700 font-medium mt-1 font-mono">
          ₹{seat.price}
        </span>
      </div>
    );
  }

  // Available Seat
  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className="w-9 sm:w-11 h-16 sm:h-20 rounded-xl border border-slate-300 bg-white hover:border-emerald-500 hover:shadow-sm flex items-center justify-center relative cursor-pointer transition-all active:scale-95">
        <span className="text-[10px] text-slate-400 font-mono">{seat.number}</span>
      </div>
      <span className="text-[10px] text-slate-600 font-medium mt-1 font-mono">
        ₹{seat.price}
      </span>
    </div>
  );
};
