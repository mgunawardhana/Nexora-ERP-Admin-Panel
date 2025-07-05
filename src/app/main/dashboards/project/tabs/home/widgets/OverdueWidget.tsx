import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useGetProjectDashboardWidgetsQuery } from '../../../ProjectDashboardApi';
import { WidgetDataType } from './types/WidgetDataType'; // Adjusted import to use named import

/**
 * The OverdueWidget component.
 */
interface OverdueWidgetProps {
	value?: number; // Define the expected type for the value prop
}

function OverdueWidget({ value = 0 }: OverdueWidgetProps) {
	console.log('OverdueWidget value:', value);

	const { data: widgets, isLoading } = useGetProjectDashboardWidgetsQuery();
	const widget = widgets?.overdue as WidgetDataType | undefined;

	if (isLoading) {
		return <FuseLoading />;
	}

	if (!widget) {
		return null;
	}

	const { title, data } = widget;

	return (
		<Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden">
			<div className="flex items-center justify-between px-8 pt-12">
				<Typography
					className="px-16 text-lg font-medium tracking-tight leading-6 truncate"
					color="text.secondary"
				>
					{/*Total Boatman Amount*/}
				</Typography>
				<IconButton aria-label="more" size="large">
					<FuseSvgIcon>heroicons-outline:dots-vertical</FuseSvgIcon>
				</IconButton>
			</div>
			<div className="text-center mt-8">
				<Typography
					className="text-3xl sm:text-3xl font-bold tracking-tight leading-none text-blue-600"
				>
					{value.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
				</Typography>
				<Typography className="text-lg font-medium text-red-600">
				</Typography>
			</div>
			<Typography
				className="flex items-baseline justify-center w-full mt-20 mb-24"
				color="text.secondary"
			>
			</Typography>
		</Paper>
	);
}

export default memo(OverdueWidget);