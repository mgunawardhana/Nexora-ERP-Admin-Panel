import { AxiosRequestConfig } from 'axios';
import { axiosApi } from '../axios_instances';

export function getAccessToken() {
	const tokenString = localStorage.getItem('accessToken');

	if (tokenString) {
		try {
			// Parse the token if it was stored as JSON string
			return JSON.parse(tokenString);
		} catch (e) {
			// If it's not a valid JSON string, return as is
			return tokenString;
		}
	}

	return null;
}

export async function get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
	const accessToken = getAccessToken();

	if (accessToken) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		};
	}

	// Enable credentials for CORS requests
	config.withCredentials = true;

	const response = await axiosApi.get<T>(url, config);
	return response.data;
}

export async function post<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
	const accessToken = getAccessToken();

	if (accessToken) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		};
	}

	// Enable credentials for CORS requests
	config.withCredentials = true;

	const response = await axiosApi.post<T>(url, data, config);
	return response.data;
}

export async function put<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
	const accessToken = getAccessToken();

	if (accessToken) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		};
	}

	// Enable credentials for CORS requests
	config.withCredentials = true;

	const response = await axiosApi.put<T>(url, data, config);
	return response.data;
}

export async function del<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
	const accessToken = getAccessToken();

	if (accessToken) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		};
	}

	// Enable credentials for CORS requests
	config.withCredentials = true;

	const response = await axiosApi.delete<T>(url, config);
	return response.data;
}
