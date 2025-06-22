import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NavigationViewComp from '../../../../common/FormComponents/NavigationViewComp';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';
import CategoryEditModel from './components/CategoryEditModel';
import NewCategoryActiveComp from './components/NewCategoryActiveComp';
import CategoryDeleteAlert from './components/CategoryDeleteAlert';
import {
	deleteCategory,
	fetchAllCategoriesWithPagination
} from '../../../../axios/services/mega-city-services/category-services/Category';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// Define interfaces
interface Category {
	categoryId: string;
	categoryName: string;
	reason: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	_id: string;
	__v: number;
	isActive?: boolean; // Added for consistency
}

interface Pagination {
	currentPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	size: number;
	totalCategories: number;
	totalPages: number;
}

interface FetchResponse {
	categories: Category[];
	pagination: Pagination;
}

interface FormValues {
	category: string;
	status: string;
}

interface TableColumn {
	title: string;
	field: string;
	cellStyle: {
		padding: string;
	};
	render?: (rowData: Category) => JSX.Element | string; // Added for type safety
}

interface CategoryModifiedData extends Category {
	isActive: boolean;
}

// Added missing updateCategoryStatus type
interface UpdateStatusPayload {
	isActive: boolean;
}

// Added for type safety in table rendering
type RowData = Category & {
	[key: string]: any;
};

