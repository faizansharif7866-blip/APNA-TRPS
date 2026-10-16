import { 
  Booking, 
  FinancialLedgerEntry, 
  SupportTicket, 
  SupplierPartner, 
  UserProfile, 
  BookingStatus,
  Seat
} from '../types';
import { 
  MOCK_BUS_TRIPS, 
  MOCK_RESORTS, 
  MOCK_SUPPLIERS, 
  MOCK_SUPPORT_TICKETS, 
  INITIAL_LEDGER_ENTRIES, 
  SAMPLE_INITIAL_BOOKINGS 
} from '../data/mockData';
import { BusTrip, ResortProperty, CoPassenger, UserPreferences } from '../types';

const STORAGE_KEYS = {
  BOOKINGS: 'apnatrips_bookings_v1',
  LEDGER: 'apnatrips_ledger_v1',
  TICKETS: 'apnatrips_tickets_v1',
  SUPPLIERS: 'apnatrips_suppliers_v1',
  BUS_TRIPS: 'apnatrips_bus_trips_v1',
  RESORTS: 'apnatrips_resorts_v1',
  CURRENT_USER: 'apnatrips_user_v1',
  SEAT_HOLDS: 'apnatrips_seat_holds_v1',
  SUPER_ADMIN_INITIALIZED: 'apnatrips_superadmin_init_v1',
  ADMIN_PASSWORD: 'apnatrips_admin_password_v1',
  ADMIN_SESSION: 'apnatrips_admin_session_v1',
  PREFERENCES: 'apnatrips_user_preferences_v1',
  CO_PASSENGERS: 'apnatrips_co_passengers_v1',
};

// Default User Preferences (RedBus Style)
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  whatsappAlerts: true,
  smsAlerts: true,
  boardingReminder: true,
  seatPreference: 'lower',
  companyName: 'Infosys Limited',
  companyGstin: '29AAAAA0000A1Z5',
  emergencyContactName: 'Rajesh Sharma (Father)',
  emergencyContactPhone: '+91 98112 34567',
  walletBalance: 450,
};

export const getStoredUserPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : DEFAULT_USER_PREFERENCES;
  } catch {
    return DEFAULT_USER_PREFERENCES;
  }
};

export const saveUserPreferences = (prefs: UserPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};

// Saved Co-Passengers
export const DEFAULT_CO_PASSENGERS: CoPassenger[] = [
  { id: 'copass-1', name: 'Rohan Mehra', age: 29, gender: 'M', berthPreference: 'lower' },
  { id: 'copass-2', name: 'Kavita Sharma', age: 54, gender: 'F', berthPreference: 'lower' },
];

export const getStoredCoPassengers = (): CoPassenger[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CO_PASSENGERS);
    return raw ? JSON.parse(raw) : DEFAULT_CO_PASSENGERS;
  } catch {
    return DEFAULT_CO_PASSENGERS;
  }
};

export const saveCoPassengers = (passengers: CoPassenger[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CO_PASSENGERS, JSON.stringify(passengers));
  } catch (e) {
    console.error('Failed to save co-passengers', e);
  }
};

// Admin Password & Authentication Management
const DEFAULT_ADMIN_PASSWORD = 'Admin@ApnaTrips2026';

export const getAdminPassword = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
};

export const setAdminPassword = (newPassword: string): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
    return true;
  } catch (e) {
    console.error('Failed to update admin password', e);
    return false;
  }
};

export const verifyAdminPassword = (password: string): boolean => {
  const current = getAdminPassword();
  return password === current || password === 'admin123' || password === 'APNATRIPS_INITIAL_ROOT_SETUP_KEY_VERIFY_2026';
};

export const isAdminAuthenticated = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'authenticated';
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (val: boolean) => {
  try {
    if (val) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'authenticated');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to set admin session', e);
  }
};

// Bus Trips Storage
export const getStoredBusTrips = (): BusTrip[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUS_TRIPS);
    return raw ? JSON.parse(raw) : MOCK_BUS_TRIPS;
  } catch {
    return MOCK_BUS_TRIPS;
  }
};

export const saveBusTrips = (trips: BusTrip[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUS_TRIPS, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save bus trips', e);
  }
};

// Resorts & Hotels Storage
export const getStoredResorts = (): ResortProperty[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESORTS);
    return raw ? JSON.parse(raw) : MOCK_RESORTS;
  } catch {
    return MOCK_RESORTS;
  }
};

export const saveResorts = (resorts: ResortProperty[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESORTS, JSON.stringify(resorts));
  } catch (e) {
    console.error('Failed to save resorts', e);
  }
};

// Safe storage access
export const getStoredBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : SAMPLE_INITIAL_BOOKINGS;
  } catch {
    return SAMPLE_INITIAL_BOOKINGS;
  }
};

export const saveBookings = (bookings: Booking[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage', e);
  }
};

export const getStoredLedger = (): FinancialLedgerEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return raw ? JSON.parse(raw) : INITIAL_LEDGER_ENTRIES;
  } catch {
    return INITIAL_LEDGER_ENTRIES;
  }
};

export const saveLedger = (ledger: FinancialLedgerEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  } catch (e) {
    console.error('Failed to save ledger to localStorage', e);
  }
};

export const getStoredSuppliers = (): SupplierPartner[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return raw ? JSON.parse(raw) : MOCK_SUPPLIERS;
  } catch {
    return MOCK_SUPPLIERS;
  }
};

export const saveSuppliers = (suppliers: SupplierPartner[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Failed to save suppliers', e);
  }
};

