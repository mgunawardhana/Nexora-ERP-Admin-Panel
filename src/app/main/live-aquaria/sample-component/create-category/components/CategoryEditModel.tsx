import React, { useState } from 'react';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Typography,
	MenuItem
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import TextFormField from '../../../../../common/FormComponents/FormTextField'; // Assuming this component exists

// The UserType should match the keys used in your form state (PascalCase)
interface UserType {
	employee_name: string;
	Age: number;
	BusinessTravel: string;
	DailyRate: number;
	Department: string;
	DistanceFromHome: number;
	Education: number;
	EducationField: string;
	EnvironmentSatisfaction: number;
	Gender: string;
	HourlyRate: number;
	JobInvolvement: number;
	JobLevel: number;
	JobRole: string;
	JobSatisfaction: number;
	MaritalStatus: string;
	MonthlyIncome: number;
	MonthlyRate: number;
	NumCompaniesWorked: number;
	OverTime: string;
	PerformanceRating: number; // Added this field
	RelationshipSatisfaction: number;
	StockOptionLevel: number;
	TotalWorkingYears: number;
	TrainingTimesLastYear: number;
	WorkLifeBalance: number;
	YearsAtCompany: number;
	YearsInCurrentRole: number;
	YearsSinceLastPromotion: number;
	YearsWithCurrManager: number;
}

// Props interface for the component
interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	// The incoming data object can have any shape, but we know its keys are camelCase
	clickedRowData: Record<string, any> | null;
	fetchAllUsers: () => void;
	isTableMode: 'view' | 'edit' | 'new';
}

