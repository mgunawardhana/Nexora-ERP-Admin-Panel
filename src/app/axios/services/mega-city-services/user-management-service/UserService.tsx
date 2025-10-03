import { post, put } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';

export const fetchAllUsersByPagination = (page: string | number, size: string | number) =>
	post(`${url.FETCH_ALL_USERS_BY_PAGINATION}page=${page}&size=${size}`);

export const registerUser = (data: any) => post(url.REGISTER_USER, data);

export const updateUser = (id: any, data: any) => put(`${url.UPDATE_USER}${id}`, data);
