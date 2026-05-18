export const HOST = process.env.BACKEND_URL;
export const AUTH_ROUTE = "/api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/register`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const VERIFY_EMAIL_ROUTE = `${AUTH_ROUTE}/verify-email`;
export const USER_ROUTE = "/api/user/me";


// PARTNER ONBOARDING ROUTES
export const ONBOARDING_BASE = "/api/partner/onboarding";
export const ONBOARDING_VEHICLE = `${ONBOARDING_BASE}/vehicle`;
export const ONBOARDING_BANK = `${ONBOARDING_BASE}/bank`;   
export const ONBOARDING_DOCUMENTS = `${ONBOARDING_BASE}/documents`;

// ADMIN DASHBOARD ROUTE
export const ADMIN_DASHBOARD_ROUTE = "/api/admin/dashboard";
export const ADMIN_PARTNER_REVIEWS_ROUTE = "/api/admin/reviews/partner";