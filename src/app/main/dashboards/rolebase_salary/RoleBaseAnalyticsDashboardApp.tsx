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
import { fetchRoleByOfficeLocationsForAnalytics } from '../../../axios/services/mega-city-services/common/CommonService';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

interface EmployeeRoleData {
	[officeLocation: string]: { [role: string]: number };
}

interface ChartComponentProps {
	data: EmployeeRoleData;
	title?: string;
}

function StackedBarChart({ data, title = 'Role Distribution by Office Location' }: ChartComponentProps) {
	const chartRef = useRef<HTMLCanvasElement | null>(null);
	const chartInstance = useRef<ChartJS | null>(null);

	useEffect(() => {
		if (chartRef.current && data) {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}

			const ctx = chartRef.current.getContext('2d');

			if (!ctx) return;

			// Extract unique roles and office locations
			const officeLocations = Object.keys(data);
			const roles = [...new Set(Object.values(data).flatMap((loc) => Object.keys(loc)))];
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
				data: officeLocations.map((location) => data[location][role] || 0),
				backgroundColor: colors[index % colors.length],
				borderColor: colors[index % colors.length].replace('0.6', '1'),
				borderWidth: 1
			}));

			const chartData: ChartData<'bar'> = {
				labels: officeLocations.map((loc) => loc.replace(/_/g, ' ')), // Format location names
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
						stacked: true,
						title: {
							display: true,
							text: 'Office Location'
						}
					},
					y: {
						stacked: true,
						beginAtZero: true,
						title: {
							display: true,
							text: 'Number of Employees'
						}
					}
				}
			};

			chartInstance.current = new ChartJS(ctx, {
				type: 'bar',
				data: chartData,
				options
			});
		}

		// eslint-disable-next-line consistent-return
		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
		};
	}, [data, title]);

	return (
		<Box sx={{ position: 'relative', height: '400px', width: '100%' }}>
			<canvas ref={chartRef} />
		</Box>
	);
}

function RoleBaseAnalyticsDashboardApp() {
	const [employeeData, setEmployeeData] = useState<EmployeeRoleData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await fetchRoleByOfficeLocationsForAnalytics();
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
							Employee Role Distribution
						</Typography>
						{employeeData ? (
							<StackedBarChart
								data={employeeData}
								title="Employee Roles by Office Location"
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

export default RoleBaseAnalyticsDashboardApp;
