export type LanguageCode = 'en' | 'hi' | 'ta';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  categories: {
    bus: string;
    train: string;
    resort: string;
    taxi: string;
    auto: string;
    bike: string;
  };
  search: {
    from: string;
    to: string;
    date: string;
    passengers: string;
    guests: string;
    rooms: string;
    searchButton: string;
    destinationCity: string;
  };
  bus: {
    selectSeats: string;
    lowerDeck: string;
    upperDeck: string;
    sleeper: string;
    seater: string;
    available: string;
    booked: string;
    selected: string;
    fare: string;
    boardingPoint: string;
    droppingPoint: string;
    holdTimerNotice: string;
    continueToCheckout: string;
  };
  train: {
    partnerDisclaimer: string;
    trainSchedule: string;
    checkPnr: string;
    classes: string;
    departure: string;
    arrival: string;
  };
  resort: {
    starRating: string;
    perNight: string;
    selectRoom: string;
    checkIn: string;
    checkOut: string;
    amenities: string;
  };
  mobility: {
    perKm: string;
    bookRide: string;
    fareEstimate: string;
    driverVerified: string;
  };
  checkout: {
    summary: string;
    passengerDetails: string;
    fareBreakdown: string;
    baseFare: string;
    gst: string;
    platformFee: string;
    discount: string;
    totalAmount: string;
    payWithRazorpay: string;
    secureNotice: string;
  };
  common: {
    confirm: string;
    cancel: string;
    close: string;
    viewTicket: string;
    trackGps: string;
    status: string;
  };
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'ApnaTrips',
    tagline: 'BOOK • TRAVEL • EXPLORE',
    categories: {
      bus: 'Bus Tickets',
      train: 'Train Booking',
      resort: 'Resorts & Hotels',
      taxi: 'Airport & Outstation Cabs',
      auto: 'City Auto',
      bike: 'Bike & Scooter Rental',
    },
    search: {
      from: 'Leaving From',
      to: 'Going To',
      date: 'Travel Date',
      passengers: 'Passengers',
      guests: 'Guests',
      rooms: 'Rooms',
      searchButton: 'Search Inventory',
      destinationCity: 'Destination City / Resort',
    },
    bus: {
      selectSeats: 'Select Seats',
      lowerDeck: 'Lower Deck',
      upperDeck: 'Upper Deck',
      sleeper: 'Sleeper Berth',
      seater: 'Push-back Seater',
      available: 'Available',
      booked: 'Booked',
      selected: 'Selected',
      fare: 'Fare Starting',
      boardingPoint: 'Boarding Point',
      droppingPoint: 'Dropping Point',
      holdTimerNotice: 'Selected seats held for 10:00 minutes during checkout',
      continueToCheckout: 'Proceed to Passenger Details',
    },
    train: {
      partnerDisclaimer: 'Official Authorized IRCTC Partner Interface. Live schedules, fares & PNR verification.',
      trainSchedule: 'Train Timetable & Classes',
      checkPnr: 'Track PNR Status',
      classes: 'Coach Classes',
      departure: 'Departure',
      arrival: 'Arrival',
    },
    resort: {
      starRating: 'Star Luxury',
      perNight: 'per night + taxes',
      selectRoom: 'Book This Suite',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      amenities: 'Key Amenities',
    },
    mobility: {
      perKm: 'per km tariff',
      bookRide: 'Request Chauffeur',
      fareEstimate: 'Estimated Fare',
      driverVerified: 'Police Verified Driver',
    },
    checkout: {
      summary: 'Trip Summary & Verification',
      passengerDetails: 'Passenger Manifest',
      fareBreakdown: 'Fare Breakdown',
      baseFare: 'Base Fare',
      gst: 'GST (18% Statutory)',
      platformFee: 'Platform Convenience Fee',
      discount: 'Special Offer Discount',
      totalAmount: 'Total Payable Amount',
      payWithRazorpay: 'Pay via Razorpay Secure Gateway',
      secureNotice: '256-bit Encrypted Transaction • Official Indian Banking Standards',
    },
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      viewTicket: 'View E-Ticket',
      trackGps: 'Live GPS Tracking',
      status: 'Status',
    },
  },
  hi: {
    appName: 'अपनाट्रिप्स',
    tagline: 'बुक करें • यात्रा करें • देश घूमें',
    categories: {
      bus: 'बस टिकट',
      train: 'ट्रेन बुकिंग',
      resort: 'रिसॉर्ट व होटल',
      taxi: 'एयरपोर्ट व आउटस्टेशन कैब',
      auto: 'सिटी ऑटो',
      bike: 'बाइक व स्कूटर किराया',
    },
    search: {
      from: 'कहाँ से',
      to: 'कहाँ तक',
      date: 'यात्रा तिथि',
      passengers: 'यात्री',
      guests: 'अतिथि',
      rooms: 'कमरे',
      searchButton: 'उपलब्धता खोजें',
      destinationCity: 'शहर या रिसॉर्ट चुनें',
    },
    bus: {
      selectSeats: 'सीट चुनें',
      lowerDeck: 'निचला डेक',
      upperDeck: 'ऊपरी डेक',
      sleeper: 'स्लीपर बर्थ',
      seater: 'पुशबैक सीट',
      available: 'उपलब्ध',
      booked: 'आरक्षित',
      selected: 'चुनी गई',
      fare: 'शुरुआती किराया',
      boardingPoint: 'बोर्डिंग पॉइंट',
      droppingPoint: 'ड्रॉपिंग पॉइंट',
      holdTimerNotice: 'चुनी गई सीटें 10:00 मिनट के लिए सुरक्षित रखी गई हैं',
      continueToCheckout: 'यात्री विवरण भरें',
    },
    train: {
      partnerDisclaimer: 'आईआरसीटीसी अधिकृत पार्टनर इंटरफेस। लाइव समय-सारिणी व पीएनआर स्थिति।',
      trainSchedule: 'ट्रेन समय-सारणी व श्रेणियाँ',
      checkPnr: 'पीएनआर स्टेटस देखें',
      classes: 'कोच श्रेणियां',
      departure: 'प्रस्थान',
      arrival: 'आगमन',
    },
    resort: {
      starRating: 'स्टार लग्जरी',
      perNight: 'प्रति रात + कर',
      selectRoom: 'सूट बुक करें',
      checkIn: 'चेक-इन',
      checkOut: 'चेक-आउट',
      amenities: 'प्रमुख सुविधाएं',
    },
    mobility: {
      perKm: 'प्रति किमी दर',
      bookRide: 'कैब बुक करें',
      fareEstimate: 'अनुमानित किराया',
      driverVerified: 'सत्यापित ड्राइवर',
    },
    checkout: {
      summary: 'यात्रा सारांश व सत्यापन',
      passengerDetails: 'यात्री विवरण',
      fareBreakdown: 'किराया विवरण',
      baseFare: 'मूल किराया',
      gst: 'जीएसटी (18% वैधानिक)',
      platformFee: 'प्लेटफॉर्म सुविधा शुल्क',
      discount: 'विशेष छूट',
      totalAmount: 'कुल देय राशि',
      payWithRazorpay: 'रेज़रपे सुरक्षित गेटवे से भुगतान करें',
      secureNotice: '256-बिट एन्क्रिप्टेड भुगतान • पूर्णतः सुरक्षित',
    },
    common: {
      confirm: 'पुष्टि करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      viewTicket: 'ई-टिकट देखें',
      trackGps: 'लाइव जीपीएस ट्रैकिंग',
      status: 'स्थिति',
    },
  },
  ta: {
    appName: 'அப்னாட்ரிப்ஸ்',
    tagline: 'முன்பதிவு • பயணம் • கொண்டாட்டம்',
    categories: {
      bus: 'பேருந்து டிக்கெட்',
      train: 'ரயில் முன்பதிவு',
      resort: 'ரிசார்ட் & ஹோட்டல்',
      taxi: 'விமான நிலைய & வெளியூர் டாக்ஸி',
      auto: 'நகர ஆட்டோ',
      bike: 'பைக் & ஸ்கூட்டர் வாடகை',
    },
    search: {
      from: 'புறப்படும் இடம்',
      to: 'சேருமிடம்',
      date: 'பயண தேதி',
      passengers: 'பயணிகள்',
      guests: 'விருந்தினர்கள்',
      rooms: 'அறைகள்',
      searchButton: 'இருக்கைகளைத் தேடு',
      destinationCity: 'இலக்கு நகரம் / ரிசார்ட்',
    },
    bus: {
      selectSeats: 'இருக்கை தேர்வு',
      lowerDeck: 'கீழ் தளம்',
      upperDeck: 'மேல் தளம்',
      sleeper: 'படுக்கை வசதி',
      seater: 'சாய்வு இருக்கை',
      available: 'உள்ளது',
      booked: 'பதிவானது',
      selected: 'தேர்ந்தெடுக்கப்பட்டது',
      fare: 'கட்டணம் தொடக்கம்',
      boardingPoint: 'ஏறும் இடம்',
      droppingPoint: 'இறங்கும் இடம்',
      holdTimerNotice: 'தேர்ந்தெடுத்த இருக்கைகள் 10:00 நிமிடங்கள் நிறுத்தி வைக்கப்பட்டுள்ளன',
      continueToCheckout: 'பயணிகள் விவரத்திற்கு செல்லவும்',
    },
    train: {
      partnerDisclaimer: 'அங்கீகரிக்கப்பட்ட ஐஆர்சிடிசி பார்ட்னர் தளம். நேரலை அட்டவணை & பிஎன்ஆர் நிலை.',
      trainSchedule: 'ரயில் கால அட்டவணை',
      checkPnr: 'பிஎன்ஆர் நிலையை அறிய',
      classes: 'பயண வகுப்புகள்',
      departure: 'புறப்பாடு',
      arrival: 'வருகை',
    },
    resort: {
      starRating: 'நட்சத்திர சொகுசு',
      perNight: 'ஒரு இரவுக்கு + வரிகள்',
      selectRoom: 'அறையை முன்பதிவு செய்க',
      checkIn: 'செக்-இன்',
      checkOut: 'செக்-அவுட்',
      amenities: 'சிறப்பம்சங்கள்',
    },
    mobility: {
      perKm: 'கிமீ கட்டணம்',
      bookRide: 'வாகனத்தை முன்பதிவு செய்',
      fareEstimate: 'மதிப்பிடப்பட்ட கட்டணம்',
      driverVerified: 'சரிபார்க்கப்பட்ட ஓட்டுநர்',
    },
    checkout: {
      summary: 'பயண விவரச் சுருக்கம்',
      passengerDetails: 'பயணிகள் விவரம்',
      fareBreakdown: 'கட்டண விவரம்',
      baseFare: 'அடிப்படை கட்டணம்',
      gst: 'ஜிஎஸ்டி (18%)',
      platformFee: 'தள வசதிக் கட்டணம்',
      discount: 'சிறப்பு தள்ளுபடி',
      totalAmount: 'மொத்த கட்டணம்',
      payWithRazorpay: 'ரேசர்பே மூலம் பாதுகாப்பாக செலுத்தவும்',
      secureNotice: '256-பிட் பாதுகாக்கப்பட்ட பணப்பரிமாற்றம்',
    },
    common: {
      confirm: 'உறுதி செய்',
      cancel: 'ரத்து செய்',
      close: 'மூடு',
      viewTicket: 'மின்-டிக்கெட் பார்க்க',
      trackGps: 'நேரலை ஜிபிஎஸ் டிராக்கிங்',
      status: 'நிலை',
    },
  },
};
