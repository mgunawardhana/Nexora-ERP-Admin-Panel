import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Field, Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import FormDropdown from '../../../../../common/FormComponents/FormDropdown';
import {
	createReceivedStocks,
	fetchAllProducts
} from '../../../../../axios/services/mega-city-services/common/CommonService';

interface GuideType {
	receivedProductID: string;
	receivedProductName: string;
	remark: string;
	category: string;
	createdBy: string;
	qty: number;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: GuideType | null;
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

const useRelatedProductChange = (products: Product[]) => {
	const { setFieldValue } = useFormikContext<any>();

	const handleRelatedProductChange = (e: React.ChangeEvent<{ value: unknown }>) => {
		const selectedCode = e.target.value as string;
		const selectedProduct = products.find((p) => p.itemCode === selectedCode);
		setFieldValue('receivedProductID', selectedCode);
		setFieldValue('receivedProductName', selectedProduct?.itemName || '');
		setFieldValue('category', selectedProduct?.category || '');
		console.log('Selected product:', selectedProduct);
	};

	return handleRelatedProductChange;
};

const ReceivedEditModel: React.FC<Props> = ({
	isOpen,
	toggleModal,
	clickedRowData,
	isTableMode,
	fetchAllGuidelines
}) => {
	const { t } = useTranslation('shippingTypes');
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);

	// Updated validation schema to match the required payload
	const schema = yup.object().shape({
		receivedProductID: yup.string().required(t('Received Product ID is required')),
		receivedProductName: yup.string().required(t('Received Product Name is required')),
		remark: yup.string().required(t('Remark is required')),
		category: yup.string().required(t('Category is required')),
		createdBy: yup.string().required(t('Created By is required')),
		qty: yup.number().required(t('Quantity is required')).min(1, t('Quantity must be at least 1'))
	});

	useEffect(() => {
		fetchAllProductsFromBackend();
	}, []);

	const fetchAllProductsFromBackend = async () => {
		try {
			const response: ApiResponse = await fetchAllProducts(0, 100);
			console.log('Fetched products:', response.products);
			setProducts(response.products);
			setProductOptions(
				response.products.map((p) => ({
					label: p.itemCode,
					value: p.itemCode
				}))
			);
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error('Failed to fetch products');
		}
	};

	const handleSubmit = async (values: GuideType) => {
		console.log('handleSubmit called with values:', values);
		const data: GuideType = {
			receivedProductID: values.receivedProductID,
			receivedProductName: values.receivedProductName,
			remark: values.remark,
			category: values.category,
			createdBy: values.createdBy,
			qty: Number(values.qty)
		};

		try {
			setDataLoading(true);
			console.log('Submitting data:', data);

			if (clickedRowData?.receivedProductID) {
				// TODO: Implement update API call (e.g., handleUpdateGuidelineAPI)
				console.log('Update mode - API call needed');
				toast.success('Guideline updated successfully');
			} else {
				const response = await createReceivedStocks(data);
				fetchAllGuidelines();
				toggleModal();
				console.log('API response:', response);
				toast.success('Guideline created successfully');
			}


			console.log('Toggling modal');

		} catch (e: any) {
			console.error('Error saving guideline:', e.message, e.response?.data);
			toast.error(`Error while saving guideline: ${e.message}`);
		} finally {
			console.log('Finally block reached, setting isDataLoading to false');
			setDataLoading(false);
		}
	};

	function RelatedProductDropdown() {
		const handleRelatedProductChange = useRelatedProductChange(products);

		return (
			<FormDropdown
				disabled={isTableMode === 'view'}
				name="receivedProductID"
				optionsValues={productOptions}
				fullWidth
				size="small"
				onChange={handleRelatedProductChange}
			/>
		);
	}

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
					{t('Issued Stock model')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					enableReinitialize
					initialValues={{
						receivedProductID: clickedRowData?.receivedProductID || '',
						receivedProductName: clickedRowData?.receivedProductName || '',
						remark: clickedRowData?.remark || '',
						category: clickedRowData?.category || '',
						createdBy: clickedRowData?.createdBy || 'user456', // Default or from auth context
						qty: clickedRowData?.qty || 0
					}}
					onSubmit={handleSubmit}
					validationSchema={schema}
				>
					{({ errors, touched, isValid, dirty }) => {
						console.log('Form errors:', errors);
						console.log('Is form valid?', isValid);
						console.log('Is form dirty?', dirty);
						return (
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
										<Typography>
											{t('Received Product ID')} <span className="text-red-500">*</span>
										</Typography>
										<RelatedProductDropdown />
									</Grid>
									<Grid
										item
										lg={3}
										md={3}
										sm={6}
										xs={12}
									>
										<Typography>
											{t('Received Product Name')} <span className="text-red-500">*</span>
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
											{t('Category')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="category"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.category && Boolean(errors.category)}
											helperText={touched.category && errors.category}
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
											{t('Quantity')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="qty"
											type="number"
											component={TextFormField}
											fullWidth
											size="small"
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
											{t('Created By')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="createdBy"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.createdBy && Boolean(errors.createdBy)}
											helperText={touched.createdBy && errors.createdBy}
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
											disabled={isTableMode === 'view' || isDataLoading || !isValid || !dirty}
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
						);
					}}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default ReceivedEditModel;
