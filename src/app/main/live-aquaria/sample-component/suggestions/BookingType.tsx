import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Typography,
	CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import {
	fetchAllSuggestions
} from '../../../../axios/services/mega-city-services/common/CommonService';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';

function SuggestionsTable() {
	const { t } = useTranslation();
	const [suggestions, setSuggestions] = useState([]);
	const [pageNo, setPageNo] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchSuggestionsData();
	}, [pageNo, pageSize]);

	const fetchSuggestionsData = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const response = await fetchAllSuggestions(pageNo, pageSize);
			if (response.result && response.result.content) {
				setSuggestions(response.result.content);
			} else {
				throw new Error('No suggestions found');
			}
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			const errorMessage = error instanceof Error ? error.message : 'Error fetching data';
			setError(errorMessage);
			toast.error(errorMessage);
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	}, [pageNo, pageSize]);

	const handlePageChange = (newPage) => {
		setPageNo(newPage);
	};

	const handlePageSizeChange = (newSize) => {
		setPageSize(newSize);
		setPageNo(0);
	};

	const handleEdit = (rowData) => {
		// Handle edit functionality here
		console.log('Edit:', rowData);
	};

	const handleView = (rowData) => {
		// Handle view functionality here
		console.log('View:', rowData);
	};

	const tableColumns = [
		{ title: 'ID', field: 'id' },
		{ title: 'Full Name', field: 'fullName' },
		{ title: 'Department', field: 'department' },
		{ title: 'Employee Code', field: 'employeeCode' },
		{ title: 'Suggestion', field: 'suggestion' },
		{ title: 'Saved At', field: 'savedAt' },
	];

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography color="error" variant="h6">
					{error}
				</Typography>
				<Button
					onClick={() => {
						setError('');
						fetchSuggestionsData();
					}}
					variant="contained"
					sx={{ mt: 2 }}
				>
					Retry
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<MaterialTableWrapper
				title={
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<BookmarkAddedIcon /> {t('Suggestions')}
					</Box>
				}
				tableColumns={tableColumns}
				data={suggestions}
				handlePageChange={handlePageChange}
				handlePageSizeChange={handlePageSizeChange}
				loading={loading}
				page={pageNo}
				pageSize={pageSize}
				totalCount={suggestions.length} // This should be updated with total count from API if available
				externalEdit={handleEdit}
				externalView={handleView}
			/>
		</Box>
	);
}

export default SuggestionsTable;