import { FuseRouteConfigsType } from '@fuse/utils/FuseUtils';
import UserRolesAppConfig from './roles/UserRolesConfig';
import UserPermissionsConfig from './permissions/UserPermissionsConfig';

/**
 * User Management App Config
 */
const userManagementConfigs: FuseRouteConfigsType = [UserRolesAppConfig, UserPermissionsConfig];

export default userManagementConfigs;
