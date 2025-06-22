import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import { createNewCategory } from '../../../../../axios/services/mega-city-services/category-services/Category';
import {updateCategory} from "../../../../../axios/services/mega-city-services/common/CommonService";

interface CategoryType {
	categoryId: string;
	categoryName: string;
	reason: string;
	createdBy: string;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: CategoryType | null;
	fetchAllCategories: () => void;
	isTableMode: 'view' | 'edit' | 'new';
}

const CategoryEditModal: React.FC<Props> = ({
	isOpen,
	toggleModal,
	clickedRowData,
	fetchAllCategories,
	isTableMode
}) => {
	const { t } = useTranslation('categories');
	const [isDataLoading, setDataLoading] = useState<boolean>(false);

	console.log('clickedRowData clickedRowData', clickedRowData);

	const generateCategoryId = (): string => {
		return `CMCATNO${Math.floor(Math.random() * 1000)}M${new Date().getMonth() + 1}D${new Date().getDate()}`;
	};

	const validationSchema = yup.object().shape({
		categoryId: yup.string().required(t('Category ID is required')).trim(),
		categoryName: yup
			.string()
			.required(t('Category Name is required'))
			.max(100, t('Category name cannot exceed 100 characters'))
			.trim(),
		reason: yup.string().required(t('Reason is required')).trim(),
		createdBy: yup.string().required(t('Created By is required')).trim()
	});

	const handleUpdateCategory = async (values: CategoryType) => {

		const data: CategoryType = {
			categoryId: values.categoryId || generateCategoryId(),
			categoryName: values.categoryName,
			reason: values.reason,
			createdBy: values.createdBy
		};

		try {
			setDataLoading(true);

			if (clickedRowData?.categoryId && isTableMode === 'edit') {
				await updateCategory(clickedRowData._id, data);
				fetchAllCategories();
				toggleModal();
				toast.success(t('Category updated successfully'));
			} else {
				await createNewCategory(data);
				fetchAllCategories();
				toggleModal();
				toast.success(t('Category created successfully'));
			}
		} catch (error) {
			toast.error(t('Error while saving category'));
		} finally {
			setDataLoading(false);
		}
	};

	const initialValues: CategoryType = {
		categoryId: clickedRowData?.categoryId || generateCategoryId(),
		categoryName: clickedRowData?.categoryName || '',
		reason: clickedRowData?.reason || '',
		createdBy: clickedRowData?.createdBy || ''
	};

	return (
		<Dialog
			open={isOpen}
			maxWidth="xl"
			onClose={toggleModal}
			PaperProps={{ style: { top: '40px', margin: 0, position: 'absolute' } }}
		>
			<DialogTitle>
				<Typography
					variant="h6"
					color="textSecondary"
					fontWeight={400}
				>
					{t('Category Management')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={initialValues}
					onSubmit={handleUpdateCategory}
					validationSchema={validationSchema}
					enableReinitialize
				>
					{({ errors, touched }) => (
						<Form>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Category ID')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled
										name="categoryId"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.categoryId && Boolean(errors.categoryId)}
										helperText={touched.categoryId && errors.categoryId}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Category Name')} <span className="text-red-500">*</span>
									</Typography>
									{/* TODO manage properly */}
									<Field
										disabled={isTableMode === 'view'}
										name="categoryName"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.categoryName && Boolean(errors.categoryName)}
										helperText={touched.categoryName && errors.categoryName}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Reason')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="reason"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.reason && Boolean(errors.reason)}
										helperText={touched.reason && errors.reason}
									/>
								</Grid>
								<Grid
									item
									lg={4}
									md={4}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Created By')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="createdBy"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.createdBy && Boolean(errors.createdBy)}
										helperText={touched.createdBy && errors.createdBy}
									/>
								</Grid>
								<Grid
									item
									lg={12}
									className="flex justify-end gap-2"
								>
									<Button
										type="submit"
										variant="contained"
										disabled={isTableMode === 'view' || isDataLoading}
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
									>
										{t('Save')}
										{isDataLoading && (
											<CircularProgress
												size={24}
												className="ml-2"
											/>
										)}
									</Button>
									<Button
										variant="contained"
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
										onClick={toggleModal}
									>
										{t('Cancel')}
									</Button>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default CategoryEditModal;
