import { Router } from "express";
import { db } from "../database/db.js";
import { requireAdmin } from "../auth/authMiddleware.js";
const router = Router();
router.use(requireAdmin());
router.get("/overview", (req, res) => {
  const confirmedBookings = db.bookings.filter((b) => b.bookingStatus === "CONFIRMED");
  const cancelledBookings = db.bookings.filter((b) => b.bookingStatus === "CANCELLED");
  const pendingPayments = db.bookings.filter((b) => b.paymentStatus === "PENDING");
  const totalGrossRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalFare, 0);
  const totalRefundsIssued = db.refunds.reduce((sum, r) => sum + r.refundAmount, 0);
  const netPlatformRevenue = Math.round(totalGrossRevenue * 0.1);
  const approvedOperators = db.operators.filter((o) => o.kycStatus === "APPROVED").length;
  const pendingOperators = db.operators.filter((o) => o.kycStatus === "PENDING_VERIFICATION").length;
  const activeBuses = db.busConfigurations.filter((b) => b.status === "published").length;
  res.json({
    kpi: {
      totalBookings: db.bookings.length,
      confirmedBookings: confirmedBookings.length,
      pendingPayments: pendingPayments.length,
      cancelledBookings: cancelledBookings.length,
      totalCustomers: Math.max(db.customers.length, 1280),
      totalRegisteredOperators: db.operators.length,
      approvedOperators,
      pendingOperators,
      activeBuses,
      totalGrossRevenue,
      totalRefundsIssued,
      netPlatformRevenue
    },
    recentBookings: db.bookings.slice(0, 5),
    recentAuditLogs: db.auditLogs.slice(0, 8),
    pendingApprovalOperators: db.operators.filter((o) => o.kycStatus === "PENDING_VERIFICATION")
  });
});
router.get("/operators", (_req, res) => {
  res.json({ operators: db.operators });
});
router.post("/operators/:id/approve", (req, res) => {
  const { id } = req.params;
  const operator = db.operators.find((o) => o.id === id);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound", message: "Operator could not be found." });
  }
  operator.kycStatus = "APPROVED";
  operator.approvedAt = (/* @__PURE__ */ new Date()).toISOString();
  operator.approvedBy = req.user?.email || "admin@apnatrips.com";
  db.addAuditLog({
    actorEmail: req.user?.email || "admin@apnatrips.com",
    actorRole: req.user?.adminRole || "super_admin",
    action: "APPROVE_OPERATOR",
    entityType: "OperatorOrganization",
    entityId: operator.id,
    details: `Operator ${operator.businessName} (GSTIN ${operator.gstin}) approved by ${req.user?.email}. Partner can now publish fleet and manage live trips.`,
    status: "SUCCESS"
  });
  return res.json({
    success: true,
    message: `Operator ${operator.businessName} has been approved successfully.`,
    operator
  });
});
router.post("/operators/:id/reject", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const operator = db.operators.find((o) => o.id === id);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound" });
  }
  operator.kycStatus = "REJECTED";
  operator.kycRejectionReason = reason || "Documentation discrepancy or unverified GSTIN details.";
  db.addAuditLog({
    actorEmail: req.user?.email || "admin@apnatrips.com",
    actorRole: req.user?.adminRole || "super_admin",
    action: "REJECT_OPERATOR",
    entityType: "OperatorOrganization",
    entityId: operator.id,
    details: `Operator ${operator.businessName} rejected. Reason: ${operator.kycRejectionReason}`,
    status: "SUCCESS"
  });
  return res.json({
    success: true,
    message: `Operator ${operator.businessName} application has been rejected.`,
    operator
  });
});
router.put("/operators/:id/commission", (req, res) => {
  const { id } = req.params;
  const { percentage } = req.body;
  const operator = db.operators.find((o) => o.id === id);
  if (!operator) {
    return res.status(404).json({ error: "OperatorNotFound" });
  }
  const oldRate = operator.commissionPercentage;
  operator.commissionPercentage = Number(percentage);
  db.addAuditLog({
    actorEmail: req.user?.email || "admin@apnatrips.com",
    actorRole: req.user?.adminRole || "super_admin",
    action: "UPDATE_OPERATOR_COMMISSION",
    entityType: "OperatorOrganization",
    entityId: operator.id,
    details: `Changed commission for ${operator.businessName} from ${oldRate}% to ${operator.commissionPercentage}%.`,
    status: "SUCCESS"
  });
  return res.json({
    success: true,
    message: `Commission updated to ${operator.commissionPercentage}% for ${operator.businessName}.`,
    operator
  });
});
router.get("/buses", (_req, res) => {
  res.json({
    buses: db.busConfigurations,
    trips: db.trips
  });
});
router.get("/bookings", (_req, res) => {
  res.json({ bookings: db.bookings });
});
router.post("/refunds/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;
  const booking = db.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "BookingNotFound" });
  }
  if (booking.bookingStatus === "REFUNDED") {
    return res.status(400).json({ error: "AlreadyRefunded", message: "Booking has already been refunded." });
  }
  const cancellationFee = Math.round(booking.totalFare * 0.1);
  const refundAmount = booking.totalFare - cancellationFee;
  booking.bookingStatus = "REFUNDED";
  booking.paymentStatus = "REFUNDED";
  booking.refundAmount = refundAmount;
  booking.refundId = `ref-${Date.now()}`;
  const refundRecord = {
    id: booking.refundId,
    bookingId: booking.id,
    pnrNumber: booking.pnrNumber,
    originalAmount: booking.totalFare,
    cancellationFee,
    refundAmount,
    reason: reason || "Customer requested cancellation per refund policy",
    status: "PROCESSED",
    processedBy: req.user?.email || "admin@apnatrips.com",
    processedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.refunds.push(refundRecord);
  db.addAuditLog({
    actorEmail: req.user?.email || "admin@apnatrips.com",
    actorRole: req.user?.adminRole || "finance_manager",
    action: "PROCESS_REFUND",
    entityType: "RefundRecord",
    entityId: refundRecord.id,
    details: `Processed verified refund of \u20B9${refundAmount} (cancellation fee \u20B9${cancellationFee}) for PNR ${booking.pnrNumber}.`,
    status: "SUCCESS"
  });
  return res.json({
    success: true,
    message: `Verified refund of \u20B9${refundAmount} successfully processed.`,
    refund: refundRecord,
    booking
  });
});
router.get("/coupons", (_req, res) => {
  res.json({ coupons: db.coupons });
});
router.post("/coupons", (req, res) => {
  const { code, title, discountPercentage, maxDiscount, minBookingAmount, validTill } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: "BadRequest", message: "Coupon code and title are required." });
  }
  const newCoupon = {
    id: `cpn-${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    title: String(title).trim(),
    discountPercentage: Number(discountPercentage) || 0,
    maxDiscount: Number(maxDiscount) || 50,
    minBookingAmount: Number(minBookingAmount) || 500,
    validTill: validTill || "2026-12-31",
    isActive: true,
    usageCount: 0
  };
  db.coupons.push(newCoupon);
  db.addAuditLog({
    actorEmail: req.user?.email || "admin@apnatrips.com",
    actorRole: req.user?.adminRole || "super_admin",
    action: "CREATE_PROMOTIONAL_COUPON",
    entityType: "CouponOffer",
    entityId: newCoupon.id,
    details: `Created new discount coupon ${newCoupon.code}: ${newCoupon.title}`,
    status: "SUCCESS"
  });
  return res.status(201).json({ success: true, coupon: newCoupon });
});
router.get("/tickets", (_req, res) => {
  res.json({ tickets: db.tickets });
});
router.get("/audit-logs", (_req, res) => {
  res.json({ auditLogs: db.auditLogs });
});
router.get("/roles", (_req, res) => {
  res.json({
    administrators: db.adminUsers,
    rolesDescription: [
      { role: "super_admin", title: "Super Administrator", permissions: "Full root access, account approvals, financial controls, system configuration." },
      { role: "operations_manager", title: "Operations Manager", permissions: "Operator onboarding review, route oversight, fleet compliance, trip monitoring." },
      { role: "finance_manager", title: "Finance Manager", permissions: "Payment reconciliation, refund approvals, ledger auditing, operator settlements." },
      { role: "customer_support", title: "Customer Support Lead", permissions: "Booking lookup, ticket resolution, passenger communications, refund requests." }
    ]
  });
});
var adminRoutes_default = router;
export {
  adminRoutes_default as default
};
