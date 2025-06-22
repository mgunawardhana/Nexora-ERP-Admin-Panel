import React, { useEffect, useState, useCallback } from 'react';
import { Button, Grid } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import NewVehicleManagement from './components/ReceivedManagementEditModel';
import NewReceivedActiveComp from './components/NewReceivedActiveComp';
import { fetchAllReceivedStocks } from '../../../../axios/services/mega-city-services/guideline-services/GuidelineService';
import ReceivedEditModel from './components/ReceivedEditModel';
import ReceivedDeleteAlert from './components/ReceivedDeleteAlert';
import { deleteReceivedStocks } from '../../../../axios/services/mega-city-services/common/CommonService';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// TypeScript interfaces - Updated to match API response
interface ReceivedStock {
	_id: string;
	receivedProductID: string;
	receivedProductName: string;
	qty: number;
	remark: string;
	category: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

interface FetchResponse {
	success: boolean;
	count: number;
	data: ReceivedStock[];
}

interface GuideType {
	_id: string;
	receivedProductID: string;
	receivedProductName?: string;
	remark?: string;
	createdAt?: string;
}

interface FormValues {
	shippingType: string;
	category: string;
	status: string;
}

interface TableColumn {
	title: string;
	field: string;
	cellStyle: {
		padding: string;
	};
	render?: (rowData: ReceivedStock) => JSX.Element;
}

export interface ReceivedProduct {
	_id: string;
	category: string;
	createdAt: string;
	createdBy: string;
	qty: number;
	receivedProductID: string;
	receivedProductName: string;
	remark: string;
	updatedAt: string;
	__v: number;
}

function ReceivedStocks(): JSX.Element {
	const { t } = useTranslation('GuidelineTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [count, setCount] = useState<number>(0);
	const [isOpenShippingTypeViewModal, setIsOpenShippingTypeViewModal] = useState<boolean>(false);
	const [isOpenShippingTypeEditModal, setIsOpenShippingTypeEditModal] = useState<boolean>(false);
	const [isOpenNewShippingTypeModal, setIsOpenNewShippingTypeModal] = useState<boolean>(false);
	const [sampleData, setSampleData] = useState<ReceivedStock[]>([]);
	const [isTableLoading, setTableLoading] = useState<boolean>(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<ReceivedStock | null>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<GuideType | null>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<ReceivedStock | null>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<ReceivedProduct | null>(null);
	const [isOpenActiveModal, setOpenActiveModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const toggleShippingTypeViewModal = useCallback((): void => {
		setIsOpenShippingTypeViewModal((prev) => !prev);
	}, []);

	const toggleShippingTypeEditModal = useCallback((): void => {
		setIsOpenShippingTypeEditModal((prev) => !prev);
	}, []);

	const toggleNewShippingTypeModal = useCallback((): void => {
		setIsOpenNewShippingTypeModal((prev) => !prev);
	}, []);

	const toggleActiveModal = useCallback((): void => {
		setOpenActiveModal((prev) => !prev);
	}, []);

	const toggleDeleteModal = useCallback((): void => {
		setOpenDeleteModal((prev) => !prev);
	}, []);

	// Remove mapping function - use API data directly
	const fetchAllGuidelines = useCallback(async (): Promise<void> => {
		setTableLoading(true);
		try {
			const response = (await fetchAllReceivedStocks(pageNo, pageSize)) as FetchResponse;

			if (response?.success && Array.isArray(response.data)) {
				setSampleData(response.data);
				setCount(response.count);
			} else {
				console.error('Unexpected data format:', response);
				setSampleData([]);
				setCount(0);
			}
		} catch (error) {
			console.error('Error fetching received stocks:', error);
			toast.error(t('Error fetching data'));
			setSampleData([]);
			setCount(0);
		} finally {
			setTableLoading(false);
		}
	}, [pageNo, pageSize, t]);

	useEffect(() => {
		void fetchAllGuidelines();
	}, [fetchAllGuidelines]);

	const handlePageChange = useCallback((page: number): void => {
		setPageNo(page);
	}, []);

	const handlePageSizeChange = useCallback((newPageSize: number): void => {
		setPageSize(newPageSize);
	}, []);

	const tableColumns: TableColumn[] = [
		{
			title: t('Related Product No'),
			field: 'receivedProductID',
			cellStyle: {
				padding: '6px 8px'
			}
		},
		{
			title: t('Item Name'),
			field: 'receivedProductName',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Category'),
			field: 'category',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: ReceivedStock) => {
				const categoryColors: { [key: string]: { text: string; bg: string } } = {
					'PERSONAL CARE': { text: '#388E3C', bg: '#E8F5E9' },
					BEVERAGE: { text: '#1976D2', bg: '#E3F2FD' },
					FOOD: { text: '#F57C00', bg: '#FFF3E0' },
					'HEALTH & WELLNESS': { text: '#9C27B0', bg: '#F3E5F5' },
					'FRAGRANCE & HOME': { text: '#D32F2F', bg: '#FFEBEE' },
					'PET CARE': { text: '#C2185B', bg: '#FCE4EC' }
				};

				const category = rowData.category.toUpperCase();
				const color = categoryColors[category] || { text: '#455A64', bg: '#ECEFF1' };

				return (
					<span
						style={{
							display: 'inline-block',
							padding: '4px 12px',
							borderRadius: '16px',
							color: color.text,
							backgroundColor: color.bg,
							fontSize: '12px',
							fontWeight: 500,
							textAlign: 'center',
							minWidth: '80px'
						}}
					>
						{t(rowData.category)}
					</span>
				);
			}
		},
		{
			title: t('Remark'),
			field: 'remark',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Qty'),
			field: 'qty',
			cellStyle: {
				padding: '4px 8px'
			}
		},
		{
			title: t('Date'),
			field: 'createdAt',
			cellStyle: {
				padding: '4px 8px'
			},
			render: (rowData: ReceivedStock) => {
				return new Date(rowData.createdAt).toLocaleDateString();
			}
		}
	];

	const handleConfirmStatusChange = useCallback(async (): Promise<void> => {
		toggleActiveModal();

		if (!selectedActiveRowData?._id) return;

		try {
			const data = {
				is_active: true // Toggle as needed
			};
			// await updateShippingTypeStatus(selectedActiveRowData._id, data);
			await fetchAllGuidelines();
			toast.success(t('Status updated successfully'));
		} catch (error) {
			toast.error(t('Error updating status'));
		}
	}, [selectedActiveRowData, toggleActiveModal, fetchAllGuidelines, t]);

	const handleRowDelete = useCallback(
		(rowData: ReceivedStock): void => {
			// Convert ReceivedStock to GuideType
			const deleteData: GuideType = {
				_id: rowData._id,
				receivedProductID: rowData.receivedProductID,
				receivedProductName: rowData.receivedProductName,
				remark: rowData.remark,
				createdAt: rowData.createdAt
			};
			setSelectedDeleteRowData(deleteData);
			toggleDeleteModal();
		},
		[toggleDeleteModal]
	);

	const handleAlertForm = useCallback(async (): Promise<void> => {
		toggleDeleteModal();

		if (!selectedDeleteRowData?._id) return;

		try {
			await deleteReceivedStocks(selectedDeleteRowData._id);
			await fetchAllGuidelines();
			toast.success(t('Guideline deleted successfully'));
		} catch (error) {
			toast.error(t('Error deleting Guideline'));
		}
	}, [selectedDeleteRowData, toggleDeleteModal, fetchAllGuidelines, t]);

	const handleView = useCallback(
		(rowData: ReceivedStock): void => {
			// Pass ReceivedStock directly to view modal
			setSelectedViewRowData(rowData);
			toggleShippingTypeViewModal();
		},
		[toggleShippingTypeViewModal]
	);

	const handleEdit = useCallback(
		(rowData: ReceivedStock): void => {
			// Convert ReceivedStock to ReceivedProduct format for editing
			const convertedData: ReceivedProduct = {
				_id: rowData._id,
				receivedProductID: rowData.receivedProductID,
				receivedProductName: rowData.receivedProductName,
				qty: rowData.qty,
				remark: rowData.remark,
				category: rowData.category,
				createdBy: rowData.createdBy,
				createdAt: rowData.createdAt,
				updatedAt: rowData.updatedAt,
				__v: rowData.__v
			};
			setSelectedEditRowData(convertedData);
			toggleShippingTypeEditModal();
		},
		[toggleShippingTypeEditModal]
	);

	const handleNewShippingType = useCallback((): void => {
		toggleNewShippingTypeModal();
	}, [toggleNewShippingTypeModal]);

	const handleSubmit = useCallback((values: FormValues, _actions: FormikHelpers<FormValues>): void => {
		console.log('Form values:', values);
	}, []);

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title="Stock Management / Received Stock" />
			<Formik
				initialValues={{ shippingType: '', category: '', status: '' }}
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
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="pt-[5px!important]"
							>
								{/* Add form fields here if needed */}
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="pt-[5px!important]"
							>
								{/* Add form fields here if needed */}
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								lg={3}
								xl={2}
								className="pt-[5px!important]"
							>
								{/* Add form fields here if needed */}
							</Grid>
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
									startIcon={<AddCircleOutlineIcon/>}
									onClick={handleNewShippingType}
								>
									{t('Create Received Stocks')}
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
						title="Received Stock Table"
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
						records={sampleData}
						tableRowViewHandler={handleView}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
					/>
				</Grid>
			</Grid>
			{isOpenNewShippingTypeModal && (
				<ReceivedEditModel
					isOpen={isOpenNewShippingTypeModal}
					toggleModal={toggleNewShippingTypeModal}
					isTableMode="new"
					clickedRowData={{}}
					fetchAllGuidelines={fetchAllGuidelines}
				/>
			)}
			{isOpenShippingTypeViewModal && selectedViewRowData && (
				<NewVehicleManagement
					isOpen={isOpenShippingTypeViewModal}
					toggleModal={toggleShippingTypeViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllGuidelines={fetchAllGuidelines}
				/>
			)}
			{isOpenShippingTypeEditModal && selectedEditRowData && (
				<NewVehicleManagement
					isOpen={isOpenShippingTypeEditModal}
					toggleModal={toggleShippingTypeEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllGuidelines={fetchAllGuidelines}
				/>
			)}
			{isOpenActiveModal && selectedActiveRowData && (
				<NewReceivedActiveComp
					toggleModal={toggleActiveModal}
					isOpen={isOpenActiveModal}
					clickedRowData={selectedActiveRowData}
					handleAlertForm={handleConfirmStatusChange}
				/>
			)}
			{isOpenDeleteModal && selectedDeleteRowData && (
				<ReceivedDeleteAlert
					toggleModal={toggleDeleteModal}
					isOpen={isOpenDeleteModal}
					clickedRowData={selectedDeleteRowData}
					handleAlertForm={handleAlertForm}
				/>
			)}
		</div>
	);
}

export default ReceivedStocks;
