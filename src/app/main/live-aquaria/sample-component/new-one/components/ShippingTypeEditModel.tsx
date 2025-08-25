// @ts-nocheck
import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	MenuItem,
	Typography
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import TextFormField from '../../../../../common/FormComponents/FormTextField';

// Define the UserData interface based on your requirements
interface UserData {
	nationalId: string;
	email: string;
	department: string;
	designation: string;
	hr_approved: boolean;
	finance_approved: boolean;
	admin_approved: boolean;
}

interface Props {
	toggleModal: () => void;
	isOpen: boolean;
	clickedRowData: UserData;
	fetchAllUsers?: () => void;
}

// Helper function to map boolean status to a string for the dropdown
const mapBooleanToStatus = (status: boolean): string => {
	if (status) return 'Approved';

	return 'Pending';
};

function UpdateUserStatusModal({ isOpen, toggleModal, clickedRowData, fetchAllUsers }: Props) {
	const { t } = useTranslation('userManagement'); // Changed translation namespace
	const [isDataLoading, setDataLoading] = useState(false);

	const approvalStatusOptions = ['Approved', 'Rejected', 'On Hold', 'Pending'];

	const handleUpdateUser = async (values: {
		hr_approved: string;
		finance_approved: string;
		admin_approved: string;
	}) => {
		setDataLoading(true);
		const payload = {
			nationalId: clickedRowData.nationalId,
			hr_approved: values.hr_approved,
			finance_approved: values.finance_approved,
			admin_approved: values.admin_approved
		};

		try {
			// Replace this with your actual API call to update the user statuses
			console.log('Submitting data:', payload);
			// await updateUserStatus(payload);

			toast.success('User statuses updated successfully!');

			if (fetchAllUsers) {
				fetchAllUsers();
			}

			toggleModal();
		} catch (error) {
			toast.error('Failed to update user statuses.');
		} finally {
			setDataLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			maxWidth="sm"
			fullWidth
			onClose={toggleModal}
		>
			<DialogTitle>
				<Typography variant="h6">{t('Update User Approval Status')}</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={{
						hr_approved: mapBooleanToStatus(clickedRowData.hr_approved),
						finance_approved: mapBooleanToStatus(clickedRowData.finance_approved),
						admin_approved: mapBooleanToStatus(clickedRowData.admin_approved)
					}}
					onSubmit={handleUpdateUser}
				>
					{() => (
						<Form>
							<Grid
								container
								spacing={2}
								sx={{ pt: 1 }}
							>
								{/* Non-Editable Fields */}
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography gutterBottom>{t('National ID')}</Typography>
									<Field
										name="nationalId"
										component={TextFormField}
										value={clickedRowData.nationalId || ''}
										fullWidth
										size="small"
										disabled
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography gutterBottom>{t('Email')}</Typography>
									<Field
										name="email"
										component={TextFormField}
										value={clickedRowData.email || ''}
										fullWidth
										size="small"
										disabled
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography gutterBottom>{t('Department')}</Typography>
									<Field
										name="department"
										component={TextFormField}
										value={clickedRowData.department || ''}
										fullWidth
										size="small"
										disabled
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography gutterBottom>{t('Designation')}</Typography>
									<Field
										name="designation"
										component={TextFormField}
										value={clickedRowData.designation || ''}
										fullWidth
										size="small"
										disabled
									/>
								</Grid>

								{/* Editable Dropdowns */}
								<Grid
									item
									xs={12}
									sm={4}
								>
									<Typography gutterBottom>{t('HR Approved')}</Typography>
									<Field
										name="hr_approved"
										component={TextFormField}
										fullWidth
										size="small"
										select
									>
										{approvalStatusOptions.map((option) => (
											<MenuItem
												key={option}
												value={option}
											>
												{option}
											</MenuItem>
										))}
									</Field>
								</Grid>

								<Grid
									item
									xs={12}
									sm={4}
								>
									<Typography gutterBottom>{t('Finance Approved')}</Typography>
									<Field
										name="finance_approved"
										component={TextFormField}
										fullWidth
										size="small"
										select
									>
										{approvalStatusOptions.map((option) => (
											<MenuItem
												key={option}
												value={option}
											>
												{option}
											</MenuItem>
										))}
									</Field>
								</Grid>

								<Grid
									item
									xs={12}
									sm={4}
								>
									<Typography gutterBottom>{t('Admin Approved')}</Typography>
									<Field
										name="admin_approved"
										component={TextFormField}
										fullWidth
										size="small"
										select
									>
										{approvalStatusOptions.map((option) => (
											<MenuItem
												key={option}
												value={option}
											>
												{option}
											</MenuItem>
										))}
									</Field>
								</Grid>

								{/* Action Buttons */}
								<Grid
									item
									xs={12}
									className="flex justify-end gap-2 mt-4"
								>
									<Button
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
										onClick={toggleModal}
									>
										{t('Cancel')}
									</Button>
									<Button
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
										type="submit"
										variant="contained"
										color="primary"
										disabled={isDataLoading}
									>
										{t('Update')}
										{isDataLoading && (
											<CircularProgress
												size={20}
												className="ml-2"
											/>
										)}
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

export default UpdateUserStatusModal;
