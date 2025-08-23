import React, { useCallback, useState, useEffect } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Paper,
	styled,
	Typography,
	CircularProgress,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import TextFormField from '../../../../common/FormComponents/FormTextField';

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	borderRadius: '8px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
	marginBottom: theme.spacing(3),
	backgroundColor: '#fff'
}));

// Updated interface to match new requirements
interface EmployeeRecord {
	id: string;
	full_name: string;
	department: string;
	employee_code: string;
	suggestion: string;
	final_decision: string;
	hr_approval: string;
	hr_approval_id: string;
	hr_comments: string;
	manager_approval: string;
	financial_officer_approval: string;
	overall_status: string;
	priority_level: string;
	date: string;
	time: string;
}

interface Pagination {
	currentPage: number;
	totalPages: number;
	totalOrders: number;
	ordersPerPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	nextPage: number | null;
	prevPage: number | null;
}

// Dropdown options
const HR_APPROVAL_OPTIONS = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' }
];

const OVERALL_STATUS_OPTIONS = [
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'on_hold', label: 'On Hold' },
	{ value: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_LEVEL_OPTIONS = [
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' },
	{ value: 'urgent', label: 'Urgent' }
];

const FINAL_DECISION_OPTIONS = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' }
];

const APPROVAL_STATUS_OPTIONS = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' }
];

// Mock data for the table
const MOCK_DATA: EmployeeRecord[] = [
	{
		id: '1',
		full_name: 'John Smith',
		department: 'Engineering',
		employee_code: 'ENG001',
		suggestion: 'Implement new development tools to improve productivity',
		final_decision: 'approved',
		hr_approval: 'approved',
		hr_approval_id: 'HR001',
		hr_comments: 'Excellent suggestion. Will help team efficiency.',
		manager_approval: 'approved',
		financial_officer_approval: 'pending',
		overall_status: 'in_progress',
		priority_level: 'high',
		date: '2024-01-15',
		time: '09:30'
	},
	{
		id: '2',
		full_name: 'Sarah Johnson',
		department: 'Marketing',
		employee_code: 'MKT002',
		suggestion: 'Launch new social media campaign for Q2',
		final_decision: 'pending',
		hr_approval: 'approved',
		hr_approval_id: 'HR002',
		hr_comments: 'Good initiative for brand awareness.',
		manager_approval: 'approved',
		financial_officer_approval: 'rejected',
		overall_status: 'on_hold',
		priority_level: 'medium',
		date: '2024-01-16',
		time: '14:15'
	},
	{
		id: '3',
		full_name: 'Michael Brown',
		department: 'Finance',
		employee_code: 'FIN003',
		suggestion: 'Automate monthly reporting process',
		final_decision: 'approved',
		hr_approval: 'approved',
		hr_approval_id: 'HR003',
		hr_comments: 'Will reduce manual work significantly.',
		manager_approval: 'approved',
		financial_officer_approval: 'approved',
		overall_status: 'completed',
		priority_level: 'high',
		date: '2024-01-17',
		time: '11:00'
	},
	{
		id: '4',
		full_name: 'Emily Davis',
		department: 'Human Resources',
		employee_code: 'HR004',
		suggestion: 'Implement flexible working hours policy',
		final_decision: 'pending',
		hr_approval: 'pending',
		hr_approval_id: 'HR004',
		hr_comments: 'Under review with management team.',
		manager_approval: 'approved',
		financial_officer_approval: 'pending',
		overall_status: 'in_progress',
		priority_level: 'medium',
		date: '2024-01-18',
		time: '16:45'
	},
	{
		id: '5',
		full_name: 'David Wilson',
		department: 'Operations',
		employee_code: 'OPS005',
		suggestion: 'Upgrade warehouse management system',
		final_decision: 'rejected',
		hr_approval: 'rejected',
		hr_approval_id: 'HR005',
		hr_comments: 'Budget constraints for current fiscal year.',
		manager_approval: 'approved',
		financial_officer_approval: 'rejected',
		overall_status: 'cancelled',
		priority_level: 'low',
		date: '2024-01-19',
		time: '10:20'
	},
	{
		id: '6',
		full_name: 'Lisa Anderson',
		department: 'IT',
		employee_code: 'IT006',
		suggestion: 'Implement cybersecurity training program',
		final_decision: 'approved',
		hr_approval: 'approved',
		hr_approval_id: 'HR006',
		hr_comments: 'Critical for company security. High priority.',
		manager_approval: 'approved',
		financial_officer_approval: 'approved',
		overall_status: 'in_progress',
		priority_level: 'urgent',
		date: '2024-01-20',
		time: '13:30'
	},
	{
		id: '7',
		full_name: 'Robert Taylor',
		department: 'Sales',
		employee_code: 'SAL007',
		suggestion: 'Create customer loyalty rewards program',
		final_decision: 'pending',
		hr_approval: 'approved',
		hr_approval_id: 'HR007',
		hr_comments: 'Innovative approach to customer retention.',
		manager_approval: 'pending',
		financial_officer_approval: 'pending',
		overall_status: 'in_progress',
		priority_level: 'medium',
		date: '2024-01-21',
		time: '15:10'
	},
	{
		id: '8',
		full_name: 'Jennifer Martinez',
		department: 'Quality Assurance',
		employee_code: 'QA008',
		suggestion: 'Implement automated testing framework',
		final_decision: 'approved',
		hr_approval: 'approved',
		hr_approval_id: 'HR008',
		hr_comments: 'Will improve product quality and reduce testing time.',
		manager_approval: 'approved',
		financial_officer_approval: 'approved',
		overall_status: 'completed',
		priority_level: 'high',
		date: '2024-01-22',
		time: '12:00'
	}
];

