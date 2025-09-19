import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';
import { Icon } from '@mui/material';

// Define types for API response and state
interface BusinessSummary {
	orderCount: number;
	totalBoatmanCost: number;
	totalGuideCost: number;
	totalSalesAmount: number;
	groupCodeCount: number;
	date: string;
}

interface User {
	id: number;
	name: string;
	email: string;
	phone: string;
	avatar: string;
}

interface WeatherData {
	main: {
		temp: number;
	};
	weather: {
		main: string;
		description: string;
		icon: string;
	}[];
	name: string;
}

const mockUsers: User[] = [
	{
		id: 1,
		name: 'John Doe',
		email: 'john.doe@example.com',
		phone: '123-456-7890',
		avatar: 'https://i.pravatar.cc/150?img=1'
	},
	{
		id: 2,
		name: 'Jane Smith',
		email: 'jane.smith@example.com',
		phone: '098-765-4321',
		avatar: 'https://i.pravatar.cc/150?img=2'
	},
	{
		id: 3,
		name: 'Sam Wilson',
		email: 'sam.wilson@example.com',
		phone: '555-555-5555',
		avatar: 'https://i.pravatar.cc/150?img=3'
	}
];

function StatCard({ icon, label, value, color }) {
	return (
		<motion.div
			className="p-6 rounded-lg shadow-md flex items-center space-x-4 bg-white"
			variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
		>
			<div className={`rounded-full p-3 ${color}`}>
				<Icon className="text-white">{icon}</Icon>
			</div>
			<div>
				<p className="text-gray-500 text-sm font-medium">{label}</p>
				<p className="text-2xl font-bold text-gray-800">{value}</p>
			</div>
		</motion.div>
	);
}

/**
 * The HomeTab component.
 */
