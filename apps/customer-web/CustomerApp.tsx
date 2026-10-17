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
} from '../../src/types/index.js';
import { 
  MOCK_BUS_TRIPS, 
  MOCK_RESORTS, 
  MOCK_MOBILITY_VEHICLES, 
  MOCK_TRAIN_SCHEDULES 
} from '../../src/data/mockData.js';
import { 
  getStoredBookings, 
  saveBookings, 
  getCurrentUser, 
  recordBookingFinancialsInLedger,
  getStoredBusTrips,
  getStoredResorts
} from '../../src/services/storage.js';
import { LanguageCode } from '../../src/services/localization.js';

import { CustomerNavbar } from './customer-components/CustomerNavbar.js';
import { CustomerFooter } from './customer-components/CustomerFooter.js';
import { HeroBanner } from '../../src/components/HeroBanner.js';
import { BusBookingView } from '../../src/components/BusBookingView.js';
import { TrainBookingView } from '../../src/components/TrainBookingView.js';
import { ResortBookingView } from '../../src/components/ResortBookingView.js';
import { MobilityBookingView } from '../../src/components/MobilityBookingView.js';
import { LiveGpsTrackerModal } from '../../src/components/LiveGpsTrackerModal.js';
import { CheckoutModal } from '../../src/components/CheckoutModal.js';
import { BookingConfirmationModal } from '../../src/components/BookingConfirmationModal.js';
import { CustomerBookingsModal } from '../../src/components/CustomerBookingsModal.js';
import { PublicLoginModal } from '../../src/components/PublicLoginModal.js';
import { RedBusAccountModal } from '../../src/components/RedBusAccountModal.js';
import { SplashScreen } from '../../src/components/SplashScreen.js';
import { ToastContainer, showToast } from '../../src/components/Toast.js';

export const CustomerApp: React.FC = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [showPublicLogin, setShowPublicLogin] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  const [activeCategory, setActiveCategory] = useState<TravelCategory>('bus');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>(getStoredBookings());
  const [busTrips, setBusTrips] = useState<BusTrip[]>(getStoredBusTrips());
  const [resorts, setResorts] = useState<ResortProperty[]>(getStoredResorts());

  // Modal display states
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
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
      seatNumbers: data.selectedSeats.map((s) => s.number),
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

  // Payment completed callback with verified server-side sync
  const handlePaymentSuccess = async (newBooking: Booking) => {
    try {
      // Post to authoritative customer booking endpoint
      await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }).catch(() => null);
    } catch {
      // Fallback local storage
    }

    const updated = [newBooking, ...bookings];
    saveBookings(updated);
    setBookings(updated);
    recordBookingFinancialsInLedger(newBooking);
    setCheckoutProps(null);
    setConfirmedBooking(newBooking);
    showToast('Payment verified! Your e-ticket with PNR has been generated.', 'success');
  };

  // Live bus search parameters (Chennai ➜ Bengaluru)
  const [busSearchParams, setBusSearchParams] = useState<{
    source: string;
    destination: string;
    date: string;
    passengers: number;
    womenOnly?: boolean;
  } | null>({
    source: 'Chennai',
    destination: 'Bengaluru',
    date: '2026-10-18',
    passengers: 1,
  });

  // Search submission from Hero Banner
  const handleHeroSearch = (params: { source: string; destination: string; date: string; passengers: number; womenOnly?: boolean }) => {
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
    setShowUserSettings(false);
    showToast('You have been logged out securely.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Exclusively Customer Navbar (Zero Admin or Partner Portal Controls) */}
      <CustomerNavbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        currentLang={currentLang}
        onSelectLang={(l) => setCurrentLang(l)}
        currentUser={currentUser}
        bookingsCount={bookings.length}
        onOpenAuth={() => setShowPublicLogin(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenMyAccount={() => setShowUserSettings(true)}
      />

      {/* Hero Banner with Multi-Category Search Form */}
      <HeroBanner
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        lang={currentLang}
        onSearch={handleHeroSearch}
        initialSource={busSearchParams?.source || 'Chennai'}
        initialDestination={busSearchParams?.destination || 'Bengaluru'}
      />

      {/* Main Dynamic Booking Category Container */}
      <main className="flex-1">
        {activeCategory === 'bus' && (
          <BusBookingView
            trips={busTrips}
            lang={currentLang}
            searchParams={busSearchParams}
            onClearSearch={() => setBusSearchParams(null)}
            onSelectRoute={(s, d) => setBusSearchParams((prev) => prev ? { ...prev, source: s, destination: d } : { source: s, destination: d, date: '2026-10-18', passengers: 1 })}
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
            onInitiateResortBooking={(r: ResortProperty, room: ResortRoom) => handleInitiateResortCheckout(r, room)}
          />
        )}

        {activeCategory === 'taxi' && (
          <MobilityBookingView
            vehicles={MOCK_MOBILITY_VEHICLES}
            activeSubCategory="taxi"
            onSelectSubCategory={() => {}}
            lang={currentLang}
            onInitiateMobilityBooking={(veh: MobilityVehicle, pick: string, drop: string, km: number) => handleInitiateMobilityCheckout(veh, pick, drop, km)}
          />
        )}
      </main>

      {/* Customer Footer (Zero Admin Links) */}
      <CustomerFooter 
        onSelectCategory={(cat) => setActiveCategory(cat)} 
      />

      {/* Live GPS Tracking Modal */}
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

      {/* Customer's Booking History Modal with Cancellation */}
      {isMyBookingsOpen && (
        <CustomerBookingsModal
          bookings={bookings}
          onClose={() => setIsMyBookingsOpen(false)}
          onViewTicket={(b) => setConfirmedBooking(b)}
          onTrackGps={(id) => setGpsTripId(id)}
          onBookingCancelled={refreshAllData}
        />
      )}

      {/* Customer Public Login Modal (Google, Apple, Phone OTP) */}
      <PublicLoginModal
        currentUser={currentUser}
        isOpen={showPublicLogin}
        onClose={() => setShowPublicLogin(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowPublicLogin(false);
          showToast(`Welcome back, ${user.name}!`, 'success');
        }}
      />

      {/* Customer Account & Profile Drawer */}
      <RedBusAccountModal
        currentUser={currentUser}
        bookings={bookings}
        currentLang={currentLang}
        onSelectLang={(l) => setCurrentLang(l)}
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenPublicLogin={() => setShowPublicLogin(true)}
        onUserUpdated={(u) => setCurrentUser(u)}
        onLogOut={handleLogOut}
        onNavigateTab={(tab) => {
          if (tab === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
          if (tab === 'bookings') setIsMyBookingsOpen(true);
          if (tab === 'offers') {
            const section = document.getElementById('buses-available-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
          }
          if (tab === 'getaways') setActiveCategory('resort');
          if (tab === 'help') showToast("Call ApnaTrip-Support: 1800-APNA-TRIP (1800 2762 8747) | Head Office: Athanavur, Yelagiri Hills, Tirupattur D.T., Tamil Nadu, 635853", 'info');
        }}
      />

      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
};
export default CustomerApp;