function BookingType() {
	const { t } = useTranslation('shippingTypes');
	const [employeeRecords, setEmployeeRecords] = useState<EmployeeRecord[]>([]);
	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(15);
	const [pagination, setPagination] = useState<Pagination>({
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		ordersPerPage: 15,
		hasNextPage: false,
		hasPrevPage: false,
		nextPage: null,
		prevPage: null
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
	const [itemToDelete, setItemToDelete] = useState<EmployeeRecord | null>(null);
	const [itemToView, setItemToView] = useState<EmployeeRecord | null>(null);
	const [itemToEdit, setItemToEdit] = useState<EmployeeRecord | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	// Load mock data on component mount
	useEffect(() => {
		loadMockData();
	}, []);

	const loadMockData = () => {
		setLoading(true);
		// Simulate API call delay
		setTimeout(() => {
			setEmployeeRecords(MOCK_DATA);
			setPagination({
				currentPage: 1,
				totalPages: Math.ceil(MOCK_DATA.length / pageSize),
				totalOrders: MOCK_DATA.length,
				ordersPerPage: pageSize,
				hasNextPage: MOCK_DATA.length > pageSize,
				hasPrevPage: false,
				nextPage: MOCK_DATA.length > pageSize ? 2 : null,
				prevPage: null
			});
			setLoading(false);
		}, 500);
	};

	const confirmDelete = async (): Promise<void> => {
		if (itemToDelete) {
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const updatedRecords = employeeRecords.filter((item) => item.id !== itemToDelete.id);
				setEmployeeRecords(updatedRecords);
				setDeleteDialogOpen(false);
				setItemToDelete(null);
				toast.success('Employee record deleted successfully');

				// Update pagination
				setPagination((prev) => ({
					...prev,
					totalOrders: updatedRecords.length,
					totalPages: Math.ceil(updatedRecords.length / pageSize)
				}));
			} catch (error) {
				console.error('Error deleting record:', error);
				toast.error(t('Error deleting record'));
			}
		}
	};

	const handlePageChange = (newPage: number) => {
		setPageNo(newPage);
	};

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPageNo(0);
		setPagination((prev) => ({
			...prev,
			ordersPerPage: newSize,
			totalPages: Math.ceil(prev.totalOrders / newSize)
		}));
	};

	const handleView = (rowData: EmployeeRecord) => {
		setItemToView(rowData);
		setViewDialogOpen(true);
	};

	const handleEdit = (rowData: EmployeeRecord) => {
		setItemToEdit(rowData);
		setEditDialogOpen(true);
	};

	const handleEditSubmit = async (values: EmployeeRecord) => {
		try {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const updatedRecords = employeeRecords.map((record) =>
				record.id === values.id ? values : record
			);
			setEmployeeRecords(updatedRecords);
			setEditDialogOpen(false);
			setItemToEdit(null);
			toast.success('Employee record updated successfully');
		} catch (error) {
			console.error('Error updating record:', error);
			toast.error('Error updating record');
		} finally {
			setLoading(false);
		}
	};

	const editValidationSchema = yup.object().shape({
		full_name: yup.string().required('Full name is required'),
		department: yup.string().required('Department is required'),
		employee_code: yup.string().required('Employee code is required'),
		suggestion: yup.string().required('Suggestion is required'),
		hr_comments: yup.string(),
		final_decision: yup.string().required('Final decision is required'),
		hr_approval: yup.string().required('HR approval is required'),
		manager_approval: yup.string().required('Manager approval is required'),
		financial_officer_approval: yup.string().required('Financial officer approval is required'),
		overall_status: yup.string().required('Overall status is required'),
		priority_level: yup.string().required('Priority level is required')
	});

	// Updated table columns
	const tableColumns = [
		{ title: t('Full Name'), field: 'full_name', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Department'), field: 'department', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{ title: t('Employee Code'), field: 'employee_code', cellStyle: { paddingTop: 16, paddingBottom: 16 } },
		{
			title: t('Suggestion'),
			field: 'suggestion',
			render: (rowData: EmployeeRecord) => (
				<Typography
					variant="body2"
					sx={{
						maxWidth: 200,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap'
					}}
					title={rowData.suggestion}
				>
					{rowData.suggestion}
				</Typography>
			),
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Final Decision'),
			field: 'final_decision',
			render: (rowData: EmployeeRecord) => {
				const option = FINAL_DECISION_OPTIONS.find((opt) => opt.value === rowData.final_decision);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.final_decision === 'approved'
									? 'success.main'
									: rowData.final_decision === 'rejected'
										? 'error.main'
										: 'warning.main',
							fontWeight: 500
						}}
					>
						{option ? option.label : rowData.final_decision}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('HR Approval'),
			field: 'hr_approval',
			render: (rowData: EmployeeRecord) => {
				const option = HR_APPROVAL_OPTIONS.find((opt) => opt.value === rowData.hr_approval);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.hr_approval === 'approved'
									? 'success.main'
									: rowData.hr_approval === 'rejected'
										? 'error.main'
										: 'warning.main',
							fontWeight: 500
						}}
					>
						{option ? option.label : rowData.hr_approval}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Manager Approval'),
			field: 'manager_approval',
			render: (rowData: EmployeeRecord) => {
				const option = APPROVAL_STATUS_OPTIONS.find(
					(opt) => opt.value === rowData.manager_approval
				);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.manager_approval === 'approved'
									? 'success.main'
									: rowData.manager_approval === 'rejected'
										? 'error.main'
										: 'warning.main',
							fontWeight: 500
						}}
					>
						{option ? option.label : rowData.manager_approval}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Financial Officer Approval'),
			field: 'financial_officer_approval',
			render: (rowData: EmployeeRecord) => {
				const option = APPROVAL_STATUS_OPTIONS.find(
					(opt) => opt.value === rowData.financial_officer_approval
				);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.financial_officer_approval === 'approved'
									? 'success.main'
									: rowData.financial_officer_approval === 'rejected'
										? 'error.main'
										: 'warning.main',
							fontWeight: 500
						}}
					>
						{option ? option.label : rowData.financial_officer_approval}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Overall Status'),
			field: 'overall_status',
			render: (rowData: EmployeeRecord) => {
				const option = OVERALL_STATUS_OPTIONS.find((opt) => opt.value === rowData.overall_status);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.overall_status === 'completed'
									? 'success.main'
									: rowData.overall_status === 'cancelled'
										? 'error.main'
										: rowData.overall_status === 'on_hold'
											? 'warning.main'
											: 'info.main',
							fontWeight: 500
						}}
					>
						{option ? option.label : rowData.overall_status}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		},
		{
			title: t('Priority Level'),
			field: 'priority_level',
			render: (rowData: EmployeeRecord) => {
				const option = PRIORITY_LEVEL_OPTIONS.find((opt) => opt.value === rowData.priority_level);
				return (
					<Typography
						variant="body2"
						sx={{
							color:
								rowData.priority_level === 'urgent'
									? 'error.main'
									: rowData.priority_level === 'high'
										? 'warning.main'
										: rowData.priority_level === 'medium'
											? 'info.main'
											: 'text.secondary',
							fontWeight:
								rowData.priority_level === 'urgent' || rowData.priority_level === 'high'
									? 600
									: 400
						}}
					>
						{option ? option.label : rowData.priority_level}
					</Typography>
				);
			},
			cellStyle: { paddingTop: 16, paddingBottom: 16 }
		}
	];

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography
					color="error"
					variant="h6"
				>
					{error}
				</Typography>
				<Button
					onClick={() => {
						setError('');
						loadMockData();
					}}
					variant="contained"
					sx={{ mt: 2 }}
				>
					Retry
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Grid
				container
				spacing={0}
			>
				<Grid
					item
					xs={12}
				>
					<MaterialTableWrapper
						title={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BookmarkAddedIcon /> {t('Employee Records')}
							</Box>
						}
						filterChanged={null}
						handleColumnFilter={null}
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						handleCommonSearchBar={null}
						pageSize={pageSize}
						disableColumnFiltering
						loading={loading}
						setPageSize={setPageSize}
						pageIndex={pageNo}
						searchByText=""
						count={pagination?.totalOrders || 0}
						exportToExcel={null}
						externalAdd={null}
						externalEdit={null}
						externalView={null}
						selection={false}
						selectionExport={null}
						isColumnVisible
						records={employeeRecords || []}
						sx={{
							bgcolor: '#fff',
							borderRadius: '8px',
							boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
						}}
						actions={[
							{
								icon: 'visibility',
								tooltip: t('View Record'),
								onClick: (event: any, rowData: EmployeeRecord) => handleView(rowData)
							},
							{
								icon: 'edit',
								tooltip: t('Edit Record'),
								onClick: (event: any, rowData: EmployeeRecord) => handleEdit(rowData)
							},
							{
								icon: 'delete',
								tooltip: t('Delete Record'),
								onClick: (event: any, rowData: EmployeeRecord) => {
									setItemToDelete(rowData);
									setDeleteDialogOpen(true);
								}
							}
						]}
					/>
				</Grid>
			</Grid>

			{/* View Dialog */}
			<Dialog
				open={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Typography variant="h6">View Employee Record</Typography>
				</DialogTitle>
				<DialogContent>
					{itemToView && (
						<Grid
							container
							spacing={2}
							sx={{ mt: 1 }}
						>
							<Grid
								item
								xs={12}
								sm={6}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Full Name
								</Typography>
								<Typography variant="body1">{itemToView.full_name}</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Department
								</Typography>
								<Typography variant="body1">{itemToView.department}</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Employee Code
								</Typography>
								<Typography variant="body1">{itemToView.employee_code}</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Priority Level
								</Typography>
								<Typography variant="body1">
									{PRIORITY_LEVEL_OPTIONS.find(
										(opt) => opt.value === itemToView.priority_level
									)?.label || itemToView.priority_level}
								</Typography>
							</Grid>
							<Grid
								item
								xs={12}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Suggestion
								</Typography>
								<Typography variant="body1">{itemToView.suggestion}</Typography>
							</Grid>
							<Grid
								item
								xs={12}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									HR Comments
								</Typography>
								<Typography variant="body1">{itemToView.hr_comments || 'No comments'}</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={4}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Final Decision
								</Typography>
								<Typography variant="body1">
									{FINAL_DECISION_OPTIONS.find(
										(opt) => opt.value === itemToView.final_decision
									)?.label || itemToView.final_decision}
								</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={4}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									HR Approval
								</Typography>
								<Typography variant="body1">
									{HR_APPROVAL_OPTIONS.find(
										(opt) => opt.value === itemToView.hr_approval
									)?.label || itemToView.hr_approval}
								</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={4}
							>
								<Typography
									variant="subtitle2"
									color="textSecondary"
								>
									Overall Status
								</Typography>
								<Typography variant="body1">
									{OVERALL_STATUS_OPTIONS.find(
										(opt) => opt.value === itemToView.overall_status
									)?.label || itemToView.overall_status}
								</Typography>
							</Grid>
						</Grid>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setViewDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle>
					<Typography variant="h6">Edit Employee Record</Typography>
				</DialogTitle>
				<DialogContent>
					{itemToEdit && (
						<Formik
							initialValues={itemToEdit}
							validationSchema={editValidationSchema}
							onSubmit={handleEditSubmit}
						>
							{({ values, setFieldValue, isSubmitting }) => (
								<Form>
									<Grid
										container
										spacing={3}
										sx={{ mt: 1 }}
									>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<Field
												name="full_name"
												component={TextFormField}
												label="Full Name"
												fullWidth
												required
											/>
										</Grid>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<Field
												name="department"
												component={TextFormField}
												label="Department"
												fullWidth
												required
											/>
										</Grid>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<Field
												name="employee_code"
												component={TextFormField}
												label="Employee Code"
												fullWidth
												required
											/>
										</Grid>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>Priority Level</InputLabel>
												<Select
													value={values.priority_level}
													onChange={(e) => setFieldValue('priority_level', e.target.value)}
													label="Priority Level"
												>
													{PRIORITY_LEVEL_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid
											item
											xs={12}
										>
											<Field
												name="suggestion"
												component={TextFormField}
												label="Suggestion"
												fullWidth
												multiline
												rows={3}
												required
											/>
										</Grid>
										<Grid
											item
											xs={12}
										>
											<Field
												name="hr_comments"
												component={TextFormField}
												label="HR Comments"
												fullWidth
												multiline
												rows={2}
											/>
										</Grid>
										<Grid
											item
											xs={12}
											sm={4}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>Final Decision</InputLabel>
												<Select
													value={values.final_decision}
													onChange={(e) =>
														setFieldValue('final_decision', e.target.value)
													}
													label="Final Decision"
												>
													{FINAL_DECISION_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid
											item
											xs={12}
											sm={4}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>HR Approval</InputLabel>
												<Select
													value={values.hr_approval}
													onChange={(e) => setFieldValue('hr_approval', e.target.value)}
													label="HR Approval"
												>
													{HR_APPROVAL_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid
											item
											xs={12}
											sm={4}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>Manager Approval</InputLabel>
												<Select
													value={values.manager_approval}
													onChange={(e) =>
														setFieldValue('manager_approval', e.target.value)
													}
													label="Manager Approval"
												>
													{APPROVAL_STATUS_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>Financial Officer Approval</InputLabel>
												<Select
													value={values.financial_officer_approval}
													onChange={(e) =>
														setFieldValue('financial_officer_approval', e.target.value)
													}
													label="Financial Officer Approval"
												>
													{APPROVAL_STATUS_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid
											item
											xs={12}
											sm={6}
										>
											<FormControl
												fullWidth
												required
											>
												<InputLabel>Overall Status</InputLabel>
												<Select
													value={values.overall_status}
													onChange={(e) => setFieldValue('overall_status', e.target.value)}
													label="Overall Status"
												>
													{OVERALL_STATUS_OPTIONS.map((option) => (
														<MenuItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
									</Grid>
									<DialogActions sx={{ mt: 3, px: 0 }}>
										<Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
										<Button
											type="submit"
											variant="contained"
											disabled={isSubmitting || loading}
											startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
										>
											{isSubmitting ? 'Updating...' : 'Update Record'}
										</Button>
									</DialogActions>
								</Form>
							)}
						</Formik>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				aria-labelledby="record-dialog-title"
				aria-describedby="record-dialog-description"
			>
				<DialogTitle id="record-dialog-title">{t('Confirm Delete')}</DialogTitle>
				<DialogContent>
					<DialogContentText id="record-dialog-description">
						{t('Are you sure you want to delete this employee record?')}
						{itemToDelete && (
							<>
								<br />
								<strong>Full Name: {itemToDelete.full_name}</strong>
								<br />
								<strong>Employee Code: {itemToDelete.employee_code}</strong>
								<br />
								<strong>Department: {itemToDelete.department}</strong>
							</>
						)}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
					<Button
						onClick={confirmDelete}
						color="error"
						autoFocus
					>
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default BookingType;