import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Grid,
	Paper,
	styled,
	Typography,
	CircularProgress,
	TextField,
	IconButton,
	Modal
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import TextFormDateField from '../../../../common/FormComponents/TextFormDateField';
import TextFormField from '../../../../common/FormComponents/FormTextField';

// Styled component for the main paper container
const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	borderRadius: '8px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
	marginBottom: theme.spacing(3),
	backgroundColor: '#fff'
}));

// Styled component for the filter section
const FilterSection = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2)
}));

// Styled component for form field labels
const FieldLabel = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	fontWeight: 500,
	color: theme.palette.text.primary,
	'& .text-red': {
		color: theme.palette.error.main
	}
}));

// Interface for a single order
export interface Order {
	_id?: string;
	orderCode: string;
	selectedProducts: { productId: string; productName: string; quantity: number }[];
	selectedDemonstrator: { name: string; demonstratorId: string; demonstratorAmount: number }[];
	forBoatman: { name: string; percentage: number; costAmount: number }[];
	guide: {
		name: string;
		percentage: number;
		amount: number;
	};
	price: number;
	company: {
		percentage: number;
		amount: number;
	};
	discount: {
		percentage: number;
		amount: number;
	};
	gift: number;
	itemWiseTotal: number;
	categoryCode: string;
	exotic: number;
	less: number;
}

// Interface for a group of orders
export interface OrderGroup {
	_id?: string;
	groupCode: string;
	orderCount: number;
	orders: Order[];
	date: string;
	time: string;
}

// Interface for pagination data
interface Pagination {
	currentPage: number;
	totalPages: number;
	totalOrders: number;
	ordersPerPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	nextPage: number | null;
	prevPage: number | null;
}

// Interface for filter form values
interface FilterFormValues {
	startDate: string;
	endDate: string;
	groupCode: string;
	demonstratorName: string;
	boatmanName: string;
}

