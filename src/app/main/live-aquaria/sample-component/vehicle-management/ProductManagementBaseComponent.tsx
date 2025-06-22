import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import VehicleManagementActiveComp from './components/VehicleManagementActiveComp';
import NewVehicleDeleteAlertForm from './components/NewVehicleDeleteAlertForm';
import ProductManagement from './components/ProductManagement';
import UpdateProduct from './components/UpdateProduct';
import { deleteProduct, fetchAllProducts } from '../../../../axios/services/mega-city-services/common/CommonService';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// Define TypeScript interfaces based on actual API response
interface Product {
	_id: string;
	itemCode: string;
	description: string;
	category: string;
	brandName: string;
	price: number;
	isActive: boolean;
	updatedBy: string;
	categoryCode: string;
	createdAt: string;
	expireDate: string;
	manufactureDate: string;
	manufacturerCode: string;
	manufacturerName: string;
	stocks: number;
	updatedAt: string;
	warrantyClaimProcess: string;
	warrantyDetails: string;
	warrantyPeriod: number;
	__v: number;
}

// Updated interface to match actual API response structure
interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalProducts: number;
	size: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface ApiResponse {
	products: Product[];
	pagination: PaginationInfo;
}

interface FormValues {
	product: string;
	category: string;
	status: string;
}

