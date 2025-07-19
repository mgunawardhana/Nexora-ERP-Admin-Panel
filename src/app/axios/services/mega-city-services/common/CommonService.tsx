import { get, post, del, put } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';

export const fetchAllProducts = (pageNo: string | number, pageSize: string | number) =>
	get(`${url.FETCH_ALL_PRODUCTS}${pageNo}/size/${pageSize}`);
export const saveProduct = (data: any) => post(url.SAVE_PRODUCT, data);
export const updateProductDetails = (data: any, id: any) => put(`${url.UPDATE_PRODUCT}${id}`, data);
export const deleteProduct = (id: string | number) => del(`${url.DELETE_PRODUCT}${id}`);

// Received Stocks

export const updateReceivedStocks = (id: any, data: any) => put(`${url.UPDATE_RECEIVED_STOCKS}${id}`, data);
export const deleteReceivedStocks = (id: any) => del(`${url.DELETE_RECEIVED_STOCKS}${id}`);
export const createReceivedStocks = (data: any) => post(url.CREATE_RECEIVED_STOCKS, data);
export const updateCategory = (id: any, data: any) => put(`${url.UPDATE_CATEGORY}${id}`, data);

export const createOrder = (data: any) => post(url.CREATE_PLACE_ORDER, data);

export const fetchOrders = (
	pageNo: string | number,
	pageSize: string | number,
	startDate: string | number = '',
	endDate: string | number = '',
	groupCode: string | number = '',
	demonstratorName: string | number = '',
	boatmanName: string | number = ''
) =>
	get(
		`${url.FETCH_ORDERS}=${pageNo}&size=${pageSize}&startDate=${startDate}&endDate=${endDate}&groupCode=${groupCode}&demonstratorName=${demonstratorName}&boatmanName=${boatmanName}`
	);

export const createUser = (data: any) => post(url.CREATE_USER, data);
export const businessSummery = () => get(`${url.FETCH_BUSINESS_DETAILS}`);
export const fetchAnalyzingPart = () => get(`${url.FETCH_ANALYZED_PART}`);
export const fetchRoleByOfficeLocationsForAnalytics = () => get(`${url.ROLES_BY_OFFICE_LOCATIONS_FOR_ANALYTICS}`);
export const fetchStatusByRoleForAnalytics = () => get(`${url.STATUS_BY_ROLE_FOR_ANALYTICS}`);
export const geminiAPICall = (data: any) => post(url.GEMINI_API_CALL, data);
