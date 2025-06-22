import { get } from '../../../http/LiveAquariaServiceMethods';
import * as url from '../url_helper';

export const fetchAllUsersByPagination = (pageNo: string | number, pageSize: string | number) =>
	get(`${url.FETCH_ALL_USERS_BY_PAGINATION}page/${pageNo}/size/${pageSize}`);
