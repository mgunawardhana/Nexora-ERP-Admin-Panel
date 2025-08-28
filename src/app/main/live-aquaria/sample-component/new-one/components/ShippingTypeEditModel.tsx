// @ts-nocheck
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	MenuItem,
	Paper,
	Typography
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// Make sure this path is correct for your project structure
import TextFormField from '../../../../../common/FormComponents/FormTextField';

// --- INTERFACES ---

interface PredictionData {
	performance_rating: number;
	confidence: number;
	suggestions: string;
}

interface ApiResponse {
	status: string;
	prediction: PredictionData;
	employee_name: string;
}

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
	toggleModal?: () => void;
	isOpen?: boolean;
	clickedRowData?: UserData;
	predictionData?: ApiResponse;
	fetchAllUsers?: () => void;
}

// --- MOCK DATA FOR TESTING ---

const mockClickedRowData_Default = {
	nationalId: '199012345678',
	email: 'jane.doe@example.com',
	department: 'Technology',
	designation: 'Senior Software Engineer',
	hr_approved: true,
	finance_approved: false,
	admin_approved: false
};

const mockPredictionData_Default = {
	status: 'success',
	prediction: {
		performance_rating: 3,
		confidence: 0.78,
		suggestions: 'Meets expectations. Encourage continued growth via feedback and development opportunities.'
	},
	employee_name: 'Jane Doe'
};

// --- HELPER FUNCTIONS & CONSTANTS ---

const mapBooleanToStatus = (status: boolean): string => {
	if (status) return 'Approved';

	return 'Pending';
};

const meterSegments = [
	{ label: 'Very Low', color: '#f44336', minValue: 0 },
	{ label: 'Low', color: '#ff9800', minValue: 0.2 },
	{ label: 'Medium', color: '#ffeb3b', minValue: 0.4 },
	{ label: 'High', color: '#8bc34a', minValue: 0.6 },
	{ label: 'Very High', color: '#4caf50', minValue: 0.8 }
];

// --- MAIN COMPONENT ---

