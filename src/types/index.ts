export type TravelCategory = 'bus' | 'train' | 'resort' | 'taxi' | 'auto' | 'bike';

export type UserRole = 
  | 'customer'
  | 'super_admin'
  | 'operations_admin'
  | 'finance_manager'
  | 'supplier'
  | 'driver';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  supplierId?: string;
  assignedTripId?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'apple' | 'phone' | 'guest';
}

export interface CoPassenger {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference?: 'lower' | 'upper' | 'window' | 'any';
}

export interface UserPreferences {
  whatsappAlerts: boolean;
  smsAlerts: boolean;
  boardingReminder: boolean;
  seatPreference: 'lower' | 'upper' | 'window' | 'any';
  companyName: string;
  companyGstin: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  walletBalance: number;
}

export type BookingStatus =
  | 'PENDING'
  | 'INVENTORY_HELD'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'CONFIRMED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'COMPLETED';

export interface Seat {
  id: string;
  number: string;
  deck: 'lower' | 'upper';
  type: 'sleeper' | 'seater';
  status: 'available' | 'held' | 'booked';
  heldExpiresAt?: number;
  price: number;
}

export interface BusTrip {
  id: string;
  supplierId: string;
  operatorName: string;
  busNumber: string;
  busType: string;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  rating: number;
  reviewCount: number;
  totalSeats: number;
  availableSeatsCount: number;
  fareStartingFrom: number;
  amenities: string[];
  boardingPoints: { location: string; time: string }[];
  droppingPoints: { location: string; time: string }[];
  cancellationPolicy: string;
  hasLiveGps: boolean;
  gpsTripId?: string;
  seats: Seat[];
}

export interface TrainSchedule {
  id: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOn: string[];
  classes: {
    code: '1A' | '2A' | '3A' | 'CC' | 'SL';
    name: string;
    fare: number;
    availability: string;
  }[];
  disclaimer: string;
}

export interface ResortRoom {
  id: string;
  name: string;
  description: string;
  bedType: string;
  maxOccupancy: number;
  pricePerNight: number;
  amenities: string[];
  availableUnits: number;
  photos: string[];
}

export interface ResortProperty {
  id: string;
  supplierId: string;
  name: string;
  location: string;
  city: string;
  state: string;
  starRating: number;
  reviewsCount: number;
  description: string;
  coverImage: string;
  startingPrice: number;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  rooms: ResortRoom[];
}

export interface MobilityVehicle {
  id: string;
  category: 'taxi' | 'auto' | 'bike';
  subType: string;
  model: string;
  capacity: number;
  fareBase: number;
  perKmRate: number;
  driverName?: string;
  driverRating?: number;
  vehicleNumber: string;
  availableLocations: string[];
  imageUrl: string;
  fuelType: 'EV' | 'Petrol' | 'Diesel' | 'CNG';
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  seatNumber?: string;
  berthPreference?: string;
}

export interface FinancialBreakdown {
  baseFare: number;
  gstAmount: number; // 18%
  platformServiceFee: number;
  gatewayProcessingFee: number; // 2%
  couponDiscount: number;
  totalPayableAmount: number;
  supplierPayableAmount: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  pnrNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: TravelCategory;
  tripDetails: {
    title: string;
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
  };
  passengers: Passenger[];
  financials: FinancialBreakdown;
  paymentDetails: {
    orderId: string;
    paymentId?: string;
    signature?: string;
    method?: string;
    verifiedAt?: string;
  };
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  cancellationDetails?: {
    requestedAt: string;
    refundAmount: number;
    deductionAmount: number;
    processedAt?: string;
  };
}

export interface FinancialLedgerEntry {
  id: string;
  bookingId: string;
  timestamp: string;
  type: 'CREDIT' | 'DEBIT';
  account: 'CUSTOMER_RECEIVABLE' | 'GATEWAY_ESCROW' | 'PLATFORM_REVENUE' | 'TAX_PAYABLE_GST' | 'SUPPLIER_PAYABLE' | 'REFUND_DISBURSEMENT';
  amount: number;
  description: string;
  referenceId: string;
}

export interface SupplierPartner {
  id: string;
  businessName: string;
  ownerName: string;
  category: 'bus_operator' | 'resort_hotel' | 'fleet_owner';
  phone: string;
  email: string;
  gstin: string;
  panNumber: string;
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  commissionPercentage: number;
  bankAccountMasked: string;
  totalTripsCount: number;
  totalEarnings: number;
  pendingSettlement: number;
  createdAt: string;
}

export interface GpsTelemetry {
  tripId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  currentLat: number;
  currentLng: number;
  speedKmh: number;
  headingDegrees: number;
  lastUpdated: string;
  isStale: boolean;
  nextStopName: string;
  estimatedArrivalMinutes: number;
  routeStops: { name: string; lat: number; lng: number; passed: boolean; eta: string }[];
}

export interface SupportTicket {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: 'cancellation_refund' | 'bus_delay' | 'driver_issue' | 'resort_checkin' | 'payment_query';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: { sender: 'customer' | 'agent'; text: string; timestamp: string }[];
  createdAt: string;
}
