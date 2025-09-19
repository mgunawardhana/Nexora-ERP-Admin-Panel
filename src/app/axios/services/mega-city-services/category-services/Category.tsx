import { del, get, post, put } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';
import { DELETE_USER } from '../url_helper';

// create category
export const createCategory = (data: any) => post(url.CREATE_CATEGORY, data);

export const fetchAllCategoriesWithPagination = (pageNo: string | number, pageSize: string | number) =>
	get(`${url.FETCH_CATEGORIES}page/${pageNo}/size/${pageSize}`);

export const createNewCategory = (data: any) => post(url.CREATE_CATEGORY, data);

export const deleteUser = (id: string | number) => del(`${url.DELETE_USER}${id}`);

export const updateCategory = (id: string, data: any) => put(url.UPDATE_CATEGORY, data);
