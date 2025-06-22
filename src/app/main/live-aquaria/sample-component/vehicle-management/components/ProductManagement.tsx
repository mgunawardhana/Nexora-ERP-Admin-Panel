import React, { useState, useEffect, useCallback } from 'react';
import {
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Typography,
	IconButton,
	LinearProgress
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import { saveProduct } from '../../../../../axios/services/mega-city-services/common/CommonService';
import TextFormDateField from '../../../../../common/FormComponents/TextFormDateField';
import FormDropdown from '../../../../../common/FormComponents/FormDropdown';
import { fetchAllCategoriesWithPagination } from '../../../../../axios/services/mega-city-services/category-services/Category';

// Interface Definitions
interface Image {
	id: number;
	link: string;
	file?: File;
	base64: string;
}

interface ProductData {
	id?: string;
	itemCode: string;
	itemName: string;
	price: string | number;
	brandName: string;
	categoryCode: string;
	category: string;
	description: string;
	isActive: boolean;
	updatedBy: string;
	manufacturerName: string;
	manufacturerCode: string;
	warrantyPeriod: string | number;
	warrantyDetails: string;
	warrantyClaimProcess: string;
	manufactureDate: string;
	expireDate: string;
	stocks: string | number;
	productImage?: string;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData?: ProductData;
	fetchAllProducts?: () => void;
	isTableMode?: 'view' | 'edit' | 'create';
}

interface ProductFormValues {
	id: string;
	itemCode: string;
	price: string;
	brandName: string;
	itemName: string;
	categoryCode: string;
	category: string;
	description: string;
	isActive: boolean;
	updatedBy: string;
	manufacturerName: string;
	manufacturerCode: string;
	warrantyPeriod: string;
	warrantyDetails: string;
	warrantyClaimProcess: string;
	manufactureDate: string;
	expireDate: string;
	stocks: string;
	productImage?: string;
}

interface CategoryOption {
	value: string;
	label: string;
	categoryId: string;
}

interface Category {
	categoryId: string;
	categoryName: string;
	reason: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	_id: string;
	__v: number;
	isActive?: boolean;
}

interface Pagination {
	currentPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	size: number;
	totalCategories: number;
	totalPages: number;
}

interface FetchResponse {
	categories: Category[];
	pagination: Pagination;
}

function ProductManagement({
	isOpen,
	toggleModal,
	clickedRowData = {} as ProductData,
	fetchAllProducts,
	isTableMode = 'create'
}: Props): JSX.Element {
	const { t } = useTranslation('products');
	const [images, setImages] = useState<Image[]>([]);
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const [isRefreshingItemCode, setIsRefreshingItemCode] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

	useEffect(() => {
		fetchCategories();
	}, []);

	async function fetchCategories(): Promise<void> {
		try {
			const response = (await fetchAllCategoriesWithPagination(1, 100)) as FetchResponse;
			const options = response.categories.map((category) => ({
				value: category.categoryName,
				label: category.categoryName,
				categoryId: category.categoryId
			}));
			setCategoryOptions(options);
		} catch (error) {
			console.error('Error fetching categories:', error);
			toast.error('Failed to load categories');
		}
	}

	useEffect(() => {
		if (isOpen) {
			if (clickedRowData?.productImage) {
				setImages([
					{
						id: Date.now(),
						link: clickedRowData.productImage,
						base64: clickedRowData.productImage
					}
				]);
			} else {
				setImages([]);
			}
		}
	}, [isOpen, clickedRowData?.productImage]);

	const generateItemCode = (): string => {
		const now = new Date();
		const yearLastDigits = now.getFullYear().toString().slice(-2);
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const date = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const time = `${hours}${minutes}`;
		const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
		return `PRODCODE-${yearLastDigits}-${month}-${date}-${time}-${randomDigits}`;
	};

	const handleRefreshItemCode = (setFieldValue: (field: string, value: unknown) => void): void => {
		if (isTableMode === 'view') return;

		setIsRefreshingItemCode(true);
		setProgress(0);

		const duration = 2000;
		const interval = 100;
		const steps = duration / interval;
		let currentStep = 0;

		const progressInterval = setInterval(() => {
			currentStep++;
			setProgress((currentStep / steps) * 100);

			if (currentStep >= steps) {
				clearInterval(progressInterval);
				setFieldValue('itemCode', generateItemCode());
				setIsRefreshingItemCode(false);
			}
		}, interval);
	};

	const handleCategoryChange = (
		categoryName: string,
		setFieldValue: (field: string, value: unknown) => void
	): void => {
		const selectedCategory = categoryOptions.find((option) => option.value === categoryName);

		if (selectedCategory) {
			setFieldValue('category', selectedCategory.value);
			setFieldValue('categoryCode', selectedCategory.categoryId);
		} else {
			setFieldValue('category', '');
			setFieldValue('categoryCode', '');
		}
	};

	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = (): void => resolve(reader.result as string);
			reader.onerror = (error): void => reject(error);
		});
	};

	const validateImageDimensions = (file: File): Promise<boolean> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = (): void => {
				resolve(file.size <= 20 * 1024 * 1024); // 20MB
			};
			img.onerror = (): void => {
				toast.error('Invalid image file');
				resolve(false);
			};
		});
	};

	const handleImageUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
			const { files } = event.target;

			if (!files || files.length === 0) return;

			if (images.length + files.length > 1) {
				toast.error(`You can only upload a maximum of 1 image.`);
				return;
			}

			try {
				const fileArray = Array.from(files);
				const newValidImages: Image[] = [];

				for (const file of fileArray) {
					const isValid = await validateImageDimensions(file);

					if (isValid) {
						const base64 = await convertToBase64(file);
						newValidImages.push({
							id: Date.now() + Math.random(),
							link: URL.createObjectURL(file),
							file,
							base64
						});
					} else {
						toast.error('Image upload failed: Size should be ≤ 20MB.');
					}
				}

				if (newValidImages.length > 0) {
					setImages(newValidImages);
				}
			} catch (error) {
				console.error('Error processing image upload:', error);
				toast.error('Error processing image upload');
			}

			event.target.value = '';
		},
		[images.length]
	);

	const handleRemoveImage = useCallback((id: number): void => {
		setImages((prevImages) => prevImages.filter((image) => image.id !== id));
	}, []);

	const schema = yup.object().shape({
		price: yup.string().required(t('Price is required')),
		itemName: yup.string().required('Item Name is required'),
		brandName: yup.string().required(t('Brand name is required')),
		categoryCode: yup.string().required(t('Category code is required')),
		category: yup.string().required(t('Category is required')),
		description: yup.string().required(t('Description is required')),
		manufacturerName: yup.string().required(t('Manufacturer name is required')),
		manufacturerCode: yup.string().required(t('Manufacturer code is required')),
		warrantyPeriod: yup.string().required(t('Warranty period is required')),
		warrantyDetails: yup.string().required(t('Warranty details is required')),
		warrantyClaimProcess: yup.string().required(t('Warranty claim process is required')),
		manufactureDate: yup.string().required(t('Manufacture date is required')),
		expireDate: yup.string().required(t('Expire date is required')),
		stocks: yup.string().required(t('Stocks is required'))
	});

	const handleSubmit = async (values: ProductFormValues): Promise<void> => {
		console.log('Save button clicked with values:', values);
		setDataLoading(true);
		try {
			const formData: ProductData = {
				id: values.id || undefined,
				itemName: values.itemName,
				itemCode: values.itemCode,
				price: values.price,
				brandName: values.brandName,
				categoryCode: values.categoryCode,
				category: values.category,
				description: values.description,
				isActive: values.isActive,
				updatedBy: values.updatedBy,
				manufacturerName: values.manufacturerName,
				manufacturerCode: values.manufacturerCode,
				warrantyPeriod: values.warrantyPeriod,
				warrantyDetails: values.warrantyDetails,
				warrantyClaimProcess: values.warrantyClaimProcess,
				manufactureDate: values.manufactureDate,
				expireDate: values.expireDate,
				stocks: values.stocks,
				productImage: images[0]?.base64 || ''
			};

			console.log('Submitting product data:', formData);

			if (formData.id) {
				// await handleUpdateProductAPI(formData);
				console.log('Product update API called');
				toast.success('Product updated successfully');
			} else {
				await saveProduct(formData);
				console.log('Product create API called');
				toast.success('Product created successfully');
			}

			toggleModal();

			if (fetchAllProducts) {
				fetchAllProducts();
			}
		} catch (error) {
			console.error('Error saving product:', error);
			toast.error('Error while saving product');
		} finally {
			setDataLoading(false);
		}
	};

	const initialValues: ProductFormValues = React.useMemo(
		() => ({
			id: clickedRowData?.id || '',
			itemCode: isTableMode === 'create' ? generateItemCode() : clickedRowData?.itemCode || '',
			itemName: clickedRowData?.itemName || '',
			price:
				typeof clickedRowData?.price === 'number'
					? clickedRowData.price.toString()
					: clickedRowData?.price || '',
			brandName: clickedRowData?.brandName || '',
			categoryCode: clickedRowData?.categoryCode || '',
			category: clickedRowData?.category || '',
			description: clickedRowData?.description || '',
			isActive: clickedRowData?.isActive ?? true,
			updatedBy: clickedRowData?.updatedBy || '',
			manufacturerName: clickedRowData?.manufacturerName || '',
			manufacturerCode: clickedRowData?.manufacturerCode || '',
			warrantyPeriod:
				typeof clickedRowData?.warrantyPeriod === 'number'
					? clickedRowData.warrantyPeriod.toString()
					: clickedRowData?.warrantyPeriod || '',
			warrantyDetails: clickedRowData?.warrantyDetails || '',
			warrantyClaimProcess: clickedRowData?.warrantyClaimProcess || '',
			manufactureDate: clickedRowData?.manufactureDate || '',
			expireDate: clickedRowData?.expireDate || '',
			stocks:
				typeof clickedRowData?.stocks === 'number'
					? clickedRowData.stocks.toString()
					: clickedRowData?.stocks || '',
			productImage: clickedRowData?.productImage || ''
		}),
		[clickedRowData, isTableMode]
	);

	return (
		<Dialog
			open={isOpen}
			maxWidth="xl"
			onClose={toggleModal}
			PaperProps={{ style: { top: '40px', margin: 0, position: 'absolute' } }}
		>
			<DialogTitle>
				<h6 className="text-gray-600 font-400">{t('Product Management')}</h6>
			</DialogTitle>
			<DialogContent>
				<Formik
					enableReinitialize
					initialValues={initialValues}
					onSubmit={handleSubmit}
					validationSchema={schema}
				>
					{({ setFieldValue, values }) => (
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
										{t('Item Code')}
										<span className="text-red"> *</span>
									</Typography>
									<div className="flex items-center">
										<Field
											name="itemCode"
											disabled
											component={TextFormField}
											fullWidth
											size="small"
										/>
										{isTableMode !== 'view' && (
											<IconButton
												size="small"
												className="ml-2"
												onClick={() => handleRefreshItemCode(setFieldValue)}
												disabled={isRefreshingItemCode}
											>
												<RefreshIcon fontSize="small" />
											</IconButton>
										)}
									</div>
									{isRefreshingItemCode && (
										<LinearProgress
											variant="determinate"
											value={progress}
											className="mt-1"
										/>
									)}
								</Grid>

								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Item Name')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="itemName"
										disabled={isTableMode === 'view'}
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
										{t('Price')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="price"
										type="number"
										disabled={isTableMode === 'view'}
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
										{t('Brand Name')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="brandName"
										disabled={isTableMode === 'view'}
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
										{t('Category')}
										<span className="text-red"> *</span>
									</Typography>
									<FormDropdown
										name="category"
										disabled={isTableMode === 'view'}
										optionsValues={categoryOptions}
										fullWidth
										size="small"
										onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
											handleCategoryChange(e.target.value as string, setFieldValue)
										}
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
										{t('Category Code')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="categoryCode"
										disabled
										component={TextFormField}
										fullWidth
										size="small"
										placeholder="Auto-populated from category selection"
									/>
								</Grid>

								<Grid
									item
									lg={6}
									md={6}
									sm={12}
									xs={12}
								>
									<Typography>
										{t('Description')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="description"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										multiline
										rows={3}
										size="small"
									/>
								</Grid>

								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
									className="flex items-center"
								>
									<Typography className="mr-3">{t('Is Active')}</Typography>
									<Checkbox
										color="primary"
										checked={values.isActive}
										disabled={isTableMode === 'view'}
										onChange={(event) => setFieldValue('isActive', event.target.checked)}
									/>
								</Grid>

								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>{t('Updated By')}</Typography>
									<Field
										name="updatedBy"
										disabled={isTableMode === 'view'}
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
										{t('Manufacturer Name')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="manufacturerName"
										disabled={isTableMode === 'view'}
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
										{t('Manufacturer Code')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="manufacturerCode"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>

								<Grid
									item
									lg={6}
									md={6}
									sm={12}
									xs={12}
								>
									<Typography>
										{t('Warranty Details')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="warrantyDetails"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										multiline
										rows={3}
										size="small"
									/>
								</Grid>

								<Grid
									item
									lg={6}
									md={6}
									sm={12}
									xs={12}
								>
									<Typography>
										{t('Warranty Claim Process')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="warrantyClaimProcess"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										multiline
										rows={3}
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
										{t('Manufacture Date')}
										<span className="text-red"> *</span>
									</Typography>
									<TextFormDateField
										name="manufactureDate"
										type="date"
										placeholder="Select manufacture date"
										size="small"
										disabled={isTableMode === 'view'}
										disablePastDate
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
										{t('Expire Date')}
										<span className="text-red"> *</span>
									</Typography>
									<TextFormDateField
										name="expireDate"
										type="date"
										disabled={isTableMode === 'view'}
										placeholder="Select expiry date"
										size="small"
										disablePastDate
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
										{t('Stocks')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="stocks"
										type="number"
										disabled={isTableMode === 'view'}
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
										{t('Warranty Period (Months)')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="warrantyPeriod"
										type="number"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>

								<Grid
									item
									md={6}
									xs={12}
								>
									<Typography className="text-[10px] sm:text-[12px] lg:text-[14px] font-600 mb-[5px]">
										{t('Upload Product Image')}
									</Typography>
									<div
										className="relative flex gap-[10px] overflow-x-auto"
										style={{ whiteSpace: 'nowrap' }}
									>
										{images.map((image) => (
											<div
												key={image.id}
												className="relative inline-block w-[550px] h-[240px] border-[2px] border-[#ccc] rounded-[10px] overflow-hidden"
											>
												<img
													src={image.base64}
													alt={`Product ${image.id}`}
													className="w-full h-full rounded-[10px] object-contain object-center"
												/>
												{isTableMode !== 'view' && (
													<IconButton
														size="small"
														className="absolute top-0 right-0 text-white p-[2px] rounded-full bg-black/5 hover:text-red"
														onClick={() => handleRemoveImage(image.id)}
													>
														<CancelIcon fontSize="small" />
													</IconButton>
												)}
											</div>
										))}

										{images.length < 1 && isTableMode !== 'view' && (
											<div className="relative flex justify-center items-center w-[100px] h-[100px] border-[2px] border-[#ccc] rounded-[10px]">
												<IconButton
													className="text-amber-700"
													onClick={() => document.getElementById('productImage')?.click()}
												>
													<AddCircleIcon fontSize="large" />
												</IconButton>
												<input
													id="productImage"
													type="file"
													accept="image/*"
													style={{ display: 'none' }}
													onChange={handleImageUpload}
												/>
											</div>
										)}
									</div>
									<span className="text-[10px] text-gray-700 italic">
										<b className="text-red">Note:</b> Image size should be ≤ 20MB.
									</span>
								</Grid>

								<Grid
									item
									lg={12}
									className="flex justify-end gap-2"
								>
									{isTableMode !== 'view' && (
										<Button
											type="submit"
											variant="contained"
											className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
											disabled={isDataLoading || isRefreshingItemCode}
										>
											{t('Save')}
											{isDataLoading && (
												<CircularProgress
													size={24}
													className="ml-2"
												/>
											)}
										</Button>
									)}
									<Button
										variant="contained"
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-grey-300 hover:bg-grey-300/80"
										onClick={toggleModal}
										disabled={isRefreshingItemCode}
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
}

export default ProductManagement;
