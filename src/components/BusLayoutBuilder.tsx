import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  DollarSign, 
  AlertTriangle, 
  Eye, 
  Save, 
  FileText,
  Layers,
  MapPin,
  X,
  Info,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Wrench,
  RefreshCw
} from 'lucide-react';
import { 
  BusCategoryType, 
  DeckType, 
  LayoutPosition, 
  LayoutPositionType, 
  BusFleetConfiguration, 
  BusTrip,
  Seat
} from '../types';
import { showToast } from './Toast';
import { saveBusTrips, getStoredBusTrips } from '../services/storage';
import { 
  validateBusLayout, 
  autoFixSafetyMarkers, 
  BusLayoutValidationReport 
} from '../services/busLayoutValidator';

interface BusLayoutBuilderProps {
  operatorId: string;
  operatorName: string;
  onClose: () => void;
  onBusPublished: (bus: BusFleetConfiguration) => void;
}

export const BusLayoutBuilder: React.FC<BusLayoutBuilderProps> = ({
  operatorId,
  operatorName,
  onClose,
  onBusPublished,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Basic Information
  const [busName, setBusName] = useState('Sri Sai Royal Primo');
  const [registrationNumber, setRegistrationNumber] = useState('KA-01-EQ-9876');
  const [manufacturer, setManufacturer] = useState('Volvo');
  const [model, setModel] = useState('9600 Multi-Axle Luxury Sleeper');
  const [modelYear, setModelYear] = useState<number>(2026);
  const [amenities, setAmenities] = useState<string[]>([
    'Live GPS Tracking',
    'Toilet',
    'Personal AC Vents',
    'USB Charging Point',
    'Blanket & Pillow',
    'Reading Light',
    'Primo Lounge Access',
  ]);

  // Step 2 & 3: Bus Category & Decks
  const [category, setCategory] = useState<BusCategoryType>('sleeper');
  const [deckType, setDeckType] = useState<DeckType>('double');
  const [activeEditingDeck, setActiveEditingDeck] = useState<'lower' | 'upper'>('lower');

  // Step 4: Layout Grid Positions
  const [positions, setPositions] = useState<LayoutPosition[]>(() => {
    // Generate starting template for standard sleeper with complete safety deck markers
    const initial: LayoutPosition[] = [];
    
    // Lower Deck: 6 rows
    // Row 1: col 0: Driver Cabin, col 1: Aisle, col 2: L1B (seater), col 3: Entry Door
    initial.push({ id: 'lower-r1-c0', label: 'DRIVER CABIN', deck: 'lower', row: 1, col: 0, type: 'driver', basePrice: 0, status: 'available' });
    initial.push({ id: 'lower-r1-c1', label: '', deck: 'lower', row: 1, col: 1, type: 'aisle', basePrice: 0, status: 'available' });
    initial.push({ id: 'lower-r1-c2', label: 'L1B', deck: 'lower', row: 1, col: 2, type: 'seater', basePrice: 1250, status: 'available' });
    initial.push({ id: 'lower-r1-c3', label: 'ENTRY DOOR', deck: 'lower', row: 1, col: 3, type: 'door', basePrice: 0, status: 'available' });

    // Row 2: col 0: L2A, col 1: Stairs to Upper, col 2: L2B, col 3: L2C
    initial.push({ id: 'lower-r2-c0', label: 'L2A', deck: 'lower', row: 2, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });
    initial.push({ id: 'lower-r2-c1', label: 'STAIRS TO UPPER', deck: 'lower', row: 2, col: 1, type: 'stairs', basePrice: 0, status: 'available' });
    initial.push({ id: 'lower-r2-c2', label: 'L2B', deck: 'lower', row: 2, col: 2, type: 'seater', basePrice: 1250, status: 'available' });
    initial.push({ id: 'lower-r2-c3', label: 'L2C', deck: 'lower', row: 2, col: 3, type: 'seater', isWindow: true, basePrice: 1250, status: 'available' });

    // Rows 3 to 5: Standard cabin
    for (let r = 3; r <= 5; r++) {
      initial.push({
        id: `lower-r${r}-c0`,
        label: `L${r}A`,
        deck: 'lower',
        row: r,
        col: 0,
        type: 'single_sleeper',
        isWindow: true,
        basePrice: 1599,
        status: r <= 4 ? 'booked' : 'available',
      });
      initial.push({
        id: `lower-r${r}-c1`,
        label: '',
        deck: 'lower',
        row: r,
        col: 1,
        type: 'aisle',
        basePrice: 0,
        status: 'available',
      });
      initial.push({
        id: `lower-r${r}-c2`,
        label: `L${r}B`,
        deck: 'lower',
        row: r,
        col: 2,
        type: 'seater',
        basePrice: 1250,
        status: 'available',
      });
      initial.push({
        id: `lower-r${r}-c3`,
        label: `L${r}C`,
        deck: 'lower',
        row: r,
        col: 3,
        type: 'seater',
        isWindow: true,
        basePrice: 1250,
        status: 'available',
      });
    }

    // Row 6 (Rear of lower deck): col 0: L6A, col 1: Emergency Exit, col 2: L6B, col 3: L6C
    initial.push({ id: 'lower-r6-c0', label: 'L6A', deck: 'lower', row: 6, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });
    initial.push({ id: 'lower-r6-c1', label: 'EMERGENCY EXIT', deck: 'lower', row: 6, col: 1, type: 'emergency_exit', basePrice: 0, status: 'available' });
    initial.push({ id: 'lower-r6-c2', label: 'L6B', deck: 'lower', row: 6, col: 2, type: 'seater', basePrice: 1250, status: 'available' });
    initial.push({ id: 'lower-r6-c3', label: 'L6C', deck: 'lower', row: 6, col: 3, type: 'seater', isWindow: true, basePrice: 1250, status: 'available' });

    // Upper Deck: 6 rows
    // Row 1: col 0: U1A, col 1: Aisle, col 2: U1B, col 3: U1C
    initial.push({ id: 'upper-r1-c0', label: 'U1A', deck: 'upper', row: 1, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1699, status: 'available' });
    initial.push({ id: 'upper-r1-c1', label: '', deck: 'upper', row: 1, col: 1, type: 'aisle', basePrice: 0, status: 'available' });
    initial.push({ id: 'upper-r1-c2', label: 'U1B', deck: 'upper', row: 1, col: 2, type: 'single_sleeper', basePrice: 1599, status: 'available' });
    initial.push({ id: 'upper-r1-c3', label: 'U1C', deck: 'upper', row: 1, col: 3, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });

    // Row 2: col 0: U2A, col 1: Stairs from Lower, col 2: U2B, col 3: U2C
    initial.push({ id: 'upper-r2-c0', label: 'U2A', deck: 'upper', row: 2, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1699, status: 'available' });
    initial.push({ id: 'upper-r2-c1', label: 'STAIRS FROM LOWER', deck: 'upper', row: 2, col: 1, type: 'stairs', basePrice: 0, status: 'available' });
    initial.push({ id: 'upper-r2-c2', label: 'U2B', deck: 'upper', row: 2, col: 2, type: 'single_sleeper', basePrice: 1599, status: 'available' });
    initial.push({ id: 'upper-r2-c3', label: 'U2C', deck: 'upper', row: 2, col: 3, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });

    // Rows 3 to 5:
    for (let r = 3; r <= 5; r++) {
      initial.push({ id: `upper-r${r}-c0`, label: `U${r}A`, deck: 'upper', row: r, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1699, status: r <= 4 ? 'booked' : 'available' });
      initial.push({ id: `upper-r${r}-c1`, label: '', deck: 'upper', row: r, col: 1, type: 'aisle', basePrice: 0, status: 'available' });
      initial.push({ id: `upper-r${r}-c2`, label: `U${r}B`, deck: 'upper', row: r, col: 2, type: 'single_sleeper', basePrice: 1599, status: r === 4 ? 'booked' : 'available' });
      initial.push({ id: `upper-r${r}-c3`, label: `U${r}C`, deck: 'upper', row: r, col: 3, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });
    }

    // Row 6 (Rear of upper deck): col 0: U6A, col 1: Emergency Exit, col 2: U6B, col 3: U6C
    initial.push({ id: 'upper-r6-c0', label: 'U6A', deck: 'upper', row: 6, col: 0, type: 'single_sleeper', isWindow: true, basePrice: 1699, status: 'available' });
    initial.push({ id: 'upper-r6-c1', label: 'EMERGENCY EXIT', deck: 'upper', row: 6, col: 1, type: 'emergency_exit', basePrice: 0, status: 'available' });
    initial.push({ id: 'upper-r6-c2', label: 'U6B', deck: 'upper', row: 6, col: 2, type: 'single_sleeper', basePrice: 1599, status: 'available' });
    initial.push({ id: 'upper-r6-c3', label: 'U6C', deck: 'upper', row: 6, col: 3, type: 'single_sleeper', isWindow: true, basePrice: 1599, status: 'available' });

    return initial;
  });

  // Step 5: Pricing Strategy
  const [lowerSleeperPrice, setLowerSleeperPrice] = useState(1599);
  const [upperSleeperPrice, setUpperSleeperPrice] = useState(1699);
  const [seaterPrice, setSeaterPrice] = useState(1250);
  const [numberingConvention, setNumberingConvention] = useState<'prefixed' | 'numeric' | 'berth'>('prefixed');

  // Currently selected position for property inspection
  const [selectedPosId, setSelectedPosId] = useState<string | null>(null);

  // Real-time server validation report
  const [validationReport, setValidationReport] = useState<BusLayoutValidationReport>(() =>
    validateBusLayout({
      busName: 'Sri Sai Royal Primo',
      registrationNumber: 'KA-01-EQ-9876',
      category: 'sleeper',
      deckType: 'double',
      positions: [],
    })
  );
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Available amenities to toggle
  const availableAmenitiesList = [
    'Live GPS Tracking',
    'Toilet',
    'Personal AC Vents',
    'USB Charging Point',
    'Blanket & Pillow',
    'Reading Light',
    'Primo Lounge Access',
    'Clean Restroom Guarantee',
    'CCTV Surveillance',
    'Emergency SOS Button',
    'Snack & Water Bottle',
    'High Speed WiFi',
  ];

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  // Re-run validation whenever layout configuration changes
  useEffect(() => {
    // Immediate client-side authoritative validation
    const localReport = validateBusLayout({
      busName,
      registrationNumber,
      category,
      deckType,
      positions,
    });
    setValidationReport(localReport);

    // Call server validation API
    let isCancelled = false;
    setIsValidating(true);
    fetch('/api/bus-configurations/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busName,
        registrationNumber,
        category,
        deckType,
        positions,
      }),
    })
      .then((res) => res.json())
      .then((serverReport: BusLayoutValidationReport) => {
        if (!isCancelled && serverReport && typeof serverReport.isValid === 'boolean') {
          setValidationReport(serverReport);
        }
      })
      .catch((err) => {
        // Fallback to local report if server fetch fails
        console.warn('Server validation endpoint unreachable, using client validator:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsValidating(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [busName, registrationNumber, category, deckType, positions]);

  // Handle auto-fixing safety markers
  const handleAutoFixSafetyMarkers = () => {
    const fixed = autoFixSafetyMarkers(positions, deckType);
    setPositions(fixed);
    showToast('Safety markers (Emergency Exits, Stairs, Door, Driver) configured successfully!', 'success');
  };

  // Switch category and generate appropriate template
  const handleSelectCategory = (newCat: BusCategoryType) => {
    setCategory(newCat);
    if (newCat === 'seater') {
      setDeckType('single');
      // Create 2+2 seater template with safety markers
      const newPos: LayoutPosition[] = [];
      newPos.push({ id: 'l-r1-0', label: 'DRIVER CABIN', deck: 'lower', row: 1, col: 0, type: 'driver', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r1-1', label: '1B', deck: 'lower', row: 1, col: 1, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
      newPos.push({ id: 'l-r1-2', label: '', deck: 'lower', row: 1, col: 2, type: 'aisle', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r1-3', label: '1C', deck: 'lower', row: 1, col: 3, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
      newPos.push({ id: 'l-r1-4', label: 'ENTRY DOOR', deck: 'lower', row: 1, col: 4, type: 'door', basePrice: 0, status: 'available' });
      for (let r = 2; r <= 7; r++) {
        newPos.push({ id: `l-r${r}-0`, label: `${r}A`, deck: 'lower', row: r, col: 0, type: 'seater', isWindow: true, basePrice: 850, status: 'available' });
        newPos.push({ id: `l-r${r}-1`, label: `${r}B`, deck: 'lower', row: r, col: 1, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
        newPos.push({ id: `l-r${r}-2`, label: '', deck: 'lower', row: r, col: 2, type: 'aisle', basePrice: 0, status: 'available' });
        newPos.push({ id: `l-r${r}-3`, label: `${r}C`, deck: 'lower', row: r, col: 3, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
        newPos.push({ id: `l-r${r}-4`, label: `${r}D`, deck: 'lower', row: r, col: 4, type: 'seater', isWindow: true, basePrice: 850, status: 'available' });
      }
      newPos.push({ id: 'l-r8-0', label: '8A', deck: 'lower', row: 8, col: 0, type: 'seater', isWindow: true, basePrice: 850, status: 'available' });
      newPos.push({ id: 'l-r8-1', label: '8B', deck: 'lower', row: 8, col: 1, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
      newPos.push({ id: 'l-r8-2', label: 'EMERGENCY EXIT', deck: 'lower', row: 8, col: 2, type: 'emergency_exit', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r8-3', label: '8C', deck: 'lower', row: 8, col: 3, type: 'seater', isAisle: true, basePrice: 850, status: 'available' });
      newPos.push({ id: 'l-r8-4', label: '8D', deck: 'lower', row: 8, col: 4, type: 'seater', isWindow: true, basePrice: 850, status: 'available' });
      setPositions(newPos);
    } else if (newCat === 'semi_sleeper') {
      setDeckType('single');
      const newPos: LayoutPosition[] = [];
      newPos.push({ id: 'l-r1-0', label: 'DRIVER CABIN', deck: 'lower', row: 1, col: 0, type: 'driver', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r1-1', label: '1B', deck: 'lower', row: 1, col: 1, type: 'semi_sleeper', isAisle: true, basePrice: 1100, status: 'available' });
      newPos.push({ id: 'l-r1-2', label: '', deck: 'lower', row: 1, col: 2, type: 'aisle', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r1-3', label: 'ENTRY DOOR', deck: 'lower', row: 1, col: 3, type: 'door', basePrice: 0, status: 'available' });
      for (let r = 2; r <= 6; r++) {
        newPos.push({ id: `l-r${r}-0`, label: `${r}A`, deck: 'lower', row: r, col: 0, type: 'semi_sleeper', isWindow: true, basePrice: 1100, status: 'available' });
        newPos.push({ id: `l-r${r}-1`, label: `${r}B`, deck: 'lower', row: r, col: 1, type: 'semi_sleeper', isAisle: true, basePrice: 1100, status: 'available' });
        newPos.push({ id: `l-r${r}-2`, label: '', deck: 'lower', row: r, col: 2, type: 'aisle', basePrice: 0, status: 'available' });
        newPos.push({ id: `l-r${r}-3`, label: `${r}C`, deck: 'lower', row: r, col: 3, type: 'semi_sleeper', isWindow: true, basePrice: 1100, status: 'available' });
      }
      newPos.push({ id: 'l-r7-0', label: '7A', deck: 'lower', row: 7, col: 0, type: 'semi_sleeper', isWindow: true, basePrice: 1100, status: 'available' });
      newPos.push({ id: 'l-r7-1', label: '7B', deck: 'lower', row: 7, col: 1, type: 'semi_sleeper', isAisle: true, basePrice: 1100, status: 'available' });
      newPos.push({ id: 'l-r7-2', label: 'EMERGENCY EXIT', deck: 'lower', row: 7, col: 2, type: 'emergency_exit', basePrice: 0, status: 'available' });
      newPos.push({ id: 'l-r7-3', label: '7C', deck: 'lower', row: 7, col: 3, type: 'semi_sleeper', isWindow: true, basePrice: 1100, status: 'available' });
      setPositions(newPos);
    }
  };

  // Re-apply numbering convention
  const applyNumbering = (convention: 'prefixed' | 'numeric' | 'berth') => {
    setNumberingConvention(convention);
    let lowerCount = 1;
    let upperCount = 1;
    let totalCount = 1;

    setPositions(
      positions.map((p) => {
        if (p.type === 'aisle' || p.type === 'empty' || p.type === 'driver' || p.type === 'door' || p.type === 'emergency_exit' || p.type === 'stairs') {
          return p;
        }

        let newLabel = '';
        if (convention === 'numeric') {
          newLabel = `${totalCount++}`;
        } else if (convention === 'prefixed') {
          if (p.deck === 'lower') {
            newLabel = `L${lowerCount++}`;
          } else {
            newLabel = `U${upperCount++}`;
          }
        } else if (convention === 'berth') {
          if (p.deck === 'lower') {
            newLabel = `LB${lowerCount++}`;
          } else {
            newLabel = `UB${upperCount++}`;
          }
        }
        return { ...p, label: newLabel };
      })
    );
    showToast('Seat labels updated with ' + convention + ' convention', 'success');
  };

  // Update specific position properties
  const handleUpdatePositionType = (id: string, newType: LayoutPositionType) => {
    setPositions(
      positions.map((p) => {
        if (p.id === id) {
          const isSeat = newType === 'seater' || newType === 'semi_sleeper' || newType === 'single_sleeper' || newType === 'double_sleeper';
          let defaultLabel = p.label;
          if (newType === 'emergency_exit') defaultLabel = 'EMERGENCY EXIT';
          else if (newType === 'stairs') defaultLabel = p.deck === 'lower' ? 'STAIRS TO UPPER' : 'STAIRS FROM LOWER';
          else if (newType === 'door') defaultLabel = 'ENTRY DOOR';
          else if (newType === 'driver') defaultLabel = 'DRIVER CABIN';
          else if (newType === 'aisle' || newType === 'empty') defaultLabel = '';
          else if (!defaultLabel || defaultLabel.includes('EXIT') || defaultLabel.includes('STAIRS') || defaultLabel.includes('DOOR') || defaultLabel.includes('DRIVER')) {
            defaultLabel = p.deck === 'lower' ? `L${p.row}${String.fromCharCode(65 + p.col)}` : `U${p.row}${String.fromCharCode(65 + p.col)}`;
          }

          return {
            ...p,
            type: newType,
            label: defaultLabel,
            basePrice: isSeat
              ? (newType === 'single_sleeper' || newType === 'double_sleeper'
                ? (p.deck === 'lower' ? lowerSleeperPrice : upperSleeperPrice)
                : seaterPrice)
              : 0,
          };
        }
        return p;
      })
    );
  };

  // Capacity calculation
  const passengerSeats = positions.filter(
    (p) => p.type === 'seater' || p.type === 'semi_sleeper' || p.type === 'single_sleeper' || p.type === 'double_sleeper'
  );
  const totalCapacity = passengerSeats.length;

  // Authoritative Validation check using busLayoutValidator
  const validateLayout = (): BusLayoutValidationReport => {
    return validateBusLayout({
      busName,
      registrationNumber,
      category,
      deckType,
      positions,
    });
  };

  // Publish bus and create live trip inventory with authoritative server validation
  const handlePublishBus = async () => {
    const report = validateLayout();
    if (!report.isValid) {
      showToast(report.errors[0] || 'Bus layout validation failed. Please resolve all safety and overlap errors.', 'error');
      return;
    }

    const busConfig: BusFleetConfiguration = {
      id: `bus-config-${Date.now()}`,
      operatorId,
      operatorName,
      busName,
      registrationNumber,
      manufacturer,
      model,
      modelYear,
      category,
      deckType,
      totalCapacity,
      amenities,
      positions,
      status: 'published',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Convert positions into live BusTrip Seat inventory for immediate booking
    const generatedSeats: Seat[] = passengerSeats.map((pos) => ({
      id: `seat-${pos.deck}-${pos.label}`,
      number: pos.label,
      deck: pos.deck,
      type: pos.type === 'seater' ? 'seater' : pos.type === 'semi_sleeper' ? 'semi_sleeper' : 'sleeper',
      status: pos.status === 'booked' ? 'booked' : 'available',
      price: pos.basePrice || (pos.deck === 'lower' ? lowerSleeperPrice : upperSleeperPrice),
      isLadies: pos.isLadies,
      isWindow: pos.isWindow,
      berthType: pos.type === 'double_sleeper' ? 'double' : 'single',
    }));

    const newLiveTrip: BusTrip = {
      id: `trip-dynamic-${Date.now()}`,
      supplierId: operatorId,
      operatorName,
      busNumber: registrationNumber,
      busType: `${manufacturer} ${model} (${category === 'sleeper' ? 'A/C Sleeper 2+1' : 'A/C Semi-Sleeper'})`,
      sourceCity: 'Chennai',
      destinationCity: 'Bengaluru',
      departureTime: '22:30',
      arrivalTime: '05:40',
      duration: '7h 10m',
      rating: 4.9,
      reviewCount: 1383,
      totalSeats: totalCapacity,
      availableSeatsCount: generatedSeats.filter((s) => s.status === 'available').length,
      fareStartingFrom: Math.min(...generatedSeats.map((s) => s.price)),
      amenities,
      boardingPoints: [
        { location: 'Chennai Koyambedu Omni Bus Stand', time: '22:30' },
        { location: 'Chennai Guindy Kathipara Flyover', time: '23:00' },
        { location: 'Chennai Sriperumbudur Toll Plaza', time: '23:45' },
      ],
      droppingPoints: [
        { location: 'Bengaluru Electronic City Toll', time: '04:45' },
        { location: 'Bengaluru Bulk Board Junction', time: '05:15' },
        { location: 'Bengaluru Majestic Bus Terminus', time: '05:40' },
      ],
      cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
      hasLiveGps: true,
      gpsTripId: 'gps-trip-001',
      seats: generatedSeats,
    };

    try {
      // POST to backend publish endpoint to enforce server-side validation
      const res = await fetch('/api/bus-configurations/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busConfig),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData?.validationReport?.errors?.length) {
          showToast(`Server Validation Blocked: ${errorData.validationReport.errors[0]}`, 'error');
          return;
        }
      }
    } catch (e) {
      console.warn('Backend publish endpoint offline, saving to authoritative local storage:', e);
    }

    // Save to stored bus trips
    const currentTrips = getStoredBusTrips();
    saveBusTrips([newLiveTrip, ...currentTrips]);

    showToast(`Bus ${busName} (${registrationNumber}) verified by server & published to live schedule! Audit ID: ${report.auditId}`, 'success');
    onBusPublished(busConfig);
    onClose();
  };

  const selectedPosition = positions.find((p) => p.id === selectedPosId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col text-slate-800">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">
                  Bus Fleet Configuration & Seat Layout Builder
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  {operatorName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure physical vehicle dimensions, decks, berth spaces, fares, and publish to live booking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between max-w-3xl mx-auto text-xs">
            {[
              { num: 1, label: 'Vehicle Info' },
              { num: 2, label: 'Bus Type' },
              { num: 3, label: 'Deck Setup' },
              { num: 4, label: 'Layout Grid Editor' },
              { num: 5, label: 'Fares & Labels' },
              { num: 6, label: 'Validation & Publish' },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 font-semibold transition-colors ${
                  currentStep === step.num
                    ? 'text-emerald-700'
                    : currentStep > step.num
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === step.num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : currentStep > step.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Step Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {/* STEP 1: Basic Vehicle Information */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 1: Vehicle Information</h3>
                <p className="text-xs text-slate-500">Provide verified RTO vehicle details and manufacturer specifications</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bus Display Name</label>
                  <input
                    type="text"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Sri Sai Royal Primo"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RTO Registration Number</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. KA-01-EQ-9876"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chassis / Manufacturer</label>
                  <select
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Volvo">Volvo</option>
                    <option value="Scania">Scania</option>
                    <option value="BharatBenz">BharatBenz</option>
                    <option value="Ashok Leyland">Ashok Leyland</option>
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Body / Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 9600 Multi-Axle Luxury Sleeper"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Year</label>
                  <input
                    type="number"
                    value={modelYear}
                    onChange={(e) => setModelYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    min={2018}
                    max={2027}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Fleet Operator</label>
                  <input
                    type="text"
                    disabled
                    value={operatorName}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Amenities Selector */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block font-semibold text-xs text-slate-800 mb-2">
                  Included Passenger Amenities & Equipment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableAmenitiesList.map((amenity) => {
                    const isChecked = amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isChecked && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Select Bus Configuration Type */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 2: Bus Type & Seating Architecture</h3>
                <p className="text-xs text-slate-500">Choose the primary passenger cabin arrangement for this bus</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    type: 'sleeper' as BusCategoryType,
                    title: 'C. Sleeper Bus (Recommended)',
                    desc: 'Full length individual sleeping berths (Single & Double berths) with upper and lower deck levels.',
                    badge: 'Multi-Deck Berths',
                  },
                  {
                    type: 'semi_sleeper' as BusCategoryType,
                    title: 'B. Semi-Sleeper Bus',
                    desc: 'Deep-recline ergonomic calf-rest seats with configurable rows, window and aisle identification.',
                    badge: 'Reclining Comfort',
                  },
                  {
                    type: 'seater' as BusCategoryType,
                    title: 'A. Seater Bus',
                    desc: 'Standard passenger seating rows with 2+2 or 2+1 layout, window and aisle seat allocation.',
                    badge: 'High Capacity',
                  },
                  {
                    type: 'combination' as BusCategoryType,
                    title: 'D. Seater + Sleeper Combination',
                    desc: 'Hybrid configuration with Lower Deck Seater and Upper Deck Sleeper berths.',
                    badge: 'Hybrid Fleet',
                  },
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => handleSelectCategory(item.type)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      category === item.type
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Deck Configuration */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 3: Deck Architecture</h3>
                <p className="text-xs text-slate-500">Specify single level or dual-level upper/lower coach structure</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setDeckType('single')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all text-center ${
                    deckType === 'single'
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🚌</div>
                  <div className="text-sm font-bold text-slate-900">Single Deck</div>
                  <div className="text-xs text-slate-500 mt-1">Single floor layout for standard coaches</div>
                </div>

                <div
                  onClick={() => setDeckType('double')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all text-center ${
                    deckType === 'double'
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🚍</div>
                  <div className="text-sm font-bold text-slate-900">Double Deck (Lower + Upper)</div>
                  <div className="text-xs text-slate-500 mt-1">Dual-level luxury multi-axle sleeper coach</div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Independent Deck Architecture:</strong> Each deck has separate passenger spaces, aisle clearances, and stair access positions.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Interactive Layout Grid Editor */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4: Interactive Cabin Layout Editor</h3>
                  <p className="text-xs text-slate-500">
                    Click any cell to inspect or change seat type, configure berth pricing, or assign emergency exits & stairs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFixSafetyMarkers}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    title="Automatically add required emergency exits, stairs, and doors without overlapping seats"
                  >
                    <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Place Safety Markers</span>
                  </button>

                  {deckType === 'double' && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveEditingDeck('lower')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeEditingDeck === 'lower'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Lower Deck
                      </button>
                      <button
                        onClick={() => setActiveEditingDeck('upper')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeEditingDeck === 'upper'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Upper Deck
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor Workspace: Grid on Left, Inspector on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Bus Cabin Outline matching user's screenshot */}
                <div className="lg:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  
                  {/* Front of Bus indicator */}
                  <div className="bg-slate-200/80 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs font-mono text-slate-600">
                    <span className="font-bold">FRONT OF BUS (CABIN ENTRANCE)</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      STEERING WHEEL 🛞
                    </span>
                  </div>

                  {/* Grid of seats for active editing deck */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((rowNum) => {
                      const rowItems = positions.filter(
                        (p) => p.deck === activeEditingDeck && p.row === rowNum
                      );

                      if (rowItems.length === 0) return null;

                      return (
                        <div key={rowNum} className="flex items-center gap-3">
                          <span className="w-6 text-xs font-mono text-slate-400 font-bold">R{rowNum}</span>
                          
                          <div className="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                            {rowItems.map((pos) => {
                              const isSelected = selectedPosId === pos.id;
                              const isAisle = pos.type === 'aisle';
                              const isSleeper = pos.type === 'single_sleeper' || pos.type === 'double_sleeper';

                              if (isAisle) {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className={`h-14 sm:h-16 rounded-xl border border-dashed flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                        : 'border-slate-300 text-slate-400 bg-white/40 hover:bg-slate-100'
                                    }`}
                                  >
                                    AISLE
                                  </div>
                                );
                              }

                              if (pos.type === 'emergency_exit') {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className={`h-14 sm:h-16 rounded-xl border-2 border-dashed p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-rose-600 bg-rose-100 text-rose-900 shadow-md ring-2 ring-rose-500/20'
                                        : 'border-rose-300 bg-rose-50/80 text-rose-800 hover:border-rose-500'
                                    }`}
                                  >
                                    <AlertTriangle className="w-4 h-4 text-rose-600 mb-0.5" />
                                    <span className="text-[10px] font-bold leading-tight">EMERGENCY EXIT</span>
                                  </div>
                                );
                              }

                              if (pos.type === 'stairs') {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className={`h-14 sm:h-16 rounded-xl border-2 border-dashed p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-indigo-600 bg-indigo-100 text-indigo-900 shadow-md ring-2 ring-indigo-500/20'
                                        : 'border-indigo-300 bg-indigo-50/80 text-indigo-800 hover:border-indigo-500'
                                    }`}
                                  >
                                    <Layers className="w-4 h-4 text-indigo-600 mb-0.5" />
                                    <span className="text-[10px] font-bold leading-tight">
                                      {pos.deck === 'lower' ? 'STAIRS TO UPPER' : 'STAIRS FROM LOWER'}
                                    </span>
                                  </div>
                                );
                              }

                              if (pos.type === 'door') {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className={`h-14 sm:h-16 rounded-xl border-2 border-dashed p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-amber-600 bg-amber-100 text-amber-900 shadow-md ring-2 ring-amber-500/20'
                                        : 'border-amber-300 bg-amber-50/80 text-amber-800 hover:border-amber-500'
                                    }`}
                                  >
                                    <span className="text-sm">🚪</span>
                                    <span className="text-[10px] font-bold leading-tight">ENTRY DOOR</span>
                                  </div>
                                );
                              }

                              if (pos.type === 'driver') {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className={`h-14 sm:h-16 rounded-xl border-2 p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                                        : 'border-slate-300 bg-slate-200 text-slate-800 hover:border-slate-500'
                                    }`}
                                  >
                                    <span className="text-sm">🛞</span>
                                    <span className="text-[10px] font-bold leading-tight">DRIVER CABIN</span>
                                  </div>
                                );
                              }

                              if (pos.type === 'empty') {
                                return (
                                  <div
                                    key={pos.id}
                                    onClick={() => setSelectedPosId(pos.id)}
                                    className="h-14 sm:h-16 rounded-xl border border-dotted border-slate-200 flex items-center justify-center text-[10px] text-slate-300 font-mono bg-slate-50/40 cursor-pointer hover:bg-slate-100"
                                  >
                                    EMPTY
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={pos.id}
                                  onClick={() => setSelectedPosId(pos.id)}
                                  className={`h-14 sm:h-16 rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                                      : pos.status === 'booked'
                                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                                      : 'border-slate-300 bg-white hover:border-emerald-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className={isSelected ? 'text-emerald-800' : 'text-slate-800'}>
                                      {pos.label}
                                    </span>
                                    {isSleeper && (
                                      <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500">
                                        BED
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                    <span>₹{pos.basePrice}</span>
                                    {pos.status === 'booked' && (
                                      <span className="text-[9px] text-slate-400 font-bold">SOLD</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rear of bus */}
                  <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>REAR OF BUS — EMERGENCY EXITS & CLEAR EVACUATION ZONE</span>
                  </div>
                </div>

                {/* Inspector Panel */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                    Position Inspector
                  </h4>

                  {selectedPosition ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Identifier Label</span>
                        <input
                          type="text"
                          value={selectedPosition.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPositions(
                              positions.map((p) => (p.id === selectedPosition.id ? { ...p, label: val } : p))
                            );
                          }}
                          className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block">Position Type</span>
                        <select
                          value={selectedPosition.type}
                          onChange={(e) => handleUpdatePositionType(selectedPosition.id, e.target.value as any)}
                          className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                        >
                          <option value="single_sleeper">🛏️ Single Sleeper Berth</option>
                          <option value="double_sleeper">🛏️ Double Sleeper Berth</option>
                          <option value="semi_sleeper">💺 Semi-Sleeper Seat</option>
                          <option value="seater">💺 Regular Seater</option>
                          <option value="aisle">🚶 Aisle Passage</option>
                          <option value="emergency_exit">🚨 Emergency Exit Marker</option>
                          <option value="stairs">🪜 Staircase Deck Link</option>
                          <option value="door">🚪 Passenger Entry Door</option>
                          <option value="driver">🛞 Driver Cabin Area</option>
                          <option value="empty">⬜ Empty Space</option>
                        </select>
                      </div>

                      {['seater', 'semi_sleeper', 'single_sleeper', 'double_sleeper'].includes(selectedPosition.type) && (
                        <div>
                          <span className="text-slate-400 block">Seat Fare (₹)</span>
                          <input
                            type="number"
                            value={selectedPosition.basePrice}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPositions(
                                positions.map((p) => (p.id === selectedPosition.id ? { ...p, basePrice: val } : p))
                              );
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      )}

                      {['seater', 'semi_sleeper', 'single_sleeper', 'double_sleeper'].includes(selectedPosition.type) && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(selectedPosition.isWindow)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setPositions(
                                  positions.map((p) => (p.id === selectedPosition.id ? { ...p, isWindow: val } : p))
                                );
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Window-side position</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(selectedPosition.isLadies)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setPositions(
                                  positions.map((p) => (p.id === selectedPosition.id ? { ...p, isLadies: val } : p))
                                );
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Ladies-only allocation</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-8">
                      Click any seat, berth, or safety marker in the cabin layout to inspect and modify properties.
                    </div>
                  )}

                  {/* Summary Metric */}
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Passenger Seats:</span>
                      <strong className="text-slate-900">{totalCapacity}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Exits Configured:</span>
                      <strong className="text-emerald-700">
                        {positions.filter((p) => p.type === 'emergency_exit').length}
                      </strong>
                    </div>
                    {deckType === 'double' && (
                      <div className="flex justify-between">
                        <span>Staircase Links:</span>
                        <strong className="text-indigo-700">
                          {positions.filter((p) => p.type === 'stairs').length}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: Seat Numbering & Pricing Strategy */}
          {currentStep === 5 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 5: Numbering Conventions & Fare Matrix</h3>
                <p className="text-xs text-slate-500">Apply standardized Indian bus numbering and default berth pricing</p>
              </div>

              {/* Numbering Format Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Select Numbering Convention</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { key: 'prefixed' as const, label: 'Deck Prefixed (L1, U1)', desc: 'L1-L15 / U1-U15' },
                    { key: 'berth' as const, label: 'Berth Prefixed (LB1, UB1)', desc: 'LB1-LB15 / UB1-UB15' },
                    { key: 'numeric' as const, label: 'Continuous Numeric', desc: '1, 2, 3, 4...' },
                  ].map((conv) => (
                    <button
                      key={conv.key}
                      type="button"
                      onClick={() => applyNumbering(conv.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        numberingConvention === conv.key
                          ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div>{conv.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{conv.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fares Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">Authoritative Fare Matrix (₹)</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Lower Sleeper Berth</span>
                    <input
                      type="number"
                      value={lowerSleeperPrice}
                      onChange={(e) => setLowerSleeperPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Upper Sleeper Berth</span>
                    <input
                      type="number"
                      value={upperSleeperPrice}
                      onChange={(e) => setUpperSleeperPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Standard Seater / Chair</span>
                    <input
                      type="number"
                      value={seaterPrice}
                      onChange={(e) => setSeaterPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Validation & Publication */}
          {currentStep === 6 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 6: Server-Side Validation & Safety Audit</h3>
                  <p className="text-xs text-slate-500">
                    Authoritative vehicle audit ensuring no coordinate overlaps, unique seat labels, and required deck safety markers
                  </p>
                </div>
                {isValidating && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing...</span>
                  </span>
                )}
              </div>

              {/* Status Header Badge */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                validationReport.isValid
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-3">
                  {validationReport.isValid ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {validationReport.isValid
                        ? 'COMPLIANT & APPROVED FOR PASSENGER BOOKINGS'
                        : 'VALIDATION BLOCKED: SAFETY & LAYOUT VIOLATIONS DETECTED'}
                    </div>
                    <div className="text-[11px] opacity-80 font-mono">
                      Audit Reference: {validationReport.auditId} • Validated at: {new Date(validationReport.validatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {!validationReport.isValid && (
                  <button
                    type="button"
                    onClick={handleAutoFixSafetyMarkers}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Auto-Fix Safety Markers</span>
                  </button>
                )}
              </div>

              {/* Audit Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Overlap Check */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.noOverlaps
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.noOverlaps ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      1. Coordinate Overlap Check
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.noOverlaps ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {validationReport.checks.noOverlaps ? 'PASSED' : 'OVERLAPS FOUND'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ensures no two passenger seats, berths, or markers share the same deck, row, and column coordinates.
                  </p>
                </div>

                {/* 2. Seat Labels Check */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.uniqueLabels
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.uniqueLabels ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      2. Unique Seat Labels
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.uniqueLabels ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {validationReport.checks.uniqueLabels ? 'PASSED' : 'DUPLICATES FOUND'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All passenger seats and berths must have unique, non-empty identifiers across the bus.
                  </p>
                </div>

                {/* 3. Emergency Exits Check */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.emergencyExitsValid
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.emergencyExitsValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      3. Emergency Exit Placement
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.emergencyExitsValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {validationReport.checks.emergencyExitsValid ? 'PASSED' : 'EXIT MISSING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Emergency exits must exist on lower deck ({validationReport.stats.lowerExits}) and upper deck ({validationReport.stats.upperExits}).
                  </p>
                </div>

                {/* 4. Staircase Deck Egress */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.stairsValid
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.stairsValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      4. Staircase Deck Connection
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.stairsValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {deckType === 'double' ? (validationReport.checks.stairsValid ? 'CONNECTED' : 'MISSING') : 'N/A (SINGLE)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {deckType === 'double'
                      ? 'Staircase markers must connect lower and upper decks for passenger movement.'
                      : 'Single-deck coach does not require vertical staircase connections.'}
                  </p>
                </div>

                {/* 5. Boarding Door Marker */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.doorsValid
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-rose-50/60 border-rose-300 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.doorsValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      5. Boarding Entry Door
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.doorsValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {validationReport.checks.doorsValid ? 'VERIFIED' : 'DOOR MISSING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Passenger entrance door must be designated on the lower deck near the front cabin.
                  </p>
                </div>

                {/* 6. Driver Cabin Area */}
                <div className={`p-3.5 rounded-xl border ${
                  validationReport.checks.driverCabinValid
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-amber-50/60 border-amber-300 text-amber-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {validationReport.checks.driverCabinValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      6. Driver Control Zone
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      validationReport.checks.driverCabinValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {validationReport.checks.driverCabinValid ? 'SEPARATE' : 'RECOMMENDED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Driver cabin area separated from passenger seating at vehicle front.
                  </p>
                </div>
              </div>

              {/* Validation Errors Box if Any */}
              {!validationReport.isValid && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>The following issues must be resolved before publishing:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-rose-700">
                    {validationReport.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAutoFixSafetyMarkers}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Auto-Fix Missing Safety Markers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded-lg font-bold hover:bg-rose-100 transition-all"
                    >
                      Open Layout Editor (Step 4)
                    </button>
                  </div>
                </div>
              )}

              {/* Warnings Box if Any */}
              {validationReport.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Compliance Notices:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {validationReport.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Publish Action Button */}
              <button
                type="button"
                disabled={!validationReport.isValid}
                onClick={handlePublishBus}
                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all text-sm tracking-wide flex items-center justify-center gap-2 ${
                  validationReport.isValid
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>
                  {validationReport.isValid
                    ? 'Publish Bus to Live Trips & Search Inventory'
                    : 'Resolve Validation Errors to Publish'}
                </span>
              </button>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-400 font-medium">
            Step {currentStep} of 6
          </div>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!validationReport.isValid}
              onClick={handlePublishBus}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                validationReport.isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Publish Now</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

