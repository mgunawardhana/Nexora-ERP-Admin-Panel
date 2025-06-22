import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import {
	fetchAllProducts,
	updateReceivedStocks
} from '../../../../../axios/services/mega-city-services/common/CommonService';

export interface ReceivedProduct {
	_id: string;
	category: string; // e.g., "BEVERAGE"
	createdAt: string; // ISO date string
	createdBy: string;
	qty: number;
	receivedProductID: string;
	receivedProductName: string;
	remark: string;
	updatedAt: string; // ISO date string
	__v: number;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: ReceivedProduct | null;
	fetchAllGuidelines: () => void;
	isTableMode: 'view' | 'edit' | 'new';
}

interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalProducts: number;
	size: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface Product {
	itemCode: string;
	category: string;
	itemName: string;
	price: number;
}

interface ApiResponse {
	products: Product[];
	pagination: PaginationInfo;
}

interface VehicleType {
	receivedProductID: string;
	receivedProductName: string;
	remark: string;
	date: string;
	category: string;
	price: number;
	qty: number; // Added qty to VehicleType
}

const NewVehicleManagement: React.FC<Props> = ({
	isOpen,
	toggleModal,
	clickedRowData,
	fetchAllGuidelines,
	isTableMode
}) => {
	const { t } = useTranslation('shippingTypes');
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const [products, setProducts] = useState<Product[]>([]);

	console.log('clickedRowData clickedRowData', clickedRowData);

	// Get current date in YYYY-MM-DD format
	const getCurrentDate = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const schema = yup.object().shape({
		receivedProductID: yup.string().required(t('Related Product ID is required')),
		receivedProductName: yup.string().required(t('Item Name is required')),
		remark: yup.string().required(t('Remark is required')),
		date: yup.string().required(t('Date is required')),
		qty: yup
			.number()
			.required(t('Quantity is required'))
			.min(0, t('Quantity must be non-negative'))
			.integer(t('Quantity must be an integer')), // Added qty validation
		price: yup.number().required(t('Price is required')).min(0, t('Price must be non-negative')) // Added price validation
	});

	useEffect(() => {
		fetchAllProductsFromBackend();
	}, []);

	const fetchAllProductsFromBackend = async () => {
		try {
			const response: ApiResponse = await fetchAllProducts(0, 100);
			setProducts(response.products);
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	};

	const handleUpdateShippingType = async (values: VehicleType) => {
		const data: VehicleType = {
			receivedProductID: values.receivedProductID,
			receivedProductName: values.receivedProductName,
			remark: values.remark,
			date: values.date,
			category: values.category,
			price: values.price,
			qty: values.qty // Include qty in the payload
		};

		setDataLoading(true);

		try {
			if (clickedRowData?._id) {
				await updateReceivedStocks(clickedRowData._id, data);
				toggleModal();
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				fetchAllGuidelines();
				toast.success('Received Stocks updated successfully');
			} else {
				// Handle create case - you'll need to implement handleCreateShippingTypeAPI
				// await handleCreateShippingTypeAPI(data);
				toast.success('Vehicle created successfully');
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setDataLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			maxWidth="xl"
			onClose={toggleModal}
			PaperProps={{ style: { top: '40px', margin: 0, position: 'absolute' } }}
		>
			<DialogTitle>
				<Typography
					variant="h6"
					color="textSecondary"
					fontWeight={400}
				>
					{t('Received Stock Management')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					enableReinitialize
					initialValues={{
						receivedProductID: clickedRowData?.receivedProductID || '',
						receivedProductName: clickedRowData?.receivedProductName || '',
						remark: clickedRowData?.remark || '',
						date: getCurrentDate(),
						category: clickedRowData?.category || '',
						qty: clickedRowData?.qty || 0,
						price: clickedRowData?.price || 0
					}}
					onSubmit={handleUpdateShippingType}
					validationSchema={schema}
				>
					{({ errors, touched }) => (
						<Form>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>{t('Related Product ID')}</Typography>
									<Field
										disabled
										name="receivedProductID"
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Category Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="category"
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Item Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="receivedProductName"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.receivedProductName && Boolean(errors.receivedProductName)}
										helperText={touched.receivedProductName && errors.receivedProductName}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Date')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled
										name="date"
										component={TextFormField}
										fullWidth
										size="small"
										type="date"
										error={touched.date && Boolean(errors.date)}
										helperText={touched.date && errors.date}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Remark')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="remark"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.remark && Boolean(errors.remark)}
										helperText={touched.remark && errors.remark}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Qty')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="qty"
										component={TextFormField}
										fullWidth
										size="small"
										type="number"
										error={touched.qty && Boolean(errors.qty)}
										helperText={touched.qty && errors.qty}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Price')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="price"
										component={TextFormField}
										fullWidth
										size="small"
										type="number"
										error={touched.price && Boolean(errors.price)}
										helperText={touched.price && errors.price}
									/>
								</Grid>
								<Grid
									item
									lg={12}
									className="flex justify-end gap-2"
								>
									<Button
										type="submit"
										variant="contained"
										disabled={isTableMode === 'view' || isDataLoading}
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-medium py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
									>
										{t('Save')}
										{isDataLoading && (
											<CircularProgress
												size={24}
												className="ml-2"
											/>
										)}
									</Button>
									<Button
										variant="contained"
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
										onClick={toggleModal}
									>
										{t('Cancel')}
									</Button>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default NewVehicleManagement;
