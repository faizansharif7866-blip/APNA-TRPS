import { Router } from "express";
import { db } from "../database/db.js";
import { requireOperator } from "../auth/authMiddleware.js";
import { validateBusLayout } from "../../../src/services/busLayoutValidator.js";
const router = Router();
router.use(requireOperator());
router.get("/dashboard", (req, res) => {
  const operatorId = req.user?.operatorId;
  const operator = db.operators.find((o) => o.id === operatorId);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound" });
  }
  const myBuses = db.busConfigurations.filter((b) => b.operatorId === operatorId);
  const myTrips = db.trips.filter((t) => t.supplierId === operatorId);
  const myBookings = db.bookings.filter((b) => b.operatorId === operatorId);
  const grossEarnings = myBookings.filter((b) => b.bookingStatus === "CONFIRMED").reduce((sum, b) => sum + b.totalFare, 0);
  const commissionDeduction = Math.round(grossEarnings * (operator.commissionPercentage / 100));
  const netSettlement = grossEarnings - commissionDeduction;
  res.json({
    operator,
    stats: {
      totalBuses: myBuses.length,
      activeTrips: myTrips.length,
      totalBookings: myBookings.length,
      grossEarnings,
      commissionPercentage: operator.commissionPercentage,
      commissionDeduction,
      netSettlement,
      pendingSettlement: operator.pendingSettlement || 142800
    },
    buses: myBuses,
    trips: myTrips,
    recentBookings: myBookings.slice(0, 5)
  });
});
router.get("/buses", (req, res) => {
  const operatorId = req.user?.operatorId;
  const myBuses = db.busConfigurations.filter((b) => b.operatorId === operatorId);
  res.json({ buses: myBuses });
});
router.post("/buses", (req, res) => {
  const operatorId = req.user?.operatorId;
  const operator = db.operators.find((o) => o.id === operatorId);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound" });
  }
  const {
    busName,
    registrationNumber,
    category,
    deckType,
    manufacturer,
    model,
    amenities,
    rows,
    cols,
    positions
  } = req.body;
  if (!busName || !registrationNumber || !deckType || !Array.isArray(positions)) {
    return res.status(400).json({
      error: "BadRequest",
      message: "Missing required configuration fields: busName, registrationNumber, deckType, and positions are mandatory."
    });
  }
  const report = validateBusLayout({
    busName,
    registrationNumber,
    category: category || "sleeper",
    deckType,
    positions
  });
  if (!report.isValid) {
    return res.status(422).json({
      success: false,
      message: "Bus layout validation failed: Layout violates safety or geometric constraints.",
      validationReport: report
    });
  }
  const newBusConfig = {
    id: `bus-cfg-${Date.now()}`,
    operatorId: operator.id,
    operatorName: operator.businessName,
    busName: String(busName).trim(),
    registrationNumber: String(registrationNumber).trim().toUpperCase(),
    category: category || "sleeper",
    deckType,
    manufacturer: manufacturer || "Volvo",
    model: model || "Multi-Axle Express",
    amenities: amenities || ["Live GPS Tracking", "AC", "Blanket", "Water Bottle"],
    rows: Number(rows) || 8,
    cols: Number(cols) || 3,
    positions,
    status: "published",
    safetyCertified: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.busConfigurations.unshift(newBusConfig);
  operator.registeredBusCount = (operator.registeredBusCount || 0) + 1;
  const passengerSeats = positions.filter((pos) => ["seater", "semi_sleeper", "single_sleeper", "double_sleeper"].includes(pos.type)).map((pos) => ({
    id: `seat-${pos.deck}-${pos.label}`,
    number: pos.label,
    deck: pos.deck,
    type: pos.type === "seater" ? "seater" : pos.type === "semi_sleeper" ? "semi_sleeper" : "sleeper",
    status: pos.status === "booked" ? "booked" : "available",
    price: pos.basePrice || (pos.deck === "lower" ? 1599 : 1799),
    isLadies: pos.isLadies,
    isWindow: pos.isWindow,
    berthType: pos.type === "double_sleeper" ? "double" : "single"
  }));
  const liveTrip = {
    id: `trip-live-${Date.now()}`,
    supplierId: operator.id,
    operatorName: operator.businessName,
    busNumber: newBusConfig.registrationNumber,
    busType: `${newBusConfig.busName} (${newBusConfig.category === "sleeper" ? "AC Sleeper 2+1" : "AC Semi-Sleeper"})`,
    category: newBusConfig.category,
    sourceCity: "Chennai",
    destinationCity: "Bengaluru",
    departureTime: "22:30",
    arrivalTime: "05:40",
    duration: "7h 10m",
    rating: 4.9,
    reviewCount: 1,
    totalSeats: report.stats.totalSeats,
    availableSeatsCount: passengerSeats.filter((s) => s.status === "available").length,
    fareStartingFrom: Math.min(...passengerSeats.map((s) => s.price)),
    amenities: newBusConfig.amenities,
    boardingPoints: [
      { location: "Chennai Koyambedu Omni Bus Stand", time: "22:30" },
      { location: "Chennai Guindy Kathipara Flyover", time: "23:00" }
    ],
    droppingPoints: [
      { location: "Bengaluru Electronic City Toll", time: "04:45" },
      { location: "Bengaluru Majestic Bus Terminus", time: "05:40" }
    ],
    tripDate: "2026-10-18",
    fleetConfigId: newBusConfig.id
  };
  db.trips.unshift(liveTrip);
  db.addAuditLog({
    actorEmail: req.user?.email || operator.email,
    actorRole: "operator",
    action: "PUBLISH_BUS_CONFIGURATION",
    entityType: "BusFleetConfiguration",
    entityId: newBusConfig.id,
    details: `Operator published bus ${newBusConfig.busName} (${newBusConfig.registrationNumber}) with ${report.stats.totalSeats} seats. Passed all server safety checks.`,
    status: "SUCCESS"
  });
  return res.status(201).json({
    success: true,
    message: `Bus ${newBusConfig.busName} published successfully and added to live booking inventory.`,
    busConfig: newBusConfig,
    liveTrip,
    validationReport: report
  });
});
router.get("/trips", (req, res) => {
  const operatorId = req.user?.operatorId;
  const myTrips = db.trips.filter((t) => t.supplierId === operatorId);
  res.json({ trips: myTrips });
});
router.get("/trips/:tripId/manifest", (req, res) => {
  const operatorId = req.user?.operatorId;
  const { tripId } = req.params;
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: "TripNotFound" });
  }
  if (trip.supplierId !== operatorId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access Denied: You cannot view passenger manifests of another operator."
    });
  }
  const tripBookings = db.bookings.filter((b) => b.operatorId === operatorId && b.bookingStatus === "CONFIRMED");
  const passengers = tripBookings.flatMap(
    (b) => (b.seatNumbers || []).map((seat) => ({
      pnrNumber: b.pnrNumber,
      seatNumber: seat,
      passengerName: b.passengerName || "Confirmed Passenger",
      passengerPhone: b.passengerPhone || "Masked",
      boardingPoint: b.source,
      droppingPoint: b.destination,
      paymentStatus: b.paymentStatus
    }))
  );
  return res.json({
    trip,
    totalPassengers: passengers.length,
    manifest: passengers
  });
});
router.get("/settlements", (req, res) => {
  const operatorId = req.user?.operatorId;
  const operator = db.operators.find((o) => o.id === operatorId);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound" });
  }
  const myBookings = db.bookings.filter((b) => b.operatorId === operatorId);
  const grossBookings = myBookings.filter((b) => b.bookingStatus === "CONFIRMED").reduce((sum, b) => sum + b.totalFare, 0);
  const platformCommissions = Math.round(grossBookings * (operator.commissionPercentage / 100));
  const refundDeductions = db.refunds.filter((r) => myBookings.some((b) => b.id === r.bookingId)).reduce((sum, r) => sum + r.refundAmount, 0);
  const netPayable = grossBookings - platformCommissions - refundDeductions;
  return res.json({
    settlement: {
      operatorId: operator.id,
      businessName: operator.businessName,
      bankAccountMasked: operator.bankAccountMasked,
      bankIfsc: operator.bankIfsc,
      grossBookings,
      platformCommissions,
      refundDeductions,
      netPayable,
      settledAmount: operator.totalEarnings || 2845e3,
      pendingAmount: operator.pendingSettlement || 142800,
      lastSettlementDate: "2026-10-10"
    }
  });
});
var operatorRoutes_default = router;
export {
  operatorRoutes_default as default
};
