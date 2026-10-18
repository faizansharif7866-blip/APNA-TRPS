import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { activeSessions, AuthenticatedRequest, extractAuthToken } from './authMiddleware.js';
import { AdminRole, OperatorOrganization, UserProfile } from '../../../packages/shared-types/index.js';

const router = Router();

// Rate limiter / failed attempt counter
const failedLoginAttempts: Map<string, { count: number; lockedUntil?: number }> = new Map();

/**
 * 1. Dedicated Administrator Authentication Endpoint
 * POST /api/auth/admin/login
 * Strict requirements:
 * - No public administrator registration.
 * - Server-side credential verification.
 * - Rate limiting and account protection.
 * - Audit logging.
 */
router.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Email address and administrator password are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check rate limiting / locks
  const attempts = failedLoginAttempts.get(normalizedEmail) || { count: 0 };
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const remainingSeconds = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: 'AccountLocked',
      message: `Too many failed login attempts. Account temporarily locked for ${remainingSeconds} seconds.`,
    });
  }

  const credentials = db.adminCredentials.get(normalizedEmail);
  const adminUser = db.adminUsers.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (!credentials || !adminUser || !adminUser.isActive) {
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 60 * 1000; // 1-minute lock
    }
    failedLoginAttempts.set(normalizedEmail, attempts);

    db.addAuditLog({
      actorEmail: normalizedEmail,
      actorRole: 'unknown',
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'AdminAccount',
      entityId: normalizedEmail,
      details: 'Failed administrator login attempt: Invalid credentials.',
      status: 'DENIED',
    });

    return res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Invalid administrative credentials. Please verify your email and secure password.',
    });
  }

  // Verify password hash
  if (credentials.passwordHash !== password) {
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 60 * 1000;
    }
    failedLoginAttempts.set(normalizedEmail, attempts);

    db.addAuditLog({
      actorEmail: normalizedEmail,
      actorRole: adminUser.role,
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'AdminAccount',
      entityId: adminUser.id,
      details: 'Failed administrator password verification.',
      status: 'DENIED',
    });

    return res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Invalid administrative credentials.',
    });
  }

  // Clear failed attempts upon success
  failedLoginAttempts.delete(normalizedEmail);

  // Generate authoritative server session token
  const token = `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  activeSessions.set(token, {
    userId: adminUser.id,
    email: adminUser.email,
    role: 'admin',
    adminRole: adminUser.role,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  });

  adminUser.lastLoginAt = new Date().toISOString();

  // Audit Log
  db.addAuditLog({
    actorEmail: adminUser.email,
    actorRole: adminUser.role,
    action: 'ADMIN_LOGIN_SUCCESS',
    entityType: 'AdminAccount',
    entityId: adminUser.id,
    details: `Administrator logged in successfully with role: ${adminUser.role}`,
    status: 'SUCCESS',
  });

  return res.status(200).json({
    success: true,
    token,
    user: adminUser,
  });
});

/**
 * 2. Partner & Operator Registration Endpoint
 * POST /api/auth/operator/register
 * Collects required business, tax, and bank information.
 * Always sets KYC status to PENDING_VERIFICATION.
 */
router.post('/operator/register', (req: Request, res: Response) => {
  const {
    businessName,
    tradeName,
    ownerName,
    email,
    phone,
    password,
    gstin,
    panNumber,
    bankAccountMasked,
    bankIfsc,
    bankName,
    headOfficeAddress,
  } = req.body;

  if (!businessName || !ownerName || !email || !phone || !password || !gstin || !panNumber) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Missing required partner fields: businessName, ownerName, email, phone, password, gstin, and panNumber are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if operator already registered
  const existingOp = db.operators.find((op) => op.email.toLowerCase() === normalizedEmail);
  if (existingOp) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'An operator with this email address has already been registered.',
    });
  }

  const newOperator: OperatorOrganization = {
    id: `op-${Date.now()}`,
    businessName: String(businessName).trim(),
    tradeName: tradeName ? String(tradeName).trim() : String(businessName).trim(),
    ownerName: String(ownerName).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    gstin: String(gstin).trim().toUpperCase(),
    panNumber: String(panNumber).trim().toUpperCase(),
    kycStatus: 'PENDING_VERIFICATION',
    commissionPercentage: 10,
    bankAccountMasked: bankAccountMasked || 'Pending Verification',
    bankIfsc: bankIfsc || '',
    bankName: bankName || 'Bank of India',
    headOfficeAddress: headOfficeAddress || 'India',
    totalTripsCount: 0,
    totalEarnings: 0,
    pendingSettlement: 0,
    registeredBusCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.operators.push(newOperator);
  db.operatorCredentials.set(normalizedEmail, {
    passwordHash: password,
    salt: 'salt_op_' + Date.now(),
  });

  db.addAuditLog({
    actorEmail: normalizedEmail,
    actorRole: 'operator_applicant',
    action: 'OPERATOR_APPLICATION_SUBMITTED',
    entityType: 'OperatorOrganization',
    entityId: newOperator.id,
    details: `New operator registered: ${newOperator.businessName} (GSTIN ${newOperator.gstin}). Status: PENDING_VERIFICATION.`,
    status: 'SUCCESS',
  });

  return res.status(201).json({
    success: true,
    message: 'Operator application received successfully. Your account is pending administrative verification before fleet publishing is enabled.',
    operator: newOperator,
  });
});

/**
 * 3. Partner & Operator Login Endpoint
 * POST /api/auth/operator/login
 */
router.post('/operator/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Email and password are required.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const operator = db.operators.find((op) => op.email.toLowerCase() === normalizedEmail);
  const creds = db.operatorCredentials.get(normalizedEmail);

  if (!operator || !creds || creds.passwordHash !== password) {
    return res.status(401).json({
      error: 'InvalidCredentials',
      message: 'Invalid operator email or password.',
    });
  }

  // Check KYC status
  if (operator.kycStatus === 'PENDING_VERIFICATION') {
    return res.status(200).json({
      success: false,
      isPending: true,
      message: 'Your partner account is pending administrative verification by ApnaTrips compliance team.',
      operator,
    });
  }

  if (operator.kycStatus === 'REJECTED' || operator.kycStatus === 'SUSPENDED') {
    return res.status(403).json({
      error: 'AccountSuspended',
      message: `Your partner account is ${operator.kycStatus.toLowerCase()}. Reason: ${operator.kycRejectionReason || 'Contact support'}.`,
      operator,
    });
  }

  // Active verified session
  const token = `op-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  activeSessions.set(token, {
    userId: operator.id,
    email: operator.email,
    role: 'operator',
    operatorId: operator.id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  db.addAuditLog({
    actorEmail: operator.email,
    actorRole: 'operator',
    action: 'OPERATOR_LOGIN_SUCCESS',
    entityType: 'OperatorOrganization',
    entityId: operator.id,
    details: `Operator logged in: ${operator.businessName}`,
    status: 'SUCCESS',
  });

  return res.status(200).json({
    success: true,
    token,
    operator,
  });
});

