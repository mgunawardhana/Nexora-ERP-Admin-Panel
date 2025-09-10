import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import VehicleEditModel from './components/VehicleEditModel';
import VehicleManagementActiveComp from './components/VehicleManagementActiveComp';
import NewVehicleDeleteAlertForm from './components/NewVehicleDeleteAlertForm';
import { fetchAllSuggestions } from '../../../../axios/services/mega-city-services/common/CommonService';
// import {
// 	deleteShippingType,
// 	updateShippingTypeStatus
// } from '../../../../axios/services/live-aquaria-services/shipping-services/ShippingTypeService';

// Define types based on API response
interface VehicleResp {
	id: number;
	employeeCode: string;
	firstName: string;
	lastName: string;
	fullName: string;
	department: string;
	suggestion: string;
	savedAt: string;
}

interface ShippingTypeModifiedData extends VehicleResp {
	active?: boolean;
}

function VehicleManagement() {
	const { t } = useTranslation('shippingTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [count, setCount] = useState<number>(0);
	const [isOpenShippingTypeViewModal, setIsOpenShippingTypeViewModal] = useState<boolean>(false);
	const [isOpenShippingTypeEditModal, setIsOpenShippingTypeEditModal] = useState<boolean>(false);
	const [isOpenNewShippingTypeModal, setIsOpenNewShippingTypeModal] = useState<boolean>(false);
	const [sampleData, setSampleData] = useState<VehicleResp[]>([]);
	const [isTableLoading, setTableLoading] = useState(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<ShippingTypeModifiedData | null>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<ShippingTypeModifiedData | null>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<ShippingTypeModifiedData | null>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<ShippingTypeModifiedData | null>(null);
	const [isOpenActiveModal, setOpenActiveModal] = useState(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState(false);

	const toggleShippingTypeViewModal = () => setIsOpenShippingTypeViewModal(!isOpenShippingTypeViewModal);
	const toggleShippingTypeEditModal = () => setIsOpenShippingTypeEditModal(!isOpenShippingTypeEditModal);
	const toggleNewShippingTypeModal = () => setIsOpenNewShippingTypeModal(!isOpenNewShippingTypeModal);
	const toggleActiveModal = () => setOpenActiveModal(!isOpenActiveModal);
	const toggleDeleteModal = () => setOpenDeleteModal(!isOpenDeleteModal);

	const handlePageChange = (page: number) => {
		setPageNo(page);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
	};

	useEffect(() => {
		fetchAllShippingTypes();
	}, [pageNo, pageSize]);

	const fetchAllShippingTypes = async () => {
		setTableLoading(true);
		try {
			const response = await fetchAllSuggestions(pageNo, pageSize);
			setSampleData(response.result);
			setCount(response.result.length);
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			toast.error('Failed to fetch suggestions');
		} finally {
			setTableLoading(false);
		}
	};

	const tableColumns = [
		{
			title: t('Employee Code'),
			field: 'employeeCode',
			cellStyle: {
				padding: '6px 8px',
				width: '10%'
			}
		},
		{
			title: t('Full Name'),
			field: 'fullName',
			cellStyle: {
				padding: '6px 8px',
				width: '15%'
			}
		},
		{
			title: t('Department'),
			field: 'department',
			cellStyle: {
				padding: '4px 8px',
				width: '15%'
			},
			render: (rowData: VehicleResp) => {
				const departmentColors: { [key: string]: { text: string; bg: string } } = {
					HR: { text: '#1976D2', bg: '#E3F2FD' },
					'Human Resources': { text: '#1976D2', bg: '#E3F2FD' },
					Engineering: { text: '#388E3C', bg: '#E8F5E9' },
					Sales: { text: '#F57C00', bg: '#FFF3E0' },
					Marketing: { text: '#C2185B', bg: '#FCE4EC' }
				};

				const { text, bg } = departmentColors[rowData.department] || {
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
							textAlign: 'center'
						}}
					>
						{t(rowData.department)}
					</span>
				);
			}
		},
		{
			title: t('Suggestion'),
			field: 'suggestion',
			cellStyle: {
				padding: '6px 8px',
				maxWidth: '400px',
				whiteSpace: 'pre-wrap'
			},
			render: (rowData: VehicleResp) => {
				const words = rowData.suggestion.split(' ');
				const firstThreeWords = words.slice(0, 3).join(' ');
				return words.length > 3 ? `${firstThreeWords}...` : firstThreeWords;
			}
		},
		{
			title: t('Date Submitted'),
			field: 'savedAt',
			cellStyle: {
				padding: '6px 8px',
				width: '20%'
			},
			render: (rowData: VehicleResp) => {
				return new Date(rowData.savedAt).toLocaleString();
			}
		}
	];

	const handleConfirmStatusChange = async () => {
		toggleActiveModal();
		try {
			await updateShippingTypeStatus(selectedActiveRowData.id, { active: !selectedActiveRowData.active });
			await fetchAllShippingTypes();
			toast.success('Status updated successfully');
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update status');
		}
	};

	const handleRowDelete = async (rowData: ShippingTypeModifiedData) => {
		setSelectedDeleteRowData(rowData);
		toggleDeleteModal();
	};

	const handleAlertForm = async () => {
		toggleDeleteModal();
		try {
			await deleteShippingType(selectedDeleteRowData.id);
			fetchAllShippingTypes();
			toast.success('Shipping Type deleted successfully');
		} catch (e) {
			console.error('Error deleting shipping type:', e);
			toast.error('Failed to delete shipping type');
		}
	};

	const handleView = async (rowData: ShippingTypeModifiedData) => {
		toggleShippingTypeViewModal();
		setSelectedViewRowData(rowData);
	};

	const handleEdit = async (rowData: ShippingTypeModifiedData) => {
		setSelectedEditRowData(rowData);
		toggleShippingTypeEditModal();
	};

	const handleNewShippingType = () => {
		toggleNewShippingTypeModal();
	};

	const validationSchema = Yup.object({
		shippingType: Yup.string().optional(),
		category: Yup.string().optional(),
		status: Yup.string().optional()
	});

	const handleSubmit1 = (values) => {
		console.log('Form submitted with values:', values);
	};

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title="Suggetions" />

			<Formik
				initialValues={{ shippingType: '', category: '', status: '' }}
				validationSchema={validationSchema}
				onSubmit={handleSubmit1}
			>
				{({ values }) => (
					<Form>
						<Grid
							container
							spacing={2}
							className="pt-[10px] pr-[30px] mx-auto"
						>
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="formikFormField pt-[5px!important]"
							/>
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="formikFormField pt-[5px!important]"
							/>
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="formikFormField pt-[5px!important]"
							/>
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
						title=""
						filterChanged={null}
						handleColumnFilter={null}
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						handleCommonSearchBar={null}
						pageSize={pageSize}
						disableColumnFiltering
						loading={isTableLoading}
						setPageSize={setPageSize}
						pageIndex={pageNo}
						searchByText=""
						count={count}
						exportToExcel={null}
						externalAdd={null}
						externalEdit={null}
						externalView={null}
						selection={false}
						selectionExport={null}
						isColumnChoser
						disableSearch
						records={sampleData}
						tableRowViewHandler={handleView}
						// tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
					/>
				</Grid>
			</Grid>

			{isOpenNewShippingTypeModal && (
				<VehicleEditModel
					isOpen={isOpenNewShippingTypeModal}
					toggleModal={toggleNewShippingTypeModal}
					clickedRowData={{}}
					isTableMode="create"
					fetchAllShippingTypes={fetchAllShippingTypes}
				/>
			)}

			{isOpenShippingTypeViewModal && (
				<VehicleEditModel
					isOpen={isOpenShippingTypeViewModal}
					toggleModal={toggleShippingTypeViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllShippingTypes={fetchAllShippingTypes}
				/>
			)}

			{isOpenShippingTypeEditModal && (
				<VehicleEditModel
					isOpen={isOpenShippingTypeEditModal}
					toggleModal={toggleShippingTypeEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllShippingTypes={fetchAllShippingTypes}
				/>
			)}

			{isOpenActiveModal && (
				<VehicleManagementActiveComp
					toggleModal={toggleActiveModal}
					isOpen={isOpenActiveModal}
					clickedRowData={selectedActiveRowData}
					handleAlertForm={handleConfirmStatusChange}
				/>
			)}

			{isOpenDeleteModal && (
				<NewVehicleDeleteAlertForm
					toggleModal={toggleDeleteModal}
					isOpen={isOpenDeleteModal}
					clickedRowData={selectedDeleteRowData}
					handleAlertForm={handleAlertForm}
				/>
			)}
		</div>
	);
}

export default VehicleManagement;