const UserRegistrationModal: React.FC<Props> = ({
													isOpen,
													toggleModal,
													clickedRowData,
													fetchAllUsers,
													isTableMode
												}) => {
	const { t } = useTranslation('userRegistration');

	console.log('Clicked Row Data:', clickedRowData);

	const [isDataLoading, setDataLoading] = useState<boolean>(false);

	// Dropdown options
	const educationOptions = [
		{ value: 1, label: 'Below College' },
		{ value: 2, label: 'College' },
		{ value: 3, label: 'Bachelor' },
		{ value: 4, label: 'Master' },
		{ value: 5, label: 'Doctor' }
	];
	const environmentSatisfactionOptions = [
		{ value: 1, label: 'Low' },
		{ value: 2, label: 'Medium' },
		{ value: 3, label: 'High' },
		{ value: 4, label: 'Very High' }
	];
	const jobInvolvementOptions = [
		{ value: 1, label: 'Low' },
		{ value: 2, label: 'Medium' },
		{ value: 3, label: 'High' },
		{ value: 4, label: 'Very High' }
	];
	const jobSatisfactionOptions = [
		{ value: 1, label: 'Low' },
		{ value: 2, label: 'Medium' },
		{ value: 3, label: 'High' },
		{ value: 4, label: 'Very High' }
	];
	const performanceRatingOptions = [ // Added performance rating options
		{ value: 1, label: 'Low' },
		{ value: 2, label: 'Good' },
		{ value: 3, label: 'Excellent' },
		{ value: 4, label: 'Outstanding' }
	];
	const relationshipSatisfactionOptions = [
		{ value: 1, label: 'Low' },
		{ value: 2, label: 'Medium' },
		{ value: 3, label: 'High' },
		{ value: 4, label: 'Very High' }
	];
	const workLifeBalanceOptions = [
		{ value: 1, label: 'Bad' },
		{ value: 2, label: 'Good' },
		{ value: 3, label: 'Better' },
		{ value: 4, label: 'Best' }
	];

	// Form validation schema
	const validationSchema = yup.object().shape({
		employee_name: yup.string().required(t('Employee Name is required')).trim(),
		Age: yup.number().required(t('Age is required')).positive().integer(),
		BusinessTravel: yup.string().required(t('Business Travel is required')).trim(),
		DailyRate: yup.number().required(t('Daily Rate is required')).positive(),
		Department: yup.string().required(t('Department is required')).trim(),
		DistanceFromHome: yup.number().required(t('Distance From Home is required')).positive(),
		Education: yup.number().required(t('Education is required')),
		EducationField: yup.string().required(t('Education Field is required')).trim(),
		EnvironmentSatisfaction: yup.number().required(t('Environment Satisfaction is required')),
		Gender: yup.string().required(t('Gender is required')).trim(),
		HourlyRate: yup.number().required(t('Hourly Rate is required')).positive(),
		JobInvolvement: yup.number().required(t('Job Involvement is required')),
		JobLevel: yup.number().required(t('Job Level is required')).positive().integer(),
		JobRole: yup.string().required(t('Job Role is required')).trim(),
		JobSatisfaction: yup.number().required(t('Job Satisfaction is required')),
		MaritalStatus: yup.string().required(t('Marital Status is required')).trim(),
		MonthlyIncome: yup.number().required(t('Monthly Income is required')).positive(),
		MonthlyRate: yup.number().required(t('Monthly Rate is required')).positive(),
		NumCompaniesWorked: yup.number().required(t('Number of Companies Worked is required')).min(0).integer(),
		OverTime: yup.string().required(t('Over Time is required')).trim(),
		PerformanceRating: yup.number().required(t('Performance Rating is required')), // Added validation
		RelationshipSatisfaction: yup.number().required(t('Relationship Satisfaction is required')),
		StockOptionLevel: yup.number().required(t('Stock Option Level is required')).min(0).integer(),
		TotalWorkingYears: yup.number().required(t('Total Working Years is required')).min(0).integer(),
		TrainingTimesLastYear: yup.number().required(t('Training Times Last Year is required')).min(0).integer(),
		WorkLifeBalance: yup.number().required(t('Work Life Balance is required')),
		YearsAtCompany: yup.number().required(t('Years At Company is required')).min(0).integer(),
		YearsInCurrentRole: yup.number().required(t('Years In Current Role is required')).min(0).integer(),
		YearsSinceLastPromotion: yup.number().required(t('Years Since Last Promotion is required')).min(0).integer(),
		YearsWithCurrManager: yup.number().required(t('Years With Current Manager is required')).min(0).integer()
	});

	// Form submission handler
	const handleSubmit = async (values: UserType) => {
		try {
			setDataLoading(true);
			console.log('Submitted User Data:', values);

			if (isTableMode === 'edit') {
				// await updateUser(clickedRowData._id, values); // Use values directly
				fetchAllUsers();
				toggleModal();
				toast.success(t('User updated successfully'));
			} else {
				// await createNewUser(values); // Use values directly
				fetchAllUsers();
				toggleModal();
				toast.success(t('User created successfully'));
			}
		} catch (error) {
			toast.error(t('Error while saving user'));
		} finally {
			setDataLoading(false);
		}
	};

	// **FIXED**: Initial values now correctly map from camelCase (logs) to PascalCase (form)
	const initialValues: UserType = {
		employee_name: clickedRowData?.employeeName || '',
		Age: clickedRowData?.age || 0,
		BusinessTravel: clickedRowData?.businessTravel || '',
		DailyRate: clickedRowData?.dailyRate || 0,
		Department: clickedRowData?.department || '',
		DistanceFromHome: clickedRowData?.distanceFromHome || 0,
		Education: clickedRowData?.education || 0,
		EducationField: clickedRowData?.educationField || '',
		EnvironmentSatisfaction: clickedRowData?.environmentSatisfaction || 0,
		Gender: clickedRowData?.gender || '',
		HourlyRate: clickedRowData?.hourlyRate || 0,
		JobInvolvement: clickedRowData?.jobInvolvement || 0,
		JobLevel: clickedRowData?.jobLevel || 0,
		JobRole: clickedRowData?.jobRole || '',
		JobSatisfaction: clickedRowData?.jobSatisfaction || 0,
		MaritalStatus: clickedRowData?.maritalStatus || '',
		MonthlyIncome: clickedRowData?.monthlyIncome || 0,
		MonthlyRate: clickedRowData?.monthlyRate || 0,
		NumCompaniesWorked: clickedRowData?.numCompaniesWorked || 0,
		OverTime: clickedRowData?.overTime || '',
		PerformanceRating: clickedRowData?.performanceRating || 0, // Added field
		RelationshipSatisfaction: clickedRowData?.relationshipSatisfaction || 0,
		StockOptionLevel: clickedRowData?.stockOptionLevel || 0,
		TotalWorkingYears: clickedRowData?.totalWorkingYears || 0,
		TrainingTimesLastYear: clickedRowData?.trainingTimesLastYear || 0,
		WorkLifeBalance: clickedRowData?.workLifeBalance || 0,
		YearsAtCompany: clickedRowData?.yearsAtCompany || 0,
		YearsInCurrentRole: clickedRowData?.yearsInCurrentRole || 0,
		YearsSinceLastPromotion: clickedRowData?.yearsSinceLastPromotion || 0,
		YearsWithCurrManager: clickedRowData?.yearsWithCurrManager || 0
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
					{t('User Registration')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={initialValues}
					onSubmit={handleSubmit}
					validationSchema={validationSchema}
					enableReinitialize
				>
					{({ errors, touched }) => (
						<Form>
							<Grid
								container
								spacing={2}
							>
								{/* Employee Name */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Employee Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="employee_name"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.employee_name && Boolean(errors.employee_name)}
										helperText={touched.employee_name && errors.employee_name}
									/>
								</Grid>
								{/* Age */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Age')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="Age"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.Age && Boolean(errors.Age)}
										helperText={touched.Age && errors.Age}
									/>
								</Grid>
								{/* Business Travel */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Business Travel')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="BusinessTravel"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.BusinessTravel && Boolean(errors.BusinessTravel)}
										helperText={touched.BusinessTravel && errors.BusinessTravel}
									/>
								</Grid>
								{/* Daily Rate */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Daily Rate')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="DailyRate"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.DailyRate && Boolean(errors.DailyRate)}
										helperText={touched.DailyRate && errors.DailyRate}
									/>
								</Grid>
								{/* Department */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Department')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="Department"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.Department && Boolean(errors.Department)}
										helperText={touched.Department && errors.Department}
									/>
								</Grid>
								{/* Distance From Home */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Distance From Home')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="DistanceFromHome"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.DistanceFromHome && Boolean(errors.DistanceFromHome)}
										helperText={touched.DistanceFromHome && errors.DistanceFromHome}
									/>
								</Grid>
								{/* Education */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Education')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="Education"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select // This makes the TextFormField act as a select dropdown
										error={touched.Education && Boolean(errors.Education)}
										helperText={touched.Education && errors.Education}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Education')}
										</MenuItem>
										{educationOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Education Field */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Education Field')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="EducationField"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.EducationField && Boolean(errors.EducationField)}
										helperText={touched.EducationField && errors.EducationField}
									/>
								</Grid>
								{/* Environment Satisfaction */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Environment Satisfaction')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="EnvironmentSatisfaction"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={
											touched.EnvironmentSatisfaction && Boolean(errors.EnvironmentSatisfaction)
										}
										helperText={touched.EnvironmentSatisfaction && errors.EnvironmentSatisfaction}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Environment Satisfaction')}
										</MenuItem>
										{environmentSatisfactionOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Gender */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Gender')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="Gender"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.Gender && Boolean(errors.Gender)}
										helperText={touched.Gender && errors.Gender}
									/>
								</Grid>
								{/* Hourly Rate */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Hourly Rate')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="HourlyRate"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.HourlyRate && Boolean(errors.HourlyRate)}
										helperText={touched.HourlyRate && errors.HourlyRate}
									/>
								</Grid>
								{/* Job Involvement */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Job Involvement')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="JobInvolvement"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={touched.JobInvolvement && Boolean(errors.JobInvolvement)}
										helperText={touched.JobInvolvement && errors.JobInvolvement}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Job Involvement')}
										</MenuItem>
										{jobInvolvementOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Job Level */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Job Level')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="JobLevel"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.JobLevel && Boolean(errors.JobLevel)}
										helperText={touched.JobLevel && errors.JobLevel}
									/>
								</Grid>
								{/* Job Role */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Job Role')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="JobRole"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.JobRole && Boolean(errors.JobRole)}
										helperText={touched.JobRole && errors.JobRole}
									/>
								</Grid>
								{/* Job Satisfaction */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Job Satisfaction')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="JobSatisfaction"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={touched.JobSatisfaction && Boolean(errors.JobSatisfaction)}
										helperText={touched.JobSatisfaction && errors.JobSatisfaction}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Job Satisfaction')}
										</MenuItem>
										{jobSatisfactionOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Marital Status */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Marital Status')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="MaritalStatus"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.MaritalStatus && Boolean(errors.MaritalStatus)}
										helperText={touched.MaritalStatus && errors.MaritalStatus}
									/>
								</Grid>
								{/* Monthly Income */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Monthly Income')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="MonthlyIncome"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.MonthlyIncome && Boolean(errors.MonthlyIncome)}
										helperText={touched.MonthlyIncome && errors.MonthlyIncome}
									/>
								</Grid>
								{/* Monthly Rate */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Monthly Rate')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="MonthlyRate"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.MonthlyRate && Boolean(errors.MonthlyRate)}
										helperText={touched.MonthlyRate && errors.MonthlyRate}
									/>
								</Grid>
								{/* Num Companies Worked */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Num Companies Worked')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="NumCompaniesWorked"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.NumCompaniesWorked && Boolean(errors.NumCompaniesWorked)}
										helperText={touched.NumCompaniesWorked && errors.NumCompaniesWorked}
									/>
								</Grid>
								{/* Over Time */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Over Time')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="OverTime"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.OverTime && Boolean(errors.OverTime)}
										helperText={touched.OverTime && errors.OverTime}
									/>
								</Grid>
								{/* **NEW** Performance Rating */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Performance Rating')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="PerformanceRating"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={touched.PerformanceRating && Boolean(errors.PerformanceRating)}
										helperText={touched.PerformanceRating && errors.PerformanceRating}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Performance Rating')}
										</MenuItem>
										{performanceRatingOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Relationship Satisfaction */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Relationship Satisfaction')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="RelationshipSatisfaction"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={
											touched.RelationshipSatisfaction && Boolean(errors.RelationshipSatisfaction)
										}
										helperText={touched.RelationshipSatisfaction && errors.RelationshipSatisfaction}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Relationship Satisfaction')}
										</MenuItem>
										{relationshipSatisfactionOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Stock Option Level */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Stock Option Level')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="StockOptionLevel"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.StockOptionLevel && Boolean(errors.StockOptionLevel)}
										helperText={touched.StockOptionLevel && errors.StockOptionLevel}
									/>
								</Grid>
								{/* Total Working Years */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Total Working Years')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="TotalWorkingYears"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.TotalWorkingYears && Boolean(errors.TotalWorkingYears)}
										helperText={touched.TotalWorkingYears && errors.TotalWorkingYears}
									/>
								</Grid>
								{/* Training Times Last Year */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Training Times Last Year')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="TrainingTimesLastYear"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.TrainingTimesLastYear && Boolean(errors.TrainingTimesLastYear)}
										helperText={touched.TrainingTimesLastYear && errors.TrainingTimesLastYear}
									/>
								</Grid>
								{/* Work Life Balance */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Work Life Balance')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										name="WorkLifeBalance"
										disabled={isTableMode === 'view'}
										component={TextFormField}
										fullWidth
										size="small"
										select
										error={touched.WorkLifeBalance && Boolean(errors.WorkLifeBalance)}
										helperText={touched.WorkLifeBalance && errors.WorkLifeBalance}
									>
										<MenuItem
											value={0}
											disabled
										>
											{t('Select Work Life Balance')}
										</MenuItem>
										{workLifeBalanceOptions.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Field>
								</Grid>
								{/* Years At Company */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Years At Company')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="YearsAtCompany"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.YearsAtCompany && Boolean(errors.YearsAtCompany)}
										helperText={touched.YearsAtCompany && errors.YearsAtCompany}
									/>
								</Grid>
								{/* Years In Current Role */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Years In Current Role')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="YearsInCurrentRole"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.YearsInCurrentRole && Boolean(errors.YearsInCurrentRole)}
										helperText={touched.YearsInCurrentRole && errors.YearsInCurrentRole}
									/>
								</Grid>
								{/* Years Since Last Promotion */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Years Since Last Promotion')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="YearsSinceLastPromotion"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={
											touched.YearsSinceLastPromotion && Boolean(errors.YearsSinceLastPromotion)
										}
										helperText={touched.YearsSinceLastPromotion && errors.YearsSinceLastPromotion}
									/>
								</Grid>
								{/* Years With Curr Manager */}
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Years With Curr Manager')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="YearsWithCurrManager"
										type="number"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.YearsWithCurrManager && Boolean(errors.YearsWithCurrManager)}
										helperText={touched.YearsWithCurrManager && errors.YearsWithCurrManager}
									/>
								</Grid>
								{/* Action Buttons */}
								<Grid
									item
									lg={12}
									className="flex justify-end gap-2"
								>
									<Button
										type="submit"
										variant="contained"
										disabled={isTableMode === 'view' || isDataLoading}
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

export default UserRegistrationModal;