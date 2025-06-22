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
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import LockResetIcon from '@mui/icons-material/LockReset';
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

interface ProductOrder {
	groupCode: string;
	orderCode: number;
	productId: string;
	productName: string;
	quantity: number;
	guideName: string;
	guideAmount: number;
	boatmanName: string;
	boatmanCost: number;
	price: number;
	discountPercentage: number;
	discountAmount: number;
	date: string;
	time: string;
}

interface Order {
	groupCode: string;
	orderCount: number;
	orders: {
		orderCode: number;
		selectedProducts: { productId: string; productName: string; quantity: number }[];
		guide: { name: string; percentage: number; amount: number };
		forBoatman: { name: string; percentage: number; costAmount: number }[];
		price: number;
		company: { percentage: number; amount: number };
		discount: { percentage: number; amount: number };
		gift: number;
		itemWiseTotal: number;
		categoryCode: string;
		exotic: number;
		less: number;
	}[];
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
	guideName: string;
	boatmanName: string;
}

interface ApiResponse {
	success: boolean;
	message?: string;
	data?: Order[];
	pagination?: {
		currentPage?: number;
		totalPages?: number;
		totalOrders?: number;
		ordersPerPage?: number;
		hasNextPage?: boolean;
		hasPrevPage?: boolean;
		nextPage?: number | null;
		prevPage?: number | null;
	};
}