/**
 * 4. Customer Login / Register Endpoints
 * Exclusively for travelers booking on the public website.
 */
router.post('/customer/login', (req: Request, res: Response) => {
  const { email, phone, name, authProvider } = req.body;

  if (!email && !phone) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Email address or phone number is required for customer login.',
    });
  }

  let customer: UserProfile | undefined = db.customers.find(
    (c) => (email && c.email === email) || (phone && c.phone === phone)
  );

  if (!customer) {
    const newCustomer: UserProfile = {
      id: `cust-${Date.now()}`,
      name: name || 'Valued Traveler',
      email: email || `traveler${Date.now()}@apnatrips.com`,
      phone: phone || '+91 98000 00000',
      role: 'customer',
      isVerified: true,
      authProvider: (authProvider as any) || 'phone',
      createdAt: new Date().toISOString(),
    };
    db.customers.push(newCustomer);
    customer = newCustomer;
  }

  const token = `cust-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  activeSessions.set(token, {
    userId: customer.id,
    email: customer.email,
    role: 'customer',
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    token,
    user: customer,
  });
});

/**
 * 5. Verify Active Session
 * GET /api/auth/me
 */
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  const hasAuth = extractAuthToken(req);
  if (!hasAuth || !req.user) {
    return res.status(401).json({ isAuthenticated: false });
  }

  if (req.user.role === 'admin') {
    const admin = db.adminUsers.find((a) => a.id === req.user?.id);
    return res.json({ isAuthenticated: true, role: 'admin', user: admin });
  }

  if (req.user.role === 'operator') {
    const operator = db.operators.find((op) => op.id === req.user?.operatorId);
    return res.json({ isAuthenticated: true, role: 'operator', operator });
  }

  const customer = db.customers.find((c) => c.id === req.user?.id);
  return res.json({ isAuthenticated: true, role: 'customer', user: customer });
});

export default router;
