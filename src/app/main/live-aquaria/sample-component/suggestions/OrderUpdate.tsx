import React, { useState } from 'react';
import {
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	Typography
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import TextFormField from '../../../../common/FormComponents/FormTextField';
// // Note: You will need to create and import a service function for updating order groups.
// import { updateOrderGroup } from '../../../../axios/services/mega-city-services/common/CommonService';
// import { OrderGroup } from './BookingType'; // Assuming BookingType.tsx is in the same directory. Adjust path if needed.

// The props for the OrderUpdate component
interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: OrderGroup | null;
	refetchData: () => void;
}

// This interface defines the structure of the form's values
interface OrderUpdateFormValues {
	groupCode: string;
	guideName: string;
	boatmanName: string;
	reason: string;
	exoticTich: boolean;
	lessAmount: number;
	customDiscountPercentage: number;
	customBoatmanPercentage: number;
	customGuidePercentage: number;
	customCompanyPercentage: number;
	giftValue: number;
}

const OrderUpdate: React.FC<Props> = ({ isOpen, toggleModal, clickedRowData, refetchData }) => {
	const { t } = useTranslation('orders'); // Using 'orders' translation file
	const [isDataLoading, setDataLoading] = useState<boolean>(false);

	console.log('clickedRowData in popup:', clickedRowData);

	// Since an OrderGroup can have multiple orders, we'll edit the first one for this form.
	// This is based on the data structure you provided.
	const orderToEdit = clickedRowData?.orders?.[0];

	// Validation schema for the form fields
	const validationSchema = yup.object().shape({
		guideName: yup.string().required(t('Guide Name is required')),
		boatmanName: yup.string().required(t('Boatman Name is required')),
		reason: yup.string().required(t('Reason for update is required')).trim(),
		exoticTich: yup.boolean(),
		lessAmount: yup.number().min(0, t('Value must be non-negative')),
		customDiscountPercentage: yup
			.number()
			.min(0, t('Percentage must be non-negative'))
			.max(100, t('Percentage cannot exceed 100')),
		customBoatmanPercentage: yup
			.number()
			.min(0, t('Percentage must be non-negative'))
			.max(100, t('Percentage cannot exceed 100')),
		customGuidePercentage: yup
			.number()
			.min(0, t('Percentage must be non-negative'))
			.max(100, t('Percentage cannot exceed 100')),
		customCompanyPercentage: yup
			.number()
			.min(0, t('Percentage must be non-negative'))
			.max(100, t('Percentage cannot exceed 100')),
		giftValue: yup.number().min(0, t('Value must be non-negative'))
	});

	// This function handles the form submission
	const handleUpdateOrder = async (values: OrderUpdateFormValues) => {
		if (!clickedRowData?._id || !orderToEdit?._id) {
			toast.error(t('Cannot update order, ID is missing.'));
			return;
		}

		// Construct the data payload to send to the backend
		const data = {
			...values // This includes all the updated percentages, amounts, etc.
		};

		try {
			setDataLoading(true);
			// You would call your actual API service function here to update the order
			await updateOrderGroup(clickedRowData._id, orderToEdit._id, data);
			refetchData();
			toggleModal();
			toast.success(t('Order updated successfully'));
		} catch (error) {
			console.error('Error updating order:', error);
			toast.error(t('Error while saving order'));
		} finally {
			setDataLoading(false);
		}
	};

	// Initial values for the form, populated from the clicked row's data
	const initialValues: OrderUpdateFormValues = {
		groupCode: clickedRowData?.groupCode || '',
		guideName: orderToEdit?.guide?.name || '',
		boatmanName: orderToEdit?.forBoatman?.[0]?.name || '',
		reason: '', // Reason is empty by default for the user to fill in
		exoticTich: orderToEdit?.exotic > 0 || false,
		lessAmount: orderToEdit?.less || 0,
		customDiscountPercentage: orderToEdit?.discount?.percentage || 0,
		customBoatmanPercentage: orderToEdit?.forBoatman?.[0]?.percentage || 0,
		customGuidePercentage: orderToEdit?.guide?.percentage || 0,
		customCompanyPercentage: orderToEdit?.company?.percentage || 0,
		giftValue: orderToEdit?.gift || 0
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
					{t('Update By Owner Decision')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={initialValues}
					onSubmit={handleUpdateOrder}
					validationSchema={validationSchema}
					enableReinitialize
				>
					{({ errors, touched, values }) => (
						<Form>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Group Code')}</Typography>
									<Field
										disabled
										name="groupCode"
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Guide Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="guideName"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.guideName && Boolean(errors.guideName)}
										helperText={touched.guideName && errors.guideName}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Boatman Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="boatmanName"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.boatmanName && Boolean(errors.boatmanName)}
										helperText={touched.boatmanName && errors.boatmanName}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Reason for Update')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="reason"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.reason && Boolean(errors.reason)}
										helperText={touched.reason && errors.reason}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Less Amount')}</Typography>
									<Field
										name="lessAmount"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.lessAmount && Boolean(errors.lessAmount)}
										helperText={touched.lessAmount && errors.lessAmount}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Gift Value')}</Typography>
									<Field
										name="giftValue"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.giftValue && Boolean(errors.giftValue)}
										helperText={touched.giftValue && errors.giftValue}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Custom Discount Percentage')}</Typography>
									<Field
										name="customDiscountPercentage"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={
											touched.customDiscountPercentage && Boolean(errors.customDiscountPercentage)
										}
										helperText={touched.customDiscountPercentage && errors.customDiscountPercentage}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Custom Boatman Percentage')}</Typography>
									<Field
										name="customBoatmanPercentage"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={
											touched.customBoatmanPercentage && Boolean(errors.customBoatmanPercentage)
										}
										helperText={touched.customBoatmanPercentage && errors.customBoatmanPercentage}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Custom Guide Percentage')}</Typography>
									<Field
										name="customGuidePercentage"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.customGuidePercentage && Boolean(errors.customGuidePercentage)}
										helperText={touched.customGuidePercentage && errors.customGuidePercentage}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>{t('Custom Company Percentage')}</Typography>
									<Field
										name="customCompanyPercentage"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={
											touched.customCompanyPercentage && Boolean(errors.customCompanyPercentage)
										}
										helperText={touched.customCompanyPercentage && errors.customCompanyPercentage}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
									className="flex items-center mt-2"
								>
									<FormControlLabel
										control={
											<Field
												as={Checkbox}
												name="exoticTich"
												checked={values.exoticTich}
											/>
										}
										label={t('Exotic')}
									/>
								</Grid>
								<Grid
									item
									lg={12}
									className="flex justify-end gap-2 pt-4"
								>
									<Button
										type="submit"
										variant="contained"
										disabled={isDataLoading}
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
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
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
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

export default OrderUpdate;
