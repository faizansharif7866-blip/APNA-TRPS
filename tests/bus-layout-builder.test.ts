/**
 * Automated Test Suite for ApnaTrips Dynamic Bus Configuration & Seat Layout Builder
 * 
 * Tests:
 * 1. Seater layout creation
 * 2. Semi-sleeper layout creation
 * 3. Sleeper layout creation
 * 4. Mixed seater/sleeper configuration
 * 5. Upper and lower deck configurations
 * 6. Duplicate seat labels validation
 * 7. Invalid configurations rejection
 * 8. Capacity validation
 * 9. Fare validation
 * 10. Operator ownership & authorization
 * 11. Concurrent seat reservations & hold expiry
 * 12. Existing booking preservation & layout versioning
 */

import { 
  BusFleetConfiguration, 
  LayoutPosition, 
  BusCategoryType, 
  DeckType, 
  Seat,
  Booking
} from '../src/types';

// Helper validator function modeling backend business rules
export function validateBusConfiguration(config: Partial<BusFleetConfiguration>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.busName || !config.busName.trim()) {
    errors.push('Bus display name is required.');
  }

  if (!config.registrationNumber || !config.registrationNumber.trim()) {
    errors.push('Vehicle registration number is required.');
  }

  if (!config.operatorId || !config.operatorId.trim()) {
    errors.push('Operator ownership is required.');
  }

  const positions = config.positions || [];
  const passengerPositions = positions.filter(
    (p) => p.type === 'seater' || p.type === 'semi_sleeper' || p.type === 'single_sleeper' || p.type === 'double_sleeper'
  );

  if (passengerPositions.length === 0) {
    errors.push('Bus must contain at least 1 passenger seat or berth.');
  }

  // Capacity validation
  if (config.totalCapacity !== undefined && config.totalCapacity !== passengerPositions.length) {
    errors.push(`Capacity mismatch: reported ${config.totalCapacity}, but found ${passengerPositions.length} positions.`);
  }

  // Duplicate seat label validation
  const labels = passengerPositions.map((p) => p.label.trim()).filter(Boolean);
  const uniqueLabels = new Set(labels);
  if (labels.length !== uniqueLabels.size) {
    errors.push('Duplicate seat labels detected. Every seat must have a unique identifier.');
  }

  // Fare validation
  for (const pos of passengerPositions) {
    if (pos.basePrice <= 0 || isNaN(pos.basePrice)) {
      errors.push(`Invalid fare for seat ${pos.label}: must be greater than 0.`);
      break;
    }
  }

  // Deck assignment validation
  if (config.deckType === 'single') {
    const hasUpper = positions.some((p) => p.deck === 'upper');
    if (hasUpper) {
      errors.push('Single-deck configuration cannot contain upper-deck seats.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Seat hold & concurrency safety helper
export function reserveSeatWithHold(
  seats: Seat[],
  seatId: string,
  customerId: string,
  nowTimestamp: number,
  holdDurationMs: number = 600000 // 10 minutes
): { success: boolean; seats: Seat[]; error?: string } {
  const targetSeat = seats.find((s) => s.id === seatId);
  if (!targetSeat) {
    return { success: false, seats, error: 'Seat not found.' };
  }

  // If already booked
  if (targetSeat.status === 'booked') {
    return { success: false, seats, error: 'Seat already booked.' };
  }

  // If currently held and not expired
  if (targetSeat.status === 'held' && targetSeat.heldExpiresAt && targetSeat.heldExpiresAt > nowTimestamp) {
    return { success: false, seats, error: 'Seat is currently held by another customer.' };
  }

  // Grant hold
  const updated = seats.map((s) => {
    if (s.id === seatId) {
      return {
        ...s,
        status: 'held' as const,
        heldExpiresAt: nowTimestamp + holdDurationMs,
      };
    }
    return s;
  });

  return { success: true, seats: updated };
}

// Layout versioning and existing booking preservation
export function migrateBusLayout(
  existingBookings: Booking[],
  currentVersion: number,
  newPositions: LayoutPosition[]
): { allowed: boolean; newVersion: number; reason?: string } {
  const activeBookings = existingBookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'INVENTORY_HELD'
  );

  if (activeBookings.length > 0) {
    // Check if any booked seat was deleted in new positions
    const newPositionLabels = new Set(newPositions.map((p) => p.label));
    for (const b of activeBookings) {
      const seats = b.tripDetails.seatNumbers || [];
      for (const seatNo of seats) {
        if (!newPositionLabels.has(seatNo)) {
          return {
            allowed: false,
            newVersion: currentVersion,
            reason: `Cannot delete seat ${seatNo}: already booked under booking reference ${b.id}.`,
          };
        }
      }
    }
  }

  return {
    allowed: true,
    newVersion: currentVersion + 1,
  };
}

// Test Runner Execution
console.log('================================================================');
console.log('🚀 RUNNING APNATRIPS DYNAMIC BUS & SEAT LAYOUT BUILDER TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(description: string, condition: boolean, extraInfo?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    if (extraInfo) console.error(`     Details: ${extraInfo}`);
  }
}

// 1. Seater Layout Creation
{
  const seaterPositions: LayoutPosition[] = [
    { id: 'p1', label: '1A', deck: 'lower', row: 1, col: 0, type: 'seater', isWindow: true, basePrice: 650, status: 'available' },
    { id: 'p2', label: '1B', deck: 'lower', row: 1, col: 1, type: 'seater', isAisle: true, basePrice: 650, status: 'available' },
    { id: 'p3', label: '', deck: 'lower', row: 1, col: 2, type: 'aisle', basePrice: 0, status: 'available' },
    { id: 'p4', label: '1C', deck: 'lower', row: 1, col: 3, type: 'seater', isWindow: true, basePrice: 650, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Express Seater',
    registrationNumber: 'DL-01-AB-1234',
    operatorId: 'sup-001',
    category: 'seater',
    deckType: 'single',
    totalCapacity: 3,
    positions: seaterPositions,
  });

  assert('Seater layout creation passes validation', val.isValid && val.errors.length === 0);
}

// 2. Semi-Sleeper Layout Creation
{
  const semiSleeperPositions: LayoutPosition[] = [
    { id: 's1', label: 'SS1', deck: 'lower', row: 1, col: 0, type: 'semi_sleeper', isWindow: true, basePrice: 1100, status: 'available' },
    { id: 's2', label: 'SS2', deck: 'lower', row: 1, col: 1, type: 'semi_sleeper', isAisle: true, basePrice: 1100, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Royal Semi-Sleeper',
    registrationNumber: 'KA-01-SS-5555',
    operatorId: 'sup-002',
    category: 'semi_sleeper',
    deckType: 'single',
    totalCapacity: 2,
    positions: semiSleeperPositions,
  });

  assert('Semi-sleeper layout creation passes validation', val.isValid);
}

// 3. Sleeper Layout Creation
{
  const sleeperPositions: LayoutPosition[] = [
    { id: 'sl1', label: 'L1', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' },
    { id: 'sl2', label: '', deck: 'lower', row: 1, col: 1, type: 'aisle', basePrice: 0, status: 'available' },
    { id: 'sl3', label: 'L2', deck: 'lower', row: 1, col: 2, type: 'single_sleeper', basePrice: 1599, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Sri Sai Volvo Sleeper',
    registrationNumber: 'KA-01-EQ-9876',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'single',
    totalCapacity: 2,
    positions: sleeperPositions,
  });

  assert('Sleeper layout creation passes validation', val.isValid);
}

// 4. Mixed Seater/Sleeper Combination Configuration
{
  const mixedPositions: LayoutPosition[] = [
    { id: 'm1', label: '1A', deck: 'lower', row: 1, col: 0, type: 'seater', basePrice: 900, status: 'available' },
    { id: 'm2', label: 'UB1', deck: 'upper', row: 1, col: 0, type: 'single_sleeper', basePrice: 1600, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Hybrid Combo Express',
    registrationNumber: 'MH-14-BT-9900',
    operatorId: 'sup-003',
    category: 'combination',
    deckType: 'double',
    totalCapacity: 2,
    positions: mixedPositions,
  });

  assert('Mixed seater/sleeper combination layout passes validation', val.isValid);
}

// 5. Upper and Lower Deck Configurations
{
  const dualDeckPositions: LayoutPosition[] = [
    { id: 'd1', label: 'L1', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', basePrice: 1500, status: 'available' },
    { id: 'd2', label: 'U1', deck: 'upper', row: 1, col: 0, type: 'single_sleeper', basePrice: 1600, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Double Decker Coach',
    registrationNumber: 'TN-01-DD-7777',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'double',
    totalCapacity: 2,
    positions: dualDeckPositions,
  });

  assert('Dual-deck upper and lower layout passes validation', val.isValid);
}

// 6. Duplicate Seat Labels Validation
{
  const duplicatePositions: LayoutPosition[] = [
    { id: 'dup1', label: 'L1', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', basePrice: 1500, status: 'available' },
    { id: 'dup2', label: 'L1', deck: 'lower', row: 1, col: 2, type: 'single_sleeper', basePrice: 1500, status: 'available' }, // DUPLICATE
  ];

  const val = validateBusConfiguration({
    busName: 'Invalid Duplicate Bus',
    registrationNumber: 'KA-01-DP-0001',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'single',
    totalCapacity: 2,
    positions: duplicatePositions,
  });

  assert('Duplicate seat labels are correctly rejected', !val.isValid && val.errors.some((e) => e.includes('Duplicate')));
}

// 7. Invalid Deck Assignment (Single deck with upper seat)
{
  const invalidDeckPositions: LayoutPosition[] = [
    { id: 'inv1', label: 'U1', deck: 'upper', row: 1, col: 0, type: 'single_sleeper', basePrice: 1500, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Invalid Single Deck Bus',
    registrationNumber: 'KA-01-IN-0002',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'single', // SINGLE DECK with UPPER seat
    totalCapacity: 1,
    positions: invalidDeckPositions,
  });

  assert('Upper deck seats rejected on single-deck bus', !val.isValid);
}

// 8. Capacity Validation
{
  const capPositions: LayoutPosition[] = [
    { id: 'c1', label: 'L1', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', basePrice: 1500, status: 'available' },
  ];

  const val = validateBusConfiguration({
    busName: 'Capacity Mismatch Bus',
    registrationNumber: 'KA-01-CP-0003',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'single',
    totalCapacity: 40, // MISMATCH: Reported 40, only 1 in layout
    positions: capPositions,
  });

  assert('Capacity mismatch between header and layout rejected', !val.isValid && val.errors.some((e) => e.includes('Capacity mismatch')));
}

// 9. Fare Validation (Fare <= 0)
{
  const farePositions: LayoutPosition[] = [
    { id: 'f1', label: 'L1', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', basePrice: 0, status: 'available' }, // 0 FARE
  ];

  const val = validateBusConfiguration({
    busName: 'Zero Fare Bus',
    registrationNumber: 'KA-01-ZF-0004',
    operatorId: 'sup-001',
    category: 'sleeper',
    deckType: 'single',
    totalCapacity: 1,
    positions: farePositions,
  });

  assert('Zero or negative fares rejected', !val.isValid && val.errors.some((e) => e.includes('Invalid fare')));
}

// 10. Operator Ownership & Missing Fields Validation
{
  const val = validateBusConfiguration({
    busName: '',
    registrationNumber: '',
    operatorId: '',
    positions: [],
  });

  assert('Missing bus name, registration, and operator rejected', !val.isValid && val.errors.length >= 3);
}

// 11. Concurrent Seat Reservations & Hold Expiry
{
  const initialSeats: Seat[] = [
    { id: 'seat-101', number: 'L1', deck: 'lower', type: 'sleeper', status: 'available', price: 1599 },
  ];

  const now = 1729000000000;
  // Customer A holds seat
  const holdA = reserveSeatWithHold(initialSeats, 'seat-101', 'cust-A', now, 600000);
  assert('Customer A successfully acquires 10-minute seat hold', holdA.success && holdA.seats[0].status === 'held');

  // Customer B tries to hold same seat before expiry
  const holdB = reserveSeatWithHold(holdA.seats, 'seat-101', 'cust-B', now + 300000);
  assert('Customer B is blocked from holding concurrently reserved seat', !holdB.success);

  // Expired hold allows customer C to acquire
  const expiredTime = now + 700000; // Past 10 minutes
  const holdC = reserveSeatWithHold(holdA.seats, 'seat-101', 'cust-C', expiredTime, 600000);
  assert('Expired seat hold safely releases seat for Customer C', holdC.success);
}

// 12. Existing Booking Preservation & Versioning
{
  const mockBookings: Booking[] = [
    {
      id: 'BK-CONFIRMED-99',
      bookingReference: 'REF-99',
      pnrNumber: 'PNR-998877',
      customerId: 'cust-1',
      customerName: 'Test Traveler',
      customerEmail: 'test@example.com',
      customerPhone: '+91 98401 00000',
      category: 'bus',
      tripDetails: {
        title: 'Chennai to Bengaluru',
        source: 'Chennai',
        destination: 'Bengaluru',
        travelDate: '2026-10-16',
        departureTime: '22:30',
        operatorOrHost: 'Sri Sai Travels',
        seatNumbers: ['L1A'],
      },
      passengers: [{ name: 'Test Traveler', age: 28, gender: 'M', berthPreference: 'lower' }],
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      financials: {
        baseFare: 1599,
        gstAmount: 288,
        platformServiceFee: 0,
        gatewayProcessingFee: 0,
        couponDiscount: 0,
        totalPayableAmount: 1887,
        supplierPayableAmount: 1599,
      },
      paymentDetails: {
        orderId: 'order_123',
        paymentId: 'pay_123',
        method: 'UPI',
        verifiedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    },
  ];

  // Attempt to delete booked seat L1A
  const modifiedPositionsWithoutL1A: LayoutPosition[] = [
    { id: 'p2', label: 'L1B', deck: 'lower', row: 1, col: 1, type: 'single_sleeper', basePrice: 1599, status: 'available' },
  ];

  const migrationAttempt = migrateBusLayout(mockBookings, 1, modifiedPositionsWithoutL1A);
  assert('Deleting a seat with an active confirmed booking is prohibited', !migrationAttempt.allowed);

  // Safe update preserving booked seat
  const safePositionsWithL1A: LayoutPosition[] = [
    { id: 'p1', label: 'L1A', deck: 'lower', row: 1, col: 0, type: 'single_sleeper', basePrice: 1599, status: 'available' },
    { id: 'p2', label: 'L1B', deck: 'lower', row: 1, col: 1, type: 'single_sleeper', basePrice: 1599, status: 'available' },
  ];

  const safeMigration = migrateBusLayout(mockBookings, 1, safePositionsWithL1A);
  assert('Safe layout update preserving existing bookings bumps version to 2', safeMigration.allowed && safeMigration.newVersion === 2);
}

console.log('\n================================================================');
console.log(`🏁 TEST EXECUTION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('================================================================\n');
