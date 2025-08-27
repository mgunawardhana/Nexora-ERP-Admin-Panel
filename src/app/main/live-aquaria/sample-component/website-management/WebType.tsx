// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import ShippingTypeEditModal from './components/ShippingTypeEditModel';
import NewShippingTypeModel from './components/NewShippingType';
import { ShippingTypeModifiedData, WebTypeResp } from './types/ShippingTypes';
import ShippingTypeActiveComp from './components/ShippingTypeActiveComp';
import ShippingTypeDeleteAlertForm from './components/ShippingTypeDeleteAlertForm';
import { deleteWebArticle } from '../../../../axios/services/mega-city-services/web-article/WebArticleService';

function WebType() {
	const { t } = useTranslation('shippingTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [count] = useState<number>(100);

	const [isOpenShippingTypeViewModal, setIsOpenShippingTypeViewModal] = useState<boolean>(false);
	const toggleShippingTypeViewModal = () => setIsOpenShippingTypeViewModal(!isOpenShippingTypeViewModal);

	const [isOpenShippingTypeEditModal, setIsOpenShippingTypeEditModal] = useState<boolean>(false);
	const toggleShippingTypeEditModal = () => setIsOpenShippingTypeEditModal(!isOpenShippingTypeEditModal);

	const [isOpenNewShippingTypeModal, setIsOpenNewShippingTypeModal] = useState<boolean>(false);
	const toggleNewShippingTypeModal = () => setIsOpenNewShippingTypeModal(!isOpenNewShippingTypeModal);

	const [sampleData, setSampleData] = useState<WebTypeResp[]>();
	const [isTableLoading, setTableLoading] = useState(false);
	const [selectedActiveRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<ShippingTypeModifiedData>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<ShippingTypeModifiedData>(null);
	const [isOpenActiveModal, setOpenActiveModal] = useState(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState(false);
	const toggleActiveModal = () => setOpenActiveModal(!isOpenActiveModal);
	const toggleDeleteModal = () => setOpenDeleteModal(!isOpenDeleteModal);

	useEffect(() => {
		fetchAllShippingTypes();
	}, [pageNo, pageSize]);

	const handlePageChange = (page: number) => {
		setPageNo(page);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
	};

	const tableColumns = [
		{
			title: t('Article Id'),
			field: 'articleId',
			cellStyle: {
				padding: '6px 8px'
			}
		},
		{
			title: t('Title'),
			field: 'title',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Ratings'),
			field: 'ratings',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Author'),
			field: 'author',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Is Active'),
			field: 'is_active',
			cellStyle: {
				padding: '4px 8px'
			},
			render: (rowData) => (
				<span
					style={{
						display: 'inline-block',
						padding: '4px 12px',
						borderRadius: '16px',
						color: rowData.is_active ? '#4CAF50' : '#F44336', // Green for active, red for inactive
						backgroundColor: rowData.is_active ? '#E8F5E9' : '#FFEBEE', // Light green/red for background
						fontSize: '12px',
						fontWeight: 500,
						textAlign: 'center',
						minWidth: '70px' // Optional for consistent size
					}}
				>
					{rowData.is_active ? t('Active') : t('Inactive')}
				</span>
			)
		}
	];

	const handleConfirmStatusChange = async () => {
		toggleActiveModal();

		const id = selectedActiveRowData?.id ?? null;
		try {
			const data = {
				is_active: !selectedActiveRowData?.active
			};
			await updateShippingTypeStatus(id, data);
			await fetchAllShippingTypes();
			toast.success('Status updated successfully');
		} catch (error) {
			toast.error('Error updating status:');
		}
	};

	const fetchAllShippingTypes = async () => {
		setTableLoading(true);
		try {
			const response = await fetchAllShippingTypesData(pageNo, pageSize);

			console.log('API Response:', response);

			if (response && Array.isArray(response.result)) {
				const transformedData: WebTypeResp[] = response.result.map((item) => ({
					...item
				}));

				setSampleData(transformedData);
			} else {
				console.error('Unexpected data format:', response);
				setSampleData([]);
			}
		} catch (error) {
			console.error('Error fetching shipping types:', error);
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
		console.log('selectedDeleteRowData', selectedDeleteRowData);

		toggleDeleteModal();
		try {
			await deleteWebArticle(selectedDeleteRowData?.articleId);
			await fetchAllShippingTypes();
			toast.success('Article deleted successfully');
		} catch (e) {
			toast.error('Error deleting website');
		}
	};

	const handleView = async (rowData: ShippingTypeModifiedData) => {
		setSelectedViewRowData(rowData);
		toggleShippingTypeViewModal();
	};

	const handleEdit = async (rowData: ShippingTypeModifiedData) => {
		setSelectedEditRowData(rowData);
		toggleUserEditModal();
	};

	const handleNewUser = () => {
		toggleNewUserModal();
	};

	const handleSubmit = (values: any) => {
		// Handle form submission
	};

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title=" Management" />

			<Formik
				initialValues={{}}
				validationSchema={null}
				onSubmit={handleSubmit}
			>
				{() => (
					<Form>
						<Grid
							container
							spacing={2}
							className="pt-[10px] pr-[30px] mx-auto"
						>
							<Grid
								item
								xs={12}
								className="flex justify-end items-center gap-[10px] pt-[5px!important]"
							>
								<Button
									className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
									type="button"
									variant="contained"
									size="medium"
									onClick={handleNewUser}
								>
									{t('Create User')}
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
						title="User Management Table"
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
					/>
				</Grid>
			</Grid>

			{/* Modals */}
			{isOpenNewUserModal && (
				<NewShippingTypeModel
					isOpen={isOpenNewUserModal}
					toggleModal={toggleNewUserModal}
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{isOpenUserViewModal && (
				<ShippingTypeEditModal
					isOpen={isOpenUserViewModal}
					toggleModal={toggleUserViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{isOpenUserEditModal && (
				<ShippingTypeEditModal
					isOpen={isOpenUserEditModal}
					toggleModal={toggleUserEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllShippingTypes={fetchAllUsers}
				/>
			)}

			{/* {isOpenDeleteModal && ( */}
			{/*	<ShippingTypeDeleteAlertForm */}
			{/*		toggleModal={toggleDeleteModal} */}
			{/*		isOpen={isOpenDeleteModal} */}
			{/*		clickedRowData={selectedDeleteRowData} */}
			{/*		handleAlertForm={handleAlertForm} */}
			{/*	/> */}
			{/* )} */}
		</div>
	);
}

export default UserManagement;