// More Compact OrderUpdate Component with Less Amount Management
function OrderUpdate({ isOpen, toggleModal, clickedRowData, refetchData, isTableMode }) {
	const { t } = useTranslation('shippingTypes');

	// State for custom percentages
	const [customDiscountPercentage, setCustomDiscountPercentage] = useState(0);
	const [customBoatmanPercentage, setCustomBoatmanPercentage] = useState(0);
	const [customGuidePercentage, setCustomGuidePercentage] = useState(0);
	const [customCompanyPercentage, setCustomCompanyPercentage] = useState(0);

	// State for less amount management
	const [isLessAmountEnabled, setIsLessAmountEnabled] = useState(false);
	const [lessFromBoatman, setLessFromBoatman] = useState(0);
	const [lessFromGuide, setLessFromGuide] = useState(0);

	// State for gift value management
	const [isGiftValueEnabled, setIsGiftValueEnabled] = useState(false);
	const [giftFromBoatman, setGiftFromBoatman] = useState(0);
	const [giftFromGuide, setGiftFromGuide] = useState(0);

	// useEffect to populate the form with existing data when the modal opens
	useEffect(() => {
		if (clickedRowData && clickedRowData.orders && clickedRowData.orders.length > 0) {
			const firstOrder = clickedRowData.orders[0];

			// Set initial percentages from the first order of the group
			setCustomDiscountPercentage(firstOrder.discount?.percentage || 0);
			setCustomCompanyPercentage(firstOrder.company?.percentage || 0);
			setCustomGuidePercentage(firstOrder.guide?.percentage || 0);
			setCustomBoatmanPercentage(firstOrder.forBoatman?.[0]?.percentage || 0);

			// Check if there's a 'less' amount in the original data to enable the checkbox
			const totalLess = clickedRowData.orders.reduce((sum, order) => sum + (order.less || 0), 0);

			if (totalLess > 0) {
				setIsLessAmountEnabled(true);
				// The split of the 'less' amount is not specified in the data,
				// so we leave it to the user to input the breakdown.
			}

			const totalGift = clickedRowData.orders.reduce((sum, order) => sum + (order.gift || 0), 0);

			if (totalGift > 0) {
				setIsGiftValueEnabled(true);
				// The split of the 'gift' amount is not specified in the data,
				// so we leave it to the user to input the breakdown.
			}
		}
	}, [clickedRowData]);

	// Calculate gross total (before discount)
	const itemWiseTotal = clickedRowData.orders.reduce((sum, order) => sum + order.itemWiseTotal, 0);

	// Calculate net total (after discount), which is the base for commissions
	const totalPrice = clickedRowData.orders.reduce((sum, order) => sum + order.price, 0);

	// --- CORRECTED CALCULATIONS ---

	// All calculations are now based on the price
	const calculatedDiscountAmount = (totalPrice * customDiscountPercentage) / 100;
	const calculatedCompanyAmount = (totalPrice * customCompanyPercentage) / 100;
	const calculatedBoatmanAmount =
		(totalPrice * customBoatmanPercentage) / 100 -
		(isLessAmountEnabled ? lessFromBoatman : 0) -
		(isGiftValueEnabled ? giftFromBoatman : 0);
	const calculatedGuideAmount =
		(totalPrice * customGuidePercentage) / 100 -
		(isLessAmountEnabled ? lessFromGuide : 0) -
		(isGiftValueEnabled ? giftFromGuide : 0);

	const handleUpdate = async () => {
		if (!clickedRowData?.groupCode) {
			toast.error('Error: Group code is missing. Cannot update.');
			return;
		}

		// Use the same consistent calculations for the final update payload
		const finalDiscountAmount = (totalPrice * customDiscountPercentage) / 100;
		const finalCompanyAmount = (totalPrice * customCompanyPercentage) / 100;
		const finalGuideAmount =
			(totalPrice * customGuidePercentage) / 100 -
			(isLessAmountEnabled ? lessFromGuide : 0) -
			(isGiftValueEnabled ? giftFromGuide : 0);

		// Prepare data for backend (only raw inputs)
		const data = {
			customDiscountPercentage,
			customCompanyPercentage,
			customGuidePercentage,
			customBoatmanPercentage,
			lessFromGuide: isLessAmountEnabled ? lessFromGuide : 0,
			lessFromBoatman: isLessAmountEnabled ? lessFromBoatman : 0,
			giftFromGuide: isGiftValueEnabled ? giftFromGuide : 0,
			giftFromBoatman: isGiftValueEnabled ? giftFromBoatman : 0
		};

		console.log('Updating order with payload:', { groupCode: clickedRowData.groupCode, ...data });

		try {
			// 1. Update the sale details in the database
			await updateSaleByOwnerRequest(clickedRowData.groupCode, data);
			toast.success('Order updated successfully!');

			// 2. Send WhatsApp notification after successful update
			// ⚠️ IMPORTANT: Replace with the actual recipient's number
			const WHATSAPP_RECIPIENT_NUMBER = '+94777369330';
			const lessAmountDetails = isLessAmountEnabled
				? `\n--- *Less Amount Details* ---\n*From Guide:* LKR ${lessFromGuide.toFixed(
						2
					)}\n*From Boatman:* LKR ${lessFromBoatman.toFixed(2)}`
				: '';
			const giftAmountDetails = isGiftValueEnabled
				? `\n--- *Gift Amount Details* ---\n*From Guide:* LKR ${giftFromGuide.toFixed(
						2
					)}\n*From Boatman:* LKR ${giftFromBoatman.toFixed(2)}`
				: '';
			const boatmanName = clickedRowData.orders[0]?.forBoatman[0]?.name || 'N/A';

			const message = `
*Sale Update Notification* 📣

A sale has been updated by ${localStorage.getItem('username')}.

*Group Code:* ${clickedRowData.groupCode}
*Total Amount (Net):* LKR ${totalPrice.toFixed(2)}
*Updated On:* ${new Date().toLocaleString()}

--- *Updated Values* ---
*Discount:* ${customDiscountPercentage}% (LKR ${finalDiscountAmount.toFixed(2)})
*Company:* ${customCompanyPercentage}% (LKR ${finalCompanyAmount.toFixed(2)})
*Guide:* ${customGuidePercentage}%  -> *Final Amount: LKR ${finalGuideAmount.toFixed(2)}*
*Boatman Name:* ${boatmanName}
${lessAmountDetails}
${giftAmountDetails}
`;

			try {
				const response = await fetch('https://wasenderapi.com/api/send-message', {
					method: 'POST',
					headers: {
						Authorization: 'Bearer 49ab96cb4a56b35311b75b33b9d822f0ae4d94b1442b3831574ad7689425216f',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						to: WHATSAPP_RECIPIENT_NUMBER,
						text: message
					})
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to send notification via API');
				}

				toast.info("Update notification sent to Business owner's WhatsApp.");
			} catch (notificationError) {
				console.error('Failed to send WhatsApp notification:', notificationError);
				toast.warn('Order updated, but the WhatsApp notification failed to send.');
			}

			// 3. Refresh data and close the modal
			refetchData();
			toggleModal();
		} catch (e) {
			console.error('Failed to update order:', e);
			toast.error('An error occurred while updating the order.');
		}
	};

	const renderCalculationField = (label, value, onChange, calculatedValue, calculatedLabelPrefix) => (
		<Grid
			item
			xs={12}
			sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}
		>
			<TextField
				label={t(label)}
				type="number"
				variant="outlined"
				size="small"
				value={value}
				onChange={onChange}
				disabled={isTableMode === 'view'}
				sx={{ flex: 1 }}
				InputProps={{
					inputProps: {
						min: 0
					}
				}}
			/>
			<Typography
				variant="body2"
				sx={{
					minWidth: '220px',
					fontWeight: 500,
					border: '1px solid #ccc',
					p: '8px',
					borderRadius: '4px',
					backgroundColor: '#f5f5f5',
					textAlign: 'center'
				}}
			>
				{`${t(calculatedLabelPrefix)}: LKR ${calculatedValue.toFixed(2)}`}
			</Typography>
		</Grid>
	);

	return (
		<Modal
			open={isOpen}
			onClose={toggleModal}
		>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 700,
					bgcolor: 'background.paper',
					boxShadow: 24,
					p: 3,
					borderRadius: '8px'
				}}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2
					}}
				>
					<Typography
						variant="h6"
						component="h2"
					>
						{isTableMode === 'edit' ? t('Edit Order') : t('View Order')}
					</Typography>
					<IconButton
						onClick={toggleModal}
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</Box>

				<Box
					sx={{
						border: '1px solid #ddd',
						p: 2,
						borderRadius: '4px',
						mb: 2,
						backgroundColor: '#fafafa'
					}}
				>
					<Typography
						variant="h6"
						sx={{ fontWeight: 'bold' }}
					>
						{`Group Code: ${clickedRowData.groupCode}`}
					</Typography>
					<Typography variant="body1">{`Item Wise Total (Gross): LKR ${itemWiseTotal.toFixed(
						2
					)}`}</Typography>
					<Typography
						variant="body1"
						color="primary"
						sx={{ fontWeight: '500' }}
					>
						{`Net Total (for commissions): LKR ${totalPrice.toFixed(2)}`}
					</Typography>
				</Box>

				<Grid
					container
					spacing={1}
				>
					{renderCalculationField(
						'Custom Discount Percentage',
						customDiscountPercentage,
						(e) => setCustomDiscountPercentage(parseFloat(e.target.value) || 0),
						calculatedDiscountAmount,
						'Calculated Discount'
					)}
					{renderCalculationField(
						'Custom Company Percentage',
						customCompanyPercentage,
						(e) => setCustomCompanyPercentage(parseFloat(e.target.value) || 0),
						calculatedCompanyAmount,
						'Calculated Company Amount'
					)}
					{renderCalculationField(
						'Custom Guide Percentage',
						customGuidePercentage,
						(e) => setCustomGuidePercentage(parseFloat(e.target.value) || 0),
						calculatedGuideAmount,
						'Final Guide Amount'
					)}
					{renderCalculationField(
						'Custom Boatman Percentage',
						customBoatmanPercentage,
						(e) => setCustomBoatmanPercentage(parseFloat(e.target.value) || 0),
						calculatedBoatmanAmount,
						'Final Boatman Amount'
					)}
				</Grid>

				{/* Less Amount Management Section */}
				<Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={isLessAmountEnabled}
								onChange={(e) => setIsLessAmountEnabled(e.target.checked)}
								name="lessAmountManagement"
								color="primary"
								disabled={isTableMode === 'view'}
							/>
						}
						label={t('Less Amount Management')}
					/>
					{isLessAmountEnabled && (
						<Grid
							container
							spacing={2}
							sx={{ mt: 1 }}
						>
							<Grid
								item
								xs={6}
							>
								<TextField
									label={t('Less from Guide')}
									type="number"
									variant="outlined"
									size="small"
									fullWidth
									value={lessFromGuide}
									onChange={(e) => setLessFromGuide(parseFloat(e.target.value) || 0)}
									disabled={isTableMode === 'view'}
									InputProps={{
										inputProps: {
											min: 0
										}
									}}
								/>
							</Grid>
							<Grid
								item
								xs={6}
							>
								<TextField
									label={t('Less from Boatman')}
									type="number"
									variant="outlined"
									size="small"
									fullWidth
									value={lessFromBoatman}
									onChange={(e) => setLessFromBoatman(parseFloat(e.target.value) || 0)}
									disabled={isTableMode === 'view'}
									InputProps={{
										inputProps: {
											min: 0
										}
									}}
								/>
							</Grid>
						</Grid>
					)}
				</Box>

				{/* Gift Value Management Section */}
				<Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={isGiftValueEnabled}
								onChange={(e) => setIsGiftValueEnabled(e.target.checked)}
								name="giftValueManagement"
								color="primary"
								disabled={isTableMode === 'view'}
							/>
						}
						label={t('Gift Value Management')}
					/>
					{isGiftValueEnabled && (
						<Grid
							container
							spacing={2}
							sx={{ mt: 1 }}
						>
							<Grid
								item
								xs={6}
							>
								<TextField
									label={t('Gift from Guide')}
									type="number"
									variant="outlined"
									size="small"
									fullWidth
									value={giftFromGuide}
									onChange={(e) => setGiftFromGuide(parseFloat(e.target.value) || 0)}
									disabled={isTableMode === 'view'}
									InputProps={{
										inputProps: {
											min: 0
										}
									}}
								/>
							</Grid>
							<Grid
								item
								xs={6}
							>
								<TextField
									label={t('Gift from Boatman')}
									type="number"
									variant="outlined"
									size="small"
									fullWidth
									value={giftFromBoatman}
									onChange={(e) => setGiftFromBoatman(parseFloat(e.target.value) || 0)}
									disabled={isTableMode === 'view'}
									InputProps={{
										inputProps: {
											min: 0
										}
									}}
								/>
							</Grid>
						</Grid>
					)}
				</Box>

				{isTableMode === 'edit' && (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							mt: 2
						}}
					>
						<Button
							className="min-w-[120px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-green-600 hover:bg-green-800"
							type="button"
							variant="contained"
							onClick={handleUpdate}
						>
							{t('Update')}
						</Button>
					</Box>
				)}
			</Box>
		</Modal>
	);
}

