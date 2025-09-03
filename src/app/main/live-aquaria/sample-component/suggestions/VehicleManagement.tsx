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
// We no longer need the API service for fetching
// import { fetchAllSuggestions } from '../../../../axios/services/mega-city-services/common/CommonService';
// import {
//  deleteShippingType,
//  updateShippingTypeStatus
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

// Hardcoded data for the table
const hardcodedVehicleData: VehicleResp[] = [
	{
		id: 1,
		employeeCode: 'EMP-001',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
		department: 'Engineering',
		suggestion: 'Implement a new caching strategy for faster load times.',
		savedAt: '2025-09-01T10:00:00Z'
	},
	{
		id: 2,
		employeeCode: 'EMP-002',
		firstName: 'Jane',
		lastName: 'Smith',
		fullName: 'Jane Smith',
		department: 'HR',
		suggestion: 'Organize a quarterly team-building event to boost morale.',
		savedAt: '2025-09-01T11:30:00Z'
	},
	{
		id: 3,
		employeeCode: 'EMP-003',
		firstName: 'Peter',
		lastName: 'Jones',
		fullName: 'Peter Jones',
		department: 'Sales',
		suggestion: 'Encourage open communication and regular feedback to build trust and improve performance.\n' +
			'Recognize and reward employee contributions to boost motivation and retention.',
		savedAt: '2025-09-02T09:15:00Z'
	},
	{
		id: 4,
		employeeCode: 'EMP-004',
		firstName: 'Mary',
		lastName: 'Williams',
		fullName: 'Mary Williams',
		department: 'Marketing',
		suggestion: 'Launch a social media campaign for the upcoming product.',
		savedAt: '2025-09-02T14:00:00Z'
	},
	{
		id: 5,
		employeeCode: 'EMP-005',
		firstName: 'David',
		lastName: 'Brown',
		fullName: 'David Brown',
		department: 'Engineering',
		suggestion: 'We should refactor the legacy codebase for better maintainability.',
		savedAt: '2025-09-03T08:45:00Z'
	}
];

interface ShippingTypeModifiedData extends VehicleResp {
	active?: boolean;
}

function VehicleManagement() {
	const { t } = useTranslation('shippingTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	// Initialize count to the length of our hardcoded data
	const [count, setCount] = useState<number>(hardcodedVehicleData.length);
	const [isOpenShippingTypeViewModal, setIsOpenShippingTypeViewModal] = useState<boolean>(false);
	const [isOpenShippingTypeEditModal, setIsOpenShippingTypeEditModal] = useState<boolean>(false);
	const [isOpenNewShippingTypeModal, setIsOpenNewShippingTypeModal] = useState<boolean>(false);
	// Initialize sampleData with our hardcoded data
	const [sampleData, setSampleData] = useState<VehicleResp[]>(hardcodedVehicleData);
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

	// The useEffect hook for fetching data is no longer needed and has been removed.
	// useEffect(() => {
	//    fetchAllShippingTypes();
	// }, [pageNo, pageSize]);

	// Dummy function to be called by modals to simulate a data refresh
	const fetchAllShippingTypes = () => {
		console.log('Simulating data refresh.');
		setSampleData(hardcodedVehicleData); // Reset to original data if needed
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
		console.log('Simulating status change for:', selectedActiveRowData);
		toast.success('Status updated successfully (simulation)');
		// Original API call is commented out
		// try {
		//    await updateShippingTypeStatus(id, data);
		//    await fetchAllShippingTypes();
		//    toast.success('Status updated successfully');
		// } catch (error) { ... }
	};

	const handleRowDelete = async (rowData: ShippingTypeModifiedData) => {
		setSelectedDeleteRowData(rowData);
		toggleDeleteModal();
	};

	const handleAlertForm = async () => {
		toggleDeleteModal();
		console.log('Simulating delete for:', selectedDeleteRowData);
		toast.success('Shipping Type deleted successfully (simulation)');
		// Original API call is commented out
		// try {
		//    await deleteShippingType(id);
		//    fetchAllShippingTypes();
		//    toast.success('Shipping Type deleted successfully');
		// } catch (e) { ... }
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
						loading={isTableLoading} // Set to false, or manage locally
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
						records={sampleData} // Passed the hardcoded data here
						tableRowViewHandler={handleView}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
					/>
				</Grid>
			</Grid>

			{/* Modals remain unchanged and will work with the hardcoded data */}
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