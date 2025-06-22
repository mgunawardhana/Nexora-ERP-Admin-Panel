import { del, get, post, put } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';

export const fetchAllReceivedStocks = (pageNo: string | number, pageSize: string | number) =>
	get(`${url.FETCH_ALL_RECEIVED_STOCKS}page/${pageNo}/size/${pageSize}`);

export const handleUpdateGuidelineAPI = (data: any) => put(url.UPDATE_GUIDELINE, data);

export const deleteGuideline = (id: string | number) => del(`${url.DELETE_RECEIVED_STOCKS}${id}`);

export const handleCreateGuideline = (data: any) => post(url.CREATE_RECEIVED_STOCKS, data);
