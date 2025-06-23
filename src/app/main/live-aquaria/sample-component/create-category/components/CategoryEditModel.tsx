import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography, MenuItem } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface UserType {
	role: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	address: string;
	nationalId: string;
	phoneNumber: string;
	employeeCode: string;
	department: string;
	designation: string;
	joinDate: string;
	currentSalary: number;
	emergencyContactName: string;
	emergencyContactPhone: string;
	dateOfBirth: string;
	bankAccountNumber: string;
	bankName: string;
	taxId: string;
	managerId: number;
	teamSize: number;
	specialization: string;
	contractStartDate: string;
	contractEndDate: string;
	hourlyRate: number;
	certifications: string;
	educationLevel: string;
	university: string;
	graduationYear: number;
	previousExperienceYears: number;
	employmentStatus: string;
	probationEndDate: string | null;
	shiftTimings: string;
	accessLevel: string;
	budgetAuthority: number;
	salesTarget: number;
	commissionRate: number;
	internDurationMonths: number;
	mentorId: number;
	officeLocation: string;
	workMode: string;
	notes: string;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: UserType | null;
	fetchAllUsers: () => void;
	isTableMode: 'view' | 'edit' | 'new';
}

const UserRegistrationModal: React.FC<Props> = ({
													isOpen,
													toggleModal,
													clickedRowData,
													fetchAllUsers,
													isTableMode,
												}) => {
	const { t } = useTranslation('userRegistration');
	const [isDataLoading, setDataLoading] = useState<boolean>(false);

	const generateEmployeeCode = (): string => {
		return `EMP${Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0')}`;
	};

	const roleOptions = ['ADMIN', 'USER', 'MANAGER', 'EMPLOYEE'];
	const departmentOptions = ['Human Resources', 'Engineering', 'Marketing', 'Finance'];
	const workModeOptions = ['OFFICE', 'REMOTE', 'HYBRID'];

	const validationSchema = yup.object().shape({
		role: yup.string().required(t('Role is required')).oneOf(roleOptions),
		firstName: yup.string().required(t('First Name is required')).trim(),
		lastName: yup.string().required(t('Last Name is required')).trim(),
		email: yup.string().email(t('Invalid email')).required(t('Email is required')).trim(),
		password: yup.string().when('isTableMode', {
			is: 'new',
			then: yup.string().required(t('Password is required')).min(8, t('Password must be at least 8 characters')),
			otherwise: yup.string(),
		}),
		address: yup.string().required(t('Address is required')).trim(),
		nationalId: yup.string().required(t('National ID is required')).trim(),
		phoneNumber: yup.string().required(t('Phone Number is required')).trim(),
		employeeCode: yup.string().required(t('Employee Code is required')).trim(),
		department: yup.string().required(t('Department is required')).oneOf(departmentOptions),
		designation: yup.string().required(t('Designation is required')).trim(),
		joinDate: yup.date().required(t('Join Date is required')),
		currentSalary: yup.number().required(t('Current Salary is required')).positive(),
		emergencyContactName: yup.string().required(t('Emergency Contact Name is required')).trim(),
		emergencyContactPhone: yup.string().required(t('Emergency Contact Phone is required')).trim(),
		dateOfBirth: yup.date().required(t('Date of Birth is required')),
		bankAccountNumber: yup.string().required(t('Bank Account Number is required')).trim(),
		bankName: yup.string().required(t('Bank Name is required')).trim(),
		taxId: yup.string().required(t('Tax ID is required')).trim(),
		managerId: yup.number().required(t('Manager ID is required')).positive().integer(),
		teamSize: yup.number().required(t('Team Size is required')).min(0).integer(),
		specialization: yup.string().required(t('Specialization is required')).trim(),
		contractStartDate: yup.date().required(t('Contract Start Date is required')),
		contractEndDate: yup.date().required(t('Contract End Date is required')),
		hourlyRate: yup.number().required(t('Hourly Rate is required')).positive(),
		certifications: yup.string().required(t('Certifications are required')).trim(),
		educationLevel: yup.string().required(t('Education Level is required')).trim(),
		university: yup.string().required(t('University is required')).trim(),
		graduationYear: yup.number().required(t('Graduation Year is required')).positive().integer(),
		previousExperienceYears: yup.number().required(t('Previous Experience Years is required')).min(0).integer(),
		employmentStatus: yup.string().required(t('Employment Status is required')).trim(),
		probationEndDate: yup.date().nullable(),
		shiftTimings: yup.string().required(t('Shift Timings is required')).trim(),
		accessLevel: yup.string().required(t('Access Level is required')).trim(),
		budgetAuthority: yup.number().required(t('Budget Authority is required')).min(0),
		salesTarget: yup.number().required(t('Sales Target is required')).min(0),
		commissionRate: yup.number().required(t('Commission Rate is required')).min(0),
		internDurationMonths: yup.number().required(t('Intern Duration Months is required')).min(0).integer(),
		mentorId: yup.number().required(t('Mentor ID is required')).positive().integer(),
		officeLocation: yup.string().required(t('Office Location is required')).trim(),
		workMode: yup.string().required(t('Work Mode is required')).oneOf(workModeOptions),
		notes: yup.string().required(t('Notes are required')).trim(),
	});

	const handleSubmit = async (values: UserType) => {
		const data: UserType = {
			...values,
			employeeCode: values.employeeCode || generateEmployeeCode(),
		};

		try {
			setDataLoading(true);
			console.log('Submitted User Data:', data);

			if (clickedRowData?.employeeCode && isTableMode === 'edit') {
				// await updateUser(clickedRowData._id, data); // Uncomment and implement API call
				fetchAllUsers();
				toggleModal();
				toast.success(t('User updated successfully'));
			} else {
				// await createNewUser(data); // Uncomment and implement API call
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

	const initialValues: UserType = {
		role: clickedRowData?.role || '',
		firstName: clickedRowData?.firstName || '',
		lastName: clickedRowData?.lastName || '',
		email: clickedRowData?.email || '',
		password: clickedRowData?.password || '',
		address: clickedRowData?.address || '',
		nationalId: clickedRowData?.nationalId || '',
		phoneNumber: clickedRowData?.phoneNumber || '',
		employeeCode: clickedRowData?.employeeCode || generateEmployeeCode(),
		department: clickedRowData?.department || '',
		designation: clickedRowData?.designation || '',
		joinDate: clickedRowData?.joinDate || '',
		currentSalary: clickedRowData?.currentSalary || 0,
		emergencyContactName: clickedRowData?.emergencyContactName || '',
		emergencyContactPhone: clickedRowData?.emergencyContactPhone || '',
		dateOfBirth: clickedRowData?.dateOfBirth || '',
		bankAccountNumber: clickedRowData?.bankAccountNumber || '',
		bankName: clickedRowData?.bankName || '',
		taxId: clickedRowData?.taxId || '',
		managerId: clickedRowData?.managerId || 0,
		teamSize: clickedRowData?.teamSize || 0,
		specialization: clickedRowData?.specialization || '',
		contractStartDate: clickedRowData?.contractStartDate || '',
		contractEndDate: clickedRowData?.contractEndDate || '',
		hourlyRate: clickedRowData?.hourlyRate || 0,
		certifications: clickedRowData?.certifications || '',
		educationLevel: clickedRowData?.educationLevel || '',
		university: clickedRowData?.university || '',
		graduationYear: clickedRowData?.graduationYear || 0,
		previousExperienceYears: clickedRowData?.previousExperienceYears || 0,
		employmentStatus: clickedRowData?.employmentStatus || '',
		probationEndDate: clickedRowData?.probationEndDate || null,
		shiftTimings: clickedRowData?.shiftTimings || '',
		accessLevel: clickedRowData?.accessLevel || '',
		budgetAuthority: clickedRowData?.budgetAuthority || 0,
		salesTarget: clickedRowData?.salesTarget || 0,
		commissionRate: clickedRowData?.commissionRate || 0,
		internDurationMonths: clickedRowData?.internDurationMonths || 0,
		mentorId: clickedRowData?.mentorId || 0,
		officeLocation: clickedRowData?.officeLocation || '',
		workMode: clickedRowData?.workMode || '',
		notes: clickedRowData?.notes || '',
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog
				open={isOpen}
				maxWidth="xl"
				onClose={toggleModal}
				PaperProps={{ style: { top: '40px', margin: 0, position: 'absolute' } }}
			>
				<DialogTitle>
					<Typography variant="h6" color="textSecondary" fontWeight={400}>
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
						{({ errors, touched, setFieldValue, values }) => (
							<Form>
								<Grid container spacing={2}>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Role')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											as="select"
											name="role"
											disabled={isTableMode === 'view'}
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.role && Boolean(errors.role)}
											helperText={touched.role && errors.role}
										>
											<MenuItem value="" disabled>
												{t('Select Role')}
											</MenuItem>
											{roleOptions.map((option) => (
												<MenuItem key={option} value={option}>
													{option}
												</MenuItem>
											))}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('First Name')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="firstName"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.firstName && Boolean(errors.firstName)}
											helperText={touched.firstName && errors.firstName}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Last Name')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="lastName"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.lastName && Boolean(errors.lastName)}
											helperText={touched.lastName && errors.lastName}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Email')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="email"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.email && Boolean(errors.email)}
											helperText={touched.email && errors.email}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Password')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="password"
											component={TextFormField}
											type="password"
											fullWidth
											size="small"
											error={touched.password && Boolean(errors.password)}
											helperText={touched.password && errors.password}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Address')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="address"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.address && Boolean(errors.address)}
											helperText={touched.address && errors.address}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('National ID')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="nationalId"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.nationalId && Boolean(errors.nationalId)}
											helperText={touched.nationalId && errors.nationalId}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Phone Number')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="phoneNumber"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.phoneNumber && Boolean(errors.phoneNumber)}
											helperText={touched.phoneNumber && errors.phoneNumber}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Employee Code')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled
											name="employeeCode"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.employeeCode && Boolean(errors.employeeCode)}
											helperText={touched.employeeCode && errors.employeeCode}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Department')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											as="select"
											name="department"
											disabled={isTableMode === 'view'}
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.department && Boolean(errors.department)}
											helperText={touched.department && errors.department}
										>
											<MenuItem value="" disabled>
												{t('Select Department')}
											</MenuItem>
											{departmentOptions.map((option) => (
												<MenuItem key={option} value={option}>
													{option}
												</MenuItem>
											))}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Designation')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="designation"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.designation && Boolean(errors.designation)}
											helperText={touched.designation && errors.designation}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Join Date')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											name="joinDate"
											disabled={isTableMode === 'view'}
										>
											{({ field, form }: any) => (
												<DatePicker
													{...field}
													disabled={isTableMode === 'view'}
													slotProps={{
														textField: {
															fullWidth: true,
															size: 'small',
															error: touched.joinDate && Boolean(errors.joinDate),
															helperText: touched.joinDate && errors.joinDate,
														},
													}}
													value={field.value ? new Date(field.value) : null}
													onChange={(date) => form.setFieldValue('joinDate', date ? date.toISOString() : '')}
												/>
											)}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Current Salary')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="currentSalary"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.currentSalary && Boolean(errors.currentSalary)}
											helperText={touched.currentSalary && errors.currentSalary}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Emergency Contact Name')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="emergencyContactName"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.emergencyContactName && Boolean(errors.emergencyContactName)}
											helperText={touched.emergencyContactName && errors.emergencyContactName}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Emergency Contact Phone')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="emergencyContactPhone"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.emergencyContactPhone && Boolean(errors.emergencyContactPhone)}
											helperText={touched.emergencyContactPhone && errors.emergencyContactPhone}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Date of Birth')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											name="dateOfBirth"
											disabled={isTableMode === 'view'}
										>
											{({ field, form }: any) => (
												<DatePicker
													{...field}
													disabled={isTableMode === 'view'}
													slotProps={{
														textField: {
															fullWidth: true,
															size: 'small',
															error: touched.dateOfBirth && Boolean(errors.dateOfBirth),
															helperText: touched.dateOfBirth && errors.dateOfBirth,
														},
													}}
													value={field.value ? new Date(field.value) : null}
													onChange={(date) => form.setFieldValue('dateOfBirth', date ? date.toISOString() : '')}
												/>
											)}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Bank Account Number')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="bankAccountNumber"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.bankAccountNumber && Boolean(errors.bankAccountNumber)}
											helperText={touched.bankAccountNumber && errors.bankAccountNumber}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Bank Name')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="bankName"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.bankName && Boolean(errors.bankName)}
											helperText={touched.bankName && errors.bankName}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Tax ID')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="taxId"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.taxId && Boolean(errors.taxId)}
											helperText={touched.taxId && errors.taxId}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Manager ID')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="managerId"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.managerId && Boolean(errors.managerId)}
											helperText={touched.managerId && errors.managerId}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Team Size')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="teamSize"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.teamSize && Boolean(errors.teamSize)}
											helperText={touched.teamSize && errors.teamSize}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Specialization')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="specialization"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.specialization && Boolean(errors.specialization)}
											helperText={touched.specialization && errors.specialization}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Contract Start Date')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											name="contractStartDate"
											disabled={isTableMode === 'view'}
										>
											{({ field, form }: any) => (
												<DatePicker
													{...field}
													disabled={isTableMode === 'view'}
													slotProps={{
														textField: {
															fullWidth: true,
															size: 'small',
															error: touched.contractStartDate && Boolean(errors.contractStartDate),
															helperText: touched.contractStartDate && errors.contractStartDate,
														},
													}}
													value={field.value ? new Date(field.value) : null}
													onChange={(date) => form.setFieldValue('contractStartDate', date ? date.toISOString() : '')}
												/>
											)}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Contract End Date')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											name="contractEndDate"
											disabled={isTableMode === 'view'}
										>
											{({ field, form }: any) => (
												<DatePicker
													{...field}
													disabled={isTableMode === 'view'}
													slotProps={{
														textField: {
															fullWidth: true,
															size: 'small',
															error: touched.contractEndDate && Boolean(errors.contractEndDate),
															helperText: touched.contractEndDate && errors.contractEndDate,
														},
													}}
													value={field.value ? new Date(field.value) : null}
													onChange={(date) => form.setFieldValue('contractEndDate', date ? date.toISOString() : '')}
												/>
											)}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Hourly Rate')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="hourlyRate"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.hourlyRate && Boolean(errors.hourlyRate)}
											helperText={touched.hourlyRate && errors.hourlyRate}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Certifications')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="certifications"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.certifications && Boolean(errors.certifications)}
											helperText={touched.certifications && errors.certifications}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Education Level')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="educationLevel"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.educationLevel && Boolean(errors.educationLevel)}
											helperText={touched.educationLevel && errors.educationLevel}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('University')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="university"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.university && Boolean(errors.university)}
											helperText={touched.university && errors.university}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Graduation Year')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="graduationYear"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.graduationYear && Boolean(errors.graduationYear)}
											helperText={touched.graduationYear && errors.graduationYear}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Previous Experience Years')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="previousExperienceYears"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.previousExperienceYears && Boolean(errors.previousExperienceYears)}
											helperText={touched.previousExperienceYears && errors.previousExperienceYears}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Employment Status')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="employmentStatus"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.employmentStatus && Boolean(errors.employmentStatus)}
											helperText={touched.employmentStatus && errors.employmentStatus}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Probation End Date')}
										</Typography>
										<Field
											name="probationEndDate"
											disabled={isTableMode === 'view'}
										>
											{({ field, form }: any) => (
												<DatePicker
													{...field}
													disabled={isTableMode === 'view'}
													slotProps={{
														textField: {
															fullWidth: true,
															size: 'small',
															error: touched.probationEndDate && Boolean(errors.probationEndDate),
															helperText: touched.probationEndDate && errors.probationEndDate,
														},
													}}
													value={field.value ? new Date(field.value) : null}
													onChange={(date) => form.setFieldValue('probationEndDate', date ? date.toISOString() : null)}
												/>
											)}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Shift Timings')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="shiftTimings"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.shiftTimings && Boolean(errors.shiftTimings)}
											helperText={touched.shiftTimings && errors.shiftTimings}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Access Level')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="accessLevel"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.accessLevel && Boolean(errors.accessLevel)}
											helperText={touched.accessLevel && errors.accessLevel}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Budget Authority')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="budgetAuthority"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.budgetAuthority && Boolean(errors.budgetAuthority)}
											helperText={touched.budgetAuthority && errors.budgetAuthority}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Sales Target')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="salesTarget"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.salesTarget && Boolean(errors.salesTarget)}
											helperText={touched.salesTarget && errors.salesTarget}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Commission Rate')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="commissionRate"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.commissionRate && Boolean(errors.commissionRate)}
											helperText={touched.commissionRate && errors.commissionRate}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Intern Duration Months')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="internDurationMonths"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.internDurationMonths && Boolean(errors.internDurationMonths)}
											helperText={touched.internDurationMonths && errors.internDurationMonths}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Mentor ID')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="mentorId"
											component={TextFormField}
											type="number"
											fullWidth
											size="small"
											error={touched.mentorId && Boolean(errors.mentorId)}
											helperText={touched.mentorId && errors.mentorId}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Office Location')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="officeLocation"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.officeLocation && Boolean(errors.officeLocation)}
											helperText={touched.officeLocation && errors.officeLocation}
										/>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Work Mode')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											as="select"
											name="workMode"
											disabled={isTableMode === 'view'}
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.workMode && Boolean(errors.workMode)}
											helperText={touched.workMode && errors.workMode}
										>
											<MenuItem value="" disabled>
												{t('Select Work Mode')}
											</MenuItem>
											{workModeOptions.map((option) => (
												<MenuItem key={option} value={option}>
													{option}
												</MenuItem>
											))}
										</Field>
									</Grid>
									<Grid item lg={4} md={4} sm={6} xs={12}>
										<Typography>
											{t('Notes')} <span className="text-red-500">*</span>
										</Typography>
										<Field
											disabled={isTableMode === 'view'}
											name="notes"
											component={TextFormField}
											fullWidth
											size="small"
											error={touched.notes && Boolean(errors.notes)}
											helperText={touched.notes && errors.notes}
										/>
									</Grid>
									<Grid item lg={12} className="flex justify-end gap-2">
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
		</LocalizationProvider>
	);
};

export default UserRegistrationModal;