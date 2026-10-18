import { Router } from "express";
import { db } from "../database/db.js";
const router = Router();
router.get("/buses/search", (req, res) => {
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
    searchParams: { source, destination, date }
  });
});
router.get("/buses/:tripId", (req, res) => {
  const { tripId } = req.params;
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: "TripNotFound", message: "Trip does not exist." });
  }
  const busConfig = trip.fleetConfigId ? db.busConfigurations.find((b) => b.id === trip.fleetConfigId) : db.busConfigurations[0];
  const bookedSeatNumbers = new Set(
    db.bookings.filter((b) => b.bookingStatus === "CONFIRMED").flatMap((b) => b.seatNumbers || [])
  );
  const updatedPositions = busConfig ? busConfig.positions.map((pos) => ({
    ...pos,
    status: bookedSeatNumbers.has(pos.label) ? "booked" : pos.status
  })) : [];
  return res.json({
    trip,
    busConfiguration: busConfig ? {
      ...busConfig,
      positions: updatedPositions
    } : null
  });
});
router.post("/bookings", (req, res) => {
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
    paymentMethod
  } = req.body;
  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: "BadRequest", message: "Please select at least one seat." });
  }
  const alreadyBooked = db.bookings.some(
    (b) => b.bookingStatus === "CONFIRMED" && b.seatNumbers?.some((s) => seatNumbers.includes(s))
  );
  if (alreadyBooked) {
    return res.status(409).json({
      error: "SeatAlreadyReserved",
      message: "One or more of the selected seats were just reserved by another customer. Please select different seats."
    });
  }
  const base = Number(baseFareTotal) || seatNumbers.length * 1599;
  const tax = Math.round(base * 0.05);
  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code === String(couponCode).toUpperCase() && c.isActive);
    if (coupon) {
      if (coupon.discountPercentage > 0) {
        discount = Math.min(Math.round(base * coupon.discountPercentage / 100), coupon.maxDiscount);
      } else {
        discount = coupon.maxDiscount;
      }
      coupon.usageCount += 1;
    }
  }
  const totalFare = Math.max(0, base + tax - discount);
  const pnrNumber = `AT-2026-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const transactionId = `TXN-RZP-${Date.now()}`;
  const newBooking = {
    id: `bkg-${Date.now()}`,
    pnrNumber,
    category: category || "bus",
    tripTitle: tripTitle || `${source} to ${destination}`,
    source: source || "Chennai",
    destination: destination || "Bengaluru",
    travelDate: travelDate || "2026-10-18",
    departureTime: departureTime || "22:30",
    operatorOrHost: operatorOrHost || "Sri Sai Travels Private Limited",
    operatorId: operatorId || "op-001",
    seatNumbers,
    passengers: passengers || [],
    passengerName: passengerName || "Valued Traveler",
    passengerEmail: passengerEmail || "traveler@apnatrips.com",
    passengerPhone: passengerPhone || "+91 98000 00000",
    totalFare,
    baseFare: base,
    taxAmount: tax,
    discountAmount: discount,
    couponCode: couponCode || void 0,
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    paymentMethod: paymentMethod || "UPI (Google Pay / PhonePe)",
    transactionId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.bookings.unshift(newBooking);
  const paymentRecord = {
    id: `pay-${Date.now()}`,
    bookingId: newBooking.id,
    pnrNumber: newBooking.pnrNumber,
    amount: totalFare,
    currency: "INR",
    gateway: "Razorpay",
    gatewayTransactionId: transactionId,
    status: "SUCCESS",
    customerEmail: newBooking.passengerEmail || "",
    customerPhone: newBooking.passengerPhone || "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.transactions.unshift(paymentRecord);
  const op = db.operators.find((o) => o.id === newBooking.operatorId);
  if (op) {
    op.totalEarnings = (op.totalEarnings || 0) + totalFare;
  }
  return res.status(201).json({
    success: true,
    message: "Booking confirmed and ticket generated successfully.",
    booking: newBooking,
    payment: paymentRecord
  });
});
router.get("/bookings", (req, res) => {
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
router.post("/bookings/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "BookingNotFound" });
  }
  if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "REFUNDED") {
    return res.status(400).json({ error: "AlreadyCancelled", message: "Booking is already cancelled." });
  }
  const cancellationFee = Math.round(booking.totalFare * 0.1);
  const refundAmount = booking.totalFare - cancellationFee;
  booking.bookingStatus = "CANCELLED";
  booking.cancelledAt = (/* @__PURE__ */ new Date()).toISOString();
  booking.refundAmount = refundAmount;
  booking.refundId = `ref-${Date.now()}`;
  const refundRecord = {
    id: booking.refundId,
    bookingId: booking.id,
    pnrNumber: booking.pnrNumber,
    originalAmount: booking.totalFare,
    cancellationFee,
    refundAmount,
    reason: reason || "Customer self-service cancellation",
    status: "PROCESSED",
    processedBy: "System Auto-Refund Bot",
    processedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.refunds.unshift(refundRecord);
  db.addAuditLog({
    actorEmail: booking.passengerEmail || "customer@apnatrips.com",
    actorRole: "customer",
    action: "CANCEL_BOOKING",
    entityType: "Booking",
    entityId: booking.id,
    details: `Customer cancelled booking ${booking.pnrNumber}. Auto-refund of \u20B9${refundAmount} initiated (Fee \u20B9${cancellationFee}).`,
    status: "SUCCESS"
  });
  return res.json({
    success: true,
    message: `Booking cancelled per policy. Refund of \u20B9${refundAmount} will be credited to original payment method within 2-4 hours.`,
    booking,
    refund: refundRecord
  });
});
router.post("/support", (req, res) => {
  const { name, phone, email, pnrNumber, category, message, subject } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: "BadRequest", message: "Name, phone, and inquiry message are required." });
  }
  const ticket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
    customerName: name,
    customerPhone: phone,
    customerEmail: email || "not_provided@apnatrips.com",
    pnrNumber: pnrNumber || void 0,
    category: category || "general",
    priority: "medium",
    status: "OPEN",
    subject: subject || "General Customer Grievance / Inquiry",
    message,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.tickets.unshift(ticket);
  return res.status(201).json({
    success: true,
    message: "Your support ticket has been registered. Our Grievance Officer will reach out within 30 minutes.",
    ticket
  });
});
router.get("/coupons", (_req, res) => {
  const active = db.coupons.filter((c) => c.isActive);
  res.json({ coupons: active });
});
var customerRoutes_default = router;
export {
  customerRoutes_default as default
};