function Category(): JSX.Element {
	const { t } = useTranslation('CategoryTypes');

	const [pageNo, setPageNo] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(5);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isTableLoading, setTableLoading] = useState<boolean>(false);
	const [isOpenNewCategoryModal, setIsOpenNewCategoryModal] = useState<boolean>(false);
	const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
	const [isOpenActiveModal, setOpenActiveModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
	const [selectedActiveRowData, setSelectedActiveRowData] = useState<CategoryModifiedData | null>(null);
	const [selectedDeleteRowData, setSelectedDeleteRowData] = useState<Category | null>(null);
	const [selectedEditRowData, setSelectedEditRowData] = useState<CategoryModifiedData | null>(null);

	const toggleNewCategoryModal = useCallback((): void => {
		setIsOpenNewCategoryModal((prev) => !prev);
	}, []);

	const toggleEditModal = useCallback((): void => {
		setIsOpenEditModal((prev) => !prev);
	}, []);

	const toggleActiveModal = useCallback((): void => {
		setOpenActiveModal((prev) => !prev);
	}, []);

	const toggleDeleteModal = useCallback((): void => {
		setOpenDeleteModal((prev) => !prev);
	}, []);

	const fetchCategories = useCallback(async (): Promise<void> => {
		setTableLoading(true);
		try {
			const response = (await fetchAllCategoriesWithPagination(pageNo + 1, pageSize)) as FetchResponse;

			if (response?.categories && Array.isArray(response.categories)) {
				setCategories(response.categories);
				setTotalCount(response.pagination.totalCategories);
			} else {
				console.error('Unexpected data format:', response);
				setCategories([]);
				setTotalCount(0);
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
			toast.error(t('errorFetchingData'));
			setCategories([]);
			setTotalCount(0);
		} finally {
			setTableLoading(false);
		}
	}, [pageNo, pageSize, t]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const handlePageChange = useCallback((page: number): void => {
		setPageNo(page);
	}, []);

	const handlePageSizeChange = useCallback((newPageSize: number): void => {
		setPageSize(newPageSize);
		setPageNo(0);
	}, []);

	// Added view handler
	const handleView = useCallback((rowData: Category): void => {
		setSelectedEditRowData({
			...rowData,
			isActive: rowData.isActive ?? true
		});
		setIsOpenEditModal(true);
	}, []);

	const tableColumns: TableColumn[] = [
		{
			title: t('Category ID'),
			field: 'categoryId',
			cellStyle: { padding: '6px 8px' }
		},
		{
			title: t('Category'),
			field: 'categoryName',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: Category) => {
				// All chips in green color
				const color = { text: '#388E3C', bg: '#E8F5E9' };

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
						{t(rowData.categoryName)}
					</span>
				);
			}
		},
		{
			title: t('Reason'),
			field: 'reason',
			cellStyle: { padding: '4px 8px' }
		},
		{
			title: t('Created By'),
			field: 'createdBy',
			cellStyle: { padding: '4px 8px' }
		},
		{
			title: t('Created At'),
			field: 'createdAt',
			cellStyle: { padding: '4px 8px' },
			render: (rowData: Category) => new Date(rowData.createdAt).toLocaleDateString()
		}
	];
	// Mock updateCategoryStatus (replace with actual implementation)
	const updateCategoryStatus = async (id: string, payload: UpdateStatusPayload): Promise<void> => {
		// Implement actual API call
		console.log('Updating status for id:', id, payload);
	};

	const handleConfirmStatusChange = useCallback(async (): Promise<void> => {
		if (!selectedActiveRowData) return;

		try {
			await updateCategoryStatus(selectedActiveRowData._id, {
				isActive: !selectedActiveRowData.isActive
			});
			await fetchCategories();
			toast.success(t('statusUpdated'));
			toggleActiveModal();
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error(t('errorUpdatingStatus'));
		}
	}, [selectedActiveRowData, fetchCategories, t, toggleActiveModal]);

	const handleRowDelete = useCallback(
		(rowData: Category): void => {
			setSelectedDeleteRowData(rowData);
			toggleDeleteModal();
		},
		[toggleDeleteModal]
	);

	const handleAlertForm = useCallback(async (): Promise<void> => {
		if (!selectedDeleteRowData?._id) return;

		try {
			// Implement actual delete API call
			await deleteCategory(selectedDeleteRowData._id);
			await fetchCategories();
			toast.success(t('categoryDeleted'));
			toggleDeleteModal();
		} catch (error) {
			toast.error(t('errorDeletingCategory'));
		}
	}, [selectedDeleteRowData, fetchCategories, t, toggleDeleteModal]);

	const handleEdit = useCallback(
		(rowData: Category): void => {
			setSelectedEditRowData({
				...rowData,
				isActive: rowData.isActive ?? true
			});
			toggleEditModal();
		},
		[toggleEditModal]
	);

	const handleSubmit = useCallback((values: FormValues, actions: FormikHelpers<FormValues>): void => {
		console.log('Form values:', values);
		actions.setSubmitting(false);
	}, []);

	return (
		<div className="min-w-full max-w-[100vw]">
			<NavigationViewComp title={t('stock management / categories')} />

			<Formik
				initialValues={{ category: '', status: '' }}
				onSubmit={handleSubmit}
			>
				{() => (
					<Form>
						<Grid
							container
							spacing={2}
							className="pt-[10px] pr-[30px] mx-auto"
							justifyContent="flex-end" // Aligns content to the right
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
									startIcon={<AddCircleOutlineIcon/>}
								>
									{t('Create Category')}
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
						records={categories}
						tableRowEditHandler={handleEdit}
						tableRowDeleteHandler={handleRowDelete}
						tableRowViewHandler={handleView}
						isColumnChoser
						disableColumnFiltering
					/>
				</Grid>
			</Grid>

			{isOpenNewCategoryModal && (
				<CategoryEditModel
					isOpen={isOpenNewCategoryModal}
					toggleModal={toggleNewCategoryModal}
					isTableMode="new"
					clickedRowData={{} as CategoryModifiedData}
					fetchAllCategories={fetchCategories}
				/>
			)}

			{isOpenEditModal && selectedEditRowData && (
				<CategoryEditModel
					isOpen={isOpenEditModal}
					toggleModal={toggleEditModal}
					clickedRowData={selectedEditRowData}
					isTableMode="edit"
					fetchAllCategories={fetchCategories}
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
