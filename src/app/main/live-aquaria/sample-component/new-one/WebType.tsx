import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import ShippingTypeEditModal from './components/ShippingTypeEditModel';
import NewShippingTypeModel from './components/NewShippingType';
import { ShippingTypeModifiedData } from './types/ShippingTypes';
import ShippingTypeActiveComp from './components/ShippingTypeActiveComp';
import ShippingTypeDeleteAlertForm from './components/ShippingTypeDeleteAlertForm';
import { fetchAllUsersByPagination } from '../../../../axios/services/mega-city-services/user-management-service/UserService';
import { deleteWebArticle } from '../../../../axios/services/mega-city-services/web-article/WebArticleService';

// Define the User interface based on the requested fields
interface User {
	userId: number;
	employeeName: string;
	educationField: string;
	maritalStatus: string;
	email: string;
	monthlyRate: number;
	gender: string;
	overTime: string;
	yearsAtCompany: number;
}

function WebType() {
	const { t } = useTranslation('shippingTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [count, setCount] = useState<number>(0);

	const [isOpenShippingTypeViewModal, setIsOpenShippingTypeViewModal] = useState<boolean>(false);
	const toggleShippingTypeViewModal = () => setIsOpenShippingTypeViewModal(!isOpenShippingTypeViewModal);

	const [isOpenShippingTypeEditModal, setIsOpenShippingTypeEditModal] = useState<boolean>(false);
	const toggleShippingTypeEditModal = () => setIsOpenShippingTypeEditModal(!isOpenShippingTypeEditModal);

	const [isOpenNewShippingTypeModal, setIsOpenNewShippingTypeModal] = useState<boolean>(false);
	const toggleNewShippingTypeModal = () => setIsOpenNewShippingTypeModal(!isOpenNewShippingTypeModal);

	const [sampleData, setSampleData] = useState<User[]>();
	const [isTableLoading, setTableLoading] = useState(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<ShippingTypeModifiedData>(null);
	const [isOpenActiveModal, setOpenActiveModal] = useState(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState(false);
	const toggleActiveModal = () => setOpenActiveModal(!isOpenActiveModal);
	const toggleDeleteModal = () => setOpenDeleteModal(!isOpenDeleteModal);

	useEffect(() => {
		fetchAllUsers();
	}, [pageNo, pageSize]);

	const handlePageChange = (page: number) => {
		setPageNo(page);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
	};

	const tableColumns = [
		{
			title: t('Employee ID'),
			field: 'userId',
			cellStyle: { padding: '6px 8px' },
			render: (rowData: User) => `EMPID-00${rowData.userId}`
		},
		{
			title: t('Employee Name'),
			field: 'employeeName'
		},
		{
			title: t('Monthly Rate'),
			field: 'monthlyRate',
			render: (rowData: User) => `$${rowData.monthlyRate}`
		},
		{
			title: t('Marital Status'),
			field: 'maritalStatus'
		},
		{
			title: t('Over Time'),
			field: 'overTime'
		},
		{
			title: t('Years at Company'),
			field: 'yearsAtCompany'
		},
		{
			title: t('Years Since Last Promotion'),
			field: 'yearsSinceLastPromotion'
		}
	];

	const handleConfirmStatusChange = async () => {
		toggleActiveModal();
		const id = selectedActiveRowData?.id ?? null;
		try {
			const data = {
				is_active: !selectedActiveRowData?.active
			};
			// This function seems to be missing from your services, you might need to implement it
			// await updateSomeStatus(id, data);
			await fetchAllUsers();
			toast.success('Status updated successfully');
		} catch (error) {
			toast.error('Error updating status:');
		}
	};

	const fetchAllUsers = async () => {
		setTableLoading(true);
		try {
			const response = await fetchAllUsersByPagination(pageNo, pageSize);

			console.log('Fetched users:', response);

			if (response && response.result && Array.isArray(response.result.content)) {
				const transformedData: User[] = response.result.content.map((item: any) => ({
					employeeName: item.employeeName,
					educationField: item.educationField,
					maritalStatus: item.maritalStatus,
					email: item.email,
					monthlyRate: item.monthlyRate,
					gender: item.gender,
					userId: item.userId,
					overTime: item.overTime,
					yearsAtCompany: item.yearsAtCompany,
					yearsSinceLastPromotion: item.yearsSinceLastPromotion
				}));
				setSampleData(transformedData);
				setCount(response.result.totalElements);
			} else {
				console.error('Unexpected data format:', response);
				setSampleData([]);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Error fetching data');
			setSampleData([]);
		} finally {
			setTableLoading(false);
		}
	};

	const handleRowDelete = async (rowData: ShippingTypeModifiedData) => {
		setSelectedDeleteRowData(rowData);
		toggleDeleteModal();
	};

	const handleAlertForm = async () => {
		toggleDeleteModal();
		try {
			// Assuming email is the unique identifier for deletion
			await deleteWebArticle(selectedDeleteRowData?.email);
			await fetchAllUsers();
			toast.success('User deleted successfully');
		} catch (e) {
			toast.error('Error deleting user');
		}
	};

	const handleView = async (rowData: ShippingTypeModifiedData) => {
		setSelectedViewRowData(rowData);
		toggleShippingTypeViewModal();
	};

	const handleEdit = async (rowData: ShippingTypeModifiedData) => {
		setSelectedEditRowData(rowData);
		toggleShippingTypeEditModal();
	};

	const handleNewShippingType = () => {
		toggleNewShippingTypeModal();
	};

	const handleSubmit1 = (values) => {};

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title="User Management" />

			<Formik
				initialValues={{}}
				validationSchema={null}
				onSubmit={handleSubmit1}
			>
				{({ values }) => (
					<Form>
						{/* Commented out button section as in original */}
						{/* <Grid
              container
              spacing={2}
              className="pt-[10px] pr-[30px] mx-auto"
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
                  className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
                  type="button"
                  variant="contained"
                  size="medium"
                  onClick={handleNewShippingType}
                >
                  {t('Create User')}
                </Button>
              </Grid>
            </Grid> */}
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
						title="User Table"
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						pageSize={pageSize}
						loading={isTableLoading}
						setPageSize={setPageSize}
						pageIndex={pageNo}
						count={count}
						records={sampleData}
						tableRowViewHandler={handleView}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
						disableColumnFiltering
					/>
				</Grid>
			</Grid>

			{isOpenNewShippingTypeModal && (
				<NewShippingTypeModel
					isOpen={isOpenNewShippingTypeModal}
					toggleModal={toggleNewShippingTypeModal}
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{isOpenShippingTypeViewModal && (
				<ShippingTypeEditModal
					isOpen={isOpenShippingTypeViewModal}
					toggleModal={toggleShippingTypeViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{isOpenShippingTypeEditModal && (
				<ShippingTypeEditModal
					isOpen={isOpenShippingTypeEditModal}
					toggleModal={toggleShippingTypeEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{isOpenActiveModal && (
				<ShippingTypeActiveComp
					toggleModal={toggleActiveModal}
					isOpen={isOpenActiveModal}
					clickedRowData={selectedActiveRowData}
					handleAlertForm={handleConfirmStatusChange}
				/>
			)}

			{isOpenDeleteModal && (
				<ShippingTypeDeleteAlertForm
					toggleModal={toggleDeleteModal}
					isOpen={isOpenDeleteModal}
					clickedRowData={selectedDeleteRowData}
					handleAlertForm={handleAlertForm}
				/>
			)}
		</div>
	);
}

export default WebType;
