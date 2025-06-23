import { lazy } from 'react';

const AnalyticsDashboardApp = lazy(() => import('././RoleBaseAnalyticsDashboardApp'));
/**
 * The analytics dashboard app config.
 */
const RoleBaseAnalyticsDashboardAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: 'dashboards/analytics-salary-base',
			element: <AnalyticsDashboardApp />
		}
	]
};

export default RoleBaseAnalyticsDashboardAppConfig;
