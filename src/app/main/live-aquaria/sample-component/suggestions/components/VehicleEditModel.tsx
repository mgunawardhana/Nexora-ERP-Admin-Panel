// @ts-nocheck
import React, { useState } from 'react';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Typography,
	Box,
	TextField
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';

// --- Self-Contained TextFormField Component ---
/**
 * A custom text field component designed to work with Formik.
 * It wraps the Material-UI TextField and handles props from Formik's <Field> component.
 * This removes the need for an external import.
 */
function TextFormField({ field, form, ...props }) {
	const { name } = field;
	const { touched, errors } = form;
	const hasError = touched[name] && Boolean(errors[name]);
	const errorText = hasError ? errors[name] : '';

	return (
		<TextField
			{...field}
			{...props}
			error={hasError}
			helperText={errorText}
			variant="outlined"
		/>
	);
}

// Props interface for the component
interface Props {
	isOpen?: boolean;
	toggleModal?: () => void;
	clickedRowData: any;
	fetchAllEmployees?: () => void;
	isTableMode?: string; // 'view' or 'edit'
}

/**
 * A modal component for viewing or editing employee details.
 * It uses Formik for form handling and Yup for validation.
 * The UI is built with Material-UI components.
 */
function EmployeeEditModal({ isOpen, toggleModal, clickedRowData, fetchAllEmployees, isTableMode }: Props) {
	// State to manage loading indicator on the save button
	const [isDataLoading, setDataLoading] = useState(false);

	// Validation schema using Yup with hardcoded strings
	const schema = yup.object().shape({
		firstName: yup.string().required('First name is required'),
		lastName: yup.string().required('Last name is required'),
		department: yup.string().required('Department is required'),
		employeeCode: yup.string().required('Employee code is required'),
		suggestion: yup.string().optional()
	});

	// Initial form values are populated from the clicked row data
	const initialValues = {
		firstName: clickedRowData?.firstName || '',
		lastName: clickedRowData?.lastName || '',
		department: clickedRowData?.department || '',
		employeeCode: clickedRowData?.employeeCode || '',
		suggestion: clickedRowData?.suggestion || ''
	};

	/**
	 * Handles the form submission to update employee data.
	 * @param {object} values - The form values from Formik.
	 */
	const handleUpdateEmployee = async (values: any) => {
		setDataLoading(true);
		try {
			const data = {
				id: clickedRowData?.id,
				...values
			};
			console.log('Submitting Form Data:', data);

			// --- MOCK API CALL ---
			// In a real application, you would make an API call here.
			// For demonstration, we'll simulate a delay.
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success('Employee updated successfully');
			fetchAllEmployees?.(); // Refresh the employee list
			toggleModal?.(); // Close the modal
		} catch (error) {
			console.error('Failed to update employee:', error);
			toast.error('Failed to update employee');
		} finally {
			setDataLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			maxWidth="md"
			fullWidth
			onClose={toggleModal}
			PaperProps={{
				style: {
					borderRadius: 8
				}
			}}
		>
			<DialogTitle>
				<Typography
					variant="h6"
					component="div"
					sx={{ fontWeight: 'bold', color: 'text.primary' }}
				>
					{isTableMode === 'view' ? 'View Employee' : 'Edit Employee'}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={initialValues}
					onSubmit={handleUpdateEmployee}
					validationSchema={schema}
					enableReinitialize // This allows the form to re-initialize if clickedRowData changes
				>
					{({ isSubmitting }) => (
						<Form>
							<Grid
								container
								spacing={2}
								sx={{ pt: 1 }}
							>
								{/* First Name Field */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Field
										name="firstName"
										label="First Name *"
										component={TextFormField}
										fullWidth
										size="small"
										disabled={isTableMode === 'view'}
									/>
								</Grid>

								{/* Last Name Field */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Field
										name="lastName"
										label="Last Name *"
										component={TextFormField}
										fullWidth
										size="small"
										disabled={isTableMode === 'view'}
									/>
								</Grid>

								{/* Department Field */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Field
										name="department"
										label="Department *"
										component={TextFormField}
										fullWidth
										size="small"
										disabled={isTableMode === 'view'}
									/>
								</Grid>

								{/* Employee Code Field */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Field
										name="employeeCode"
										label="Employee Code *"
										component={TextFormField}
										fullWidth
										size="small"
										disabled={isTableMode === 'view'}
									/>
								</Grid>

								{/* Suggestion Field */}
								<Grid
									item
									xs={12}
								>
									<Field
										name="suggestion"
										label="Suggestion"
										component={TextFormField}
										fullWidth
										size="small"
										multiline
										rows={12}
										disabled={isTableMode === 'view'}
									/>
								</Grid>

								{/* Action Buttons */}
								<Grid
									item
									xs={12}
								>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
										<Button
											className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
											variant="none"
											color="secondary"
											onClick={toggleModal}
										>
											Cancel
										</Button>
										{isTableMode !== 'view' && (
											<Button
												className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
												type="submit"
												variant="contained"
												color="primary"
												disabled={isSubmitting || isDataLoading}
												startIcon={
													isDataLoading ? (
														<CircularProgress
															size={20}
															color="inherit"
														/>
													) : null
												}
											>
												{isDataLoading ? 'Saving...' : 'Save'}
											</Button>
										)}
									</Box>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
}

export default EmployeeEditModal;
