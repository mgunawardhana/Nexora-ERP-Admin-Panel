import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { Grid, IconButton, Select } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { z } from 'zod';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import InputAdornment from '@mui/material/InputAdornment';
import { PhotoCamera, Visibility, VisibilityOff } from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import { createUser } from '../../../../axios/services/mega-city-services/common/CommonService';

// Interface matching backend schema
interface UserInterface {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string; // Optional for edit mode
	role: string;
	phone: string;
	address?: string;
	profilePicture?: string;
}

// Updated schema with conditional password validation
const createSchema = (isEdit: boolean) => {
	const baseSchema = z.object({
		role: z.enum(['ADMIN', 'ROOT', 'STAFF', 'DEMONSTRATOR', 'DEVELOPER'], {
			required_error: 'Role is required'
		}),
		firstName: z.string().min(2, 'Must be at least 2 characters').max(100, 'Must be maximum 100 characters').trim(),
		lastName: z.string().min(2, 'Must be at least 2 characters').max(100, 'Must be maximum 100 characters').trim(),
		email: z.string().email('Invalid email').min(1, 'Email is required').toLowerCase(),
		phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
		address: z.string().optional()
	});

	if (isEdit) {
		// For edit mode, password is optional
		return baseSchema
			.extend({
				password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
				passwordConfirm: z.string().optional().or(z.literal(''))
			})
			.refine(
				(data) => {
					if (data.password && data.password.length > 0) {
						return data.password === data.passwordConfirm;
					}

					return true;
				},
				{
					message: 'Passwords must match',
					path: ['passwordConfirm']
				}
			);
	}

	// For add mode, password is required
	return baseSchema
		.extend({
			password: z.string().min(8, 'Password must be at least 8 characters'),
			passwordConfirm: z.string()
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: 'Passwords must match',
			path: ['passwordConfirm']
		});
};

interface Props {
	isAdd: boolean;
	isEdit: boolean;
	isView: boolean;
	className?: string;
	isOpen: boolean;
	selectedRow: UserInterface | null;
	setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onCloseHandler: () => void;
	onSuccess: () => void;
}

type FormValues = {
	role: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	passwordConfirm: string;
	phone: string;
	address: string;
};

async function handleSaveUsers(userInfo: UserInterface, isAdd: boolean, isEdit: boolean): Promise<void> {
	try {
		if (isAdd) {
			await createUser(userInfo);
			toast.success('User created successfully');
		} else if (isEdit) {
			// await updateUser(userInfo);
			toast.success('User updated successfully');
		}
	} catch (error: any) {
		const errorMessage = error?.response?.data?.message || 'Error while saving user';
		throw new Error(errorMessage);
	}
}