function UpdateUserStatusModal({
	isOpen = true, // Default to true for easy testing
	toggleModal = () => console.log('Close modal clicked'),
	clickedRowData = mockClickedRowData_Default,
	predictionData = mockPredictionData_Default,
	fetchAllUsers
}: Props) {
	const { t } = useTranslation('userManagement');
	const [isDataLoading, setDataLoading] = useState(false);

	const approvalStatusOptions = ['Approved', 'Rejected', 'On Hold', 'Pending'];

	// --- METER LOGIC ---
	const confidence = predictionData?.prediction?.confidence || 0;
	const clampedConfidence = Math.max(0, Math.min(1, confidence));
	const activeSegment =
		meterSegments
			.slice()
			.reverse()
			.find((s) => clampedConfidence >= s.minValue) || meterSegments[0];
	const pointerPosition = `${clampedConfidence * 100}%`;

	const handleUpdateUser = async (values: {
		hr_approved: string;
		finance_approved: string;
		admin_approved: string;
	}) => {
		setDataLoading(true);
		const payload = {
			nationalId: clickedRowData.nationalId,
			hr_approved: values.hr_approved === 'Approved',
			finance_approved: values.finance_approved === 'Approved',
			admin_approved: values.admin_approved === 'Approved'
		};

		try {
			console.log('Submitting data:', payload);
			// Your API call would go here, e.g., await updateUserStatus(payload);
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
			maxWidth="md"
			fullWidth
			onClose={toggleModal}
		>
			<DialogTitle>
				<Typography variant="h6">{t('Update User Status & View Prediction')}</Typography>
			</DialogTitle>
			<DialogContent>
				{/* --- PREDICTION SECTION --- */}
				<Typography
					variant="subtitle1"
					gutterBottom
					sx={{ fontWeight: 'bold' }}
				>
					Performance Prediction
				</Typography>
				<Grid
					container
					spacing={2}
					sx={{ mb: 2 }}
				>
					<Grid
						item
						xs={12}
						md={7}
					>
						<Box sx={{ width: '100%', fontFamily: 'sans-serif' }}>
							<Box sx={{ position: 'relative', height: '25px', mb: 0.5 }}>
								<Box
									sx={{
										position: 'absolute',
										left: pointerPosition,
										transform: 'translateX(-50%)',
										textAlign: 'center'
									}}
								>
									<Typography
										variant="caption"
										sx={{
											fontWeight: 'bold',
											color: activeSegment.color,
											bgcolor: 'background.paper',
											px: 0.5,
											borderRadius: 1
										}}
									>
										{(clampedConfidence * 100).toFixed(1)}%
									</Typography>
									<Box
										sx={{
											width: 0,
											height: 0,
											borderLeft: '6px solid transparent',
											borderRight: '6px solid transparent',
											borderTop: `6px solid ${activeSegment.color}`,
											margin: 'auto'
										}}
									/>
								</Box>
							</Box>
							<Box
								sx={{
									display: 'flex',
									width: '100%',
									height: '20px',
									borderRadius: '4px',
									overflow: 'hidden'
								}}
							>
								{meterSegments.map((segment) => (
									<Box
										key={segment.label}
										sx={{ flex: 1, backgroundColor: segment.color }}
									/>
								))}
							</Box>
							<Box sx={{ display: 'flex', width: '100%', mt: 0.5 }}>
								{meterSegments.map((segment) => (
									<Typography
										key={segment.label}
										variant="caption"
										sx={{ flex: 1, textAlign: 'center', fontSize: '0.65rem' }}
									>
										{segment.label}
									</Typography>
								))}
							</Box>
						</Box>
					</Grid>
					<Grid
						item
						xs={12}
						md={5}
					>
						<Paper
							elevation={2}
							sx={{ p: 2, height: '100%' }}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 'bold' }}
							>
								Employee:{' '}
								<Box
									component="span"
									sx={{ fontWeight: 'normal' }}
								>
									{predictionData.employee_name}
								</Box>
							</Typography>
							<Typography
								variant="body2"
								sx={{ mt: 1, fontWeight: 'bold' }}
							>
								Suggestion:{' '}
								<Box
									component="span"
									sx={{ fontWeight: 'normal' }}
								>
									{predictionData.prediction.suggestions}
								</Box>
							</Typography>
						</Paper>
					</Grid>
				</Grid>

				<Divider sx={{ my: 2 }} />

				{/* --- APPROVAL FORM SECTION --- */}
				<Formik
					initialValues={{
						hr_approved: mapBooleanToStatus(clickedRowData.hr_approved),
						finance_approved: mapBooleanToStatus(clickedRowData.finance_approved),
						admin_approved: mapBooleanToStatus(clickedRowData.admin_approved)
					}}
					onSubmit={handleUpdateUser}
					enableReinitialize
				>
					{() => (
						<Form>
							<Typography
								variant="subtitle1"
								gutterBottom
								sx={{ fontWeight: 'bold' }}
							>
								User Approval Status
							</Typography>
							<Grid
								container
								spacing={2}
							>
								{/* Fields omitted for brevity but are the same as before */}
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
										{approvalStatusOptions.map((o) => (
											<MenuItem
												key={o}
												value={o}
											>
												{o}
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
										{approvalStatusOptions.map((o) => (
											<MenuItem
												key={o}
												value={o}
											>
												{o}
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
										{approvalStatusOptions.map((o) => (
											<MenuItem
												key={o}
												value={o}
											>
												{o}
											</MenuItem>
										))}
									</Field>
								</Grid>

								{/* Action Buttons */}
								<Grid
									item
									xs={12}
									sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}
								>
									<Button
										variant="outlined"
										color="secondary"
										onClick={toggleModal}
									>
										{t('Cancel')}
									</Button>
									<Button
										type="submit"
										variant="contained"
										color="primary"
										disabled={isDataLoading}
									>
										{t('Update')}
										{isDataLoading && (
											<CircularProgress
												size={20}
												sx={{ ml: 1 }}
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
