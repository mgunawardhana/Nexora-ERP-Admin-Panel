import React, { useState, useEffect } from 'react';
import {
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Typography,
	IconButton
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import TextFormDateField from '../../../../../common/FormComponents/TextFormDateField';
import { updateProductDetails } from '../../../../../axios/services/mega-city-services/common/CommonService';

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
	categoryName: string;
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
	itemName: string;
	price: string;
	brandName: string;
	categoryName: string;
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

function UpdateProduct({
	isOpen,
	toggleModal,
	clickedRowData = {} as ProductData,
	fetchAllProducts,
	isTableMode = 'create'
}: Props) {
	const { t } = useTranslation('products');
	const [images, setImages] = useState<Image[]>([]);
	const [isDataLoading, setDataLoading] = useState<boolean>(false);
	const maxImageCount = 1;
	const maxImageSize = 20 * 1024 * 1024; // 20MB

	console.log('product details', clickedRowData);

	useEffect(() => {
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
	}, [clickedRowData]);

	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	const validateImageDimensions = (file: File): Promise<boolean> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				resolve(file.size <= maxImageSize);
			};
			img.onerror = () => {
				toast.error('Invalid image file');
				resolve(false);
			};
		});
	};

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files } = event.target;

		if (!files) return;

		if (images.length + files.length > maxImageCount) {
			toast.error(`You can only upload a maximum of ${maxImageCount} images.`);
			return;
		}

		try {
			const validImages: Image[] = [];
			const fileArray = Array.from(files || []);

			const validationPromises = fileArray.map(async (file) => {
				const isValid = await validateImageDimensions(file);

				if (isValid) {
					const base64 = await convertToBase64(file);
					validImages.push({
						id: Date.now(),
						link: URL.createObjectURL(file),
						file,
						base64
					});
				} else {
					toast.error('Image upload failed: Size should be ≤ 20MB.');
				}
			});

			await Promise.all(validationPromises);
			setImages(validImages);
		} catch (error) {
			toast.error('Error processing image upload');
		}
	};

	const handleRemoveImage = (id: number) => {
		setImages(images.filter((image) => image.id !== id));
	};

	const schema = yup.object().shape({
		itemCode: yup.string().required(t('Item code is required')),
		price: yup.string().required(t('Price is required')),
		brandName: yup.string().required(t('Brand name is required')),
		itemName: yup.string().required(t('Item Name is required')),
		categoryName: yup.string().required(t('Category name is required')),
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

	const sendWhatsAppNotification = async (formData: ProductData, previousPrice: string, previousStocks: string) => {
		try {
			const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
			const message =
				`Automated Update Notification: Amesha has updated the item ${formData.itemName} (Item Code: ${formData.itemCode}) on ${currentDateTime}. ` +
				`Price changed from ${previousPrice} to ${formData.price}, Stocks changed from ${previousStocks} to ${formData.stocks}. This is for your reference.`;

			const response = await fetch('https://waapi.app/api/v1/instances/74838/client/action/send-message', {
				method: 'POST',
				headers: {
					accept: 'application/json',
					authorization: 'Bearer o8nhqC0NIFBMFSYNmBUljvOMkbO0CNWOH2wOcouc838854a5',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					chatId: '94719043372@c.us',
					message
				})
			});

			if (!response.ok) {
				throw new Error('Failed to send WhatsApp notification');
			}
		} catch (error) {
			console.error('Error sending WhatsApp notification:', error);
			toast.error('Failed to send notification');
		}
	};

	const handleSubmit = async (values: ProductFormValues) => {
		setDataLoading(true);
		try {
			const formData: ProductData = {
				id: values.id || undefined,
				itemCode: values.itemCode,
				itemName: values.itemName,
				price: values.price,
				brandName: values.brandName,
				categoryName: values.categoryName,
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

			// Create initialValues for comparison
			const initialValues = {
				id: clickedRowData?.id || clickedRowData?._id || '',
				itemCode: clickedRowData?.itemCode || '',
				itemName: clickedRowData?.itemName || '',
				price:
					typeof clickedRowData?.price === 'number'
						? clickedRowData.price.toString()
						: clickedRowData?.price || '',
				brandName: clickedRowData?.brandName || '',
				categoryName: clickedRowData?.categoryName || clickedRowData?.category || '',
				description: clickedRowData?.description || '',
				isActive: clickedRowData?.isActive ?? false,
				updatedBy: clickedRowData?.updatedBy || clickedRowData?.updateDBy || '',
				manufacturerName: clickedRowData?.manufacturerName || '',
				manufacturerCode: clickedRowData?.manufacturerCode || '',
				warrantyPeriod:
					typeof clickedRowData?.warrantyPeriod === 'number'
						? clickedRowData.warrantyPeriod.toString()
						: clickedRowData?.warrantyPeriod || '',
				warrantyDetails: clickedRowData?.warrantyDetails || '',
				warrantyClaimProcess: clickedRowData?.warrantyClaimProcess || '',
				manufactureDate: clickedRowData?.manufactureDate ? formData.manufactureDate.split('T')[0] : '',
				expireDate: clickedRowData?.expireDate ? formData.expireDate.split('T')[0] : '',
				stocks:
					typeof clickedRowData?.stocks === 'number'
						? clickedRowData.stocks.toString()
						: clickedRowData?.stocks || '',
				productImage: clickedRowData?.productImage || ''
			};

			// Check which fields have changed
			const changedFields = Object.keys(formData).filter(
				(key) =>
					key !== 'price' &&
					key !== 'stocks' &&
					key !== 'productImage' && // Exclude productImage as it's handled separately
					formData[key as keyof ProductData] !== initialValues[key as keyof ProductFormValues]
			);

			console.log('formData.id', formData.id);

			if (formData.id) {
				await updateProductDetails(formData, formData.id);
				console.log('update details', formData);

				// Send WhatsApp notification if only price and/or stocks changed
				if (
					changedFields.length === 0 &&
					(formData.price !== initialValues.price || formData.stocks !== initialValues.stocks)
				) {
					await sendWhatsAppNotification(formData, initialValues.price, initialValues.stocks);
				}

				setDataLoading(false);
				toast.success('Product updated successfully');
			} else {
				// await handleSaveProductAPI(formData);
				toast.success('Product created successfully');
			}

			toggleModal();

			if (fetchAllProducts) {
				fetchAllProducts();
			}
		} catch (error) {
			toast.error('Error while saving product');
		} finally {
			setDataLoading(false);
		}
	};

	// Format dates to YYYY-MM-DD
	const formatDate = (isoDate: string): string => {
		return isoDate ? isoDate.split('T')[0] : '';
	};

	const initialValues: ProductFormValues = {
		id: clickedRowData?.id || clickedRowData?._id || '',
		itemCode: clickedRowData?.itemCode || '',
		itemName: clickedRowData?.itemName || '',
		price:
			typeof clickedRowData?.price === 'number' ? clickedRowData.price.toString() : clickedRowData?.price || '',
		brandName: clickedRowData?.brandName || '',
		categoryName: clickedRowData?.categoryName || clickedRowData?.category || '',
		description: clickedRowData?.description || '',
		isActive: clickedRowData?.isActive ?? false,
		updatedBy: clickedRowData?.updatedBy || clickedRowData?.updateDBy || '',
		manufacturerName: clickedRowData?.manufacturerName || '',
		manufacturerCode: clickedRowData?.manufacturerCode || '',
		warrantyPeriod:
			typeof clickedRowData?.warrantyPeriod === 'number'
				? clickedRowData.warrantyPeriod.toString()
				: clickedRowData?.warrantyPeriod || '',
		warrantyDetails: clickedRowData?.warrantyDetails || '',
		warrantyClaimProcess: clickedRowData?.warrantyClaimProcess || '',
		manufactureDate: clickedRowData?.manufactureDate ? formatDate(clickedRowData.manufactureDate) : '',
		expireDate: clickedRowData?.expireDate ? formatDate(clickedRowData.expireDate) : '',
		stocks:
			typeof clickedRowData?.stocks === 'number'
				? clickedRowData.stocks.toString()
				: clickedRowData?.stocks || '',
		productImage: clickedRowData?.productImage || ''
	};

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
								{/* Row 1: Item Code, Description, Category, Brand Name */}
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
									<Field
										name="itemCode"
										disabled
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
										{t('Category')}
										<span className="text-red"> *</span>
									</Typography>
									<Field
										name="categoryName"
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
								{/* Row 2: Price, Stocks, Active, Updated By */}
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
									className="flex items-center"
								>
									<Typography className="mr-3">{t('Is Active')}</Typography>
									<Checkbox
										color="primary"
										checked={values.isActive}
										disabled={isTableMode === 'view'}
										onChange={(e) => setFieldValue('isActive', e.target.checked)}
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
								{/* Row 3: Manufacturer Name, Manufacturer Code */}
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
								{/* Row 4: Manufacture Date, Expire Date */}
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
										placeholder="Select expiry date"
										size="small"
										disabled={isTableMode === 'view'}
									/>
								</Grid>
								{/* Row 5: Warranty */}
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
								{/* Row 6: Description */}
								<Grid
									item
									lg={6}
									md={6}
									sm={12}
									xs={12}
								>
									<Typography>
										{t('Full Description')}
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
								{/* Product Image Upload */}
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
										{images.length < maxImageCount && isTableMode !== 'view' && (
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
								{/* Actions */}
								<Grid
									item
									lg={12}
									className="flex justify-end gap-2"
								>
									{isTableMode !== 'view' && (
										<Button
											type="submit"
											variant="contained"
											className="min-w-[100px] text-[12px] text-white font-500 bg-yellow-800 hover:bg-yellow-800/80"
											disabled={isDataLoading}
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
										className="min-w-[100px] text-[12px] text-white font-500 bg-grey-300 hover:bg-grey-300/80"
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
}

export default UpdateProduct;