function BookingType() {
	const { t } = useTranslation('shippingTypes');
	const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [pagination, setPagination] = useState<Pagination>({
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		ordersPerPage: 5,
		hasNextPage: false,
		hasPrevPage: false,
		nextPage: null,
		prevPage: null
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [itemToDelete, setItemToDelete] = useState<OrderGroup | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchLoading, setSearchLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [currentFilters, setCurrentFilters] = useState<Partial<FilterFormValues>>({});

	// State for the OrderUpdate modal
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
	const [selectedOrderGroup, setSelectedOrderGroup] = useState<OrderGroup | null>(null);
	const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit'); // New state for modal mode

	useEffect(() => {
		fetchAllSuggestions();
	}, []);

	useEffect(() => {
		if (orderGroups.length > 0 || Object.keys(currentFilters).length > 0) {
			fetchAllSuggestions(currentFilters);
		}
	}, [pageNo, pageSize]);

	// Fetches order data from the API based on pagination and filters
	const fetchAllSuggestions = useCallback(
		async (filters?: Partial<FilterFormValues>): Promise<void> => {
			setLoading(true);
			setError('');

			try {
				// Clean filters to remove empty values
				const cleanFilters = filters
					? Object.fromEntries(
							Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
						)
					: {};

				const response = await fetchAllSuggestions(
					pageNo + 1, // Convert 0-based to 1-based for backend
					pageSize,
					cleanFilters.startDate || '',
					cleanFilters.endDate || '',
					cleanFilters.groupCode || '',
					cleanFilters.demonstratorName || '',
					cleanFilters.boatmanName || ''
				);

				if (response && response.success) {
					const groups = response.data || [];
					setOrderGroups(groups);

					// Setup pagination data from response
					const paginationData = response.pagination || {};
					const totalOrders = paginationData.totalOrders || 0;
					const totalPages = paginationData.totalPages || Math.ceil(totalOrders / pageSize) || 1;
					const currentPage = paginationData.currentPage || pageNo + 1;

					setPagination({
						currentPage,
						totalPages,
						totalOrders,
						ordersPerPage: paginationData.ordersPerPage || pageSize,
						hasNextPage: paginationData.hasNextPage || currentPage < totalPages,
						hasPrevPage: paginationData.hasPrevPage || currentPage > 1,
						nextPage: paginationData.nextPage || (currentPage < totalPages ? currentPage + 1 : null),
						prevPage: paginationData.prevPage || (currentPage > 1 ? currentPage - 1 : null)
					});

					setCurrentFilters(cleanFilters);
				} else {
					const errorMessage = response?.message || t('errorFetchingData');
					throw new Error(errorMessage);
				}
			} catch (error) {
				console.error('Error fetching orders:', error);
				const errorMessage = error instanceof Error ? error.message : t('errorFetchingData');
				setError(errorMessage);
				toast.error(errorMessage);
				setOrderGroups([]);

				// Reset pagination on error
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalOrders: 0,
					ordersPerPage: pageSize,
					hasNextPage: false,
					hasPrevPage: false,
					nextPage: null,
					prevPage: null
				});
			} finally {
				setLoading(false);
			}
		},
		[pageNo, pageSize, t]
	);

	// Confirms deletion of an order group
	const confirmDelete = (): void => {
		if (itemToDelete) {
			setOrderGroups(orderGroups.filter((item) => item.groupCode !== itemToDelete.groupCode));
			setDeleteDialogOpen(false);
			setItemToDelete(null);
			toast.success('Order group removed');
			fetchAllSuggestions();
		}
	};

	// Handles page change from the table
	const handlePageChange = (newPage: number) => {
		const totalPages = pagination?.totalPages || 1;

		if (newPage >= 0 && newPage < totalPages) {
			setPageNo(newPage);
		}
	};

	// Handles page size change from the table
	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPageNo(0); // Reset to first page
	};

	// Validation schema for the filter form
	const validationSchema = yup.object().shape({
		startDate: yup.string().required(t('Start date is required')),
		endDate: yup.string().required(t('End date is required')),
		groupCode: yup.string(),
		demonstratorName: yup.string(),
		boatmanName: yup.string()
	});

	// Submits the filter form
	const handleFilterSubmit = async (values: FilterFormValues) => {
		setSearchLoading(true);
		try {
			setPageNo(0); // Reset to first page when applying filters
			const cleanFilters = Object.fromEntries(
				Object.entries(values).filter(([_, value]) => value && value.trim() !== '')
			);
			await fetchAllSuggestions(cleanFilters);
			toast.success(t('Filters applied successfully'));
		} catch (error) {
			console.error('Error applying filters:', error);
			toast.error(t('Error applying filters'));
		} finally {
			setSearchLoading(false);
		}
	};

	// Resets the filter form and fetches all data
	const handleResetFilter = async (resetForm: () => void) => {
		resetForm();
		setSearchLoading(true);
		setPageNo(0); // Reset to first page
		setCurrentFilters({});
		try {
			await fetchAllSuggestions({});
			toast.success(t('Filters reset successfully'));
		} catch (error) {
			console.error('Error resetting filters:', error);
			toast.error(t('Error resetting filters'));
		} finally {
			setSearchLoading(false);
		}
	};

	const handleNotify = async () => {
		if (orderGroups.length === 0) {
			toast.error(t('No orders to notify'));
			return;
		}

		setSearchLoading(true);
		try {
			const currentDateTime = new Date().toLocaleString();
			const message = orderGroups
				.map((group) => {
					const totalGuideAmount = group.orders.reduce((sum, order) => sum + (order.guide?.amount || 0), 0);
					const totalPrice = group.orders.reduce((sum, order) => sum + (order.price || 0), 0);
					return (
						`Group Code: ${group.groupCode}\n` +
						`Order Count: ${group.orderCount}\n` +
						`Guide Name: ${group.orders[0]?.guide?.name || 'N/A'}\n` +
						`Guide Percentage: ${group.orders
							.map((order) => order.guide?.percentage?.toFixed(2) || '0.00')
							.join(', ')}%\n` +
						`Guide Amount: LKR ${totalGuideAmount.toFixed(2)}\n` +
						`Boatman Name: ${group.orders[0]?.forBoatman[0]?.name || 'N/A'}\n` +
						`Total: LKR ${totalPrice.toFixed(2)}\n` +
						`Date: ${group.date}\n` +
						`Time: ${group.time}\n`
					);
				})
				.join('\n---\n');

			const fullMessage = `Automated Update Notification: Filtered Orders on ${currentDateTime}\n\n${message}`;

			// Replace with a valid WhatsApp number
			const recipientNumber = '+94777369330'; // ✅ Must be a valid number

			// Double check message is not empty
			if (!fullMessage.trim()) {
				throw new Error('Generated message is empty');
			}

			const response = await fetch('https://wasenderapi.com/api/send-message', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer 49ab96cb4a56b35311b75b33b9d822f0ae4d94b1442b3831574ad7689425216f',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					to: recipientNumber,
					text: fullMessage
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to send notification');
			}

			toast.success(t("Notification sent to the Business owner's WhatsApp"));
		} catch (error) {
			console.error('Error sending notification:', error);
			toast.error(t('Error sending notification'));
		} finally {
			setSearchLoading(false);
		}
	};

	/**
	 * This function is triggered when the user clicks the 'edit' icon on a table row.
	 * It opens the OrderUpdate modal with the data for the selected row in 'edit' mode.
	 */
	const handleEdit = (rowData: OrderGroup) => {
		console.log('Editing Order Group:', rowData);
		setModalMode('edit');
		setSelectedOrderGroup(rowData);
		setIsUpdateModalOpen(true);
	};

	/**
	 * This function is triggered when the user clicks the 'view' icon on a table row.
	 * It opens the OrderUpdate modal with the data for the selected row in 'view' mode.
	 */
	const handleView = (rowData: OrderGroup) => {
		console.log('Viewing Order Group:', rowData);
		setModalMode('view');
		setSelectedOrderGroup(rowData);
		setIsUpdateModalOpen(true);
	};

	// Defines columns for the material table
	const tableColumns = [
		{ title: t('Grp Code'), field: 'groupCode', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{
			title: t('Order Count'),
			field: 'orderCount',
			cellStyle: { textAlign: 'center', paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('G Name'),
			field: 'orders[0].guide.name',
			render: (rowData: OrderGroup) => rowData.orders[0]?.guide?.name || 'N/A',
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('G Percentage'),
			field: 'orders.guide.percentage',
			render: (rowData: OrderGroup) =>
				`${rowData.orders.map((order) => order.guide?.percentage?.toFixed(2) || '0.00').join(', ')}%`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('G Amount'),
			field: 'orders.guide.amount',
			render: (rowData: OrderGroup) => {
				const totalGuideAmount = rowData.orders.reduce((sum, order) => sum + (order.guide?.amount || 0), 0);
				return `LKR ${totalGuideAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Boatman'),
			field: 'orders[0].forBoatman',
			render: (rowData: OrderGroup) => rowData.orders[0]?.forBoatman[0]?.name || 'N/A',
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('B Percentage'),
			field: 'orders.forBoatman.percentage',
			render: (rowData: OrderGroup) =>
				`${rowData.orders.map((order) => order.forBoatman[0]?.percentage?.toFixed(2) || '0.00').join(', ')}%`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('B Amount'),
			field: 'orders.forBoatman.costAmount',
			render: (rowData: OrderGroup) => {
				const totalBoatmanAmount = rowData.orders.reduce(
					(sum, order) => sum + (order.forBoatman[0]?.costAmount || 0),
					0
				);
				return `LKR ${totalBoatmanAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Company Percentage'),
			field: 'orders.company.percentage',
			render: (rowData: OrderGroup) =>
				`${rowData.orders.map((order) => order.company?.percentage?.toFixed(2) || '0.00').join(', ')}%`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Company Amount'),
			field: 'orders.company.amount',
			render: (rowData: OrderGroup) => {
				const totalCompanyAmount = rowData.orders.reduce((sum, order) => sum + (order.company?.amount || 0), 0);
				return `LKR ${totalCompanyAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Discount Percentage'),
			field: 'orders.discount.percentage',
			render: (rowData: OrderGroup) =>
				`${rowData.orders.map((order) => order.discount?.percentage?.toFixed(2) || '0.00').join(', ')}%`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Less Amount'),
			field: 'orders.less',
			render: (rowData: OrderGroup) => {
				const totalLessAmount = rowData.orders.reduce((sum, order) => sum + (order.less || 0), 0);
				return `LKR ${totalLessAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Gift Amount'),
			field: 'orders.gift',
			render: (rowData: OrderGroup) => {
				const totalGiftAmount = rowData.orders.reduce((sum, order) => sum + (order.gift || 0), 0);
				return `LKR ${totalGiftAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Discount Amount'),
			field: 'orders.discount.amount',
			render: (rowData: OrderGroup) => {
				const totalDiscountAmount = rowData.orders.reduce(
					(sum, order) => sum + (order.discount?.amount || 0),
					0
				);
				return `LKR ${totalDiscountAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Total'),
			field: 'orders.price',
			render: (rowData: OrderGroup) =>
				rowData.orders.map((order) => `LKR ${order.price?.toFixed(2) || '0.00'}`).join(', '),
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{ title: t('Date'), field: 'date', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Time'), field: 'time', cellStyle: { paddingTop: 16, paddingBottom: 16 } }
	];

	// Renders an error message with a retry button if an error occurs
	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography
					color="error"
					variant="h6"
				>
					{error}
				</Typography>
				<Button
					onClick={() => {
						setError('');
						fetchAllSuggestions(currentFilters);
					}}
					variant="contained"
					sx={{ mt: 2 }}
				>
					Retry
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<StyledPaper>
				<FilterSection>
					<Typography
						variant="h6"
						sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<SearchIcon /> {t('Search Filters')}
					</Typography>

					<Formik
						initialValues={{
							startDate: '',
							endDate: '',
							groupCode: '',
							demonstratorName: '',
							boatmanName: ''
						}}
						validationSchema={validationSchema}
						onSubmit={handleFilterSubmit}
					>
						{({ isSubmitting, resetForm }) => (
							<Form>
								<Grid
									container
									spacing={3}
									alignItems="flex-end"
								>
									<Grid
										item
										xs={12}
										sm={6}
										md={4}
										lg={3}
									>
										<FieldLabel>
											{t('Start Date')}
											<span className="text-red"> *</span>
										</FieldLabel>
										<TextFormDateField
											name="startDate"
											type="date"
											disabled={false}
											placeholder="Select start date"
											size="small"
											fullWidth
										/>
									</Grid>

									<Grid
										item
										xs={12}
										sm={6}
										md={4}
										lg={3}
									>
										<FieldLabel>
											{t('End Date')}
											<span className="text-red"> *</span>
										</FieldLabel>
										<TextFormDateField
											name="endDate"
											type="date"
											disabled={false}
											placeholder="Select end date"
											size="small"
											fullWidth
										/>
									</Grid>

									<Grid
										item
										xs={12}
										sm={6}
										md={4}
										lg={3}
									>
										<FieldLabel>{t('Group Code')}</FieldLabel>
										<Field
											name="groupCode"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter group code')}
										/>
									</Grid>

									<Grid
										item
										xs={12}
										sm={6}
										md={4}
										lg={3}
									>
										<FieldLabel>{t('Boatman Name')}</FieldLabel>
										<Field
											name="boatmanName"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter boatman name')}
										/>
									</Grid>

									<Grid
										item
										xs={12}
										sm={12}
										md={8}
										lg={6}
									>
										<Box
											sx={{
												display: 'flex',
												flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
												gap: 1,
												alignItems: 'flex-end'
											}}
										>
											<Button
												className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
												type="submit"
												variant="contained"
												disabled={isSubmitting || loading || searchLoading}
												startIcon={
													searchLoading ? (
														<CircularProgress
															size={16}
															color="inherit"
														/>
													) : (
														<SearchIcon />
													)
												}
												size="medium"
											>
												{searchLoading ? t('Searching...') : t('Search')}
											</Button>
											<Button
												className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-gray-500 hover:bg-gray-700"
												type="button"
												variant="contained"
												onClick={() => handleResetFilter(resetForm)}
												startIcon={<LockResetIcon />}
												disabled={isSubmitting || loading || searchLoading}
												size="medium"
											>
												{t('Reset')}
											</Button>
											<Button
												className="min-w-[120px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-green-600 hover:bg-green-800"
												type="button"
												variant="contained"
												onClick={handleNotify}
												disabled={isSubmitting || loading || searchLoading}
												startIcon={<WhatsAppIcon />}
												size="medium"
											>
												{t('Notify')}
											</Button>
										</Box>
									</Grid>
								</Grid>
							</Form>
						)}
					</Formik>
				</FilterSection>
			</StyledPaper>

			<Grid
				container
				spacing={0}
			>
				<Grid
					item
					xs={12}
				>
					<MaterialTableWrapper
						title={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BookmarkAddedIcon /> {t('Orders')}
								{Object.keys(currentFilters).length > 0 && (
									<Typography
										variant="caption"
										sx={{ color: 'primary.main', ml: 1 }}
									>
										({t('Filtered')})
									</Typography>
								)}
							</Box>
						}
						filterChanged={null}
						handleColumnFilter={null}
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						handleCommonSearchBar={null}
						pageSize={pageSize}
						disableColumnFiltering
						loading={loading}
						setPageSize={setPageSize}
						pageIndex={pageNo}
						searchByText=""
						count={pagination?.totalOrders || 0}
						exportToExcel={null}
						externalAdd={null}
						externalEdit={handleEdit} // This now opens the modal in 'edit' mode
						externalView={handleView} // This now opens the modal in 'view' mode
						selection={false}
						selectionExport={null}
						isColumnVisible
						records={orderGroups || []}
						tableRowEditHandler={handleEdit} // This also now opens the modal in 'edit' mode
						tableRowViewHandler={handleView} // This also now opens the modal in 'view' mode
						sx={{
							bgcolor: '#fff',
							borderRadius: '8px',
							boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
						}}
					/>
				</Grid>
			</Grid>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				aria-labelledby="order-dialog-title"
				aria-describedby="order-dialog-description"
			>
				<DialogTitle id="order-dialog-title">{t('Confirm Delete')}</DialogTitle>
				<DialogContent>
					<DialogContentText id="order-dialog-description">
						{t('Are you sure you want to delete this order group?')}
						{itemToDelete && (
							<>
								<br />
								<strong>{itemToDelete.groupCode}</strong> (Order Count: {itemToDelete.orderCount})
							</>
						)}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
					<Button
						onClick={confirmDelete}
						color="error"
						autoFocus
					>
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Render the OrderUpdate Popup when an order group is selected for editing or viewing */}
			{isUpdateModalOpen && selectedOrderGroup && (
				<OrderUpdate
					isOpen={isUpdateModalOpen}
					toggleModal={() => setIsUpdateModalOpen(false)}
					clickedRowData={selectedOrderGroup}
					refetchData={() => fetchAllSuggestions(currentFilters)}
					isTableMode={modalMode} // Pass the mode to the popup
				/>
			)}
		</Box>
	);
}

export default BookingType;
