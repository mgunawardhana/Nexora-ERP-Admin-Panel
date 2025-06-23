import { FuseRouteConfigsType } from '@fuse/utils/FuseUtils';
import AnalyticsDashboardAppConfig from './analytics/AnalyticsDashboardAppConfig';
import ProjectDashboardAppConfig from './project/ProjectDashboardAppConfig';
import FinanceDashboardAppConfig from './finance/FinanceDashboardAppConfig';
import RoleBaseAnalyticsDashboardAppConfig from './rolebase_salary/RoleBaseAnalyticsDashboardAppConfig';
import StatusWiseRoleRoleBaseAnalyticsDashboardAppConfig from './status-wise-role/StatusWiseRoleRoleBaseAnalyticsDashboardAppConfig';

/**
 * Dashboards
 */
const dashboardsConfigs: FuseRouteConfigsType = [
	AnalyticsDashboardAppConfig,
	ProjectDashboardAppConfig,
	FinanceDashboardAppConfig,
	RoleBaseAnalyticsDashboardAppConfig,
	StatusWiseRoleRoleBaseAnalyticsDashboardAppConfig
];

export default dashboardsConfigs;
