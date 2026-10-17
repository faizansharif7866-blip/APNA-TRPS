import React, { useMemo } from 'react';
import CustomerApp from '../apps/customer-web/CustomerApp.js';
import AdminApp from '../apps/admin-web/AdminApp.js';
import PartnerApp from '../apps/partner-web/PartnerApp.js';

/**
 * ApnaTrips Application Ecosystem Router
 * Authoritative client router delivering 3 completely separate web applications:
 *
 * 1. Customer Application (Public Website: www.apnatrips.com)
 *    - Default root experience ('/')
 *    - Zero admin or partner portal tabs, zero admin buttons, zero role switchers
 *
 * 2. Admin Portal (Separate Website: admin.apnatrips.com or '/admin')
 *    - Dedicated administrator login with secure server verification
 *    - Role-based permissions, financial ledger, and KYC oversight
 *
 * 3. Partner & Bus Operator Portal (Separate Website: partners.apnatrips.com or '/partner')
 *    - Dedicated partner login and registration with pending verification
 *    - Bus fleet drag-and-drop layout builder with safety validation
 */
export default function App() {
  const detectedApp = useMemo(() => {
    if (typeof window === 'undefined') return 'customer';

    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const appQuery = searchParams.get('app')?.toLowerCase();

    // 1. Check Subdomain / Hostname Matching
    if (hostname.startsWith('admin.') || appQuery === 'admin' || pathname.startsWith('/admin')) {
      return 'admin';
    }

    if (
      hostname.startsWith('partner.') || 
      hostname.startsWith('partners.') || 
      appQuery === 'partner' || 
      appQuery === 'partners' || 
      pathname.startsWith('/partner')
    ) {
      return 'partner';
    }

    // 2. Default: Exclusively Customer Application (www.apnatrips.com)
    return 'customer';
  }, []);

  if (detectedApp === 'admin') {
    return <AdminApp />;
  }

  if (detectedApp === 'partner') {
    return <PartnerApp />;
  }

  return <CustomerApp />;
}
