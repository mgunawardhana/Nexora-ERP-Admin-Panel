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
	FormControlLabel,
	TextField,
	Switch
} from '@mui/material';
import { toast } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { geminiAPICall } from '../../../../axios/services/mega-city-services/common/CommonService';

// --- MOCK EXTERNAL DEPENDENCIES ---

const useTranslation = () => ({
	t: (key: string) => key
});

function TextFormField({ field, form, ...props }: any) {
	return (
		<TextField
			{...field}
			{...props}
			error={form.touched[field.name] && Boolean(form.errors[field.name])}
			helperText={form.touched[field.name] && form.errors[field.name]}
		/>
	);
}

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
		margin: '0 1px',
		borderRadius: '4px',
		background: `linear-gradient(180deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
		display: 'inline-block',
		animation: 'modern-speak 1.4s infinite ease-in-out'
	},
	'@keyframes modern-speak': {
		'0%, 40%, 100%': { transform: 'scaleY(0.2)' },
		'20%': { transform: 'scaleY(1.0)' }
	},
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

const AppleSwitch = styled(Switch)(({ theme }) => ({
	width: 42,
	height: 26,
	padding: 0,
	'& .MuiSwitch-switchBase': {
		padding: 0,
		margin: 2,
		transitionDuration: '300ms',
		'&.Mui-checked': {
			transform: 'translateX(16px)',
			color: '#fff',
			'& + .MuiSwitch-track': {
				backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
				opacity: 1,
				border: 0
			},
			'&.Mui-disabled + .MuiSwitch-track': {
				opacity: 0.5
			}
		},
		'&.Mui-focusVisible .MuiSwitch-thumb': {
			color: '#33cf4d',
			border: '6px solid #fff'
		},
		'&.Mui-disabled .MuiSwitch-thumb': {
			color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
		},
		'&.Mui-disabled + .MuiSwitch-track': {
			opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
		}
	},
	'& .MuiSwitch-thumb': {
		boxSizing: 'border-box',
		width: 22,
		height: 22
	},
	'& .MuiSwitch-track': {
		borderRadius: 26 / 2,
		backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
		opacity: 1,
		transition: theme.transitions.create(['background-color'], {
			duration: 500
		})
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
	const [animatedSuggestions, setAnimatedSuggestions] = useState<Suggestion[]>([]);
	const [hasSearched, setHasSearched] = useState<boolean>(false);
	const [isAccepting, setIsAccepting] = useState<boolean>(false);
	const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);

	useEffect(() => {
		const loadVoices = () => {
			const availableVoices: SpeechSynthesisVoice[] = window.speechSynthesis.getVoices();
			if (availableVoices.length > 0) {
				setSpeechVoices(availableVoices);
			}
		};
		window.speechSynthesis.onvoiceschanged = loadVoices;
		loadVoices();
	}, []);

	const speak = useCallback(
		(text: string, onEndCallback?: () => void) => {
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
					const voice = speechVoices.find((v: SpeechSynthesisVoice) => v.name === name);
					if (voice) return voice;
				}
				const femaleVoice = speechVoices.find(
					(v: SpeechSynthesisVoice) => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')
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
		},
		[speechVoices]
	);

	const speakQueue = useCallback(
		(texts: string[]) => {
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
		},
		[speak]
	);

	const startWritingAnimation = useCallback(
		(allSuggestions: Suggestion[]) => {
			setAnimatedSuggestions([]);
			let index = 0;
			const interval = setInterval(() => {
				if (index < allSuggestions.length) {
					setAnimatedSuggestions((prev: Suggestion[]) => [...prev, allSuggestions[index]]);
					index++;
				} else {
					clearInterval(interval);
					if (isSpeechEnabled) {
						const audioQueue = ['Here are the suggestions:', ...allSuggestions.map((s: Suggestion) => s.text)];
						speakQueue(audioQueue);
					}
				}
			}, 300);
		},
		[speakQueue, isSpeechEnabled]
	);

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
			setAnimatedSuggestions([]);
			setHasSearched(true);

			try {
				const { firstName, lastName, department, employeeCode } = values;
				const promptText = `
                Generate exactly three brief, single-line performance evaluation suggestions for an employee with the following details:
                - Name: ${firstName || 'the employee'} ${lastName || ''}
                - Employee Code: ${employeeCode || 'N/A'}
                - Department: ${department || 'N/A'}
                - Key Performance Indicator (KPI): 0.95

                Format the output as three distinct, numbered points. Each suggestion should be a concise, actionable feedback point.
                Do not include any introductory or concluding text, only the three numbered suggestions.
            `;

				const script = {
					prompt: promptText,
					options: { temperature: 0.7, maxOutputTokens: 250 }
				};
				const response = await geminiAPICall(script);

				if (response.success && response.content) {
					const rawContent: string = response.content;
					const parsedSuggestions: Suggestion[] = rawContent
						.split('\n')
						.map((line) => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering and trim
						.filter((line) => line.length > 10) // Filter out empty or short lines
						.map((text, index) => ({
							id: index + 1,
							text: text,
							approved: false
						}));

					setSuggestions(parsedSuggestions);
					toast.success(t('Suggestions generated!'));
					startWritingAnimation(parsedSuggestions);

				} else {
					toast.error(t('Failed to get suggestions from AI.'));
				}
			} catch (error) {
				console.error('Error during AI API call:', error);
				toast.error(t('An error occurred while fetching suggestions.'));
			} finally {
				setIsSearching(false);
			}
		},
		[t, startWritingAnimation, isSpeechEnabled, speakQueue]
	);

	const handleReset = useCallback(
		(resetForm: () => void) => {
			resetForm();
			setIsSearching(false);
			setSuggestions([]);
			setAnimatedSuggestions([]);
			setHasSearched(false);
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.cancel();
				setIsSpeaking(false);
			}
			toast.info(t('Search form has been reset'));
		},
		[t]
	);

	const handleSuggestionToggle = useCallback(
		(id: number) => {
			setSuggestions(
				suggestions.map((suggestion: Suggestion) =>
					suggestion.id === id ? { ...suggestion, approved: !suggestion.approved } : suggestion
				)
			);
			setAnimatedSuggestions(
				animatedSuggestions.map((suggestion: Suggestion) =>
					suggestion.id === id ? { ...suggestion, approved: !suggestion.approved } : suggestion
				)
			);
		},
		[suggestions, animatedSuggestions]
	);

	const handleAcceptSuggestions = useCallback(() => {
		if (isAccepting || isSpeaking) {
			return;
		}
		const approvedSuggestions: Suggestion[] = suggestions.filter((s: Suggestion) => s.approved);
		if (approvedSuggestions.length === 0) {
			toast.warn('Please select at least one suggestion to accept.');
			if (isSpeechEnabled) {
				speakQueue(['Please select at least one suggestion to accept.']);
			}
			return;
		}
		console.log('--- Accepted AI Suggestions ---');
		approvedSuggestions.forEach((suggestion: Suggestion) => {
			console.log({ id: suggestion.id, suggestion: suggestion.text, approved: suggestion.approved });
		});
		setIsAccepting(true);
		if (isSpeechEnabled) {
			speakQueue(['Thank you, your response will be recorded successfully.']);
		}
		toast.success('Suggestions have been processed. Check the console for details.');
		setTimeout(() => setIsAccepting(false), 2000);
	}, [isAccepting, suggestions, speakQueue, isSpeechEnabled, isSpeaking]);

	const handleSpeechToggle = () => {
		const newSpeechState = !isSpeechEnabled;
		setIsSpeechEnabled(newSpeechState);

		if (newSpeechState) {
			if (suggestions.length > 0 && !isSpeaking) {
				const audioQueue = ['Here are the suggestions:', ...suggestions.map((s: Suggestion) => s.text)];
				speakQueue(audioQueue);
			}
		} else {
			if (window.speechSynthesis.speaking) {
				window.speechSynthesis.cancel();
				setIsSpeaking(false);
			}
		}
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
									startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
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
								<FormControlLabel
									control={
										<AppleSwitch
											checked={isSpeechEnabled}
											onChange={handleSpeechToggle}
										/>
									}
									label={t('AI Voice')}
									sx={{ ml: 1 }}
								/>
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
				) : animatedSuggestions.length > 0 ? (
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
						{animatedSuggestions.map((s) => (
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
								sx={{ display: 'flex', width: '100%', mb: 1, mr: 0 }}
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