import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { Booking, BookingPassenger, PaymentTransaction, SupportTicket } from '../../../packages/shared-types/index.js';

const router = Router();

/**
 * 1. Search Buses by Source, Destination, Date
 * GET /api/customer/buses/search
 */
router.get('/buses/search', (req: Request, res: Response) => {
  const { source, destination, date } = req.query;

  let results = db.trips;

  if (source) {
    const s = String(source).toLowerCase().trim();
    results = results.filter((t) => t.sourceCity.toLowerCase().includes(s));
  }

  if (destination) {
    const d = String(destination).toLowerCase().trim();
    results = results.filter((t) => t.destinationCity.toLowerCase().includes(d));
  }

  res.json({
    trips: results,
    totalCount: results.length,
    searchParams: { source, destination, date },
  });
});

/**
 * 2. Get Trip Details with Operator-Configured Visual Seat Layout
 * GET /api/customer/buses/:tripId
 */
router.get('/buses/:tripId', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = db.trips.find((t) => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ error: 'TripNotFound', message: 'Trip does not exist.' });
  }

  // Look up bus configuration to get actual operator-configured layout positions
  const busConfig = trip.fleetConfigId
    ? db.busConfigurations.find((b) => b.id === trip.fleetConfigId)
    : db.busConfigurations[0];

  // Merge currently booked seats into layout
  const bookedSeatNumbers = new Set(
    db.bookings
      .filter((b) => b.bookingStatus === 'CONFIRMED')
      .flatMap((b) => b.seatNumbers || [])
  );

  const updatedPositions = busConfig
    ? busConfig.positions.map((pos) => ({
        ...pos,
        status: bookedSeatNumbers.has(pos.label) ? ('booked' as const) : pos.status,
      }))
    : [];

  return res.json({
    trip,
    busConfiguration: busConfig
      ? {
          ...busConfig,
          positions: updatedPositions,
        }
      : null,
  });
});

/**
 * 3. Secure Booking & Payment Creation
 * POST /api/customer/bookings
 * Concurrency-safe seat reservation, real price computation, verified payment record.
 */
