import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Icon, Card, CardContent, Typography, Avatar, Box, Chip } from '@mui/material';
import {
	fetchAllSuggestions
} from '../../../../../axios/services/mega-city-services/user-management-service/UserService';

// --- TYPES ---
interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	contactNumber: string;
	avatar: string; // Keep avatar for users who might have one
	role: string;
	status: 'Active' | 'Banned' | 'Pending';
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

// --- Helper function to generate a consistent color from a string ---
const stringToColor = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	let color = '#';
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xFF;
		color += `00${value.toString(16)}`.slice(-2);
	}
	return color;
};


// --- UserCard Component ---
function UserCard({ user }: { user: User }) {
	const getStatusChipColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'success';
			case 'banned':
				return 'error';
			case 'pending':
				return 'warning';
			default:
				return 'default';
		}
	};

	const avatarContent = (
		<Avatar
			sx={{
				width: 80,
				height: 80,
				mb: 2,
				bgcolor: stringToColor(`${user.firstName} ${user.lastName}`),
				color: 'white',
				fontSize: '2rem'
			}}
		>
			{user.firstName ? user.firstName[0].toUpperCase() : ''}
		</Avatar>
	);

	return (
		<Card
			component={motion.div}
			variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
			className="shadow-md hover:shadow-xl transition-shadow duration-300"
		>
			<CardContent className="flex flex-col items-center text-center p-6">
				{avatarContent}
				<Typography
					variant="h6"
					className="font-bold"
				>
					{`${user.firstName} ${user.lastName}`}
				</Typography>
				<Typography
					color="text.secondary"
					className="mb-2"
				>
					{user.role}
				</Typography>

				<Box className="flex items-center text-gray-600 my-1">
					<Icon
						fontSize="small"
						className="mr-2"
					>
						email
					</Icon>
					<Typography variant="body2">{user.email}</Typography>
				</Box>
				<Box className="flex items-center text-gray-600 mb-4">
					<Icon
						fontSize="small"
						className="mr-2"
					>
						phone
					</Icon>
					<Typography variant="body2">{user.contactNumber}</Typography>
				</Box>

				<Chip
					label={user.status}
					color={getStatusChipColor(user.status)}
					size="small"
				/>
			</CardContent>
		</Card>
	);
}

/**
 * The HomeTab component.
 */
function HomeTab() {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [dateTime, setDateTime] = useState(new Date());
	const [users, setUsers] = useState<User[]>([]);
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
				await Promise.all([fetchUsers()]);
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

	const fetchUsers = async () => {
		try {
			const response = await fetchAllSuggestions();
			console.log(response);

			if (response && response.result && Array.isArray(response.result.content)) {
				setUsers(response.result.content);
			}

		} catch (error) {
			console.error('Failed to fetch users:', error);
			toast.error('Could not fetch user data. Please check the console for more details.');
		}
	};

	const formattedDate = format(dateTime, 'eeee, MMMM do, yyyy');
	const formattedTime = format(dateTime, 'h:mm:ss a');

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full p-10">
				<Typography>Loading Dashboard...</Typography>
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

			{/* Users Section - Now takes full width */}
			<motion.div
				variants={item}
			>
				<h2 className="text-xl font-bold text-gray-800 mb-4">Users</h2>
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
					variants={container}
					initial="hidden"
					animate="show"
				>
					{users.map((user) => (
						<UserCard
							key={user.id}
							user={user}
						/>
					))}
				</motion.div>
			</motion.div>
		</div>
	);
}

export default HomeTab;