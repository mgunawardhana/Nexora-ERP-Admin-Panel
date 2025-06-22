// ts-nocheck
import { post } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';

// @ts-ignore
export const fetchAllUsers = (pageNo: string | number, pageSize: string | number) =>
	post(`${url.FETCH_ALL_USERS}${pageNo}&size=${pageSize}`);

export const handleSaveUsers = (data: any) => post(url.CREATE_USER, data);
