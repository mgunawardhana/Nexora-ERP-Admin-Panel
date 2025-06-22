import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Paper,
	styled,
	Typography,
	CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { fetchOrders } from '../../../../axios/services/mega-city-services/common/CommonService';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import TextFormDateField from '../../../../common/FormComponents/TextFormDateField';
import TextFormField from '../../../../common/FormComponents/FormTextField';

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	borderRadius: '8px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
	marginBottom: theme.spacing(3),
	backgroundColor: '#fff'
}));

const FilterSection = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2)
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	fontWeight: 500,
	color: theme.palette.text.primary,
	'& .text-red': {
		color: theme.palette.error.main
	}
}));

interface Order {
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

interface OrderGroup {
	groupCode: string;
	orderCount: number;
	orders: Order[];
	date: string;
	time: string;
}

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

interface FilterFormValues {
	startDate: string;
	endDate: string;
	groupCode: string;
	demonstratorName: string;
	boatmanName: string;
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

	useEffect(() => {
		fetchOrdersData();
	}, []);

	useEffect(() => {
		if (orderGroups.length > 0 || Object.keys(currentFilters).length > 0) {
			fetchOrdersData(currentFilters);
		}
	}, [pageNo, pageSize]);

	const fetchOrdersData = useCallback(
		async (filters?: Partial<FilterFormValues>): Promise<void> => {
			setLoading(true);
			setError('');

			try {
				const cleanFilters = filters
					? Object.fromEntries(
						Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
					)
					: {};

				const response = await fetchOrders(
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

					const paginationData = response.pagination || {};
					const totalOrders = paginationData.totalOrders || 0;
					const totalPages = paginationData.totalPages || Math.ceil(totalOrders / pageSize) || 1;
					const currentPage = paginationData.currentPage || (pageNo + 1);

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

	const confirmDelete = (): void => {
		if (itemToDelete) {
			setOrderGroups(orderGroups.filter((item) => item.groupCode !== itemToDelete.groupCode));
			setDeleteDialogOpen(false);
			setItemToDelete(null);
			toast.success('Order group removed');
			fetchOrdersData(currentFilters);
		}
	};

	const handlePageChange = (newPage: number) => {
		const totalPages = pagination?.totalPages || 1;

		// newPage comes from MaterialTableWrapper as 0-based index
		if (newPage >= 0 && newPage < totalPages) {
			setPageNo(newPage);
		}
	};

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPageNo(0); // Reset to first page
	};

	const validationSchema = yup.object().shape({
		startDate: yup.string().required(t('Start date is required')),
		endDate: yup.string().required(t('End date is required')),
		groupCode: yup.string(),
		demonstratorName: yup.string(),
		boatmanName: yup.string()
	});

	const handleFilterSubmit = async (values: FilterFormValues) => {
		setSearchLoading(true);
		try {
			setPageNo(0); // Reset to first page when applying filters
			const cleanFilters = Object.fromEntries(
				Object.entries(values).filter(([_, value]) => value && value.trim() !== '')
			);
			await fetchOrdersData(cleanFilters);
			toast.success(t('Filters applied successfully'));
		} catch (error) {
			console.error('Error applying filters:', error);
			toast.error(t('Error applying filters'));
		} finally {
			setSearchLoading(false);
		}
	};

	const handleResetFilter = async (resetForm: () => void) => {
		resetForm();
		setSearchLoading(true);
		setPageNo(0); // Reset to first page
		setCurrentFilters({});
		try {
			await fetchOrdersData({});
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
				.map(group => {
					const totalGuideAmount = group.orders.reduce(
						(sum, order) => sum + (order.guide?.amount || 0),
						0
					);
					const totalBoatmanAmount = group.orders.reduce(
						(sum, order) => sum + (order.forBoatman[0]?.costAmount || 0),
						0
					);
					const totalPrice = group.orders.reduce(
						(sum, order) => sum + (order.price || 0),
						0
					);
					return `Group Code: ${group.groupCode}\n` +
						`Order Count: ${group.orderCount}\n` +
						`Guide Name: ${group.orders[0]?.guide?.name || 'N/A'}\n` +
						`Guide Percentage: ${group.orders.map(order => order.guide?.percentage?.toFixed(2) || '0.00').join(', ')}%\n` +
						`Guide Amount: LKR ${totalGuideAmount.toFixed(2)}\n` +
						`Boatman Name: ${group.orders[0]?.forBoatman[0]?.name || 'N/A'}\n` +
						`Boatman Percentage: ${group.orders.map(order => order.forBoatman[0]?.percentage?.toFixed(2) || '0.00').join(', ')}%\n` +
						`Boatman Amount: LKR ${totalBoatmanAmount.toFixed(2)}\n` +
						`Total: LKR ${totalPrice.toFixed(2)}\n` +
						`Date: ${group.date}\n` +
						`Time: ${group.time}\n`;
				})
				.join('\n---\n');

			const fullMessage = `Automated Update Notification: Filtered Orders on ${currentDateTime}\n\n${message}`;

			const response = await fetch('https://waapi.app/api/v1/instances/74838/client/action/send-message', {
				method: 'POST',
				headers: {
					'accept': 'application/json',
					'authorization': 'Bearer o8nhqC0NIFBMFSYNmBUljvOMkbO0CNWOH2wOcouc838854a5',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					chatId: '94719043372@c.us',
					message: fullMessage
				})
			});

			if (response.ok) {
				toast.success(t('Notification sent to the Business owners WhatsApp'));
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || t('Failed to send notification'));
			}
		} catch (error) {
			console.error('Error sending notification:', error);
			toast.error(t('Error sending notification'));
		} finally {
			setSearchLoading(false);
		}
	};

	const tableColumns = [
		{ title: t('Grp Code'), field: 'groupCode', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{
			title: t('Order Count'),
			field: 'orderCount',
			cellStyle: { textAlign: 'center', paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('G Name'),
			field: 'orders[0].guide.name',
			render: (rowData: OrderGroup) => rowData.orders[0]?.guide?.name || 'N/A',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('G Percentage'),
			field: 'orders.guide.percentage',
			render: (rowData: OrderGroup) =>
				rowData.orders
					.map((order) => order.guide?.percentage?.toFixed(2) || '0.00')
					.join(', ') + '%',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('G Amount'),
			field: 'orders.guide.amount',
			render: (rowData: OrderGroup) => {
				const totalGuideAmount = rowData.orders.reduce(
					(sum, order) => sum + (order.guide?.amount || 0),
					0
				);
				return `LKR ${totalGuideAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('Boatman'),
			field: 'orders[0].forBoatman',
			render: (rowData: OrderGroup) => rowData.orders[0]?.forBoatman[0]?.name || 'N/A',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('B Percentage'),
			field: 'orders.forBoatman.percentage',
			render: (rowData: OrderGroup) =>
				rowData.orders
					.map((order) => order.forBoatman[0]?.percentage?.toFixed(2) || '0.00')
					.join(', ') + '%',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
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
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('Company Percentage'),
			field: 'orders.company.percentage',
			render: (rowData: OrderGroup) =>
				rowData.orders
					.map((order) => order.company?.percentage?.toFixed(2) || '0.00')
					.join(', ') + '%',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('Company Amount'),
			field: 'orders.company.amount',
			render: (rowData: OrderGroup) => {
				const totalCompanyAmount = rowData.orders.reduce(
					(sum, order) => sum + (order.company?.amount || 0),
					0
				);
				return `LKR ${totalCompanyAmount.toFixed(2)}`;
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('Discount Percentage'),
			field: 'orders.discount.percentage',
			render: (rowData: OrderGroup) =>
				rowData.orders
					.map((order) => order.discount?.percentage?.toFixed(2) || '0.00')
					.join(', ') + '%',
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
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
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{
			title: t('Total'),
			field: 'orders.price',
			render: (rowData: OrderGroup) =>
				rowData.orders
					.map((order) => `LKR ${order.price?.toFixed(2) || '0.00'}`)
					.join(', '),
			cellStyle: { paddingTop: 16, paddingBottom: 16 },
		},
		{ title: t('Date'), field: 'date', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Time'), field: 'time', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
	];

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography color="error" variant="h6">
					{error}
				</Typography>
				<Button
					onClick={() => {
						setError('');
						fetchOrdersData(currentFilters);
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
					<Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
								<Grid container spacing={3} alignItems="flex-end">
									<Grid item xs={12} sm={6} md={4} lg={3}>
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

									<Grid item xs={12} sm={6} md={4} lg={3}>
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

									<Grid item xs={12} sm={6} md={4} lg={3}>
										<FieldLabel>{t('Group Code')}</FieldLabel>
										<Field
											name="groupCode"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter group code')}
										/>
									</Grid>

									<Grid item xs={12} sm={6} md={4} lg={3}>
										<FieldLabel>{t('Demonstrator Name')}</FieldLabel>
										<Field
											name="demonstratorName"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter demonstrator name')}
										/>
									</Grid>

									<Grid item xs={12} sm={6} md={4} lg={3}>
										<FieldLabel>{t('Boatman Name')}</FieldLabel>
										<Field
											name="boatmanName"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter boatman name')}
										/>
									</Grid>

									<Grid item xs={12} sm={6} md={4} lg={3}>
										<Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'flex-end' }}>
											<Button
												className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
												type="submit"
												variant="contained"
												disabled={isSubmitting || loading || searchLoading}
												startIcon={
													searchLoading ? (
														<CircularProgress size={16} color="inherit" />
													) : (
														<SearchIcon />
													)
												}
												size="medium"
												sx={{ minWidth: '100px' }}
											>
												{searchLoading ? t('Searching...') : t('Search')}
											</Button>
											<Button
												className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
												type="button"
												variant="outlined"
												onClick={() => handleResetFilter(resetForm)}
												startIcon={<LockResetIcon />}
												disabled={isSubmitting || loading || searchLoading}
												size="medium"
												sx={{ minWidth: '80px' }}
											>
												{t('Reset')}
											</Button>
											<Button
												className="min-w-[120px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-green-600 hover:bg-green-800/80"
												type="button"
												variant="outlined"
												onClick={handleNotify}
												disabled={isSubmitting || loading || searchLoading}
												startIcon={<WhatsAppIcon />}
												size="medium"
												sx={{ minWidth: '80px' }}
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

			<Grid container spacing={0}>
				<Grid item xs={12}>
					<MaterialTableWrapper
						title={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BookmarkAddedIcon /> {t('Orders')}
								{Object.keys(currentFilters).length > 0 && (
									<Typography variant="caption" sx={{ color: 'primary.main', ml: 1 }}>
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
						externalEdit={null}
						externalView={null}
						selection={false}
						selectionExport={null}
						isColumnVisible
						records={orderGroups || []}
						sx={{
							bgcolor: '#fff',
							borderRadius: '8px',
							boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
						}}
					/>
				</Grid>
			</Grid>

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
					<Button onClick={confirmDelete} color="error" autoFocus>
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default BookingType;