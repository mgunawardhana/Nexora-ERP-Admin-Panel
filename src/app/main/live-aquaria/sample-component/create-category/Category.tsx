import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { deleteUser } from 'src/app/axios/services/mega-city-services/category-services/Category';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import CategoryEditModel from './components/CategoryEditModel';
import NewCategoryActiveComp from './components/NewCategoryActiveComp';
import CategoryDeleteAlert from './components/CategoryDeleteAlert';
import { fetchAllUsersByPagination } from '../../../../axios/services/mega-city-services/user-management-service/UserService';

// Define interfaces based on API response
interface User {
	id: number;
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	employeeCode: string;
	designation: string;
	department: string;
	employmentStatus: string;
	workMode: string;
	currentSalary: number;
	hourlyRate: number;
	joinDate: string;
	contractStartDate: string;
	contractEndDate: string;
	probationEndDate: string;
	dateOfBirth: string;
	nationalId: string;
	taxId: string;
	phoneNumber: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	address: string;
	officeLocation: string;
	bankName: string;
	bankAccountNumber: string;
	previousExperienceYears: number;
	educationLevel: string;
	university: string;
	graduationYear: number;
	internDurationMonths: number;
	certifications: string;
	specialization: string;
	notes: string;
	accessLevel: string;
	managerId: number;
	mentorId: number;
	teamSize: number;
	budgetAuthority: number;
	salesTarget: number;
	commissionRate: number;
	createdAt: string;
	updatedAt: string;
	user_profile_pic: string | null;
	shiftTimings: string;
	isActive?: boolean;
}

interface Pagination {
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalElements: number;
	first: boolean;
	last: boolean;
	empty: boolean;
	numberOfElements: number;
}

interface FetchResponse {
	statusMessage: string;
	statusCode: string;
	responseTime: string;
	origin: string;
	result: {
		content: User[];
		// Updated to match your actual API response structure
		numberOfElements: number;
		last: boolean;
		totalPages: number;
		pageSize: number;
		currentPage: number;
		first: boolean;
		totalElements: number;
		empty: boolean;
	};
}

interface FormValues {
	user: string;
	status: string;
}

interface TableColumn {
	title: string;
	field: string;
	cellStyle: {
		padding: string;
	};
	render?: (rowData: User) => JSX.Element | string;
}

interface UserModifiedData extends User {
	isActive: boolean;
}

interface UpdateStatusPayload {
	isActive: boolean;
}

type RowData = User & {
	[key: string]: any;
};