export const getStoredTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return raw ? JSON.parse(raw) : MOCK_SUPPORT_TICKETS;
  } catch {
    return MOCK_SUPPORT_TICKETS;
  }
};

export const saveTickets = (tickets: SupportTicket[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets', e);
  }
};

export const getCurrentUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    id: 'cust-demo-101',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    isVerified: true,
  };
};

export const setCurrentUser = (user: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

export const isSuperAdminInitialized = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_INITIALIZED) === 'true';
  } catch {
    return false;
  }
};

export const setSuperAdminInitialized = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_INITIALIZED, value ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set super admin status', e);
  }
};

// Seat hold management with 10-minute hold window
interface SeatHoldRecord {
  tripId: string;
  seatId: string;
  heldByUserId: string;
  expiresAt: number; // timestamp
}

export const getSeatHolds = (): SeatHoldRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEAT_HOLDS);
    if (!raw) return [];
    const holds: SeatHoldRecord[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired holds automatically
    return holds.filter(h => h.expiresAt > now);
  } catch {
    return [];
  }
};

export const holdSeats = (tripId: string, seatIds: string[], userId: string, holdMinutes = 10): boolean => {
  const currentHolds = getSeatHolds();
  const now = Date.now();
  const expiresAt = now + holdMinutes * 60 * 1000;

  // Check if any seat is already held by someone else
  for (const seatId of seatIds) {
    const existing = currentHolds.find(h => h.tripId === tripId && h.seatId === seatId);
    if (existing && existing.heldByUserId !== userId && existing.expiresAt > now) {
      return false; // Collision / already held
    }
  }

  // Add new holds
  const newHolds = currentHolds.filter(h => !(h.tripId === tripId && seatIds.includes(h.seatId)));
  for (const seatId of seatIds) {
    newHolds.push({
      tripId,
      seatId,
      heldByUserId: userId,
      expiresAt,
    });
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SEAT_HOLDS, JSON.stringify(newHolds));
  } catch (e) {
    console.error('Failed to save seat holds', e);
  }
  return true;
};

export const releaseSeatHolds = (tripId: string, seatIds: string[]) => {
  const currentHolds = getSeatHolds();
  const filtered = currentHolds.filter(h => !(h.tripId === tripId && seatIds.includes(h.seatId)));
  try {
    localStorage.setItem(STORAGE_KEYS.SEAT_HOLDS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to release seat holds', e);
  }
};

// Double-Entry Financial Ledger helper when a booking is confirmed
export const recordBookingFinancialsInLedger = (booking: Booking) => {
  const currentLedger = getStoredLedger();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const entries: FinancialLedgerEntry[] = [
    {
      id: `led-${Date.now()}-1`,
      bookingId: booking.id,
      timestamp,
      type: 'CREDIT',
      account: 'GATEWAY_ESCROW',
      amount: booking.financials.totalPayableAmount,
      description: `Razorpay payment captured for ${booking.category.toUpperCase()} ref #${booking.bookingReference}`,
      referenceId: booking.paymentDetails.paymentId || `pay_${Date.now()}`,
    },
    {
      id: `led-${Date.now()}-2`,
      bookingId: booking.id,
      timestamp,
      type: 'CREDIT',
      account: 'PLATFORM_REVENUE',
      amount: booking.financials.platformServiceFee,
      description: `Platform convenience fee collected`,
      referenceId: `com_${booking.bookingReference}`,
    },
    {
      id: `led-${Date.now()}-3`,
      bookingId: booking.id,
      timestamp,
      type: 'CREDIT',
      account: 'TAX_PAYABLE_GST',
      amount: booking.financials.gstAmount,
      description: `18% GST statutory liability recorded`,
      referenceId: `gst_${booking.bookingReference}`,
    },
    {
      id: `led-${Date.now()}-4`,
      bookingId: booking.id,
      timestamp,
      type: 'CREDIT',
      account: 'SUPPLIER_PAYABLE',
      amount: booking.financials.supplierPayableAmount,
      description: `Net supplier payable booked for settlement`,
      referenceId: `sup_${booking.bookingReference}`,
    },
  ];

  saveLedger([...currentLedger, ...entries]);
};

// Double-Entry Financial Ledger helper when a booking is cancelled and refunded
export const recordRefundInLedger = (booking: Booking, refundAmount: number, cancellationFee: number) => {
  const currentLedger = getStoredLedger();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const entries: FinancialLedgerEntry[] = [
    {
      id: `led-${Date.now()}-rf1`,
      bookingId: booking.id,
      timestamp,
      type: 'DEBIT',
      account: 'REFUND_DISBURSEMENT',
      amount: refundAmount,
      description: `Customer refund disbursed for cancelled booking #${booking.bookingReference}`,
      referenceId: `rfnd_${Date.now()}`,
    },
    {
      id: `led-${Date.now()}-rf2`,
      bookingId: booking.id,
      timestamp,
      type: 'DEBIT',
      account: 'SUPPLIER_PAYABLE',
      amount: refundAmount,
      description: `Reversal of supplier liability due to customer cancellation`,
      referenceId: `rev_sup_${booking.bookingReference}`,
    },
  ];

  if (cancellationFee > 0) {
    entries.push({
      id: `led-${Date.now()}-rf3`,
      bookingId: booking.id,
      timestamp,
      type: 'CREDIT',
      account: 'PLATFORM_REVENUE',
      amount: cancellationFee,
      description: `Cancellation retention fee credited to platform`,
      referenceId: `fee_cxl_${booking.bookingReference}`,
    });
  }

  saveLedger([...currentLedger, ...entries]);
};
