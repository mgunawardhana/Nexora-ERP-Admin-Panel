import { lazy } from 'react';

const AnalyticsDashboardApp = lazy(() => import('./StatusWiseRoleAnalyticsDashboardApp'));
/**
 * The analytics dashboard app config.
 */
const StatusWiseRoleRoleBaseAnalyticsDashboardAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'dashboards/analytics-status-base',
			element: <AnalyticsDashboardApp />
		}
	]
};

export default StatusWiseRoleRoleBaseAnalyticsDashboardAppConfig;
