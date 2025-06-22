import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import TextFormField from '../../../../../common/FormComponents/FormTextField';
import {
	handleCreateGuideline,
	handleUpdateGuidelineAPI
} from '../../../../../axios/services/mega-city-services/guideline-services/GuidelineService';

interface GuideType {
	relatedProductId?: string;
	relatedProductNumber: string;
	itemName: string;
	remark: string;
	date: string;
}

interface Image {
	id: number;
	link: string;
	file: File;
	base64: string;
}

interface Props {
	isOpen: boolean;
	toggleModal: () => void;
	clickedRowData: GuideType | null;
	fetchAllGuidelines: () => void;
	isTableMode: 'view' | 'edit' | 'new';
}

// eslint-disable-next-line react/function-component-definition
const GuidelineEditModel: React.FC<Props> = ({
	isOpen,
	toggleModal,
	clickedRowData,
	isTableMode,
	fetchAllGuidelines
}) => {
	const { t } = useTranslation('shippingTypes');
	const [isDataLoading, setDataLoading] = useState<boolean>(false);

	const schema = yup.object().shape({
		relatedProductNumber: yup.string().required(t('Related Product Number is required')),
		itemName: yup.string().required(t('Item Name is required')),
		remark: yup.string().required(t('Remark is required')),
		date: yup.string().required(t('Date is required'))
	});

	const handleSubmit = async (values: GuideType) => {
		const data: GuideType = {
			relatedProductId: values.relatedProductId,
			relatedProductNumber: values.relatedProductNumber,
			itemName: values.itemName,
			remark: values.remark,
			date: values.date
		};

		try {
			setDataLoading(true);

			if (clickedRowData?.relatedProductId) {
				await handleUpdateGuidelineAPI(data);
				toast.success('Guideline updated successfully');
			} else {
				await handleCreateGuideline(data);
				toast.success('Guideline created successfully');
			}

			fetchAllGuidelines();
			toggleModal();
		} catch (e) {
			console.error('Error:', e);
			toast.error('Error while saving guideline');
		} finally {
			setDataLoading(false);
		}
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
					{t('Issued Stock model')}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Formik
					initialValues={{
						relatedProductId: clickedRowData?.relatedProductId || '',
						relatedProductNumber: clickedRowData?.relatedProductNumber || '',
						itemName: clickedRowData?.itemName || '',
						remark: clickedRowData?.remark || '',
						date: clickedRowData?.date || ''
					}}
					onSubmit={handleSubmit}
					validationSchema={schema}
				>
					{({ errors, touched }) => (
						<Form>
							<Grid
								container
								spacing={2}
							>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>{t('Related Product Id')}</Typography>
									<Field
										disabled={isTableMode === 'view' || isTableMode === 'new'}
										name="relatedProductId"
										component={TextFormField}
										fullWidth
										size="small"
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Related Product Number')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="relatedProductNumber"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.relatedProductNumber && Boolean(errors.relatedProductNumber)}
										helperText={touched.relatedProductNumber && errors.relatedProductNumber}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Item Name')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="itemName"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.itemName && Boolean(errors.itemName)}
										helperText={touched.itemName && errors.itemName}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Remark')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="remark"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.remark && Boolean(errors.remark)}
										helperText={touched.remark && errors.remark}
									/>
								</Grid>
								<Grid
									item
									lg={3}
									md={3}
									sm={6}
									xs={12}
								>
									<Typography>
										{t('Date')} <span className="text-red-500">*</span>
									</Typography>
									<Field
										disabled={isTableMode === 'view'}
										name="date"
										component={TextFormField}
										fullWidth
										size="small"
										error={touched.date && Boolean(errors.date)}
										helperText={touched.date && errors.date}
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
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-medium py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
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
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-medium py-0 rounded-[6px] bg-gray-300 hover:bg-gray-300/80"
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

export default GuidelineEditModel;