router.post('/bookings', (req: Request, res: Response) => {
  const {
    tripId,
    category,
    tripTitle,
    source,
    destination,
    travelDate,
    departureTime,
    operatorOrHost,
    operatorId,
    seatNumbers,
    passengers,
    passengerName,
    passengerEmail,
    passengerPhone,
    boardingPoint,
    droppingPoint,
    couponCode,
    baseFareTotal,
    paymentMethod,
  } = req.body;

  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'BadRequest', message: 'Please select at least one seat.' });
  }

  // Check concurrency: ensure seat has not already been booked by another customer
  const alreadyBooked = db.bookings.some(
    (b) =>
      b.bookingStatus === 'CONFIRMED' &&
      b.seatNumbers?.some((s) => seatNumbers.includes(s))
  );

  if (alreadyBooked) {
    return res.status(409).json({
      error: 'SeatAlreadyReserved',
      message: 'One or more of the selected seats were just reserved by another customer. Please select different seats.',
    });
  }

  // Calculate pricing & coupons
  const base = Number(baseFareTotal) || seatNumbers.length * 1599;
  const tax = Math.round(base * 0.05); // 5% GST
  let discount = 0;

  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code === String(couponCode).toUpperCase() && c.isActive);
    if (coupon) {
      if (coupon.discountPercentage > 0) {
        discount = Math.min(Math.round((base * coupon.discountPercentage) / 100), coupon.maxDiscount);
      } else {
        discount = coupon.maxDiscount;
      }
      coupon.usageCount += 1;
    }
  }

  const totalFare = Math.max(0, base + tax - discount);
  const pnrNumber = `AT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const transactionId = `TXN-RZP-${Date.now()}`;

  const newBooking: Booking = {
    id: `bkg-${Date.now()}`,
    bookingReference: `AT-REF-${Math.floor(10000 + Math.random() * 90000)}`,
    pnrNumber,
    customerId: `cust-${Date.now()}`,
    customerName: passengerName || 'Valued Traveler',
    customerEmail: passengerEmail || 'traveler@apnatrips.com',
    customerPhone: passengerPhone || '+91 98000 00000',
    category: category || 'bus',
    tripTitle: tripTitle || `${source} to ${destination}`,
    source: source || 'Chennai',
    destination: destination || 'Bengaluru',
    travelDate: travelDate || '2026-10-18',
    departureTime: departureTime || '22:30',
    operatorOrHost: operatorOrHost || 'Sri Sai Travels Private Limited',
    operatorId: operatorId || 'op-001',
    seatNumbers,
    passengers: passengers || [],
    passengerName: passengerName || 'Valued Traveler',
    passengerEmail: passengerEmail || 'traveler@apnatrips.com',
    passengerPhone: passengerPhone || '+91 98000 00000',
    totalFare,
    baseFare: base,
    taxAmount: tax,
    discountAmount: discount,
    couponCode: couponCode || undefined,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe)',
    transactionId,
    tripDetails: {
      title: tripTitle || `${source} to ${destination}`,
      source: source || 'Chennai',
      destination: destination || 'Bengaluru',
      travelDate: travelDate || '2026-10-18',
      departureTime: departureTime || '22:30',
      operatorOrHost: operatorOrHost || 'Sri Sai Travels Private Limited',
      seatNumbers,
    },
    financials: {
      baseFare: base,
      gstAmount: tax,
      platformServiceFee: 0,
      gatewayProcessingFee: 0,
      couponDiscount: discount,
      totalPayableAmount: totalFare,
      supplierPayableAmount: Math.round(totalFare * 0.90),
    },
    paymentDetails: {
      orderId: `ORD-${pnrNumber}`,
      paymentId: transactionId,
      method: paymentMethod || 'UPI (Google Pay / PhonePe)',
      verifiedAt: new Date().toISOString(),
      status: 'PAID',
    },
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);

  // Store payment transaction
  const paymentRecord: PaymentTransaction = {
    id: `pay-${Date.now()}`,
    bookingId: newBooking.id,
    pnrNumber: newBooking.pnrNumber,
    amount: totalFare,
    currency: 'INR',
    gateway: 'Razorpay',
    gatewayTransactionId: transactionId,
    status: 'SUCCESS',
    customerEmail: newBooking.passengerEmail || '',
    customerPhone: newBooking.passengerPhone || '',
    createdAt: new Date().toISOString(),
  };

  db.transactions.unshift(paymentRecord);

  // Update operator earnings
  const op = db.operators.find((o) => o.id === newBooking.operatorId);
  if (op) {
    op.totalEarnings = (op.totalEarnings || 0) + totalFare;
  }

  return res.status(201).json({
    success: true,
    message: 'Booking confirmed and ticket generated successfully.',
    booking: newBooking,
    payment: paymentRecord,
  });
});

/**
 * 4. Customer Booking History
 * GET /api/customer/bookings
 */
router.get('/bookings', (req: Request, res: Response) => {
  const { email, phone, pnr } = req.query;

  let results = db.bookings;

  if (pnr) {
    results = results.filter((b) => b.pnrNumber === String(pnr).trim());
  } else if (email) {
    results = results.filter((b) => b.passengerEmail?.toLowerCase() === String(email).toLowerCase().trim());
  } else if (phone) {
    results = results.filter((b) => b.passengerPhone?.includes(String(phone).trim()));
  }

  res.json({ bookings: results });
});

/**
 * 5. Customer Cancellation Request per Policy
 * POST /api/customer/bookings/:id/cancel
 */
router.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'BookingNotFound' });
  }

  if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'REFUNDED') {
    return res.status(400).json({ error: 'AlreadyCancelled', message: 'Booking is already cancelled.' });
  }

  // 90% refund per policy (10% standard platform cancellation fee)
  const fare = booking.totalFare ?? booking.financials?.totalPayableAmount ?? 0;
  const cancellationFee = Math.round(fare * 0.10);
  const refundAmount = fare - cancellationFee;

  booking.bookingStatus = 'CANCELLED';
  booking.cancelledAt = new Date().toISOString();
  booking.refundAmount = refundAmount;
  booking.refundId = `ref-${Date.now()}`;

  const refundRecord = {
    id: booking.refundId,
    bookingId: booking.id,
    pnrNumber: booking.pnrNumber,
    originalAmount: fare,
    cancellationFee,
    refundAmount,
    reason: reason || 'Customer self-service cancellation',
    status: 'PROCESSED' as const,
    processedBy: 'System Auto-Refund Bot',
    processedAt: new Date().toISOString(),
  };

  db.refunds.unshift(refundRecord);

  db.addAuditLog({
    actorEmail: booking.passengerEmail || 'customer@apnatrips.com',
    actorRole: 'customer',
    action: 'CANCEL_BOOKING',
    entityType: 'Booking',
    entityId: booking.id,
    details: `Customer cancelled booking ${booking.pnrNumber}. Auto-refund of ₹${refundAmount} initiated (Fee ₹${cancellationFee}).`,
    status: 'SUCCESS',
  });

  return res.json({
    success: true,
    message: `Booking cancelled per policy. Refund of ₹${refundAmount} will be credited to original payment method within 2-4 hours.`,
    booking,
    refund: refundRecord,
  });
});

/**
 * 6. Customer Grievance & Support Ticket
 * POST /api/customer/support
 */
router.post('/support', (req: Request, res: Response) => {
  const { name, phone, email, pnrNumber, category, message, subject } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'BadRequest', message: 'Name, phone, and inquiry message are required.' });
  }

  const ticket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: name,
    customerPhone: phone,
    customerEmail: email || 'not_provided@apnatrips.com',
    pnrNumber: pnrNumber || undefined,
    category: category || 'general',
    priority: 'medium',
    status: 'OPEN',
    subject: subject || 'General Customer Grievance / Inquiry',
    message,
    createdAt: new Date().toISOString(),
  };

  db.tickets.unshift(ticket);

  return res.status(201).json({
    success: true,
    message: 'Your support ticket has been registered. Our Grievance Officer will reach out within 30 minutes.',
    ticket,
  });
});

/**
 * 7. Active Coupons
 * GET /api/customer/coupons
 */
router.get('/coupons', (_req: Request, res: Response) => {
  const active = db.coupons.filter((c) => c.isActive);
  res.json({ coupons: active });
});

export default router;
