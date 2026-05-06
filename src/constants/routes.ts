export const HOST = process.env.BACKEND_URL;
export const AUTH_ROUTE = "/api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/register`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const VERIFY_EMAIL_ROUTE = `${AUTH_ROUTE}/verify-email`;
export const USER_ROUTE = "/api/user/me";