function HomeTab() {
	const [summary, setSummary] = useState<BusinessSummary | null>(null);
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [dateTime, setDateTime] = useState(new Date());
	const [users] = useState<User[]>(mockUsers);
	const [loading, setLoading] = useState(true);

	const container = {
		show: {
			transition: {
				staggerChildren: 0.06
			}
		}
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	useEffect(() => {
		const fetchAllData = async () => {
			setLoading(true);
			try {
				await Promise.all([fetchSummary(), fetchWeather()]);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchAllData();

		const timer = setInterval(() => setDateTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const fetchSummary = async () => {
		// This is a placeholder. Replace with your actual API call.
		const mockSummary: BusinessSummary = {
			orderCount: 125,
			totalBoatmanCost: 15000,
			totalGuideCost: 8500,
			totalSalesAmount: 250000,
			groupCodeCount: 34,
			date: new Date().toISOString()
		};
		setSummary(mockSummary);
	};

	const fetchWeather = async () => {
		try {
			// ** IMPORTANT: Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key **
			const response = await axios.get(
				`https://api.openweathermap.org/data/2.5/weather?q=Galle&appid=YOUR_API_KEY&units=metric`
			);
			setWeather(response.data);
		} catch (error) {
			console.error(
				'Could not fetch weather data. Please replace YOUR_API_KEY with a valid one from openweathermap.org'
			);
			// Silently fail for weather if API key is not set
		}
	};

	const formattedDate = format(dateTime, 'eeee, MMMM do, yyyy');
	const formattedTime = format(dateTime, 'h:mm:ss a');

	if (loading && !summary) {
		return (
			<div className="flex justify-center items-center h-full">
				<p>Loading Dashboard...</p>
			</div>
		);
	}

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
						<p className="text-gray-500 mt-1">{formattedDate}</p>
					</div>
					<div className="flex items-center mt-4 md:mt-0 bg-white p-3 rounded-lg shadow-sm">
						<div className="text-right mr-4">
							<p className="text-2xl font-bold text-gray-800">{formattedTime}</p>
							<p className="text-gray-500 text-sm">Galle, Sri Lanka</p>
						</div>
						{weather && (
							<div className="flex items-center">
								<img
									src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
									alt={weather.weather[0].description}
									className="w-10 h-10"
								/>
								<div>
									<p className="text-xl font-semibold">{Math.round(weather.main.temp)}°C</p>
									<p className="text-xs text-gray-500 capitalize">{weather.weather[0].description}</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</motion.div>

			{/* <motion.div */}
			{/*	className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8" */}
			{/*	variants={container} */}
			{/*	initial="hidden" */}
			{/*	animate="show" */}
			{/* > */}
			{/*	<StatCard */}
			{/*		icon="shopping_cart" */}
			{/*		label="Total Orders" */}
			{/*		value={summary?.orderCount ?? 'N/A'} */}
			{/*		color="bg-blue-500" */}
			{/*	/> */}
			{/*	<StatCard */}
			{/*		icon="attach_money" */}
			{/*		label="Total Sales" */}
			{/*		value={`$${(summary?.totalSalesAmount ?? 0).toLocaleString()}`} */}
			{/*		color="bg-green-500" */}
			{/*	/> */}
			{/*	<StatCard */}
			{/*		icon="directions_boat" */}
			{/*		label="Boatman Costs" */}
			{/*		value={`$${(summary?.totalBoatmanCost ?? 0).toLocaleString()}`} */}
			{/*		color="bg-yellow-500" */}
			{/*	/> */}
			{/*	<StatCard */}
			{/*		icon="person" */}
			{/*		label="Guide Costs" */}
			{/*		value={`$${(summary?.totalGuideCost ?? 0).toLocaleString()}`} */}
			{/*		color="bg-purple-500" */}
			{/*	/> */}
			{/*	<StatCard */}
			{/*		icon="group" */}
			{/*		label="Group Codes" */}
			{/*		value={summary?.groupCodeCount ?? 'N/A'} */}
			{/*		color="bg-red-500" */}
			{/*	/> */}
			{/* </motion.div> */}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<motion.div
					className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md"
					variants={item}
				>
					<h2 className="text-xl font-bold text-gray-800 mb-4">Recent User Activity</h2>
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b">
									<th className="p-3">User</th>
									<th className="p-3">Email</th>
									<th className="p-3">Contact</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr
										key={user.id}
										className="border-b hover:bg-gray-50"
									>
										<td className="p-3 flex items-center">
											<img
												src={user.avatar}
												alt={user.name}
												className="w-8 h-8 rounded-full mr-3"
											/>
											<span className="font-medium">{user.name}</span>
										</td>
										<td className="p-3 text-gray-600">{user.email}</td>
										<td className="p-3 text-gray-600">{user.phone}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</motion.div>

				<motion.div
					className="bg-white p-6 rounded-lg shadow-md"
					variants={item}
				>
					<h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
					<ul>
						<li className="flex items-start mb-4">
							<div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
								<Icon>info</Icon>
							</div>
							<div>
								<p className="font-semibold">New System Update</p>
								<p className="text-sm text-gray-500">Version 2.5.1 is now available.</p>
							</div>
						</li>
						<li className="flex items-start mb-4">
							<div className="bg-yellow-100 text-yellow-600 p-2 rounded-full mr-3">
								<Icon>warning</Icon>
							</div>
							<div>
								<p className="font-semibold">Server Maintenance</p>
								<p className="text-sm text-gray-500">Scheduled for tonight at 11:00 PM.</p>
							</div>
						</li>
						<li className="flex items-start">
							<div className="bg-green-100 text-green-600 p-2 rounded-full mr-3">
								<Icon>check_circle</Icon>
							</div>
							<div>
								<p className="font-semibold">Backups Completed</p>
								<p className="text-sm text-gray-500">All databases were successfully backed up.</p>
							</div>
						</li>
					</ul>
				</motion.div>
			</div>
		</div>
	);
}

export default HomeTab;
