const AUTH_BASE_URL: string = import.meta.env.VITE_BASE_URL_SERVICE as string;
export const SIGN_IN = `${AUTH_BASE_URL}/api/v1/auth/authenticate`;
export const SAVE_ADMIN_USER = `${AUTH_BASE_URL}/api/v1/auth/public/register`;
export const UPDATE_ADMIN_USER = `${AUTH_BASE_URL}/api/admin/v1/admins`;
export const VALIDATE_TOKEN = `${AUTH_BASE_URL}/api/v1/auth/refresh`;
export const RESET_PASSWORD = `${AUTH_BASE_URL}/api/admin/v1/auth/forgot-password`;
export const CONFIRM_RESET_PASSWORD = `${AUTH_BASE_URL}/api/admin/v1/auth/reset-password`;
