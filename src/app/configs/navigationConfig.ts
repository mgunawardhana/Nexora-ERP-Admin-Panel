import i18next from 'i18next';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboards',
		title: 'Employee Role Distribution',
		subtitle: 'Reports generations',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'ANALYTICS_MANAGEMENT',

		children: [
			{
				id: 'dashboards.project',
				title: 'Dashboard',
				type: 'item',
				icon: 'heroicons-outline:presentation-chart-line',
				url: '/dashboards/project'
			},
			{
				id: 'dashboards.analytics',
				title: 'Analytics',
				type: 'collapse',
				icon: 'heroicons-outline:chart-pie',
				translate: 'ANALYTICS_MANAGEMENT',
				children: [
					{
						id: 'dashboards.finance',
						title: 'Role Distribution',
						type: 'item',
						icon: 'heroicons-outline:cash',
						url: '/dashboards/analytics'
					},
					{
						id: 'dashboards.rolebase_salary',
						title: 'Branch Diversity',
						type: 'item',
						icon: 'heroicons-outline:currency-dollar',
						url: '/dashboards/analytics-salary-base'
					},
					{
						id: 'dashboards.rolebase',
						title: 'Status Wise Role',
						type: 'item',
						icon: 'heroicons-outline:chart-bar',
						url: '/dashboards/analytics-status-base'
					}
				]
			}
		]
	},
	{
		id: 'propertymanagement',
		title: 'Property Management',
		type: 'group',
		icon: 'heroicons-outline:home',
		translate: 'PROPERTY_MANAGEMENT',
		subtitle: 'Business Properties Management',
		children: [
			{
				id: 'propertymanagement.users',
				title: 'Users',
				type: 'item',
				icon: 'heroicons-outline:user',
				url: 'stocks/create-category',
				translate: 'USERS'
			}
		]
	},
	{
		id: 'salesManagement',
		title: 'Sales Management',
		type: 'collapse',
		icon: 'heroicons-outline:bookmark',
		translate: 'EMPLOYEE_MANAGEMENT',
		children: [
			{
				id: 'salesManagement.orders',
				title: 'AI Recommendation',
				type: 'item',
				icon: 'heroicons-outline:light-bulb',
				url: '/web/orders'
			},
			{
				id: 'salesManagement.orderDetails1',
				title: 'HR Decision',
				type: 'item',
				icon: 'heroicons-outline:document-report',
				url: 'web/role-selection'
			},
			{
				id: 'salesManagement.orderDetails',
				title: 'Suggestions view & Manage',
				type: 'item',
				icon: 'heroicons-outline:document-report',
				url: '/suggestions/details'
			}
		]
	}
];

export default navigationConfig;
