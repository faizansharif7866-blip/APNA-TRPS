import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Timer, 
  Tag, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Booking, FinancialBreakdown, Passenger, TravelCategory, UserProfile } from '../types';
import { LanguageCode, translations } from '../services/localization';
import { showToast } from './Toast';

interface CheckoutModalProps {
  category: TravelCategory;
  tripTitle: string;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  operatorOrHost: string;
  seatNumbers?: string[];
  roomName?: string;
  vehicleType?: string;
  boardingPoint?: string;
  droppingPoint?: string;
  baseFareTotal: number;
  currentUser: UserProfile;
  lang: LanguageCode;
  onClose: () => void;
  onPaymentSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  category,
  tripTitle,
  source,
  destination,
  travelDate,
  departureTime,
  operatorOrHost,
  seatNumbers = [],
  roomName,
  vehicleType,
  boardingPoint,
  droppingPoint,
  baseFareTotal,
  currentUser,
  lang,
  onClose,
  onPaymentSuccess,
}) => {
  const t = translations[lang];

  // 10-minute hold timer (in seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [couponCode, setCouponCode] = useState('APNAFIRST');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(150);

  // Customer contact details
  const [customerName, setCustomerName] = useState(currentUser.name || 'Ananya Sharma');
  const [customerEmail, setCustomerEmail] = useState(currentUser.email || 'ananya.sharma@example.com');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '+91 98765 43210');

  // Passenger list
  const initialPassengerCount = seatNumbers.length > 0 ? seatNumbers.length : 1;
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: initialPassengerCount }, (_, idx) => ({
      name: idx === 0 ? (currentUser.name || 'Primary Passenger') : `Passenger ${idx + 1}`,
      age: 28,
      gender: 'F',
      seatNumber: seatNumbers[idx] || undefined,
    }))
  );

  // Payment UI state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('ananya@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Countdown timer for inventory hold
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast('Your inventory hold has expired. Please reselect your travel options.', 'warning');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Financial calculations
  const gstAmount = Math.round(baseFareTotal * 0.18);
  const platformFee = 49;
  const totalPayable = Math.max(0, baseFareTotal + gstAmount + platformFee - (couponApplied ? couponDiscount : 0));
  const supplierPayable = baseFareTotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'APNAFIRST' || couponCode.toUpperCase() === 'EXPLORE100') {
      setCouponApplied(true);
      setCouponDiscount(couponCode.toUpperCase() === 'APNAFIRST' ? 150 : 100);
      setPaymentError(null);
    } else {
      setCouponApplied(false);
      setCouponDiscount(0);
      setPaymentError('Invalid promo coupon. Try APNAFIRST or EXPLORE100');
    }
  };

  const handleProcessRazorpayPayment = () => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    // Simulate official Razorpay backend order verification and HMAC-SHA256 signature check
    setTimeout(() => {
      if (simulateFailure) {
        setIsProcessingPayment(false);
        setPaymentError('Razorpay Payment Declined by Issuing Bank (BAD_REQUEST_ERROR: 005_INSUFFICIENT_FUNDS_OR_OTP_FAILED). No funds were deducted.');
        return;
      }

      // Successful verification
      const bookingRef = `BK-APNA-${Math.floor(10000 + Math.random() * 90000)}`;
      const pnrNum = `PNR-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = `order_apna_${Date.now()}`;
      const paymentId = `pay_rzp_${Date.now()}`;
      const signature = `sig_hmac_sha256_${Math.random().toString(36).substring(2, 15)}`;

      const confirmedBooking: Booking = {
        id: `book-${Date.now()}`,
        bookingReference: bookingRef,
        pnrNumber: pnrNum,
        customerId: currentUser.id || 'cust-demo',
        customerName,
        customerEmail,
        customerPhone,
        category,
        tripDetails: {
          title: tripTitle,
          source,
          destination,
          travelDate,
          departureTime,
          operatorOrHost,
          seatNumbers: seatNumbers.length > 0 ? seatNumbers : undefined,
          roomName,
          vehicleType,
          boardingPoint,
          droppingPoint,
        },
        passengers,
        financials: {
          baseFare: baseFareTotal,
          gstAmount,
          platformServiceFee: platformFee,
          gatewayProcessingFee: Math.round(totalPayable * 0.02),
          couponDiscount: couponApplied ? couponDiscount : 0,
          totalPayableAmount: totalPayable,
          supplierPayableAmount: supplierPayable,
        },
        paymentDetails: {
          orderId,
          paymentId,
          signature,
          method: paymentMethod.toUpperCase(),
          verifiedAt: new Date().toISOString(),
        },
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setIsProcessingPayment(false);
      onPaymentSuccess(confirmedBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                ApnaTrips Secure Checkout
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>{tripTitle}</span>
                <span>·</span>
                <span className="text-amber-400">{travelDate} ({departureTime})</span>
              </div>
            </div>
          </div>

          {/* Hold Countdown Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-lg text-xs font-mono font-bold">
              <Timer className="w-3.5 h-3.5" />
              <span>Seat Hold: {formatTimer(secondsRemaining)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Passenger & Contact Form */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5">
            
            {/* Contact Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                1. Primary Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Indian Mobile (+91)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Email Address for E-Ticket & GST Invoice</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Passenger Manifest */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>2. Passenger Manifest</span>
                <span className="text-slate-400 font-normal">
                  {passengers.length} Traveler(s)
                </span>
              </h4>

              <div className="space-y-3">
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-12 gap-2.5 items-center">
                    <div className="col-span-6">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                        Passenger {idx + 1} Name {p.seatNumber ? `(Seat ${p.seatNumber})` : ''}
                      </label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].name = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Age</label>
                      <input
                        type="number"
                        value={p.age}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].age = Number(e.target.value);
                          setPassengers(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        min={1}
                        max={110}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Gender</label>
                      <select
                        value={p.gender}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].gender = e.target.value as 'M' | 'F' | 'O';
                          setPassengers(updated);
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                      >
                        <option value="F">Female</option>
                        <option value="M">Male</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boarding Points Confirmation */}
            {boardingPoint && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950">
                <span className="font-bold">Boarding Location: </span>
                <span>{boardingPoint}</span>
                {droppingPoint && (
                  <div className="mt-0.5">
                    <span className="font-bold">Dropoff Location: </span>
                    <span>{droppingPoint}</span>
                  </div>
                )}
              </div>
            )}

            {/* Razorpay Method Selection */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                3. Razorpay Indian Payment Options
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs block">Instant UPI</span>
                  <span className="text-[10px] text-slate-500 font-normal">GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs block">Debit / Credit</span>
                  <span className="text-[10px] text-slate-500 font-normal">Visa / RuPay / MC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs block">NetBanking</span>
                  <span className="text-[10px] text-slate-500 font-normal">SBI / HDFC / ICICI</span>
                </button>
              </div>

              {/* Input for chosen method */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Enter UPI VPA ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile@upi or username@okhdfcbank"
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Card Credentials (Test Simulator)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Select Bank</label>
                    <select className="w-full p-2 bg-white border border-slate-300 rounded font-medium">
                      <option>HDFC Bank Retail NetBanking</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank Corporate & Retail</option>
                      <option>Axis Bank India</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Pricing Breakdown & Verification */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Fare Breakdown & Ledger
              </h4>

              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (APNAFIRST)"
                    className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none uppercase font-mono font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold"
                >
                  Apply
                </button>
              </form>

              {couponApplied && (
                <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                  <span>Coupon <strong>APNAFIRST</strong> Applied</span>
                  <span className="font-bold">-₹{couponDiscount}</span>
                </div>
              )}

              {/* Itemized charges table */}
              <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-200 pb-4">
                <div className="flex justify-between">
                  <span>{t.checkout.baseFare} ({initialPassengerCount} seat/guest)</span>
                  <span className="font-medium text-slate-900 tabular-nums">₹{baseFareTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.checkout.gst}</span>
                  <span className="font-medium text-slate-900 tabular-nums">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.checkout.platformFee}</span>
                  <span className="font-medium text-slate-900 tabular-nums">₹{platformFee}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t.checkout.discount}</span>
                    <span className="font-bold tabular-nums">-₹{couponDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total Payable Amount */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">{t.checkout.totalAmount}</div>
                  <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  <span>Inclusive of 18% GST</span>
                  <div className="text-emerald-600 font-semibold">Zero Gateway Surcharge</div>
                </div>
              </div>

              {/* QA & Payment Failure Simulator Toggle as required by Section 13 */}
              <div className="mt-5 p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-slate-700 font-medium">
                    QA Test: Simulate Payment Gateway Failure
                  </span>
                </label>
              </div>

              {paymentError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Transaction Aborted: </span>
                    {paymentError}
                  </div>
                </div>
              )}
            </div>

            {/* Pay Button & Security Badges */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessRazorpayPayment}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying HMAC-SHA256 Signature...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Pay ₹{totalPayable.toLocaleString('en-IN')} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="mt-3 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>{t.checkout.secureNotice}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
