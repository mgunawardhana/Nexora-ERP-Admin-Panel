import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	BarController,
	Title,
	Tooltip,
	Legend,
	ChartData,
	ChartOptions
} from 'chart.js';
import { fetchStatusByRoleForAnalytics } from '../../../axios/services/mega-city-services/common/CommonService';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

interface EmployeeRoleData {
	[employmentStatus: string]: { [role: string]: number };
}

interface ChartComponentProps {
	data: EmployeeRoleData;
	title?: string;
}

function GroupedBarChart({ data, title = 'Role Distribution by Employment Status' }: ChartComponentProps) {
	const chartRef = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<ChartJS | null>(null);

	useEffect(() => {
		if (chartRef.current && data) {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
			}

			const ctx = chartRef.current.getContext('2d');

			if (!ctx) return;

			// Extract unique roles and employment statuses
			const employmentStatuses = Object.keys(data);
			const roles = [...new Set(Object.values(data).flatMap((status) => Object.keys(status)))];
			const colors = [
				'rgba(255, 99, 132, 0.6)',
				'rgba(54, 162, 235, 0.6)',
				'rgba(255, 206, 86, 0.6)',
				'rgba(75, 192, 192, 0.6)',
				'rgba(153, 102, 255, 0.6)'
			];

			// Create datasets for each role
			const datasets = roles.map((role, index) => ({
				label: role.replace(/_/g, ' '), // Format role names (e.g., HR_MANAGER -> HR Manager)
				data: employmentStatuses.map((status) => data[status][role] || 0),
				backgroundColor: colors[index % colors.length],
				borderColor: colors[index % colors.length].replace('0.6', '1'),
				borderWidth: 1
			}));

			const chartData: ChartData<'bar'> = {
				labels: employmentStatuses.map((status) => status.replace(/_/g, ' ')), // Format status names
				datasets
			};

			const options: ChartOptions<'bar'> = {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: title,
						font: { size: 16, weight: 'bold' }
					},
					legend: {
						display: true,
						position: 'top'
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Employment Status'
						}
					},
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Number of Employees'
						}
					}
				}
			};

			chartInstanceRef.current = new ChartJS(ctx, {
				type: 'bar',
				data: chartData,
				options
			});
		}

		return () => {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
			}
		};
	}, [data, title]);

	return (
		<Box sx={{ position: 'relative', height: '400px', width: '100%' }}>
			<canvas ref={chartRef} />
		</Box>
	);
}

function StatusWiseRoleAnalyticsDashboardApp() {
	const [employeeData, setEmployeeData] = useState<EmployeeRoleData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await fetchStatusByRoleForAnalytics();
				console.log('API Response:', response);

				if (response && typeof response === 'object') {
					setEmployeeData(response);
				}
			} catch (error) {
				console.error('Error fetching employee data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Box sx={{ p: 3 }}>
			<Grid
				container
				spacing={3}
			>
				<Grid
					item
					xs={12}
				>
					<Paper
						elevation={1}
						sx={{ p: 2 }}
					>
						<Typography
							variant="h6"
							gutterBottom
						>
							Employee Role Distribution by Employment Status
						</Typography>
						{employeeData ? (
							<GroupedBarChart
								data={employeeData}
								title="Employee Roles by Employment Status"
							/>
						) : (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									height: '400px'
								}}
							>
								<Typography
									variant="body1"
									color="text.secondary"
								>
									No employee data available
								</Typography>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
}

export default StatusWiseRoleAnalyticsDashboardApp;