function ProductManagementBaseComponent() {
	const { t } = useTranslation('productManagement');

	const [pageNo, setPageNo] = useState<number>(1); // API uses 1-based pagination
	const [pageSize, setPageSize] = useState<number>(5);
	const [count, setCount] = useState<number>(0);
	const [isOpenProductViewModal, setIsOpenProductViewModal] = useState<boolean>(false);
	const [isOpenProductEditModal, setIsOpenProductEditModal] = useState<boolean>(false);
	const [isOpenNewProductModal, setIsOpenNewProductModal] = useState<boolean>(false);
	const [sampleData, setSampleData] = useState<Product[]>([]);
	const [isTableLoading, setTableLoading] = useState<boolean>(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<Product | null>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<Product | null>(null);
	const [selectedViewRowData, setSelectedViewRowData] = useState<Product | null>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<Product | null>(null);
	const [isOpenActiveModal, setOpenActiveModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const toggleProductViewModal = () => setIsOpenProductViewModal(!isOpenProductViewModal);
	const toggleProductEditModal = () => setIsOpenProductEditModal(!isOpenProductEditModal);
	const toggleNewProductModal = () => setIsOpenNewProductModal(!isOpenNewProductModal);
	const toggleActiveModal = () => setOpenActiveModal(!isOpenActiveModal);
	const toggleDeleteModal = () => setOpenDeleteModal(!isOpenDeleteModal);

	const handlePageChange = (page: number) => {
		// Convert from 0-based (MaterialTable) to 1-based (API)
		setPageNo(page + 1);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPageNo(1); // Reset to first page when page size changes
	};

	useEffect(() => {
		fetchAllProductsFromBackend();
	}, [pageNo, pageSize]);

	const tableColumns = [
		{
			title: t('Item Code'),
			field: 'itemCode',
			cellStyle: { padding: '6px 8px' }
		},
		{
			title: t('Item Name'),
			field: 'itemName',
			cellStyle: { padding: '6px 8px' }
		},
		{
			title: t('Category'),
			field: 'category',
			cellStyle: { padding: '6px 8px' },
			render: (rowData: Product) => {
				// Use a single blue/light blue style for all categories
				const text = '#1976D2'; // Blue text
				const bg = '#E3F2FD';   // Light blue background

				return (
					<span
						style={{
							display: 'inline-block',
							padding: '6px 12px',
							borderRadius: '16px',
							color: text,
							backgroundColor: bg,
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
			title: t('Quantity'),
			field: 'stocks',
			cellStyle: { padding: '6px 8px' }
		},
		{
			title: t('Brand Name'),
			field: 'brandName',
			cellStyle: { padding: '6px 8px' }
		},
		{
			title: t('Price'),
			field: 'price',
			cellStyle: { padding: '6px 8px' },
			render: (rowData: Product) => `LKR ${rowData.price.toFixed(2)}`
		},
		{
			title: t('Active'),
			field: 'isActive',
			cellStyle: { padding: '6px 8px' },
			render: (rowData: Product) => {
				const active = rowData.isActive;
				const color = active ? '#388E3C' : '#D32F2F';
				const bg = active ? '#E8F5E9' : '#FBE9E7';
				const label = active ? t('Active') : t('Inactive');
				return (
					<span
						style={{
							display: 'inline-block',
							padding: '4px 12px',
							borderRadius: '16px',
							color,
							backgroundColor: bg,
							fontSize: '12px',
							fontWeight: 500,
							textAlign: 'center',
							minWidth: '80px'
						}}
					>
						{label}
					</span>
				);
			}
		},
		{
			title: t('Updated By'),
			field: 'updatedBy',
			cellStyle: { padding: '4px 8px' }
		}
	];

	const fetchAllProductsFromBackend = async () => {
		setTableLoading(true);
		try {
			const response: ApiResponse = await fetchAllProducts(pageNo, pageSize);
			console.log('API Response:', response); // Debug log
			console.log('Fetched products:', response.products?.length, 'PageSize:', pageSize);

			// Check if response has the expected structure
			if (response && Array.isArray(response.products)) {
				setSampleData(response.products);

				// Use pagination info from the response
				if (response.pagination) {
					setCount(response.pagination.totalProducts);
				} else {
					setCount(response.products.length);
				}
			} else {
				console.error('Unexpected response structure:', response);
				setSampleData([]);
				setCount(0);
			}
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error(t('Error fetching data'));
			setSampleData([]);
			setCount(0);
		} finally {
			setTableLoading(false);
		}
	};

	const handleConfirmStatusChange = async () => {
		toggleActiveModal();
		const id = selectedActiveRowData?._id ?? null;

		if (!id) return;

		try {
			const data = {
				isActive: !selectedActiveRowData?.isActive
			};
			// TODO: Replace with the correct product status update function
			// await updateProductStatus(id, data);
			await fetchAllProductsFromBackend();
			toast.success(t('Status updated successfully'));
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error(t('Error updating status'));
		}
	};

	const handleRowDelete = async (rowData: Product) => {
		setSelectedDeleteRowData(rowData);
		toggleDeleteModal();
	};

	const handleAlertForm = async () => {
		toggleDeleteModal();
		const id = selectedDeleteRowData?._id ?? null;

		if (!id) return;

		try {
			await deleteProduct(id);
			await fetchAllProductsFromBackend();
			toast.success(t('Product deleted successfully'));
		} catch (error) {
			toast.error(t('Error deleting product'));
		}
	};

	const handleView = (rowData: Product) => {
		setSelectedViewRowData(rowData);
		toggleProductViewModal();
	};

	const handleEdit = (rowData: Product) => {
		setSelectedEditRowData(rowData);
		toggleProductEditModal();
	};

	const handleNewProduct = () => {
		toggleNewProductModal();
	};

	const handleSubmit = (values: FormValues) => {
		// Placeholder for form submission logic
		console.log('Form values:', values);
	};

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title={t('Product')} />

			<Formik
				initialValues={{ product: '', category: '', status: '' }}
				onSubmit={handleSubmit}
			>
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
								onClick={handleNewProduct}
							>
								{t('Create Product')}
							</Button>
						</Grid>
					</Grid>
				</Form>
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
						title={t('Product Management Table')}
						tableColumns={tableColumns}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						pageSize={pageSize}
						pageSizeOptions={[5, 10, 25]}
						loading={isTableLoading}
						setPageSize={setPageSize}
						pageIndex={pageNo - 1} // Convert back to 0-based for MaterialTable
						count={count}
						records={sampleData}
						tableRowViewHandler={handleView}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
						disableColumnFiltering
						isColumnChoser
					/>
				</Grid>
			</Grid>

			{isOpenNewProductModal && (
				<ProductManagement
					isOpen={isOpenNewProductModal}
					toggleModal={toggleNewProductModal}
					clickedRowData={null} // Pass null for new product
					fetchAllProducts={fetchAllProductsFromBackend}
				/>
			)}

			{isOpenProductViewModal && (
				<UpdateProduct
					isOpen={isOpenProductViewModal}
					toggleModal={toggleProductViewModal}
					clickedRowData={selectedViewRowData}
					isTableMode="view"
					fetchAllProducts={fetchAllProductsFromBackend}
				/>
			)}

			{isOpenProductEditModal && (
				<UpdateProduct
					isOpen={isOpenProductEditModal}
					toggleModal={toggleProductEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllProducts={fetchAllProductsFromBackend}
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

export default ProductManagementBaseComponent;
