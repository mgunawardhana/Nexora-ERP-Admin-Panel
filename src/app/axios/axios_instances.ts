import axios, { AxiosInstance } from 'axios';

const tokenString = localStorage.getItem('accessToken');
const token: string | null = tokenString ? (JSON.parse(tokenString) as string) : null;

const VITE_BASE_URL_SERVICE: string = import.meta.env.VITE_BASE_URL_SERVICE as string;
const VITE_BASE_URL_AUTH_SERVICE: string = import.meta.env.VITE_BASE_URL_AUTH_SERVICE as string;

const axiosApi: AxiosInstance = axios.create({
	baseURL: VITE_BASE_URL_SERVICE,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
});

const axiosApiAuth: AxiosInstance = axios.create({
	baseURL: VITE_BASE_URL_AUTH_SERVICE,
	headers: {
		'Content-Type': 'application/json',
		Authorization: token ? `${token}` : ''
	}
});

export { axiosApi, axiosApiAuth };
