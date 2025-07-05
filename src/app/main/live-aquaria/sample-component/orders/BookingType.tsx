import React, { useState, useCallback, useEffect } from 'react';
import {
	Box,
	Button,
	Grid,
	Paper,
	styled,
	Typography,
	CircularProgress,
	Checkbox,
	FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import TextFormField from '../../../../common/FormComponents/FormTextField';

// --- STYLED COMPONENTS ---

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(3),
	borderRadius: '8px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
	backgroundColor: '#fff',
	marginBottom: theme.spacing(3)
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	fontWeight: 500,
	color: theme.palette.text.primary
}));

const SuggestionsCanvas = styled(Box)(({ theme }) => ({
	marginTop: theme.spacing(4),
	padding: theme.spacing(3),
	backgroundColor: '#f0f2f5',
	borderRadius: '8px',
	border: `1px dashed ${theme.palette.divider}`,
	minHeight: '300px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
	overflow: 'hidden',
	position: 'relative'
}));

// --- UPDATED --- Animation for when the AI is talking
const TalkingIndicator = styled(Box)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(2),
	right: theme.spacing(2),
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	padding: theme.spacing(0.5, 1.5),
	borderRadius: '16px',
	backgroundColor: 'rgba(0, 0, 0, 0.05)',
	'& .voice-bar': {
		width: '6px',
		height: '20px',
		margin: '0 1px', //  Bars are now even closer
		borderRadius: '4px',
		background: `linear-gradient(180deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
		display: 'inline-block',
		animation: 'modern-speak 1.4s infinite ease-in-out'
	},
	'@keyframes modern-speak': {
		'0%, 40%, 100%': { transform: 'scaleY(0.2)' },
		'20%': { transform: 'scaleY(1.0)' }
	},
	// Animation delays for 5 bars
	'& .voice-bar:nth-of-type(1)': { animationDelay: '-1.2s' },
	'& .voice-bar:nth-of-type(2)': { animationDelay: '-1.0s' },
	'& .voice-bar:nth-of-type(3)': { animationDelay: '-0.8s' },
	'& .voice-bar:nth-of-type(4)': { animationDelay: '-0.6s' },
	'& .voice-bar:nth-of-type(5)': { animationDelay: '-0.4s' }
}));

const AIAnimation = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing(3),
	'& .glowing-orb': {
		width: '100px',
		height: '100px',
		borderRadius: '50%',
		background: 'radial-gradient(circle, rgba(121, 205, 255, 0.8) 0%, rgba(68, 149, 255, 0.5) 100%)',
		position: 'relative',
		animation: 'pulse 2s infinite ease-in-out'
	},
	'@keyframes pulse': {
		'0%': {
			transform: 'scale(0.95)',
			boxShadow: `
0 0 0 0 rgba(0, 123, 255, 0.7),
	0 0 5px rgba(0, 123, 255, 0.5),
	0 0 10px rgba(0, 123, 255, 0.3),
	0 0 20px rgba(0, 123, 255, 0.2)`
		},
		'70%': {
			transform: 'scale(1)',
			boxShadow: `
0 0 0 10px rgba(0, 123, 255, 0),
	0 0 15px rgba(0, 123, 255, 0.7),
	0 0 25px rgba(0, 123, 255, 0.5),
	0 0 40px rgba(0, 123, 255, 0.3)`
		},
		'100%': {
			transform: 'scale(0.95)',
			boxShadow: `
0 0 0 0 rgba(0, 123, 255, 0),
	0 0 5px rgba(0, 123, 255, 0.5),
	0 0 10px rgba(0, 123, 255, 0.3),
	0 0 20px rgba(0, 123, 255, 0.2)`
		}
	}
}));

// --- INTERFACES ---

interface SearchFormValues {
	firstName: string;
	lastName: string;
	department: string;
	employeeCode: string;
}

interface Suggestion {
	id: number;
	text: string;
	approved: boolean;
}

// --- MAIN COMPONENT ---

function BookingType() {
	const { t } = useTranslation();
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [hasSearched, setHasSearched] = useState<boolean>(false);
	const [isAccepting, setIsAccepting] = useState<boolean>(false);
	const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

	useEffect(() => {
		const loadVoices = () => {
			const availableVoices = window.speechSynthesis.getVoices();

			if (availableVoices.length > 0) {
				setSpeechVoices(availableVoices);
			}
		};
		window.speechSynthesis.onvoiceschanged = loadVoices;
		loadVoices();
	}, []);

	const speak = (text: string, onEndCallback?: () => void) => {
		const utterance = new SpeechSynthesisUtterance(text);
		const getNaturalVoice = (): SpeechSynthesisVoice | null => {
			const preferredVoices = [
				'Google UK English Female',
				'Google US English',
				'Microsoft Zira Desktop - English (United States)',
				'Samantha',
				'Susan',
				'Female'
			];
			for (const name of preferredVoices) {
				const voice = speechVoices.find((v) => v.name === name);

				if (voice) return voice;
			}
			const femaleVoice = speechVoices.find(
				(v) => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')
			);
			return femaleVoice || null;
		};

		const naturalVoice = getNaturalVoice();

		if (naturalVoice) {
			utterance.voice = naturalVoice;
		}

		utterance.pitch = 1;
		utterance.rate = 0.9;
		utterance.onend = onEndCallback;
		window.speechSynthesis.speak(utterance);
	};

	const speakQueue = (texts: string[]) => {
		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
		}

		let currentIndex = 0;
		setIsSpeaking(true);

		function speakNext() {
			if (currentIndex < texts.length) {
				const text = texts[currentIndex];
				currentIndex++;
				speak(text, speakNext);
			} else {
				setIsSpeaking(false);
			}
		}

		speakNext();
	};

	const validationSchema = yup.object().shape({
		firstName: yup.string(),
		lastName: yup.string(),
		department: yup.string(),
		employeeCode: yup.string()
	});

	const handleSearch = useCallback(
		async (values: SearchFormValues) => {
			setIsSearching(true);
			setSuggestions([]);
			setHasSearched(true);
			console.log('Searching with values:', values);
			await new Promise((resolve) => setTimeout(resolve, 2500));
			const mockSuggestions: Suggestion[] = [
				{ id: 1, text: `This employee is recommended for a salary increment.`, approved: false },
				{ id: 2, text: `This employee is recommended for the Best Employee Award.`, approved: false },
				{ id: 3, text: 'Schedule a follow-up meeting next week.', approved: false }
			];
			setSuggestions(mockSuggestions);
			setIsSearching(false);
			toast.success(t('Suggestions generated!'));

			const audioQueue = ['what suggestions do you need to accept?', ...mockSuggestions.map((s) => s.text)];
			speakQueue(audioQueue);
		},
		[t, speechVoices]
	);

	const handleReset = (resetForm: () => void) => {
		resetForm();
		setIsSearching(false);
		setSuggestions([]);
		setHasSearched(false);

		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		}

		toast.info(t('Search form has been reset'));
	};

	const handleSuggestionToggle = (id: number) => {
		setSuggestions(
			suggestions.map((suggestion) =>
				suggestion.id === id ? { ...suggestion, approved: !suggestion.approved } : suggestion
			)
		);
	};

	const handleAcceptSuggestions = () => {
		if (isAccepting || window.speechSynthesis.speaking) {
			return;
		}

		const approvedSuggestions = suggestions.filter((s) => s.approved);

		if (approvedSuggestions.length === 0) {
			toast.warn('Please select at least one suggestion to accept.');
			speakQueue(['Please select at least one suggestion to accept.']);
			return;
		}

		console.log('--- Accepted AI Suggestions ---');
		approvedSuggestions.forEach((suggestion) => {
			console.log({
				id: suggestion.id,
				suggestion: suggestion.text,
				approved: suggestion.approved
			});
		});

		setIsAccepting(true);
		speakQueue(['thank you your response will be recorded successfully']);
		toast.success('Suggestions have been processed. Check the console for details.');
		// Reset isAccepting state after a delay to allow the toast to be seen
		setTimeout(() => setIsAccepting(false), 2000);
	};

	return (
		<Box sx={{ p: 3 }}>
			<StyledPaper>
				<Typography
					variant="h6"
					sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
				>
					<SearchIcon /> {t('Find Suggestions')}
				</Typography>
				<Formik
					initialValues={{ firstName: '', lastName: '', department: '', employeeCode: '' }}
					validationSchema={validationSchema}
					onSubmit={handleSearch}
				>
					{({ resetForm }) => (
						<Form>
							<Grid
								container
								spacing={3}
								alignItems="flex-end"
							>
								<Grid
									item
									xs={12}
									sm={6}
									md={3}
								>
									<FieldLabel>{t('First Name')}</FieldLabel>
									<Field
										name="firstName"
										component={TextFormField}
										fullWidth
										size="small"
										placeholder={t('Enter first name')}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
									md={3}
								>
									<FieldLabel>{t('Last Name')}</FieldLabel>
									<Field
										name="lastName"
										component={TextFormField}
										fullWidth
										size="small"
										placeholder={t('Enter last name')}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
									md={3}
								>
									<FieldLabel>{t('Department')}</FieldLabel>
									<Field
										name="department"
										component={TextFormField}
										fullWidth
										size="small"
										placeholder={t('Enter department')}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									sm={6}
									md={3}
								>
									<FieldLabel>{t('Employee Code')}</FieldLabel>
									<Field
										name="employeeCode"
										component={TextFormField}
										fullWidth
										size="small"
										placeholder={t('Enter employee code')}
									/>
								</Grid>
							</Grid>
							<Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap', alignItems: 'center' }}>
								<Button
									type="submit"
									className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] text-white font-500 py-0 rounded-[6px] bg-yellow-800 hover:bg-yellow-800/80"
									variant="contained"
									disabled={isSearching}
									startIcon={
										isSearching ? (
											<CircularProgress
												size={20}
												color="inherit"
											/>
										) : (
											<SearchIcon />
										)
									}
								>
									{isSearching ? t('Searching...') : t('Search')}
								</Button>
								<Button
									type="button"
									className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] rounded-[6px]"
									variant="outlined"
									onClick={() => handleReset(resetForm)}
									startIcon={<LockResetIcon />}
									disabled={isSearching}
								>
									{t('Reset')}
								</Button>
								<Button
									type="button"
									className="min-w-[115px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] text-white font-500 py-0 rounded-[6px] bg-blue-600 hover:bg-blue-800/80"
									variant="contained"
									color="primary"
									onClick={handleAcceptSuggestions}
									startIcon={<CheckCircleOutlineIcon />}
									disabled={isSearching || suggestions.length === 0 || isAccepting || isSpeaking}
								>
									{isAccepting ? t('Processing...') : t('Accept AI Suggestions')}
								</Button>
							</Box>
						</Form>
					)}
				</Formik>
			</StyledPaper>

			<SuggestionsCanvas>
				{isSpeaking && (
					<TalkingIndicator>
						<Typography
							variant="caption"
							color="textSecondary"
						>
							AI is talking
						</Typography>
						<div className="voice-bar" />
						<div className="voice-bar" />
						<div className="voice-bar" />
						<div className="voice-bar" />
						<div className="voice-bar" />
					</TalkingIndicator>
				)}

				{isSearching ? (
					<AIAnimation>
						<div className="glowing-orb" />
						<Typography
							variant="h6"
							color="textSecondary"
						>
							{t('AI is thinking...')}
						</Typography>
					</AIAnimation>
				) : suggestions.length > 0 ? (
					<Box
						textAlign="left"
						width="100%"
					>
						<Typography
							variant="h5"
							sx={{ mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}
						>
							{t('Suggestions')}
						</Typography>
						{suggestions.map((s) => (
							<FormControlLabel
								key={s.id}
								control={
									<Checkbox
										checked={s.approved}
										onChange={() => handleSuggestionToggle(s.id)}
										name={s.text}
									/>
								}
								label={s.text}
								sx={{ display: 'flex', width: '100%', mb: 1 }}
							/>
						))}
					</Box>
				) : (
					<Typography
						variant="body1"
						color="textSecondary"
					>
						{hasSearched ? t('No suggestions found.') : t('Enter search criteria to get AI suggestions.')}
					</Typography>
				)}
			</SuggestionsCanvas>
		</Box>
	);
}

export default BookingType;
