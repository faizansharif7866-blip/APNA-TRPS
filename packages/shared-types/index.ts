/**
 * ApnaTrips Shared Types
 * Re-exports core types from src/types/index.ts and defines unified enterprise models
 * for Customer Web, Admin Web, Partner Web, and Backend Server.
 */

export * from '../../src/types/index.js';

export interface BookingPassenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  seatNumber?: string;
  berthPreference?: string;
}

export type AdminRole = 'super_admin' | 'operations_manager' | 'customer_support' | 'finance_manager';

export type OperatorKycStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  mfaEnabled?: boolean;
}

export interface OperatorOrganization {
  id: string;
  businessName: string;
  tradeName?: string;
  ownerName: string;
  email: string;
  phone: string;
  gstin: string;
  panNumber: string;
  kycStatus: OperatorKycStatus;
  kycRejectionReason?: string;
  commissionPercentage: number;
  bankAccountMasked: string;
  bankIfsc?: string;
  bankName?: string;
  headOfficeAddress?: string;
  totalTripsCount: number;
  totalEarnings: number;
  pendingSettlement: number;
  registeredBusCount: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  pnrNumber: string;
  amount: number;
  currency: string;
  gateway: 'Razorpay' | 'UPI' | 'NetBanking' | 'Card';
  gatewayTransactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  pnrNumber: string;
  originalAmount: number;
  cancellationFee: number;
  refundAmount: number;
  reason: string;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  processedBy?: string;
  processedAt: string;
}

export interface CommissionRule {
  id: string;
  operatorId?: string;
  category: string;
  percentage: number;
  fixedFee: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CouponOffer {
  id: string;
  code: string;
  title: string;
  discountPercentage: number;
  maxDiscount: number;
  minBookingAmount: number;
  validTill: string;
  isActive: boolean;
  usageCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  ipAddress?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
}

export interface OperatorSettlementSummary {
  operatorId: string;
  grossBookings: number;
  platformCommissions: number;
  refundDeductions: number;
  netPayable: number;
  settledAmount: number;
  pendingAmount: number;
  lastSettlementDate?: string;
}