function BookingType() {
	const { t } = useTranslation('shippingTypes');
	const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
	// Fixed: Start with page 0 for zero-based indexing used by MaterialTableWrapper
	const [pageNo, setPageNo] = useState<number>(0);
	// Fixed: Set default pageSize to 15 as required
	const [pageSize, setPageSize] = useState<number>(15);
	const [pagination, setPagination] = useState<Pagination>({
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		ordersPerPage: 15, // Fixed: Default to 15
		hasNextPage: false,
		hasPrevPage: false,
		nextPage: null,
		prevPage: null
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [itemToDelete, setItemToDelete] = useState<ProductOrder | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchLoading, setSearchLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [currentFilters, setCurrentFilters] = useState<Partial<FilterFormValues>>({});

	// Fetch on mount
	useEffect(() => {
		fetchOrdersData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Fetch on pageNo or pageSize change
	useEffect(() => {
		fetchOrdersData(currentFilters);
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

				// Fixed: Pass pageNo + 1 for 1-based backend pagination, and use pageSize directly
				const response = (await fetchOrders(
					pageNo + 1, // Convert to 1-based for backend
					pageSize, // Use current pageSize
					cleanFilters.startDate || '',
					cleanFilters.endDate || '',
					cleanFilters.groupCode || '',
					cleanFilters.guideName || '', // Fixed: Use guideName instead of demonstratorName
					cleanFilters.boatmanName || ''
				)) as ApiResponse;

				if (response && response.success) {
					const ordersData: Order[] = response.data ?? [];
					const flattenedProductOrders = ordersData.flatMap((order) =>
						order.orders.flatMap((subOrder) =>
							subOrder.selectedProducts.map((product) => ({
								groupCode: order.groupCode,
								orderCode: subOrder.orderCode,
								productId: product.productId,
								productName: product.productName,
								quantity: product.quantity,
								guideName: subOrder.guide?.name || 'N/A',
								guideAmount: subOrder.guide?.amount || 0,
								boatmanName: subOrder.forBoatman[0]?.name || 'N/A',
								boatmanCost: subOrder.forBoatman[0]?.costAmount || 0,
								price: subOrder.price,
								discountPercentage: subOrder.discount.percentage,
								discountAmount: subOrder.discount.amount,
								date: order.date,
								time: order.time
							}))
						)
					);
					setProductOrders(flattenedProductOrders);

					// Fixed: Better pagination handling with proper defaults
					const paginationData = response.pagination ?? {};
					const totalOrders = paginationData.totalOrders ?? flattenedProductOrders.length;
					const currentPage = paginationData.currentPage ?? pageNo + 1;
					const totalPages = paginationData.totalPages ?? Math.ceil(totalOrders / pageSize);
					const ordersPerPage = paginationData.ordersPerPage ?? pageSize;

					setPagination({
						currentPage,
						totalPages: Math.max(totalPages, 1), // Ensure at least 1 page
						totalOrders,
						ordersPerPage,
						hasNextPage: paginationData.hasNextPage ?? currentPage < totalPages,
						hasPrevPage: paginationData.hasPrevPage ?? currentPage > 1,
						nextPage: paginationData.nextPage ?? (currentPage < totalPages ? currentPage + 1 : null),
						prevPage: paginationData.prevPage ?? (currentPage > 1 ? currentPage - 1 : null)
					});

					setCurrentFilters(cleanFilters);
				} else {
					const errorMessage = response?.message ?? t('errorFetchingData');
					throw new Error(errorMessage);
				}
			} catch (error) {
				console.error('Error fetching orders:', error);
				const errorMessage = error instanceof Error ? error.message : t('errorFetchingData');
				setError(errorMessage);
				toast.error(errorMessage);
				setProductOrders([]);

				// Fixed: Reset pagination with proper defaults
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalOrders: 0,
					ordersPerPage: pageSize, // Use current pageSize
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

	const confirmDelete = async (): Promise<void> => {
		if (itemToDelete) {
			try {
				// await deleteOrder(itemToDelete.orderCode, itemToDelete.productId);
				setProductOrders(
					productOrders.filter(
						(item) => !(item.orderCode === itemToDelete.orderCode && item.productId === itemToDelete.productId)
					)
				);
				setDeleteDialogOpen(false);
				setItemToDelete(null);
				toast.success('Product order removed');
				await fetchOrdersData(currentFilters);
			} catch (error) {
				console.error('Error deleting order:', error);
				toast.error(t('Error deleting order'));
			}
		}
	};

	// Fixed: Proper page change handling
	const handlePageChange = (newPage: number) => {
		setPageNo(newPage); // MaterialTableWrapper uses 0-based indexing
	};

	// Fixed: Proper page size change handling
	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPageNo(0); // Reset to first page when changing page size
	};

	const validationSchema = yup.object().shape({
		startDate: yup.string().required(t('Start date is required')),
		endDate: yup.string().required(t('End date is required')),
		groupCode: yup.string(),
		guideName: yup.string(),
		boatmanName: yup.string()
	});

	const handleFilterSubmit = async (values: FilterFormValues) => {
		setSearchLoading(true);
		try {
			setPageNo(0); // Reset to first page when filtering
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
		setPageNo(0); // Reset to first page when resetting filters
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

	const tableColumns = [
		{ title: t('Group Code'), field: 'groupCode', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Order Code'), field: 'orderCode', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Product ID'), field: 'productId', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Product Name'), field: 'productName', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Quantity'), field: 'quantity', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{
			title: t('Total Per Order'),
			field: 'price',
			render: (rowData: ProductOrder) => `LKR ${rowData.price.toFixed(2)}`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Discount'),
			field: 'discountPercentage',
			render: (rowData: ProductOrder) => `${rowData.discountPercentage}%`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Discount Amount'),
			field: 'discountAmount',
			render: (rowData: ProductOrder) => `LKR ${rowData.discountAmount.toFixed(2)}`,
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		}
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
							guideName: '',
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
										<FieldLabel>{t('Guide Name')}</FieldLabel>
										<Field
											name="guideName"
											component={TextFormField}
											fullWidth
											size="small"
											placeholder={t('Enter guide name')}
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
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'row',
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
						records={productOrders || []}
						sx={{
							bgcolor: '#fff',
							borderRadius: '8px',
							boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
						}}
						actions={[
							{
								icon: 'delete',
								tooltip: t('Delete Order'),
								onClick: (event: any, rowData: ProductOrder) => {
									setItemToDelete(rowData);
									setDeleteDialogOpen(true);
								}
							}
						]}
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
						{t('Are you sure you want to delete this product order?')}
						{itemToDelete && (
							<>
								<br />
								<strong>Group Code: {itemToDelete.groupCode}</strong>
								<br />
								<strong>Order Code: {itemToDelete.orderCode}</strong>
								<br />
								<strong>Product ID: {itemToDelete.productId}</strong>
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