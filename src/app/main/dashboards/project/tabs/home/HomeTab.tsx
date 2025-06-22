import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SummaryWidget from './widgets/SummaryWidget';
import OverdueWidget from './widgets/OverdueWidget';
import IssuesWidget from './widgets/IssuesWidget';
import FeaturesWidget from './widgets/FeaturesWidget';
import { businessSummery } from '../../../../../axios/services/mega-city-services/common/CommonService';

// Add types for API response and state
interface BusinessSummary {
	orderCount: number;
	totalBoatmanCost: number;
	totalGuideCost: number;
	totalSalesAmount: number;
	groupCodeCount: number;
	date: string;
}

interface ApiResponse {
	success: boolean;
	message: string;
	data: BusinessSummary;
}

/**
 * The HomeTab component.
 */
function HomeTab() {
	const [value, setValue] = useState<BusinessSummary | undefined>();

	const container = {
		show: {
			transition: {
				staggerChildren: 0.04,
			},
		},
	};
	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	useEffect(() => {
		fetchSummery();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSummery = async () => {
		try {
			const response = (await businessSummery()) as ApiResponse;
			if (response.success) {
				setValue(response.data);
				console.log('groupCodeCount', response.data.groupCodeCount); // Log after setting state
			} else {
				toast.error(response.message || 'Failed to fetch summary');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An error occurred';
			toast.error(errorMessage);
		}
	};

	return (
		<motion.div
			className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-24 w-full min-w-0 p-24"
			variants={container}
			initial="hidden"
			animate="show"
		>
			<motion.div variants={item}>
				<SummaryWidget value={value?.groupCodeCount ?? 0} />
			</motion.div>
			<motion.div variants={item}>
				<OverdueWidget value={value?.totalBoatmanCost ?? 0} />
			</motion.div>
			<motion.div variants={item}>
				<IssuesWidget value={value?.totalGuideCost ?? 0} />
			</motion.div>
			<motion.div variants={item}>
				<FeaturesWidget value={value?.totalSalesAmount ?? 0} />
			</motion.div>
		</motion.div>
	);
}

export default HomeTab;