function Category(): JSX.Element {
	const { t } = useTranslation('CategoryTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [users, setUsers] = useState<User[]>([]);
	const [isTableLoading, setTableLoading] = useState<boolean>(false);
	const [isOpenNewCategoryModal, setIsOpenNewCategoryModal] = useState<boolean>(false);
	const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
	const [isOpenViewModal, setIsOpenViewModal] = useState<boolean>(false);
	const [isOpenActiveModal, setOpenActiveModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<UserModifiedData | null>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<User | null>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<UserModifiedData | null>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<UserModifiedData | null>(null);

	const toggleNewCategoryModal = useCallback((): void => {
		setIsOpenNewCategoryModal((prev) => !prev);
	}, []);

	const toggleEditModal = useCallback((): void => {
		setIsOpenEditModal((prev) => !prev);
	}, []);

	const toggleViewModal = useCallback((): void => {
		setIsOpenViewModal((prev) => !prev);
	}, []);

	const toggleActiveModal = useCallback((): void => {
		setOpenActiveModal((prev) => !prev);
	}, []);

	const toggleDeleteModal = useCallback((): void => {
		setOpenDeleteModal((prev) => !prev);
	}, []);

	const fetchUsers = useCallback(async (): Promise<void> => {
		setTableLoading(true);
		try {
			const response = (await fetchAllUsersByPagination(pageNo, pageSize)) as FetchResponse;

			if (response?.result?.content && Array.isArray(response.result.content)) {
				const transformedData: User[] = response.result.content.map((item) => ({
					...item,
					isActive: item.employmentStatus === 'ACTIVE' || item.employmentStatus === 'PROBATION'
				}));
				setUsers(transformedData);
				// Fixed: Use the correct field from API response
				setTotalCount(response.result.totalElements || 0);
			} else {
				console.error('Unexpected data format:', response);
				setUsers([]);
				setTotalCount(0);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error(t('errorFetchingData'));
			setUsers([]);
			setTotalCount(0);
		} finally {
			setTableLoading(false);
		}
	}, [pageNo, pageSize, t]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	// Fixed: Ensure page change triggers data fetch
	const handlePageChange = useCallback((page: number): void => {
		console.log('Page changed to:', page);
		setPageNo(page);
	}, []);

	// Fixed: Ensure page size change triggers data fetch and resets page
	const handlePageSizeChange = useCallback((newPageSize: number): void => {
		console.log('Page size changed to:', newPageSize);
		setPageSize(newPageSize);
		setPageNo(0); // Reset to first page when changing page size
	}, []);

	const handleView = useCallback(
		(rowData: User): void => {
			setSelectedViewRowData({
				...rowData,
				isActive: rowData.employmentStatus === 'ACTIVE' || rowData.employmentStatus === 'PROBATION'
			});
			toggleViewModal();
		},
		[toggleViewModal]
	);

	const handleEdit = useCallback(
		(rowData: User): void => {
			setSelectedEditRowData({
				...rowData,
				isActive: rowData.employmentStatus === 'ACTIVE' || rowData.employmentStatus === 'PROBATION'
			});
			toggleEditModal();
		},
		[toggleEditModal]
	);

	const handleRowDelete = useCallback(
		(rowData: User): void => {
			setSelectedDeleteRowData(rowData);
			toggleDeleteModal();
		},
		[toggleDeleteModal]
	);

	const handleConfirmStatusChange = useCallback(async (): Promise<void> => {
		if (!selectedActiveRowData) return;

		try {
			// await updateCategoryStatus(selectedActiveRowData.id, {
			//   isActive: !selectedActiveRowData.isActive,
			// });
			await fetchUsers();
			toast.success(t('statusUpdated'));
			toggleActiveModal();
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error(t('errorUpdatingStatus'));
		}
	}, [selectedActiveRowData, fetchUsers, t, toggleActiveModal]);

	const handleAlertForm = useCallback(async (): Promise<void> => {
		console.log(selectedDeleteRowData);

		if (!selectedDeleteRowData?.userId) return;

		try {
			await deleteUser(selectedDeleteRowData.userId);
			await fetchUsers();
			toast.success(t('userDeleted'));
			toggleDeleteModal();
		} catch (error) {
			console.error('Error deleting user:', error);
			toast.error(t('errorDeletingUser'));
		}
	}, [selectedDeleteRowData, fetchUsers, t, toggleDeleteModal]);

	const handleActiveStatus = useCallback(
		(rowData: User): void => {
			setSelectedActiveRowData({
				...rowData,
				isActive: rowData.employmentStatus === 'ACTIVE' || rowData.employmentStatus === 'PROBATION'
			});
			toggleActiveModal();
		},
		[toggleActiveModal]
	);

	const handleSubmit = useCallback((values: FormValues, actions: FormikHelpers<FormValues>): void => {
		console.log('Form values:', values);
		actions.setSubmitting(false);
	}, []);

	const tableColumns: TableColumn[] = [
		{
			title: t('Employee Code'),
			field: 'userId',
			cellStyle: { padding: '6px 8px' },
			render: (rowData: User) => `EMPID-00${rowData.userId}`
		},
		{
			title: t('Name'),
			field: 'firstName',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: User) => `${rowData.firstName} ${rowData.lastName}`
		},
		{
			title: t('Email'),
			field: 'email',
			cellStyle: { padding: '4px 8px' }
		},
		// {
		// 	title: t('Role'),
		// 	field: 'role',
		// 	cellStyle: { padding: '4px 8px' },
		// 	render: (rowData: User) => {
		// 		const roleColors: { [key: string]: { text: string; bg: string } } = {
		// 			SYSTEM_ADMIN: { text: '#1976D2', bg: '#E3F2FD' },
		// 			EMPLOYEE: { text: '#388E3C', bg: '#E8F5E9' },
		// 			HR_MANAGER: { text: '#F57C00', bg: '#FFF3E0' },
		// 			INTERN: { text: '#D32F2F', bg: '#FBE9E7' },
		// 			FINANCE_OFFICER: { text: '#9C27B0', bg: '#F3E5F5' }
		// 		};
		// 		const { text, bg } = roleColors[rowData.role] || { text: '#424242', bg: '#E0E0E0' };
		// 		return (
		// 			<span
		// 				style={{
		// 					display: 'inline-block',
		// 					padding: '4px 12px',
		// 					borderRadius: '16px',
		// 					color: text,
		// 					backgroundColor: bg,
		// 					fontSize: '12px',
		// 					fontWeight: 500,
		// 					textAlign: 'center',
		// 					minWidth: '80px'
		// 				}}
		// 			>
		// 				{t(rowData.role)}
		// 			</span>
		// 		);
		// 	}
		// },
		{
			title: t('Department'),
			field: 'department',
			cellStyle: { padding: '4px 8px' }
		},
		{
			title: t('Designation'),
			field: 'jobRole',
			cellStyle: { padding: '4px 8px' }
		},
		{
			title: t('Employment Status'),
			field: 'employmentStatus',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: User) => {
				const statusColors: { [key: string]: { text: string; bg: string } } = {
					ACTIVE: { text: '#388E3C', bg: '#E8F5E9' },
					PROBATION: { text: '#F57C00', bg: '#FFF3E0' },
					PERMANENT: { text: '#1976D2', bg: '#E3F2FD' },
					ON_LEAVE: { text: '#7219d2', bg: '#e5ddf6' },
					NOTICE_PERIOD: { text: '#D32F2F', bg: '#FBE9E7' },
				};
				const { text, bg } = statusColors[rowData.employmentStatus] || { text: '#424242', bg: '#E0E0E0' };
				return (
					<span
						style={{
							display: 'inline-block',
							padding: '4px 12px',
							borderRadius: '16px',
							color: text,
							backgroundColor: bg,
							fontSize: '12px',
							fontWeight: 500,
							textAlign: 'center',
							minWidth: '80px'
						}}
					>
						{t(rowData.employmentStatus)}
					</span>
				);
			}
		},
		{
			title: t('Join Date'),
			field: 'createdAt',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: User) => new Date(rowData.createdAt).toLocaleDateString()
		}
	];

	// Debug logging to help troubleshoot pagination
	console.log('Pagination Debug:', {
		pageNo,
		pageSize,
		totalCount,
		usersLength: users.length
	});

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title={t('employee / registrations')} />

			<Formik
				initialValues={{ user: '', status: '' }}
				onSubmit={handleSubmit}
			>
				{() => (
					<Form>
						<Grid
							container
							spacing={2}
							className="pt-[10px] pr-[30px] mx-auto"
							justifyContent="flex-end"
						>
							<Grid
								item
								xs={12}
								sm={6}
								md={12}
								lg={3}
								xl={6}
								className="flex justify-end items-center gap-[10px] pt-[5px!important]"
							>
								<Button
									className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
									type="button"
									variant="contained"
									onClick={toggleNewCategoryModal}
									startIcon={<AddCircleOutlineIcon />}
								>
									{t('Register Employee')}
								</Button>
							</Grid>
						</Grid>
					</Form>
				)}
			</Formik>

			<Grid
				container
				spacing={2}
				className="pt-[20px] pr-[30px] mx-auto"
			>
				<Grid
					item
					md={12}
					sm={12}
					xs={12}
					className="pt-[5px!important]"
				>
					<MaterialTableWrapper
						title={t('Category Table')}
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						pageSize={pageSize}
						loading={isTableLoading}
						pageIndex={pageNo}
						count={totalCount}
						records={users}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
						tableRowViewHandler={handleView}
						tableRowActiveHandler={handleActiveStatus}
						isColumnChoser
						disableColumnFiltering
						disableSearch
					/>
				</Grid>
			</Grid>

			{isOpenNewCategoryModal && (
				<CategoryEditModel
					isOpen={isOpenNewCategoryModal}
					toggleModal={toggleNewCategoryModal}
					isTableMode="new"
					clickedRowData={{} as UserModifiedData}
					fetchAllCategories={fetchUsers}
				/>
			)}

			{isOpenViewModal && selectedViewRowData && (
				<CategoryEditModel
					isOpen={isOpenViewModal}
					toggleModal={toggleViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllCategories={fetchUsers}
				/>
			)}

			{isOpenEditModal && selectedEditRowData && (
				<CategoryEditModel
					isOpen={isOpenEditModal}
					toggleModal={toggleEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllCategories={fetchUsers}
				/>
			)}

			{isOpenActiveModal && selectedActiveRowData && (
				<NewCategoryActiveComp
					toggleModal={toggleActiveModal}
					isOpen={isOpenActiveModal}
					clickedRowData={selectedActiveRowData}
					handleAlertForm={handleConfirmStatusChange}
				/>
			)}

			{isOpenDeleteModal && selectedDeleteRowData && (
				<CategoryDeleteAlert
					toggleModal={toggleDeleteModal}
					isOpen={isOpenDeleteModal}
					clickedRowData={selectedDeleteRowData}
					handleAlertForm={handleAlertForm}
				/>
			)}
		</div>
	);
}

export default Category;
