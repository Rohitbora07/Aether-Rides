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
export const ONBOARDING_PRICE = `${ONBOARDING_BASE}/price`;

export const USER_BOOKINGS_ROUTE = "/api/user/bookings"
export const USER_ACTIVE_BOOKING_ROUTE = "/api/user/active-ride"

// PARTNER BOOKINGS
export const PARTNER_BOOKINGS_ROUTE = "/api/partner/bookings";
export const PARTNER_PENDING_REQUEST_COUNT_ROUTE = "/api/partner/bookings/pending-request-count";
export const PARTNER_PENDING_BOOKINGS_ROUTE = "/api/partner/bookings/pending";
export const PARTNER_ACCEPT_BOOKING_ROUTE = (id: string) => `/api/partner/bookings/${id}/accept`
export const PARTNER_REJECT_BOOKING_ROUTE = (id: string) => `/api/partner/bookings/${id}/reject`
export const PARTNER_ACTIVE_BOOKING_ROUTE = "/api/partner/my-active"

// ADMIN DASHBOARD ROUTE
export const ADMIN_DASHBOARD_ROUTE = "/api/admin/dashboard";
export const ADMIN_PARTNER_REVIEWS_ROUTE = "/api/admin/reviews/partner";
export const ADMIN_VEHICLE_REVIEWS_ROUTE = "/api/admin/reviews/vehicle";
export const ADMIN_EARNING_ROUTE = "/api/admin/earning";

// VEHICLE SEARCH ROUTE
export const NEARBY_VEHICLES_ROUTE = "/api/vehicles/near-by";

// Booking Routes
export const BOOKING_BASE_ROUTE = "/api/booking/";
export const CREATE_BOOKING_ROUTE = `${BOOKING_BASE_ROUTE}create`;
export const ACTIVE_BOOKING_ROUTE = `${BOOKING_BASE_ROUTE}active`;
export const CANCEL_BOOKING_ROUTE = (id: string) => `${BOOKING_BASE_ROUTE}${id}/cancel`;
export const CONFIRM_BOOKING_ROUTE = (id: string) => `${BOOKING_BASE_ROUTE}${id}/confirm`;


// Payment Routes
export const PAYMENT_BASE_ROUTE = "/api/payment/";
export const CREATE_PAYMENT_ROUTE = `${PAYMENT_BASE_ROUTE}create`;
export const VERIFY_PAYMENT_ROUTE = `${PAYMENT_BASE_ROUTE}verify`;

// Chat Routes
export const CHAT_BASE_ROUTE = "/api/chat/";
export const GET_ALL_MESSAGES_ROUTE = `${CHAT_BASE_ROUTE}get-all`;
export const SEND_MESSAGE_ROUTE = `${CHAT_BASE_ROUTE}send`;
export const AI_SUGGESTIONS_ROUTE = `${CHAT_BASE_ROUTE}ai-suggestions`;


// Otp Routes

export const OTP_BASE_ROUTE = "/api/partner/bookings/otp/";
export const PICKUP_OTP_SEND_ROUTE = `${OTP_BASE_ROUTE}pickup/send`;
export const PICKUP_OTP_VERIFY_ROUTE = `${OTP_BASE_ROUTE}pickup/verify`;
export const DROP_OTP_SEND_ROUTE = `${OTP_BASE_ROUTE}drop/send`;
export const DROP_OTP_VERIFY_ROUTE = `${OTP_BASE_ROUTE}drop/verify`;

export const PARTNER_EARNING_ROUTE = "/api/partner/earning";
