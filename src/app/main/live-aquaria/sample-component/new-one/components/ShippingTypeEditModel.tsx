import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Paper,
	Typography
} from '@mui/material';
import emailjs from '@emailjs/browser';
import { Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import { getPrediction } from '../../../../../axios/services/mega-city-services/common/CommonService';

// --- INTERFACES ---

interface PredictionData {
	performance_rating: number;
	confidence: number;
	suggestions: string;
}

interface ApiResponse {
	status: string;
	prediction: PredictionData | null;
	employee_name: string | null;
}

interface UserData {
	nationalId: string;
	userId?: number;
	employeeName?: string;
	gender?: string;
	monthlyRate?: number;
	overTime?: string;
	yearsAtCompany?: number;
	yearsSinceLastPromotion?: number;
	email?: string;
	department?: string;
}

interface Props {
	toggleModal?: () => void;
	isOpen?: boolean;
	clickedRowData?: UserData;
	fetchAllUsers?: () => void;
	isEditMode?: boolean;
}

// --- HELPER FUNCTIONS & CONSTANTS ---

const meterSegments = [
	{ label: 'Very Low', color: '#f44336', minValue: 0 },
	{ label: 'Low', color: '#ff9800', minValue: 0.2 },
	{ label: 'Medium', color: '#ffeb3b', minValue: 0.4 },
	{ label: 'High', color: '#8bc34a', minValue: 0.6 },
	{ label: 'Very High', color: '#4caf50', minValue: 0.8 }
];

// --- MAIN COMPONENT ---

function UpdateUserStatusModal({
								   isOpen = true,
								   toggleModal = () => console.log('Close modal clicked'),
								   clickedRowData,
								   fetchAllUsers,
								   isEditMode = false
							   }: Props) {
	const { t } = useTranslation('userManagement');
	const [isDataLoading, setDataLoading] = useState(false);
	const [isLlmLoading, setLlmLoading] = useState(false);
	const [isNotifying, setIsNotifying] = useState(false);
	const [predictionData, setPredictionData] = useState<ApiResponse | null>(null);

	useEffect(() => {
		const fetchPredictionData = async () => {
			if (clickedRowData?.userId) {
				setDataLoading(true);
				try {
					const response = await getPrediction(String(clickedRowData.userId));

					if (response.result && response.result.status !== 'error') {
						setPredictionData(response.result);
					} else {
						setPredictionData(null);
						toast.error(response.result?.status || 'Failed to fetch prediction data.');
					}
				} catch (error) {
					setPredictionData(null);
					toast.error('An unexpected error occurred.');
				} finally {
					setDataLoading(false);
				}
			}
		};

		if (isOpen) {
			fetchPredictionData();
		} else {
			setPredictionData(null);
		}
	}, [isOpen, clickedRowData]);

	// --- METER LOGIC ---
	const confidence = predictionData?.prediction?.confidence || 0;
	const clampedConfidence = Math.max(0, Math.min(1, confidence));
	const activeSegment =
		meterSegments
			.slice()
			.reverse()
			.find((s) => clampedConfidence >= s.minValue) || meterSegments[0];
	const pointerPosition = `${clampedConfidence * 100}%`;

	const handleUpdateUser = async () => {
		if (fetchAllUsers) {
			fetchAllUsers();
		}

		toggleModal();
		toast.success('User status action confirmed!');
	};

	// --- MODIFIED FUNCTION ---
	const handleLlmGetAndSave = async () => {
		if (!clickedRowData?.userId) {
			toast.warn('User ID is missing. Cannot proceed.');
			return;
		}

		setLlmLoading(true);

		const prompt = `
        Analyze the following employee data:
        - Employee Name: ${clickedRowData?.employeeName || 'N/A'}
        - Employee ID: ${clickedRowData?.userId || 'N/A'}
        - Monthly Rate: ${clickedRowData?.monthlyRate || 'N/A'}
        - Performance Score: ${predictionData?.prediction?.performance_rating || 'N/A'}
        - Years Since Last Promotion: ${clickedRowData?.yearsSinceLastPromotion || 'N/A'}
        - Current ML Suggestion: "${predictionData?.prediction?.suggestions || 'N/A'}"
        
        Based on this data, please provide a concise suggestion (3-4 lines) for the HR department regarding this employee's eligibility for a salary review or promotion.
        `;

		try {
			// Step 1: Call Gemini for the suggestion
			const geminiApiResponse = await fetch(
				`http://localhost:8080/api/v1/model/gemini-for/advanced/decision?prompt=${encodeURIComponent(
					prompt
				)}`
			);

			if (!geminiApiResponse.ok) {
				throw new Error('Failed to get an enhanced prediction.');
			}

			const geminiResult = await geminiApiResponse.json();
			const suggestionText = geminiResult.result;

			if (!suggestionText || typeof suggestionText !== 'string') {
				throw new Error('Could not get a valid suggestion string from the API response.');
			}

			// Step 2: Prepare payload and save the suggestion
			const nameParts = clickedRowData?.employeeName?.split(' ') || [];
			const firstName = nameParts[0] || 'N/A';
			const lastName = nameParts.slice(1).join(' ') || 'N/A';

			const suggestionPayload = {
				firstName,
				lastName,
				fullName: clickedRowData?.employeeName || 'N/A',
				department: clickedRowData?.department || 'N/A',
				employeeCode: `EMPID-00${clickedRowData?.userId}`,
				suggestion: suggestionText
			};

			const saveResponse = await fetch('http://localhost:8080/api/v1/attendance/save-suggestions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(suggestionPayload)
			});

			if (!saveResponse.ok) {
				const errorData = await saveResponse.json();
				throw new Error(errorData.message || 'Failed to save the suggestion.');
			}

			toast.success('Enhanced suggestion has been saved!');

			// --- THIS IS THE FIX ---
			// 1. Refresh the background table data
			if (fetchAllUsers) {
				await fetchAllUsers();
			}

			// 2. Update the suggestion text shown inside this modal
			setPredictionData(currentData => {
				// Return a new object to trigger a re-render
				return {
					...(currentData as ApiResponse),
					prediction: {
						...(currentData?.prediction as PredictionData),
						suggestions: suggestionText, // Update with the new suggestion
					},
				};
			});

			// 3. The line that closes the modal has been removed as requested
			// toggleModal();

		} catch (error) {
			console.error('Operation failed:', error);
			toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
		} finally {
			setLlmLoading(false);
		}
	};


	const handleNotifyUser = async () => {
		if (!clickedRowData?.email) {
			toast.warn('Employee email is missing. Cannot send notification.');
			return;
		}

		setIsNotifying(true);

		const serviceID = 'service_oxr5toy';
		const templateID = 'template_cx24pet';
		const publicKey = 'CImQqVmdDtxFUAGD9';

		const templateParams = {
			employee_name: clickedRowData?.employeeName || 'Valued Employee',
			employee_email: clickedRowData?.email,
			decision: predictionData?.status || 'review',
			suggestion: predictionData?.prediction?.suggestions || 'No specific suggestions at this time.',
			company_name: 'Nexora Systems',
			message: `Dear ${clickedRowData?.employeeName || 'Valued Employee'},

Welcome to ${'Nexora Systems'}! Our automated machine learning model has evaluated your performance, and based on the analysis, our system suggests the following decision: ${predictionData?.status || 'review'}.

Suggestions for improvement: ${predictionData?.prediction?.suggestions || 'No specific suggestions at this time.'}

We are excited to have you as part of our team and look forward to your contributions!

Best regards,
The ${'Nexora Systems'} Team`
		};

		try {
			await emailjs.send(serviceID, templateID, templateParams, publicKey);
			toast.success('Welcome email sent successfully!');
		} catch (error) {
			console.error('EmailJS Error:', error);
			toast.error('Failed to send welcome email.');
		} finally {
			setIsNotifying(false);
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
				{/* ... The rest of your JSX remains unchanged ... */}
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
						{isDataLoading ? (
							<Box
								sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
							>
								<CircularProgress />
							</Box>
						) : predictionData ? (
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
						) : (
							<Box
								sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
							>
								<Typography>No prediction data available.</Typography>
							</Box>
						)}
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
									{predictionData?.employee_name || clickedRowData?.employeeName || 'N/A'}
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
									{predictionData?.prediction?.suggestions || 'N/A'}
								</Box>
							</Typography>
						</Paper>
					</Grid>
				</Grid>

				<Divider sx={{ my: 2 }} />

				<Formik
					initialValues={{}}
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
								User Details
							</Typography>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									xs={12}
									sm={6}
								>
									<Typography gutterBottom>{t('Employee ID')}</Typography>
									<Field
										name="employeeId"
										component={TextFormField}
										value={`EMPID-00${clickedRowData?.userId || ''}`}
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
									<Typography gutterBottom>{t('Employee Name')}</Typography>
									<Field
										name="employeeName"
										component={TextFormField}
										value={clickedRowData?.employeeName || 'N/A'}
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
									<Typography gutterBottom>{t('Gender')}</Typography>
									<Field
										name="gender"
										component={TextFormField}
										value={clickedRowData?.gender || 'N/A'}
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
									<Typography gutterBottom>{t('Monthly Rate')}</Typography>
									<Field
										name="monthlyRate"
										component={TextFormField}
										value={clickedRowData?.monthlyRate || 'N/A'}
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
									<Typography gutterBottom>{t('Overtime')}</Typography>
									<Field
										name="overTime"
										component={TextFormField}
										value={clickedRowData?.overTime || 'N/A'}
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
									<Typography gutterBottom>{t('Years at Company')}</Typography>
									<Field
										name="yearsAtCompany"
										component={TextFormField}
										value={clickedRowData?.yearsAtCompany || 'N/A'}
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
									<Typography gutterBottom>{t('Years Since Last Promotion')}</Typography>
									<Field
										name="yearsSinceLastPromotion"
										component={TextFormField}
										value={clickedRowData?.yearsSinceLastPromotion || 'N/A'}
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
									<Typography gutterBottom>{t('Current Status')}</Typography>
									<Field
										name="status"
										component={TextFormField}
										value={predictionData?.status || 'N/A'}
										fullWidth
										size="small"
										disabled
									/>
								</Grid>

								<Grid
									item
									xs={12}
									sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}
								>
									<Button
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-red hover:bg-red/80"
										color="secondary"
										onClick={toggleModal}
										disabled={isLlmLoading || isNotifying}
									>
										{t('Cancel')}
									</Button>

									<Button
										variant="contained"
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] border-l-green-800 hover:border-l-green-800/80"
										color="success"
										onClick={handleNotifyUser}
										disabled={
											isDataLoading || isLlmLoading || isNotifying || !clickedRowData?.email
										}
										startIcon={
											isNotifying ? (
												<CircularProgress
													size={20}
													color="inherit"
												/>
											) : null
										}
									>
										{isNotifying ? 'Notifying...' : 'Notify to User'}
									</Button>

									<Button
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-blue-gray-800 hover:bg-blue-gray-800/80"
										variant="contained"
										color="info"
										onClick={handleLlmGetAndSave}
										startIcon={
											isLlmLoading ? (
												<CircularProgress
													size={20}
													color="inherit"
												/>
											) : null
										}
									>
										{isLlmLoading ? 'Processing...' : 'Call LLM & Save'}
									</Button>

									<Button
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-blue-700 hover:bg-blue-700/80"
										type="submit"
										variant="contained"
										color="primary"
										disabled={isDataLoading || isLlmLoading || isNotifying}
									>
										{t('OK')}
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