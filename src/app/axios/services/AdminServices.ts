const ADMIN_BASE_URL: string = import.meta.env.VITE_BASE_URL_SERVICE as string;

export const GET_USER_ROLES = `${ADMIN_BASE_URL}/api/admin/v1/roles`;
export const SAVE_ADMIN_ROLE = `${ADMIN_BASE_URL}/api/admin/v1/roles`;
export const UPDATE_ADMIN_ROLE = `${ADMIN_BASE_URL}/api/admin/v1/roles/`;
export const GET_PERMISSIONS_BY_ID = `${ADMIN_BASE_URL}/api/admin/v1/permissions/`;
export const UPDATE_PERMISSIONS = `${ADMIN_BASE_URL}/api/admin/v1/permissions/`;
