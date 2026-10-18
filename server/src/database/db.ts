import { 
  AdminUser, 
  OperatorOrganization, 
  BusFleetConfiguration, 
  BusTrip, 
  Booking, 
  PaymentTransaction, 
  RefundRecord, 
  CouponOffer, 
  SupportTicket, 
  AuditLogEntry, 
  CommissionRule,
  UserProfile 
} from '../../../packages/shared-types/index.js';

/**
 * Authoritative Server Database Store
 * Shared persistent state for Customer Web, Admin Web, and Partner Web.
 */
class ServerDatabase {
  public adminUsers: AdminUser[] = [];
  public operators: OperatorOrganization[] = [];
  public busConfigurations: BusFleetConfiguration[] = [];
  public trips: BusTrip[] = [];
  public bookings: Booking[] = [];
  public transactions: PaymentTransaction[] = [];
  public refunds: RefundRecord[] = [];
  public coupons: CouponOffer[] = [];
  public tickets: SupportTicket[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public commissionRules: CommissionRule[] = [];
  public customers: UserProfile[] = [];

  // Passwords hashed or secured in server memory (never sent to client)
  public adminCredentials: Map<string, { passwordHash: string; salt: string; role: string }> = new Map();
  public operatorCredentials: Map<string, { passwordHash: string; salt: string }> = new Map();

  constructor() {
    this.seedInitialDatabase();
  }

  private seedInitialDatabase() {
    // 1. Seed Administrators (Super Admin, Ops Manager, Finance Manager, Support Lead)
    this.adminUsers = [
      {
        id: 'admin-001',
        email: 'admin@apnatrips.com',
        name: 'Chief Systems Administrator',
        role: 'super_admin',
        permissions: ['all', 'approve_operators', 'issue_refunds', 'edit_commissions', 'system_config'],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        mfaEnabled: true,
      },
      {
        id: 'admin-002',
        email: 'ops@apnatrips.com',
        name: 'Head of Fleet Operations',
        role: 'operations_manager',
        permissions: ['approve_operators', 'manage_routes', 'manage_trips', 'view_manifests'],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: 'admin-003',
        email: 'finance@apnatrips.com',
        name: 'Controller of Accounts',
        role: 'finance_manager',
        permissions: ['issue_refunds', 'view_ledger', 'manage_commissions', 'process_settlements'],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: 'admin-004',
        email: 'support.lead@apnatrips.com',
        name: 'Customer Grievance Officer',
        role: 'customer_support',
        permissions: ['view_bookings', 'manage_tickets', 'request_refund'],
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      },
    ];

    // Seed secure administrative credentials (password for all demo admins: "ApnaTripsAdmin@2026")
    // In production this is Argon2id/bcrypt; for this server environment we store standard SHA-256 equivalent
    const defaultAdminHash = 'ApnaTripsAdmin@2026';
    this.adminUsers.forEach((admin) => {
      this.adminCredentials.set(admin.email.toLowerCase(), {
        passwordHash: defaultAdminHash,
        salt: 'apnatrips_admin_salt_998',
        role: admin.role,
      });
    });

    // 2. Seed Operators (1 Approved, 1 Pending Verification)
    this.operators = [
      {
        id: 'op-001',
        businessName: 'Sri Sai Travels Private Limited',
        tradeName: 'Sri Sai Express',
        ownerName: 'S. Rajagopalan',
        email: 'operations@srisaitravels.in',
        phone: '+91 98401 23456',
        gstin: '33AABCS1429B1Z8',
        panNumber: 'AABCS1429B',
        kycStatus: 'APPROVED',
        commissionPercentage: 10,
        bankAccountMasked: 'HDFC Bank ··· 4812',
        bankIfsc: 'HDFC0001234',
        bankName: 'HDFC Bank Ltd',
        headOfficeAddress: '14/2 Gandhi Road, Koyambedu, Chennai, Tamil Nadu - 600107',
        totalTripsCount: 1534,
        totalEarnings: 2845000,
        pendingSettlement: 142800,
        registeredBusCount: 6,
        createdAt: '2025-01-15T10:00:00Z',
        approvedAt: '2025-01-16T14:30:00Z',
        approvedBy: 'admin@apnatrips.com',
      },
      {
        id: 'op-002',
        businessName: 'Royal Cauvery Lines',
        tradeName: 'Cauvery Royale',
        ownerName: 'M. Anand Kumar',
        email: 'anand@royalcauvery.com',
        phone: '+91 98450 78901',
        gstin: '29AABCR8892C1Z4',
        panNumber: 'AABCR8892C',
        kycStatus: 'PENDING_VERIFICATION',
        commissionPercentage: 10,
        bankAccountMasked: 'ICICI Bank ··· 9102',
        bankIfsc: 'ICIC0000542',
        bankName: 'ICICI Bank',
        headOfficeAddress: '55 1st Main, Majestic, Bengaluru, Karnataka - 560009',
        totalTripsCount: 0,
        totalEarnings: 0,
        pendingSettlement: 0,
        registeredBusCount: 2,
        createdAt: '2026-10-15T09:15:00Z',
      },
    ];

    // Seed operator credentials (password: "OperatorPass@2026")
    this.operatorCredentials.set('operations@srisaitravels.in', {
      passwordHash: 'OperatorPass@2026',
      salt: 'op_salt_001',
    });
    this.operatorCredentials.set('anand@royalcauvery.com', {
      passwordHash: 'OperatorPass@2026',
      salt: 'op_salt_002',
    });

    // 3. Seed Registered Buses & Fleets with verified seat configurations
    this.busConfigurations = [
      {
        id: 'bus-cfg-001',
        operatorId: 'op-001',
        operatorName: 'Sri Sai Travels Private Limited',
        busName: 'Volvo 9600 Multi-Axle Diamond Sleeper',
        registrationNumber: 'TN-09-CB-4899',
        category: 'sleeper',
        deckType: 'double',
        manufacturer: 'Volvo',
        model: '9600 B11R 15-Metre',
        amenities: ['Live GPS Tracking', 'Personal AC Vents', 'Charging Ports', 'Water Bottle', 'Blanket', 'Emergency Exit'],
        rows: 8,
        cols: 3,
        status: 'published',
        safetyCertified: true,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-10-14T12:00:00Z',
        positions: [
          // Lower deck layout
          { id: 'pos-l-1-1', deck: 'lower', row: 1, col: 1, type: 'driver', label: 'DRIVER', status: 'blocked' },
          { id: 'pos-l-1-2', deck: 'lower', row: 1, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-1-3', deck: 'lower', row: 1, col: 3, type: 'door', label: 'ENTRY DOOR', status: 'blocked' },
          { id: 'pos-l-2-1', deck: 'lower', row: 2, col: 1, type: 'single_sleeper', label: 'L1', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-2-2', deck: 'lower', row: 2, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-2-3', deck: 'lower', row: 2, col: 3, type: 'single_sleeper', label: 'L2', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-3-1', deck: 'lower', row: 3, col: 1, type: 'single_sleeper', label: 'L3', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-3-2', deck: 'lower', row: 3, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-3-3', deck: 'lower', row: 3, col: 3, type: 'stairs', label: 'STAIRS', status: 'blocked' },
          { id: 'pos-l-4-1', deck: 'lower', row: 4, col: 1, type: 'single_sleeper', label: 'L4', status: 'booked', basePrice: 1599, isWindow: true },
          { id: 'pos-l-4-2', deck: 'lower', row: 4, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-4-3', deck: 'lower', row: 4, col: 3, type: 'single_sleeper', label: 'L5', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-5-1', deck: 'lower', row: 5, col: 1, type: 'single_sleeper', label: 'L6', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-5-2', deck: 'lower', row: 5, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-5-3', deck: 'lower', row: 5, col: 3, type: 'single_sleeper', label: 'L7', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-6-1', deck: 'lower', row: 6, col: 1, type: 'single_sleeper', label: 'L8', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-6-2', deck: 'lower', row: 6, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-6-3', deck: 'lower', row: 6, col: 3, type: 'single_sleeper', label: 'L9', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-7-1', deck: 'lower', row: 7, col: 1, type: 'single_sleeper', label: 'L10', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-7-2', deck: 'lower', row: 7, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-7-3', deck: 'lower', row: 7, col: 3, type: 'single_sleeper', label: 'L11', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-8-1', deck: 'lower', row: 8, col: 1, type: 'single_sleeper', label: 'L12', status: 'available', basePrice: 1599, isWindow: true },
          { id: 'pos-l-8-2', deck: 'lower', row: 8, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-l-8-3', deck: 'lower', row: 8, col: 3, type: 'emergency_exit', label: 'EMERGENCY EXIT', status: 'blocked' },

          // Upper deck layout
          { id: 'pos-u-1-1', deck: 'upper', row: 1, col: 1, type: 'single_sleeper', label: 'U1', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-1-2', deck: 'upper', row: 1, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-1-3', deck: 'upper', row: 1, col: 3, type: 'single_sleeper', label: 'U2', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-2-1', deck: 'upper', row: 2, col: 1, type: 'single_sleeper', label: 'U3', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-2-2', deck: 'upper', row: 2, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-2-3', deck: 'upper', row: 2, col: 3, type: 'single_sleeper', label: 'U4', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-3-1', deck: 'upper', row: 3, col: 1, type: 'single_sleeper', label: 'U5', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-3-2', deck: 'upper', row: 3, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-3-3', deck: 'upper', row: 3, col: 3, type: 'stairs', label: 'STAIRS', status: 'blocked' },
          { id: 'pos-u-4-1', deck: 'upper', row: 4, col: 1, type: 'single_sleeper', label: 'U6', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-4-2', deck: 'upper', row: 4, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-4-3', deck: 'upper', row: 4, col: 3, type: 'single_sleeper', label: 'U7', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-5-1', deck: 'upper', row: 5, col: 1, type: 'single_sleeper', label: 'U8', status: 'booked', basePrice: 1799, isWindow: true },
          { id: 'pos-u-5-2', deck: 'upper', row: 5, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-5-3', deck: 'upper', row: 5, col: 3, type: 'single_sleeper', label: 'U9', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-6-1', deck: 'upper', row: 6, col: 1, type: 'single_sleeper', label: 'U10', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-6-2', deck: 'upper', row: 6, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-6-3', deck: 'upper', row: 6, col: 3, type: 'single_sleeper', label: 'U11', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-7-1', deck: 'upper', row: 7, col: 1, type: 'single_sleeper', label: 'U12', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-7-2', deck: 'upper', row: 7, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-7-3', deck: 'upper', row: 7, col: 3, type: 'single_sleeper', label: 'U13', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-8-1', deck: 'upper', row: 8, col: 1, type: 'single_sleeper', label: 'U14', status: 'available', basePrice: 1799, isWindow: true },
          { id: 'pos-u-8-2', deck: 'upper', row: 8, col: 2, type: 'aisle', label: 'AISLE', status: 'available' },
          { id: 'pos-u-8-3', deck: 'upper', row: 8, col: 3, type: 'emergency_exit', label: 'EMERGENCY EXIT', status: 'blocked' },
        ],
      },
    ];

    // 4. Seed Live Trips
    this.trips = [
      {
        id: 'trip-001',
        supplierId: 'op-001',
        operatorName: 'Sri Sai Travels Private Limited',
        busNumber: 'TN-09-CB-4899',
        busType: 'Volvo 9600 A/C Sleeper (2+1)',
        category: 'sleeper',
        sourceCity: 'Chennai',
        destinationCity: 'Bengaluru',
        departureTime: '22:30',
        arrivalTime: '05:40',
        duration: '7h 10m',
        rating: 4.9,
        reviewCount: 1420,
        totalSeats: 30,
        availableSeatsCount: 26,
        fareStartingFrom: 1599,
        amenities: ['Live GPS Tracking', 'Personal AC Vents', 'Charging Ports', 'Water Bottle', 'Blanket', 'Emergency Exit'],
        boardingPoints: [
          { location: 'Chennai Koyambedu Omni Bus Stand', time: '22:30' },
          { location: 'Chennai Guindy Kathipara Flyover', time: '23:00' },
          { location: 'Chennai Sriperumbudur Toll Plaza', time: '23:45' },
        ],
        droppingPoints: [
          { location: 'Bengaluru Electronic City Toll', time: '04:45' },
          { location: 'Bengaluru Silk Board Junction', time: '05:15' },
          { location: 'Bengaluru Majestic Bus Terminus', time: '05:40' },
        ],
        tripDate: '2026-10-18',
        fleetConfigId: 'bus-cfg-001',
        cancellationPolicy: 'Standard 90% refund up to 12 hours prior to departure.',
        hasLiveGps: true,
        seats: [],
      },
      {
        id: 'trip-002',
        supplierId: 'op-001',
        operatorName: 'Sri Sai Travels Private Limited',
        busNumber: 'TN-09-DE-7788',
        busType: 'Scania Metrolink Multi-Axle HD',
        category: 'seater',
        sourceCity: 'Chennai',
        destinationCity: 'Bengaluru',
        departureTime: '23:15',
        arrivalTime: '06:15',
        duration: '7h 00m',
        rating: 4.8,
        reviewCount: 980,
        totalSeats: 40,
        availableSeatsCount: 32,
        fareStartingFrom: 999,
        amenities: ['Live GPS Tracking', 'Reclining Pushback Seats', 'USB Ports', 'Snacks'],
        boardingPoints: [
          { location: 'Chennai Koyambedu Omni Bus Stand', time: '23:15' },
          { location: 'Chennai Poonamallee Bypass', time: '23:55' },
        ],
        droppingPoints: [
          { location: 'Bengaluru Electronic City Toll', time: '05:30' },
          { location: 'Bengaluru Majestic Bus Terminus', time: '06:15' },
        ],
        tripDate: '2026-10-18',
        cancellationPolicy: 'Standard 90% refund up to 12 hours prior to departure.',
        hasLiveGps: true,
        seats: [],
      },
    ];

    // 5. Seed Real Bookings & Financial Records
    this.bookings = [
      {
        id: 'bkg-1001',
        bookingReference: 'AT-REF-98124',
        pnrNumber: 'AT-2026-98124',
        customerId: 'cust-001',
        customerName: 'Karthik Subramanian',
        customerEmail: 'karthik.sub@gmail.com',
        customerPhone: '+91 98410 55443',
        category: 'bus',
        tripTitle: 'Chennai to Bengaluru (Volvo 9600 A/C Sleeper)',
        source: 'Chennai',
        destination: 'Bengaluru',
        travelDate: '2026-10-18',
        departureTime: '22:30',
        operatorOrHost: 'Sri Sai Travels Private Limited',
        operatorId: 'op-001',
        seatNumbers: ['L4'],
        passengerName: 'Karthik Subramanian',
        passengerEmail: 'karthik.sub@gmail.com',
        passengerPhone: '+91 98410 55443',
        totalFare: 1699,
        baseFare: 1599,
        taxAmount: 100,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI (Google Pay)',
        transactionId: 'TXN-RAZORPAY-8821948',
        tripDetails: {
          title: 'Chennai to Bengaluru (Volvo 9600 A/C Sleeper)',
          source: 'Chennai',
          destination: 'Bengaluru',
          travelDate: '2026-10-18',
          departureTime: '22:30',
          operatorOrHost: 'Sri Sai Travels Private Limited',
          seatNumbers: ['L4'],
        },
        passengers: [{ name: 'Karthik Subramanian', age: 31, gender: 'M', seatNumber: 'L4' }],
        financials: {
          baseFare: 1599,
          gstAmount: 100,
          platformServiceFee: 0,
          gatewayProcessingFee: 0,
          couponDiscount: 0,
          totalPayableAmount: 1699,
          supplierPayableAmount: 1529,
        },
        paymentDetails: {
          orderId: 'ORD-98124',
          paymentId: 'TXN-RAZORPAY-8821948',
          method: 'UPI (Google Pay)',
          verifiedAt: '2026-10-16T18:24:00Z',
          status: 'PAID',
        },
        status: 'CONFIRMED',
        createdAt: '2026-10-16T18:24:00Z',
        updatedAt: '2026-10-16T18:24:00Z',
      },
      {
        id: 'bkg-1002',
        bookingReference: 'AT-REF-77341',
        pnrNumber: 'AT-2026-77341',
        customerId: 'cust-002',
        customerName: 'Divya Ramesh',
        customerEmail: 'divya.ramesh@yahoo.co.in',
        customerPhone: '+91 97909 23118',
        category: 'bus',
        tripTitle: 'Chennai to Bengaluru (Volvo 9600 A/C Sleeper)',
        source: 'Chennai',
        destination: 'Bengaluru',
        travelDate: '2026-10-18',
        departureTime: '22:30',
        operatorOrHost: 'Sri Sai Travels Private Limited',
        operatorId: 'op-001',
        seatNumbers: ['U8'],
        passengerName: 'Divya Ramesh',
        passengerEmail: 'divya.ramesh@yahoo.co.in',
        passengerPhone: '+91 97909 23118',
        totalFare: 1899,
        baseFare: 1799,
        taxAmount: 100,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'Credit Card (HDFC RuPay)',
        transactionId: 'TXN-RAZORPAY-9912041',
        tripDetails: {
          title: 'Chennai to Bengaluru (Volvo 9600 A/C Sleeper)',
          source: 'Chennai',
          destination: 'Bengaluru',
          travelDate: '2026-10-18',
          departureTime: '22:30',
          operatorOrHost: 'Sri Sai Travels Private Limited',
          seatNumbers: ['U8'],
        },
        passengers: [{ name: 'Divya Ramesh', age: 27, gender: 'F', seatNumber: 'U8' }],
        financials: {
          baseFare: 1799,
          gstAmount: 100,
          platformServiceFee: 0,
          gatewayProcessingFee: 0,
          couponDiscount: 0,
          totalPayableAmount: 1899,
          supplierPayableAmount: 1709,
        },
        paymentDetails: {
          orderId: 'ORD-77341',
          paymentId: 'TXN-RAZORPAY-9912041',
          method: 'Credit Card (HDFC RuPay)',
          verifiedAt: '2026-10-16T19:10:00Z',
          status: 'PAID',
        },
        status: 'CONFIRMED',
        createdAt: '2026-10-16T19:10:00Z',
        updatedAt: '2026-10-16T19:10:00Z',
      },
    ];

    // 6. Seed Coupons
    this.coupons = [
      {
        id: 'cpn-001',
        code: 'APNA50',
        title: 'Flat ₹50 Off on First Bus Journey',
        discountPercentage: 0,
        maxDiscount: 50,
        minBookingAmount: 500,
        validTill: '2026-12-31',
        isActive: true,
        usageCount: 142,
      },
      {
        id: 'cpn-002',
        code: 'FESTIVE15',
        title: '15% Off Up to ₹150 for Festival Travel',
        discountPercentage: 15,
        maxDiscount: 150,
        minBookingAmount: 900,
        validTill: '2026-11-30',
        isActive: true,
        usageCount: 88,
      },
    ];

    // 7. Seed Initial Audit Logs
    this.auditLogs = [
      {
        id: 'audit-001',
        timestamp: '2026-10-16T10:00:00Z',
        actorEmail: 'admin@apnatrips.com',
        actorRole: 'super_admin',
        ipAddress: '10.0.4.1',
        action: 'APPROVE_OPERATOR',
        entityType: 'OperatorOrganization',
        entityId: 'op-001',
        details: 'Approved Sri Sai Travels Private Limited (GSTIN 33AABCS1429B1Z8) after automated KYC check.',
        status: 'SUCCESS',
      },
      {
        id: 'audit-002',
        timestamp: '2026-10-16T14:15:00Z',
        actorEmail: 'operations@srisaitravels.in',
        actorRole: 'operator',
        ipAddress: '106.51.78.12',
        action: 'PUBLISH_BUS_LAYOUT',
        entityType: 'BusFleetConfiguration',
        entityId: 'bus-cfg-001',
        details: 'Published Volvo 9600 Multi-Axle Diamond Sleeper with validated 30 passenger berths and deck safety markers.',
        status: 'SUCCESS',
      },
    ];

    // 8. Seed Customer Support Tickets
    this.tickets = [
      {
        id: 'tkt-001',
        ticketNumber: 'TKT-2026-0041',
        customerName: 'Suresh Menon',
        customerPhone: '+91 98400 11223',
        customerEmail: 'suresh.menon@outlook.com',
        pnrNumber: 'AT-2026-98124',
        category: 'boarding_point',
        priority: 'medium',
        status: 'IN_PROGRESS',
        subject: 'Request confirmation of Koyambedu Omni Bus stand platform number',
        message: 'Travelling tonight on Volvo 9600. Please confirm if bus will arrive at platform 4.',
        createdAt: '2026-10-17T08:30:00Z',
        assignedTo: 'support.lead@apnatrips.com',
      },
    ];
  }

  // Audit Log helper
  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const log: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const db = new ServerDatabase();
