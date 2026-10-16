import React, { useState, useEffect } from 'react';
import { 
  BusTrip, 
  Booking, 
  ResortProperty, 
  ResortRoom, 
  MobilityVehicle, 
  TrainSchedule, 
  Seat, 
  TravelCategory, 
  UserProfile 
} from './types';
import { 
  MOCK_BUS_TRIPS, 
  MOCK_RESORTS, 
  MOCK_MOBILITY_VEHICLES, 
  MOCK_TRAIN_SCHEDULES 
} from './data/mockData';
import { 
  getStoredBookings, 
  saveBookings, 
  getCurrentUser, 
  recordBookingFinancialsInLedger,
  getStoredBusTrips,
  getStoredResorts
} from './services/storage';
import { LanguageCode } from './services/localization';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BusBookingView } from './components/BusBookingView';
import { TrainBookingView } from './components/TrainBookingView';
import { ResortBookingView } from './components/ResortBookingView';
import { MobilityBookingView } from './components/MobilityBookingView';
import { LiveGpsTrackerModal } from './components/LiveGpsTrackerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { CustomerBookingsModal } from './components/CustomerBookingsModal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { PublicLoginModal } from './components/PublicLoginModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { SplashScreen } from './components/SplashScreen';
import { Footer } from './components/Footer';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showPublicLogin, setShowPublicLogin] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  const [activeCategory, setActiveCategory] = useState<TravelCategory>('bus');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>(getStoredBookings());
  const [busTrips, setBusTrips] = useState<BusTrip[]>(getStoredBusTrips());
  const [resorts, setResorts] = useState<ResortProperty[]>(getStoredResorts());

  // Splash screen completion handler: transition directly to public login
  const handleSplashFinish = () => {
    setShowSplash(false);
    setShowPublicLogin(true);
  };

  const handleLogOut = () => {
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Guest Traveler',
      email: 'guest@apnatrips.com',
      phone: '+91 98000 00000',
      role: 'customer',
      isVerified: false,
      authProvider: 'guest',
    };
    setCurrentUser(guestUser);
    setShowPublicLogin(true);
  };

  // Modal display states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [gpsTripId, setGpsTripId] = useState<string | null>(null);

  // Checkout and confirmation states
  const [checkoutProps, setCheckoutProps] = useState<{
    category: TravelCategory;
    tripTitle: string;
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
    baseFareTotal: number;
  } | null>(null);

  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Sync data refresh across all categories
  const refreshAllData = () => {
    setBookings(getStoredBookings());
    setBusTrips(getStoredBusTrips());
    setResorts(getStoredResorts());
  };

  // Bus booking trigger
  const handleInitiateBusCheckout = (data: {
    trip: BusTrip;
    selectedSeats: Seat[];
    boardingPoint: string;
    droppingPoint: string;
  }) => {
    const totalBase = data.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    setCheckoutProps({
      category: 'bus',
      tripTitle: `${data.trip.sourceCity} to ${data.trip.destinationCity} (${data.trip.busType})`,
      source: data.trip.sourceCity,
      destination: data.trip.destinationCity,
      travelDate: '2026-10-18',
      departureTime: data.trip.departureTime,
      operatorOrHost: data.trip.operatorName,
      seatNumbers: data.selectedSeats.map(s => s.number),
      boardingPoint: data.boardingPoint,
      droppingPoint: data.droppingPoint,
      baseFareTotal: totalBase,
    });
  };

  // Resort booking trigger
  const handleInitiateResortCheckout = (resort: ResortProperty, room: ResortRoom) => {
    setCheckoutProps({
      category: 'resort',
      tripTitle: `${resort.name} — ${room.name}`,
      source: resort.city,
      destination: resort.location,
      travelDate: '2026-10-18',
      departureTime: `Check-in ${resort.checkInTime}`,
      operatorOrHost: resort.name,
      roomName: room.name,
      baseFareTotal: room.pricePerNight,
    });
  };

  // Mobility (Taxi, Auto, Bike) booking trigger
  const handleInitiateMobilityCheckout = (
    vehicle: MobilityVehicle, 
    pickup: string, 
    dropoff: string, 
    estKm: number
  ) => {
    const totalBase = vehicle.perKmRate === 0 
      ? vehicle.fareBase 
      : vehicle.fareBase + (vehicle.perKmRate * estKm);

    setCheckoutProps({
      category: vehicle.category,
      tripTitle: `${vehicle.model} (${vehicle.subType})`,
      source: pickup,
      destination: dropoff,
      travelDate: '2026-10-18',
      departureTime: 'Immediate Chauffeur Dispatch',
      operatorOrHost: vehicle.driverName || 'ApnaTrips Verified Fleet',
      vehicleType: vehicle.model,
      boardingPoint: pickup,
      droppingPoint: dropoff,
      baseFareTotal: totalBase,
    });
  };

  // Train demo booking trigger
  const handleInitiateTrainCheckout = (train: TrainSchedule, selectedClass: string, fare: number) => {
    setCheckoutProps({
      category: 'train',
      tripTitle: `${train.trainNumber} ${train.trainName} (${selectedClass})`,
      source: train.sourceStation,
      destination: train.destinationStation,
      travelDate: '2026-10-18',
      departureTime: train.departureTime,
      operatorOrHost: 'Indian Railways (IRCTC Authorized)',
      baseFareTotal: fare,
    });
  };

  // Payment completed callback
  const handlePaymentSuccess = (newBooking: Booking) => {
    const updated = [newBooking, ...bookings];
    saveBookings(updated);
    setBookings(updated);
    recordBookingFinancialsInLedger(newBooking);
    setCheckoutProps(null);
    setConfirmedBooking(newBooking);
  };

  // Live bus search parameters from Hero Banner
  const [busSearchParams, setBusSearchParams] = useState<{
    source: string;
    destination: string;
    date: string;
    passengers: number;
  } | null>({
    source: 'New Delhi',
    destination: 'Manali',
    date: '2026-10-18',
    passengers: 1,
  });

  // Search submission from Hero Banner
  const handleHeroSearch = (params: { source: string; destination: string; date: string; passengers: number }) => {
    setBusSearchParams(params);
    if (activeCategory !== 'bus') {
      setActiveCategory('bus');
    }
    setTimeout(() => {
      const section = document.getElementById('buses-available-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        currentLang={currentLang}
        onSelectLang={(l) => setCurrentLang(l)}
        currentUser={currentUser}
        bookingsCount={bookings.length}
        onOpenAuth={() => setShowPublicLogin(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenMyAccount={() => setShowUserSettings(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* Hero Banner with Multi-Category Search Form */}
      <HeroBanner
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        lang={currentLang}
        onSearch={handleHeroSearch}
      />

      {/* Main Dynamic Booking Category Container */}
      <main className="flex-1">
        {activeCategory === 'bus' && (
          <BusBookingView
            trips={busTrips}
            lang={currentLang}
            searchParams={busSearchParams}
            onClearSearch={() => setBusSearchParams(null)}
            onOpenGpsModal={(id) => setGpsTripId(id)}
            onInitiateCheckout={handleInitiateBusCheckout}
          />
        )}

        {activeCategory === 'train' && (
          <TrainBookingView
            trains={MOCK_TRAIN_SCHEDULES}
            lang={currentLang}
            onInitiateDemoTrainBooking={handleInitiateTrainCheckout}
          />
        )}

        {activeCategory === 'resort' && (
          <ResortBookingView
            resorts={resorts}
            lang={currentLang}
            onInitiateResortBooking={handleInitiateResortCheckout}
          />
        )}

        {(activeCategory === 'taxi' || activeCategory === 'auto' || activeCategory === 'bike') && (
          <MobilityBookingView
            vehicles={MOCK_MOBILITY_VEHICLES}
            activeSubCategory={activeCategory}
            onSelectSubCategory={(cat) => setActiveCategory(cat)}
            lang={currentLang}
            onInitiateMobilityBooking={handleInitiateMobilityCheckout}
          />
        )}
      </main>

      {/* Quiet Corporate Footer */}
      <Footer
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* --- MODALS & WORKSPACES --- */}

      {/* Live GPS Radar Modal */}
      {gpsTripId && (
        <LiveGpsTrackerModal
          tripId={gpsTripId}
          onClose={() => setGpsTripId(null)}
        />
      )}

      {/* Razorpay Checkout & Seat Hold Modal */}
      {checkoutProps && (
        <CheckoutModal
          {...checkoutProps}
          currentUser={currentUser}
          lang={currentLang}
          onClose={() => setCheckoutProps(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Confirmed E-Ticket & QR Code Modal */}
      {confirmedBooking && (
        <BookingConfirmationModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onTrackGps={(id) => setGpsTripId(id)}
        />
      )}

      {/* Customer's Booking History Modal */}
      {isMyBookingsOpen && (
        <CustomerBookingsModal
          bookings={bookings}
          onClose={() => setIsMyBookingsOpen(false)}
          onViewTicket={(b) => setConfirmedBooking(b)}
          onTrackGps={(id) => setGpsTripId(id)}
          onBookingCancelled={refreshAllData}
        />
      )}

      {/* Super Admin & Operations Portal (Security Protected) */}
      {isAdminPortalOpen && (
        <AdminPortal
          bookings={bookings}
          currentUser={currentUser}
          onClose={() => setIsAdminPortalOpen(false)}
          onRefreshData={refreshAllData}
        />
      )}

      {/* Authentication & Role Switcher */}
      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthOpen(false)}
          onUserUpdated={(u) => setCurrentUser(u)}
        />
      )}

      {/* Public Users Login Modal (Google, Apple, Phone OTP) */}
      <PublicLoginModal
        currentUser={currentUser}
        isOpen={showPublicLogin}
        onClose={() => setShowPublicLogin(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowPublicLogin(false);
        }}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
      />

      {/* RedBus-Style User Settings & Passenger Manifest Modal */}
      <UserSettingsModal
        currentUser={currentUser}
        bookings={bookings}
        currentLang={currentLang}
        onSelectLang={(l) => setCurrentLang(l)}
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onUserUpdated={(u) => setCurrentUser(u)}
        onLogOut={handleLogOut}
      />

      {/* 3-Second Loading Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

    </div>
  );
}
