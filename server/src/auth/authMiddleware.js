import { db } from "../database/db.js";
const activeSessions = /* @__PURE__ */ new Map();
function extractAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  if (!session) {
    return false;
  }
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  req.user = {
    id: session.userId,
    email: session.email,
    role: session.role,
    adminRole: session.adminRole,
    operatorId: session.operatorId
  };
  return true;
}
function requireAdmin(allowedRoles) {
  return (req, res, next) => {
    const isAuthenticated = extractAuthToken(req);
    if (!isAuthenticated || !req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Administrator authentication required. Please login with valid administrative credentials."
      });
    }
    if (req.user.role !== "admin") {
      db.addAuditLog({
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
        entityType: "Endpoint",
        entityId: req.originalUrl,
        details: `Access denied to administrator endpoint ${req.originalUrl} for non-admin user ${req.user.email}.`,
        status: "DENIED"
      });
      return res.status(403).json({
        error: "Forbidden",
        message: "Access Denied: Customer and Operator accounts cannot access administrator endpoints."
      });
    }
    if (allowedRoles && allowedRoles.length > 0 && req.user.adminRole) {
      if (!allowedRoles.includes(req.user.adminRole) && req.user.adminRole !== "super_admin") {
        return res.status(403).json({
          error: "InsufficientPermissions",
          message: `Your administrative role (${req.user.adminRole}) is not authorized for this specific operation.`
        });
      }
    }
    next();
  };
}
function requireOperator() {
  return (req, res, next) => {
    const isAuthenticated = extractAuthToken(req);
    if (!isAuthenticated || !req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Operator authentication required. Please login with your registered partner credentials."
      });
    }
    if (req.user.role !== "operator") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Access Denied: Customers and non-operator accounts cannot access partner operations."
      });
    }
    const operator = db.operators.find((op) => op.id === req.user?.operatorId);
    if (!operator) {
      return res.status(404).json({
        error: "OperatorNotFound",
        message: "Associated operator organization could not be found."
      });
    }
    if (operator.kycStatus === "PENDING_VERIFICATION") {
      return res.status(403).json({
        error: "AccountPendingVerification",
        message: "Your partner account is pending administrative verification. Live fleet operations are locked.",
        operatorStatus: "PENDING_VERIFICATION"
      });
    }
    if (operator.kycStatus === "REJECTED" || operator.kycStatus === "SUSPENDED") {
      return res.status(403).json({
        error: "AccountSuspended",
        message: `Your partner account has been ${operator.kycStatus.toLowerCase()}. Please contact ApnaTrips support.`,
        operatorStatus: operator.kycStatus
      });
    }
    next();
  };
}
function requireCustomer() {
  return (req, res, next) => {
    const isAuthenticated = extractAuthToken(req);
    if (!isAuthenticated || !req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Customer sign-in required to access this resource."
      });
    }
    next();
  };
}
export {
  activeSessions,
  extractAuthToken,
  requireAdmin,
  requireCustomer,
  requireOperator
};
