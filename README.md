# ApnaTrips — Complete Multi-Application Travel Booking Platform

An enterprise-grade Indian travel booking platform separating three independent web applications connected to one unified, secure backend and authoritative shared database.

---

## 🏛️ System Architecture

```
apnatrips/
├── apps/
│   ├── customer-web/                     # 1. Customer Public Web Application (www.apnatrips.com)
│   │   ├── CustomerApp.tsx               # Pure customer booking interface (Zero internal portal buttons)
│   │   ├── main.tsx                      # Standalone entry point
│   │   └── customer-components/          # CustomerNavbar, CustomerFooter, booking views
│   │
│   ├── admin-web/                        # 2. Admin Operations Portal (admin.apnatrips.com)
│   │   ├── AdminApp.tsx                  # Dedicated administrator console & management modules
│   │   ├── main.tsx                      # Standalone entry point
│   │   └── admin-components/             # KPI cards, audit logs, KYC approvals, refund management
│   │
│   └── partner-web/                      # 3. Partner & Bus Operator Portal (partners.apnatrips.com)
│       ├── PartnerApp.tsx                # Dedicated operator dashboard & registration
│       ├── main.tsx                      # Standalone entry point
│       └── partner-components/           # Visual Drag-and-Drop Bus Layout Builder & safety validator
│
├── packages/
│   └── shared-types/                     # Authoritative Shared Types
│       └── index.ts                      # UserProfile, AdminUser, Operator, Bus, Seat, Booking, Refund
│
├── server/
│   └── src/
│       ├── auth/                         # Strict role auth middleware & session token verification
│       │   ├── authMiddleware.ts
│       │   └── authRoutes.ts
│       ├── database/                     # Authoritative in-memory / persistent database
│       │   └── db.ts
│       ├── administrators/               # Admin endpoints (overview, operator KYC, refunds, audit)
│       │   └── adminRoutes.ts
│       ├── operators/                    # Operator fleet, layout publishing, trips, manifests, payouts
│       │   └── operatorRoutes.ts
│       ├── customers/                    # Bus search, seat map, booking, cancellation, grievances
│       │   └── customerRoutes.ts
│       └── services/                     # Safety layout validator enforcing zero overlaps & exits
│           └── busLayoutValidator.ts
│
├── index.html                            # Customer Web Entry (Default)
├── admin.html                            # Admin Web Entry (Standalone)
├── partner.html                          # Partner Web Entry (Standalone)
├── server.ts                             # Express backend on port 3000 mounting Vite and API routers
└── README.md
```

---

## 🌐 The 3 Separated Web Applications

### 1. Customer Application (`www.apnatrips.com`)
- **URL**: `http://localhost:3000/` or `www.apnatrips.com`
- **Audience**: Travelers and passengers booking buses, IRCTC trains, getaways, and cabs.
- **Strict Separation Rules Enforced**:
  - ❌ ZERO Admin Portal tabs or buttons.
  - ❌ ZERO Partner or Operator tabs or buttons.
  - ❌ ZERO Role-switching controls or development portal selectors.
  - ❌ ZERO Admin registration controls.
  - 🔒 Customers cannot reach admin or operator management screens by changing URLs or tampering with frontend state.
- **Key Features**:
  - Live bus search by Source, Destination, and Journey Date.
  - Visual seat selection showing real operator layouts (seater, semi-sleeper, sleeper, mixed, double-decker).
  - Passenger information and discount coupons (`APNA50`, `FESTIVE15`).
  - Razorpay payment modal with verified booking confirmation and QR e-tickets.
  - Self-service booking cancellation with automated 90% refund computation.
  - Customer Support & Grievances:
    - **Helpline**: `1800-APNA-TRIP (1800 2762 8747)`
    - **Head Office**: `Athanavur, Yelagiri Hills, Tirupattur D.T., Tamil Nadu, 635853`

### 2. Admin Portal (`admin.apnatrips.com`)
- **URL**: `http://localhost:3000/admin` or `admin.html` or `admin.apnatrips.com`
- **Audience**: Authorized ApnaTrips administrative staff.
- **Dedicated Authentication**:
  - Requires valid administrator work credentials.
  - Rate-limited login attempts with brute-force lockout protection.
  - No public registration allowed.
  - Role-based permissions (`super_admin`, `operations_manager`, `finance_manager`, `customer_support`).
- **Management Modules**:
  - **Executive KPI Dashboard**: Verified Gross Revenue, Confirmed Bookings, Active Fleet, Net Platform Revenue.
  - **Operator & KYC Compliance**: Review GSTIN, PAN, and bank settlement details. Approve or reject operators.
  - **Fleet & Seat Layout Oversight**: View all buses registered by operators with safety compliance certifications.
  - **Trips & Schedules**: Monitor scheduled inter-city corridors and departure times.
  - **Master Booking Registry**: Track all passenger bookings across operators.
  - **Refund Management**: Execute verified cancellations and authorization of refunds.
  - **Commission Rules**: Configure platform take rates per operator.
  - **Coupons & Promo Offers**: Manage discount vouchers.
  - **Customer Grievance Desk**: Review customer complaint tickets.
  - **Security & Audit Logs**: Immutable chronological record of all sensitive actions.

### 3. Partner & Bus Operator Portal (`partners.apnatrips.com`)
- **URL**: `http://localhost:3000/partner` or `partner.html` or `partners.apnatrips.com`
- **Audience**: Verified bus operators and fleet owners.
- **Dedicated Registration & Verification**:
  - Dedicated partner registration collecting Company Legal Name, Owner, GSTIN, PAN, Bank Details.
  - New partners strictly set to `PENDING_VERIFICATION` status until approved by compliance.
  - Only authenticated operators can access fleet controls.
- **Operator Capabilities**:
  - **Scoped Dashboard**: Displays only their own buses, trips, seat availability, bookings, and earnings.
  - **Visual Bus Layout Builder**: Interactive drag-and-drop editor for seats, berths, aisles, driver area, entry doors, staircases, and emergency exits.
  - **Server-Side Validation**: Layouts are rejected if any seats overlap, labels are duplicated, or required safety markers are missing.
  - **Passenger Manifests**: Secure manifest view for their upcoming scheduled trips.
  - **Settlements**: Breakdown of gross fares, commission deductions, and net payouts.

---

## 🔒 Security & Access Control Matrix

| Endpoint Group | Customer Accounts | Operator Accounts | Admin Accounts |
| :--- | :---: | :---: | :---: |
| `/api/customer/*` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `/api/operator/*` | ⛔ 403 Forbidden | ✅ Allowed (Scoped) | ✅ Allowed |
| `/api/admin/*` | ⛔ 403 Forbidden | ⛔ 403 Forbidden | ✅ Allowed (Role-checked) |
| `/api/bus-configurations/publish` | ⛔ 403 Forbidden | ✅ Allowed (Validated) | ✅ Allowed |

---

## 🚀 Running & Building

```bash
# Start full-stack development server on port 3000
npm run dev

# Run production build (generates index.html, admin.html, partner.html)
npm run build

# Start production server
npm start
```