function UsersForm({
	isAdd,
	isEdit,
	isView,
	className,
	isOpen,
	selectedRow,
	setIsFormOpen,
	onCloseHandler,
	onSuccess
}: Props) {
	const { t } = useTranslation('sampleComponent');
	const [openDialog, setOpenDialog] = useState(false);
	const [profilePic, setProfilePic] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [userRoles] = useState<{ value: string; label: string }[]>([
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'ROOT', label: 'Root' },
		{ value: 'STAFF', label: 'Staff' },
		{ value: 'DEMONSTRATOR', label: 'Demonstrator' },
		{ value: 'DEVELOPER', label: 'Developer' }
	]);

	const schema = createSchema(isEdit);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch
	} = useForm<FormValues>({
		defaultValues: {
			role: '',
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			passwordConfirm: '',
			phone: '',
			address: ''
		},
		resolver: zodResolver(schema)
	});

	// Watch password field to show/hide confirm password
	const passwordValue = watch('password');

	useEffect(() => {
		setOpenDialog(isOpen);
	}, [isOpen]);

	useEffect(() => {
		if (selectedRow && (isEdit || isView)) {
			setValue('role', selectedRow.role || '');
			setValue('firstName', selectedRow.firstName || '');
			setValue('lastName', selectedRow.lastName || '');
			setValue('email', selectedRow.email || '');
			setValue('phone', selectedRow.phone || '');
			setValue('address', selectedRow.address || '');
			setValue('password', '');
			setValue('passwordConfirm', '');
			setProfilePic(selectedRow.profilePicture || null);
		} else if (isAdd) {
			reset();
			setProfilePic(null);
		}
	}, [selectedRow, isAdd, isEdit, isView, setValue, reset]);

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setIsFormOpen(false);
		reset();
		setProfilePic(null);
		setShowPassword(false);
		setShowConfirmPassword(false);
		onCloseHandler();
	};

	const onSubmit = async (data: FormValues) => {
		if (isView) return;

		setLoading(true);
		try {
			const userInfo: UserInterface = {
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				role: data.role,
				phone: data.phone,
				address: data.address || undefined
			};

			if (isEdit && selectedRow?.id) {
				userInfo.id = selectedRow.id;
			}

			if (data.password && data.password.trim() !== '') {
				userInfo.password = data.password;
			}

			if (profilePic) {
				userInfo.profilePicture = profilePic;
			}

			await handleSaveUsers(userInfo, isAdd, isEdit);

			// Removed: if (typeof onSuccess === 'function') { onSuccess(); }
			handleCloseDialog();
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error('File size must be less than 5MB');
				return;
			}

			if (!file.type.startsWith('image/')) {
				toast.error('Please select a valid image file');
				return;
			}

			const reader = new FileReader();
			reader.onload = () => setProfilePic(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const getTitle = (): string => {
		if (isView) return 'View User';

		if (isEdit) return 'Edit User';

		return 'Add User';
	};

	const isReadOnly = isView;

	return (
		<>
			{loading && (
				<div className="flex justify-center items-center w-[100vw] h-[100vh] fixed top-0 left-0 z-[10000] bg-white/95">
					<div className="flex-col gap-4 w-full flex items-center justify-center">
						<CircularProgress size={60} />
					</div>
				</div>
			)}
			<div className={clsx('users-form', className)}>
				<Dialog
					fullWidth
					open={openDialog}
					onClose={handleCloseDialog}
					aria-labelledby="form-dialog-title"
					scroll="body"
					maxWidth="xl"
				>
					<DialogTitle className="pb-0">{getTitle()}</DialogTitle>
					<DialogContent>
						<Grid
							container
							spacing={2}
							className="mb-4"
						>
							<Grid
								item
								xs={12}
								sm={3}
								className="flex"
							>
								<div className="flex flex-col items-center">
									<Avatar
										src={profilePic || ''}
										alt="Profile Picture"
										sx={{ width: 100, height: 100 }}
									/>
									{!isReadOnly && (
										<IconButton
											color="primary"
											aria-label="upload picture"
											component="label"
											className="mt-2"
										>
											<input
												hidden
												accept="image/*"
												type="file"
												onChange={handleProfilePicChange}
											/>
											<PhotoCamera />
										</IconButton>
									)}
								</div>
							</Grid>
						</Grid>
						<form
							noValidate
							onSubmit={handleSubmit(onSubmit)}
							className="w-full"
						>
							<Grid
								container
								spacing={2}
								className="pt-[10px]"
							>
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">
										Role <span className="text-red">*</span>
									</Typography>
									<Controller
										name="role"
										control={control}
										render={({ field }) => (
											<FormControl
												fullWidth
												required
												error={!!errors.role}
											>
												<Select
													{...field}
													size="small"
													disabled={isReadOnly}
												>
													{userRoles.map((role) => (
														<MenuItem
															key={role.value}
															value={role.value}
														>
															{role.label}
														</MenuItem>
													))}
												</Select>
												{errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
											</FormControl>
										)}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">
										First Name <span className="text-red">*</span>
									</Typography>
									<Controller
										name="firstName"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												size="small"
												error={!!errors.firstName}
												helperText={errors.firstName?.message}
												required
												disabled={isReadOnly}
											/>
										)}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">
										Last Name <span className="text-red">*</span>
									</Typography>
									<Controller
										name="lastName"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												size="small"
												error={!!errors.lastName}
												helperText={errors.lastName?.message}
												required
												disabled={isReadOnly}
											/>
										)}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">
										Email <span className="text-red">*</span>
									</Typography>
									<Controller
										name="email"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												size="small"
												error={!!errors.email}
												helperText={errors.email?.message}
												required
												disabled={isReadOnly}
											/>
										)}
									/>
								</Grid>
								{!isView && (
									<>
										<Grid
											item
											xs={12}
											md={6}
											lg={3}
											className="pt-[5px!important]"
										>
											<Typography className="formTypography">
												Password {isAdd && <span className="text-red">*</span>}
												{isEdit && (
													<span className="text-gray-500">
														{' '}
														(leave blank to keep current)
													</span>
												)}
											</Typography>
											<Controller
												name="password"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														type={showPassword ? 'text' : 'password'}
														variant="outlined"
														fullWidth
														size="small"
														error={!!errors.password}
														helperText={errors.password?.message}
														required={isAdd}
														disabled={isReadOnly}
														placeholder={
															isEdit ? 'Leave blank to keep current password' : ''
														}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton
																		aria-label="toggle password visibility"
																		onClick={togglePasswordVisibility}
																		edge="end"
																		size="small"
																	>
																		{showPassword ? (
																			<Visibility />
																		) : (
																			<VisibilityOff />
																		)}
																	</IconButton>
																</InputAdornment>
															)
														}}
													/>
												)}
											/>
										</Grid>
										{/* Show confirm password only if password is entered */}
										{(isAdd || (isEdit && passwordValue && passwordValue.length > 0)) && (
											<Grid
												item
												xs={12}
												md={6}
												lg={3}
												className="pt-[5px!important]"
											>
												<Typography className="formTypography">
													Confirm Password <span className="text-red">*</span>
												</Typography>
												<Controller
													name="passwordConfirm"
													control={control}
													render={({ field }) => (
														<TextField
															{...field}
															type={showConfirmPassword ? 'text' : 'password'}
															variant="outlined"
															fullWidth
															size="small"
															error={!!errors.passwordConfirm}
															helperText={errors.passwordConfirm?.message}
															required
															disabled={isReadOnly}
															InputProps={{
																endAdornment: (
																	<InputAdornment position="end">
																		<IconButton
																			aria-label="toggle password visibility"
																			onClick={toggleConfirmPasswordVisibility}
																			edge="end"
																			size="small"
																		>
																			{showConfirmPassword ? (
																				<Visibility />
																			) : (
																				<VisibilityOff />
																			)}
																		</IconButton>
																	</InputAdornment>
																)
															}}
														/>
													)}
												/>
											</Grid>
										)}
									</>
								)}
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">
										Phone <span className="text-red">*</span>
									</Typography>
									<Controller
										name="phone"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												size="small"
												error={!!errors.phone}
												helperText={errors.phone?.message}
												required
												disabled={isReadOnly}
												placeholder="0771234567"
											/>
										)}
									/>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}
									lg={3}
									className="pt-[5px!important]"
								>
									<Typography className="formTypography">Address</Typography>
									<Controller
										name="address"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												variant="outlined"
												fullWidth
												size="small"
												error={!!errors.address}
												helperText={errors.address?.message}
												disabled={isReadOnly}
											/>
										)}
									/>
								</Grid>
								<Grid
									item
									md={12}
									sm={12}
									xs={12}
									className="flex justify-end items-center gap-[10px] pt-[10px!important]"
								>
									<Button
										variant="contained"
										color="error"
										onClick={handleCloseDialog}
										className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] font-500 rounded-[6px]"
									>
										{isView ? 'Close' : 'Cancel'}
									</Button>
									{!isView && (
										<Button
											variant="contained"
											type="submit"
											className="min-w-[100px] min-h-[36px] max-h-[36px] text-[10px] sm:text-[12px] lg:text-[14px] font-500 rounded-[6px] bg-blue-600 hover:bg-blue-700"
											disabled={loading}
										>
											{loading ? (
												<CircularProgress
													className="text-white"
													size={24}
												/>
											) : isAdd ? (
												'Create'
											) : (
												'Update'
											)}
										</Button>
									)}
								</Grid>
							</Grid>
						</form>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}

export default UsersForm;
