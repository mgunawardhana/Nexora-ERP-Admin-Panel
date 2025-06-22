import { Button, Grid } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { Form, Formik } from 'formik';
import LockIcon from '@mui/icons-material/Lock';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import UsersForm from './UsersForm';
import { fetchAllUsersByPagination } from '../../../../axios/services/mega-city-services/user-management-service/UserService';

interface AdvanceFilteringTypes {
	userName: string;
	status: string;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
}

interface UserInterface {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: string;
	address: string;
	phone: string;
	passwordConfirm: string;
	licenseNumber: string;
	licenseExpiryDate: string;
	vehicleAssigned: boolean;
	driverStatus: boolean;
	emergencyContact: string;
	dateOfBirth: string;
	dateOfJoining: string;
}

interface ApiResponse {
	pagination: {
		currentPage: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
		size: number;
		totalPages: number;
		totalUsers: number;
	};
	users: Array<{
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		password?: string;
		role: string;
		address?: string;
		phone?: string;
		passwordConfirm?: string;
		licenseNumber?: string;
		licenseExpiryDate?: string;
		vehicleAssigned?: boolean;
		driverStatus?: boolean;
		emergencyContact?: string;
		dateOfBirth?: string;
		dateOfJoining?: string;
	}>;
}

const UsersApp: React.FC = () => {
	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [userRoles, ] = useState<{ label: string; value: number }[]>([]);
	const [users, setUsers] = useState<UserInterface[]>([]);
	const [isTableLoading, setTableLoading] = useState<boolean>(false);
	const [count, setCount] = useState<number>(0);
	const [isModelOpen, setIsModelOpen] = useState<boolean>(false);
	const [isAdd, setIsAdd] = useState<boolean>(false);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(false);
	const [selectedRow, setSelectedRow] = useState<UserInterface | null>(null);

	const handlePageChange = useCallback((page: number) => {
		setPageNo(page);
	}, []);

	const handlePageSizeChange = useCallback((size: number) => {
		setPageSize(size);
	}, []);

	const fetchAllGuidelines = useCallback(async () => {
		setTableLoading(true);
		try {
			const response: ApiResponse = await fetchAllUsersByPagination(pageNo, pageSize);

			if (response?.users && Array.isArray(response.users) && response.pagination) {
				const transformedUsers: UserInterface[] = response.users.map((user) => ({
					id: user._id || '',
					firstName: user.firstName || '',
					lastName: user.lastName || '',
					email: user.email || '',
					password: user.password || '',
					role: user.role || '',
					address: user.address || '',
					phone_number: user.phone || '',
					passwordConfirm: user.passwordConfirm || '',
					licenseNumber: user.licenseNumber || '',
					licenseExpiryDate: user.licenseExpiryDate || '',
					vehicleAssigned: user.vehicleAssigned ?? false,
					driverStatus: user.driverStatus ?? false,
					emergencyContact: user.emergencyContact || '',
					dateOfBirth: user.dateOfBirth || '',
					dateOfJoining: user.dateOfJoining || ''
				}));

				setUsers(transformedUsers);
				setCount(response.pagination.totalUsers);
			} else {
				setUsers([]);
				setCount(0);
				toast.error('Invalid data format received');
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Error fetching data');
			setUsers([]);
			setCount(0);
		} finally {
			setTableLoading(false);
		}
	}, [pageNo, pageSize]);

	useEffect(() => {
		fetchAllGuidelines();
	}, [fetchAllGuidelines]);

	const tableColumns = [
		{ title: t('User Id'), field: 'id' },
		{
			title: t('First Name'),
			field: 'firstName',
			render: (rowData: UserInterface) => {
				if (rowData.role === 'DEVELOPER') {
					return (
						<span>
							-- <LockIcon sx={{ color: '#00C853', fontSize: '18px' }} /> --
						</span>
					);
				}

				return rowData.firstName;
			}
		},
		{
			title: t('Last Name'),
			field: 'lastName',
			render: (rowData: UserInterface) => {
				if (rowData.role === 'DEVELOPER') {
					return (
						<span>
							-- <LockIcon sx={{ color: '#00C853', fontSize: '18px' }} /> --
						</span>
					);
				}

				return rowData.lastName;
			}
		},
		{
			title: t('Email'),
			field: 'email',
			render: (rowData: UserInterface) => {
				if (rowData.role === 'DEVELOPER') {
					return (
						<span>
							-- <LockIcon sx={{ color: '#00C853', fontSize: '18px' }} /> --
						</span>
					);
				}

				return rowData.email;
			}
		},
		{
			title: t('Password'),
			field: 'password',
			render: (rowData: UserInterface) => {
				if (rowData.password === 'DEVELOPER') {
					return (
						<span>
							-- <LockIcon sx={{ color: '#00C853', fontSize: '18px' }} /> --
						</span>
					);
				}

				return '*********';
			}
		},
		{
			title: t('Role'),
			field: 'role',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: UserInterface) => {
				const roleColors: Record<string, { text: string; bg: string }> = {
					STAFF: { text: '#1E88E5', bg: '#E3F2FD' },
					ROOT: { text: '#E53935', bg: '#FFEBEE' },
					ADMIN: { text: '#0f8515', bg: '#deffe1' },
					DEMONSTRATOR: { text: '#440f85', bg: '#f0e3fb' },
					DEVELOPER: { text: '#1c0606', bg: '#c3bebe' }
				};

				const { text, bg } = roleColors[rowData.role] ?? {
					text: '#424242',
					bg: '#E0E0E0'
				};

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
							minWidth: '70px'
						}}
					>
						{t(rowData.role)}
					</span>
				);
			}
		}
	];

	const handleFormModelOpen = useCallback(
		(isNew: boolean, isEdit: boolean, isView: boolean, selectedData: UserInterface | null) => {
			setIsAdd(isNew);
			setIsEdit(isEdit);
			setIsView(isView);
			setSelectedRow(selectedData);
			setIsModelOpen(true);
		},
		[]
	);

	const tableRowViewHandler = useCallback(
		(rowData: UserInterface) => {
			handleFormModelOpen(false, false, true, rowData);
		},
		[handleFormModelOpen]
	);

	const tableRowEditHandler = useCallback(
		(rowData: UserInterface) => {
			handleFormModelOpen(false, true, false, rowData);
		},
		[handleFormModelOpen]
	);

	const onCloseHandler = useCallback(() => {
		setIsModelOpen(false);
		setSelectedRow(null);
	}, []);

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title={t('users')} />
			<Formik
				initialValues={{} as AdvanceFilteringTypes}
				onSubmit={() => {}}
				enableReinitialize
			>
				{({ setFieldValue, errors, touched }) => (
					<Form>
						<Grid
							container
							spacing={2}
						/>
					</Form>
				)}
			</Formik>

			<Grid
				container
				spacing={2}
				className="pt-[10px] pr-[30px] mx-auto"
			>
				<Grid
					item
					xs={12}
					sm={12}
					md={4}
					lg={6}
					xl={12}
					className="flex flex-wrap justify-end items-end gap-[10px] pt-[10px!important]"
				>
					<Button
						className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-medium rounded-[6px] bg-yellow-800 hover:bg-yellow-900/80"
						variant="contained"
						size="medium"
						// disabled
						onClick={() => handleFormModelOpen(true, false, false, null)}
					>
						{t('Create User')}
					</Button>
				</Grid>
			</Grid>

			<Grid
				container
				spacing={2}
				className="pr-[30px] mx-auto mt-0"
			>
				<Grid
					item
					xs={12}
					className="!pt-[5px]"
				>
					<div style={{ position: 'relative' }}>
						<span
							style={{
								position: 'absolute',
								top: '4px', // Adds spacing from the top
								right: '1000px', // Adds spacing from the right
								padding: '4px 12px',
								borderRadius: '16px',
								color: '#D32F2F',
								backgroundColor: '#FBE9E7',
								fontSize: '12px',
								fontWeight: 500,
								textAlign: 'center',
								minWidth: '80px',
								zIndex: 1
							}}
						>
							This feature is currently disabled at the business owner's request.
						</span>

						<MaterialTableWrapper
							title="User Management Table"
							filterChanged={null}
							handleColumnFilter={null}
							tableColumns={tableColumns}
							handlePageChange={handlePageChange}
							handlePageSizeChange={handlePageSizeChange}
							handleCommonSearchBar={null}
							pageSize={pageSize}
							disableColumnFiltering
							pageIndex={pageNo}
							setPageSize={setPageSize}
							searchByText=""
							loading={isTableLoading}
							count={count}
							exportToExcel={null}
							handleRowDeleteAction={null}
							externalAdd={null}
							externalEdit={null}
							externalView={null}
							selection={false}
							selectionExport={null}
							isColumnChoser
							records={users}
							disabled
							tableRowViewHandler={tableRowViewHandler}
							tableRowEditHandler={tableRowEditHandler}
						/>
					</div>
				</Grid>
			</Grid>

			{isModelOpen && (
				<UsersForm
					isOpen={isModelOpen}
					isAdd={isAdd}
					isEdit={isEdit}
					isView={isView}
					selectedRow={selectedRow}
					setIsFormOpen={setIsModelOpen}
					onCloseHandler={onCloseHandler}
					userRoles={userRoles}
				/>
			)}
		</div>
	);
};

export default UsersApp;
