import React, { useEffect, useRef, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Paper,
	Select,
	styled,
	Switch,
	TextField,
	Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReplayIcon from '@mui/icons-material/Replay';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NoteAlt from '@mui/icons-material/NoteAlt';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createOrder, fetchAllProducts } from '../../../../axios/services/mega-city-services/common/CommonService';
import MaterialTableWrapper from '../../../../common/tableComponents/MaterialTableWrapper';

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
	itemName: string;
	productImage: string;
}

interface CartItem {
	orderNumber: string;
	productId: string;
	productName: string;
	quantity: number;
	price: number;
	total: number;
	categoryCode: string;
}

interface Percentages {
	boatman: number;
	guide: number;
	gift: number;
	customBoatman: boolean;
	customGuide: boolean;
	customGift: boolean;
	less: boolean;
	lessAmount: number;
	exoticTich: boolean;
	company: number;
	customCompany: boolean;
	discount: number;
	customDiscount: boolean;
}

const CustomSwitch = styled(Switch)(({ theme }) => ({
	width: 52,
	height: 26,
	padding: 0,
	'& .MuiSwitch-switchBase': {
		padding: 2,
		margin: 2,
		transitionDuration: '300ms',
		'&.Mui-checked': {
			transform: 'translateX(26px)',
			color: 'white',
			'& + .MuiSwitch-track': {
				backgroundColor: theme.palette.primary.main,
				opacity: 1,
				border: 0
			}
		},
		'& .MuiSwitch-thumb': {
			boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
			width: 18,
			height: 18,
			backgroundColor: 'white'
		}
	},
	'& .MuiSwitch-track': {
		borderRadius: 13,
		backgroundColor: theme.palette.grey[400],
		opacity: 1
	}
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(1.5),
	borderRadius: '8px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
	minHeight: '400px',
	display: 'flex',
	flexDirection: 'column'
}));

const CostItem = styled(Box)(({ theme }) => ({
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: theme.spacing(0.5),
	'& .label': { color: theme.palette.text.secondary },
	'& .value': { fontWeight: 500 }
}));

const PlaceOrderButton = styled(Button)(({ theme }) => ({
	backgroundColor: '#4caf50',
	color: 'white',
	fontWeight: 'bold',
	borderRadius: '6px',
	padding: theme.spacing(0.75),
	'&:hover': { backgroundColor: '#388e3c' },
	'&:disabled': {
		backgroundColor: theme.palette.grey[400],
		color: theme.palette.grey[600]
	}
}));

const GreenProgress = styled(LinearProgress)(({ theme }) => ({
	'& .MuiLinearProgress-bar': {
		backgroundColor: '#4caf50'
	}
}));

function generateOrderNumber(): string {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	const randomDigits = Math.floor(1000 + Math.random() * 9000);
	return `ORD-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${randomDigits}`;
}

function getCategoryCodeCounter(): number {
	const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
	const stored = localStorage.getItem('categoryCodeCounter');
	let date = today;
	let counter = 1;

	if (stored) {
		const parsed = JSON.parse(stored);
		if (parsed.date === today) {
			counter = parsed.counter;
		}
	}

	return counter;
}

function incrementCategoryCodeCounter(): number {
	const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
	const stored = localStorage.getItem('categoryCodeCounter');
	let date = today;
	let counter = 1;

	if (stored) {
		const parsed = JSON.parse(stored);
		if (parsed.date === today) {
			counter = parsed.counter + 1;
		}
	}

	localStorage.setItem('categoryCodeCounter', JSON.stringify({ date, counter }));
	return counter;
}

function generateCategoryCode(counter: number): string {
	const date = new Date();
	const year = date.getFullYear().toString();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const dayName = date.toLocaleString('en-US', { weekday: 'long' }).slice(0, 3).toUpperCase();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `GRCAT-${year}-${month}-${day}-${dayName}-${hours}-${minutes}-${seconds}-${counter}`;
}

function NewOrders() {
	const { t } = useTranslation('shippingTypes');
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<number>(1);
	const [guideName, setGuideName] = useState<string>('');
	const [boatmanName, setBoatmanName] = useState<string>('');
	const [demonstratorName, setDemonstratorName] = useState<string>('');
	const [isGroupCodeGenerated, setIsGroupCodeGenerated] = useState<boolean>(false);
	const [orderNumber, setOrderNumber] = useState<string>(generateOrderNumber());
	const [categoryCode, setCategoryCode] = useState<string>(() => generateCategoryCode(getCategoryCodeCounter()));
	const [percentages, setPercentages] = useState<Percentages>({
		boatman: 0,
		guide: 0,
		gift: 0,
		customBoatman: false,
		customGuide: false,
		customGift: false,
		less: false,
		lessAmount: 0,
		exoticTich: false,
		company: 0,
		customCompany: false,
		discount: 0,
		customDiscount: false
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
	const [, setCurrentDateTime] = useState<string>(new Date().toLocaleString());
	const [progress, setProgress] = useState<number>(0);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [billDialogOpen, setBillDialogOpen] = useState<boolean>(false);
	const [sendingEmail, setSendingEmail] = useState<boolean>(false);
	const [emailStatus, setEmailStatus] = useState<'success' | 'error' | null>(null);
	const billRef = useRef<HTMLDivElement>(null);

	// Calculate costs
	const subtotal = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
	const discountAmount = percentages.customDiscount ? (subtotal * percentages.discount) / 100 : 0;
	const discountedSubtotal = subtotal - discountAmount;
	const giftCost = percentages.customGift ? percentages.gift : 0;
	const lessAmount = percentages.less ? percentages.lessAmount : 0;
	const companyCost = percentages.customCompany ? (discountedSubtotal * percentages.company) / 100 : 0;
	const boatmanCost = percentages.customBoatman ? (discountedSubtotal * percentages.boatman) / 100 : 0;
	const guideCost = percentages.customGuide ? (discountedSubtotal * percentages.guide) / 100 : 0;
	const totalAmount = discountedSubtotal + giftCost;

	const fetchAllProductsFromBackend = async () => {
		setLoading(true);
		setError('');
		try {
			const response: any = await fetchAllProducts(1, 1000);

			if (response && response.products) {
				setProducts(response.products as Product[]);
			} else {
				setError('No products found');
				toast.error('No products found');
			}
		} catch (error) {
			console.error('Error fetching products:', error);
			setError('Error fetching products');
			toast.error('Error fetching data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllProductsFromBackend();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentDateTime(new Date().toLocaleString());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const resetCategoryCode = (): void => {
		if (isGenerating) return;

		setIsGenerating(true);
		setProgress(0);
		const interval = setInterval(() => {
			setProgress((prevProgress) => {
				if (prevProgress >= 100) {
					clearInterval(interval);
					setCategoryCode(generateCategoryCode(getCategoryCodeCounter()));
					setIsGenerating(false);
					setIsGroupCodeGenerated(true);
					setGuideName('');
					setBoa
					tmanName('');
					setDemonstratorName('');
					return 100;
				}

				return prevProgress + 10;
			});
		}, 200);
	};

	const handleAddToCart = (): void => {
		if (!selectedProduct || quantity <= 0) {
			toast.error('Please select a product and valid quantity');
			return;
		}

		const product = products.find((p) => p._id === selectedProduct);

		if (!product) {
			toast.error('Selected.Error: Selected product not found');
			return;
		}

		if (quantity > product.stocks) {
			toast.error(`Quantity cannot exceed available stock of ${product.stocks}`);
			return;
		}

		if (!product.price && product.price !== 0) {
			toast.error(`Price for product ${product.itemName} is not defined`);
			return;
		}

		const existingItemIndex = cartItems.findIndex((item) => item.productId === product._id);
		const itemPrice: number = product.price;

		if (existingItemIndex >= 0) {
			const updatedItems = [...cartItems];
			const existingItem = updatedItems[existingItemIndex];
			const newQuantity = existingItem.quantity + quantity;

			if (newQuantity > product.stocks) {
				toast.error(`Total quantity cannot exceed available stock of ${product.stocks}`);
				return;
			}

			updatedItems[existingItemIndex] = {
				...existingItem,
				quantity: newQuantity,
				total: itemPrice * newQuantity
			};
			setCartItems(updatedItems);
			toast.success('Item quantity updated in cart');
		} else {
			const newCartItem: CartItem = {
				orderNumber,
				productId: product._id,
				productName: product.itemName,
				quantity,
				price: itemPrice,
				total: itemPrice * quantity,
				categoryCode
			};
			setCartItems((prev) => [...prev, newCartItem]);
			toast.success('Item added to cart');
		}

		setSelectedProduct('');
		setQuantity(1);
	};

	const handleDownloadPDF = async () => {
		if (sendingEmail) return;

		setSendingEmail(true);
		setEmailStatus(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 100));

			const input = billRef.current;

			if (!input) {
				throw new Error('Bill reference not found');
			}

			const canvas = await html2canvas(input, {
				scale: 2,
				useCORS: true,
				logging: false,
				windowWidth: input.scrollWidth,
				windowHeight: input.scrollHeight
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			const imgWidth = 210;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
			pdf.save(`Invoice-${new Date().toISOString().replace(/[-:.TZ]/g, '')}.pdf`);

			const invoiceNumber = `INV${new Date().toISOString().replace(/[-:.TZ]/g, '')}`;
			const emailData = {
				to_email: 'maneesha.gunawardhana.contact@gmail.com',
				userName: guideName || 'Customer',
				invoice_no: invoiceNumber,
				order_number: orderNumber,
				total_amount: totalAmount.toFixed(2)
			};

			emailjs.init('ejR0xzMGaWtvCmdBw');
			const response = await emailjs.send('service_o4z3qa5', 'template_u9wcogp', emailData);

			if (response.status === 200) {
				setEmailStatus('success');
				toast.success('Invoice sent successfully!');
			} else {
				throw new Error('Email sending failed');
			}
		} catch (error) {
			console.error('Error in PDF generation or email sending:', error);
			setEmailStatus('error');
			toast.error('Failed to send invoice. Please try again.');
		} finally {
			setSendingEmail(false);
		}
	};

	const handlePlaceOrder = async (): Promise<void> => {
		if (cartItems.length === 0) {
			toast.error('Cart is empty');
			return;
		}

		if (!guideName.trim()) {
			toast.error('Please enter a guide name');
			return;
		}

		if (!boatmanName.trim()) {
			toast.error('Please enter a boatman name');
			return;
		}

		if (!demonstratorName.trim()) {
			toast.error('Please enter a demonstrator name');
			return;
		}

		if (!categoryCode.trim()) {
			toast.error('Please generate a group code');
			return;
		}

		for (const item of cartItems) {
			if (
				!item.productId ||
				!item.productName ||
				item.quantity <= 0 ||
				item.price == null ||
				item.total == null
			) {
				toast.error('Invalid product in cart');
				return;
			}
		}

		if (!orderNumber.trim()) {
			toast.error('Invalid order number');
			return;
		}

		const orderData = {
			groupCode: categoryCode.trim(),
			orderCode: orderNumber.trim(),
			selectedProducts: cartItems.map((item) => ({
				productId: item.productId,
				productName: item.productName.trim(),
				quantity: item.quantity
			})),
			company: {
				percentage: percentages.customCompany ? percentages.company : 0,
				amount: companyCost
			},
			discount: {
				percentage: percentages.customDiscount ? percentages.discount : 0,
				amount: discountAmount
			},
			guide: {
				name: guideName.trim(),
				percentage: percentages.customGuide ? percentages.guide : 0,
				amount: guideCost
			},
			categoryCode: categoryCode.trim(),
			forBoatman: [
				{
					boatmanName: boatmanName.trim(),
					percentage: percentages.customBoatman ? percentages.boatman : 0,
					costAmount: boatmanCost
				}
			],
			demonstratorName: demonstratorName.trim(),
			gift: giftCost,
			Price: totalAmount,
			itemWiseTotal: subtotal,
			exotic: percentages.exoticTich,
			less: percentages.less ? percentages.lessAmount : 0
		};
		try {
			console.log('Order Details:', orderData);
			await createOrder(orderData);
			await fetchAllProductsFromBackend();
			toast.success('Order placed successfully!');
			setCartItems([]);
			setOrderNumber(generateOrderNumber());
			const newCounter = incrementCategoryCodeCounter();
			setCategoryCode(generateCategoryCode(newCounter));
			setPercentages({
				boatman: 0,
				guide: 0,
				gift: 0,
				customBoatman: false,
				customGuide: false,
				customGift: false,
				less: false,
				lessAmount: 0,
				exoticTich: false,
				company: 0,
				customCompany: false,
				discount: 0,
				customDiscount: false
			});
			setIsGroupCodeGenerated(false);
		} catch (error) {
			console.error('Error placing order:', error);
			toast.error('Failed to place order');
		}
	};

	const handlePrintBill = () => {
		if (cartItems.length === 0 || !guideName.trim() || !boatmanName.trim() || !demonstratorName.trim()) {
			toast.error('Please add items to cart and enter guide, boatman, and demonstrator names');
			return;
		}

		setBillDialogOpen(true);
		setEmailStatus(null);
	};

	const handleDeleteItem = (rowData: CartItem): void => {
		setItemToDelete(rowData);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = (): void => {
		if (itemToDelete) {
			setCartItems(cartItems.filter((item) => item.productId !== itemToDelete.productId));
			setDeleteDialogOpen(false);
			setItemToDelete(null);
			toast.success('Item removed from cart');
		}
	};

	const handleProductChange = (productId: string): void => {
		setSelectedProduct(productId);
		const selected = products.find((p) => p._id === productId);

		if (selected) {
			setPercentages((p) => ({
				...p,
				exoticTich: selected.itemName === 'Organic Ceylon Cinnamon Drink',
				guide: selected.itemName === 'Organic Ceylon Cinnamon Drink' && !p.customGuide ? 50 : p.guide,
				customGift: false,
				less: false
			}));
		}
	};

	const handleQuantityChange = (value: number): void => {
		const selected = products.find((p) => p._id === selectedProduct);

		if (selected && value > selected.stocks) {
			return;
		}

		setQuantity(Math.max(1, value));
	};

	const tableColumns = [
		{ title: t('Order Number'), field: 'orderNumber' },
		{
			title: t('Product ID'),
			field: 'productId'
		},
		{ title: t('Product Name'), field: 'productName' },
		{ title: t('Quantity'), field: 'quantity' },
		{
			title: t('Price'),
			field: 'price',
			render: (rowData: CartItem) =>
				`LKR ${typeof rowData.price === 'number' ? rowData.price.toFixed(2) : '0.00'}`
		},
		{
			title: t('Total'),
			field: 'total',
			render: (rowData: CartItem) =>
				`LKR ${typeof rowData.total === 'number' ? rowData.total.toFixed(2) : '0.00'}`
		},
		{ title: t('Category Code'), field: 'categoryCode' }
	];

	const formattedOrderDate = new Date().toLocaleString();

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography
					color="error"
					variant="h6"
				>
					{error}
				</Typography>
				<Button
					onClick={() => window.location.reload()}
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
			<Grid
				container
				spacing={3}
				alignItems="stretch"
			>
				<Grid
					item
					xs={12}
					md={6}
				>
					<StyledPaper>
						<Typography
							variant="h6"
							gutterBottom
							sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#37474f' }}
						>
							{t('Add New Order')}
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<TextField
									label={t('Group Code')}
									fullWidth
									value={categoryCode}
									InputProps={{ readOnly: true }}
									size="small"
									variant="outlined"
									sx={{ bgcolor: '#fff' }}
								/>
								<IconButton
									onClick={resetCategoryCode}
									color="primary"
									disabled={isGenerating}
									title="Generate new group code"
								>
									<ReplayIcon />
								</IconButton>
							</Box>
							{isGenerating && (
								<Box sx={{ width: '100%', mt: 1 }}>
									<GreenProgress
										variant="determinate"
										value={progress}
									/>
								</Box>
							)}
							<TextField
								label={t('Order Number')}
								fullWidth
								value={orderNumber}
								InputProps={{ readOnly: true }}
								size="small"
								variant="outlined"
								sx={{ bgcolor: '#fff' }}
							/>
							<FormControl
								fullWidth
								size="small"
							>
								<InputLabel>{t('Select Product')}</InputLabel>
								<Select
									value={selectedProduct}
									onChange={(e) => handleProductChange(e.target.value)}
									label={t('Select Product')}
									sx={{ bgcolor: '#fff' }}
									disabled={loading}
								>
									{products.map((p) => (
										<MenuItem
											key={p._id}
											value={p._id}
											disabled={!p.isActive || p.stocks === 0}
										>
											{p.itemName} - ${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}{' '}
											(Stock: {p.stocks})
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<TextField
								label={t('Quantity')}
								type="number"
								fullWidth
								inputProps={{
									min: 1,
									max: products.find((p) => p._id === selectedProduct)?.stocks || 1000
								}}
								value={quantity}
								onChange={(e) => handleQuantityChange(Number(e.target.value))}
								size="small"
								variant="outlined"
								sx={{ bgcolor: '#fff' }}
								disabled={!selectedProduct}
							/>
							<TextField
								label={t('Guide Name')}
								fullWidth
								value={guideName}
								onChange={(e) => setGuideName(e.target.value)}
								size="small"
								variant="outlined"
								sx={{ bgcolor: '#fff' }}
								disabled={loading}
							/>
							<TextField
								label={t('Boatman Name')}
								fullWidth
								value={boatmanName}
								onChange={(e) => setBoatmanName(e.target.value)}
								size="small"
								variant="outlined"
								sx={{ bgcolor: '#fff' }}
								disabled={loading}
							/>
							<TextField
								label={t('Demonstrator Name')}
								fullWidth
								value={demonstratorName}
								onChange={(e) => setDemonstratorName(e.target.value)}
								size="small"
								variant="outlined"
								sx={{ bgcolor: '#fff' }}
								disabled={loading}
							/>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								onClick={handleAddToCart}
								startIcon={<ShoppingCartIcon />}
								disabled={!selectedProduct || quantity <= 0 || loading}
								sx={{
									mt: 1,
									py: 0.75,
									borderRadius: '6px',
									bgcolor: '#0288d1',
									'&:hover': { bgcolor: '#0277bd' }
								}}
							>
								{t('Add to Cart')}
							</Button>
						</Box>
					</StyledPaper>
				</Grid>
				<Grid
					item
					xs={12}
					md={6}
				>
					<StyledPaper>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography
								variant="h6"
								sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#37474f' }}
							>
								{t('Cost Calculations')}
							</Typography>
							{guideName && (
								<Typography
									variant="body2"
									sx={{ fontWeight: 500, color: '#37474f' }}
								>
									{t('Business By')} - {guideName}
								</Typography>
							)}
						</Box>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Typography variant="body2">{t('Exotic Tich (Guide 50%)')}</Typography>
								<CustomSwitch
									checked={percentages.exoticTich}
									onChange={(e) => {
										const isChecked = e.target.checked;
										setPercentages((p) => ({
											...p,
											exoticTich: isChecked,
											guide: isChecked && !p.customGuide ? 50 : p.guide
										}));
									}}
								/>
							</Box>
							<Box>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<Typography variant="body2">{t('Less Amount')}</Typography>
									<CustomSwitch
										checked={percentages.less}
										onChange={(e) => setPercentages((p) => ({ ...p, less: e.target.checked }))}
									/>
								</Box>
								{percentages.less && (
									<TextField
										fullWidth
										label={t('Less Amount')}
										type="number"
										inputProps={{ min: 0, max: subtotal }}
										value={percentages.lessAmount}
										onChange={(e) =>
											setPercentages((p) => ({
												...p,
												lessAmount: Math.max(0, Number(e.target.value))
											}))
										}
										size="small"
										variant="outlined"
										sx={{ mt: 0.5, bgcolor: '#fff' }}
									/>
								)}
							</Box>
							{(['discount', 'boatman', 'guide', 'company'] as const).map((role) => {
								const customKey =
									`custom${role.charAt(0).toUpperCase() + role.slice(1)}` as keyof Percentages;
								return (
									<Box key={role}>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between'
											}}
										>
											<Typography variant="body2">
												{t(`Custom ${role.charAt(0).toUpperCase() + role.slice(1)} Percentage`)}
											</Typography>
											<CustomSwitch
												checked={percentages[customKey] as boolean}
												onChange={(e) => {
													const isChecked = e.target.checked;
													setPercentages((p) => ({
														...p,
														[customKey]: isChecked,
														[role]: isChecked ? p[role as keyof Percentages] : 0
													}));
												}}
											/>
										</Box>
										{percentages[customKey] && (
											<TextField
												fullWidth
												label={t(`${role.charAt(0).toUpperCase() + role.slice(1)} Percentage`)}
												type="number"
												inputProps={{ min: 0, max: 100 }}
												value={percentages[role as keyof Percentages]}
												onChange={(e) =>
													setPercentages((p) => ({
														...p,
														[role]: Math.min(100, Math.max(0, Number(e.target.value)))
													}))
												}
												size="small"
												variant="outlined"
												sx={{ mt: 0.5, bgcolor: '#fff' }}
											/>
										)}
									</Box>
								);
							})}
							<Box>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<Typography variant="body2">{t('Gift Value')}</Typography>
									<CustomSwitch
										checked={percentages.customGift}
										onChange={(e) =>
											setPercentages((p) => ({
												...p,
												customGift: e.target.checked,
												gift: e.target.checked ? p.gift : 0
											}))
										}
									/>
								</Box>
								{percentages.customGift && (
									<TextField
										fullWidth
										label={t('Gift Value')}
										type="number"
										inputProps={{ min: 0 }}
										value={percentages.gift}
										onChange={(e) =>
											setPercentages((p) => ({
												...p,
												gift: Math.max(0, Number(e.target.value))
											}))
										}
										size="small"
										variant="outlined"
										sx={{ mt: 0.5, bgcolor: '#fff' }}
									/>
								)}
							</Box>
							<Divider sx={{ my: 1.5, borderColor: '#e0e0e0' }} />
							<Box>
								<CostItem>
									<Typography
										variant="body2"
										className="label"
									>
										{t('Subtotal')}:
									</Typography>
									<Typography
										variant="body2"
										className="value"
									>
										LKR {subtotal.toFixed(2)}
									</Typography>
								</CostItem>
								{percentages.customDiscount && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Discount')} ({percentages.discount}%):
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											-LKR {discountAmount.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								{percentages.customBoatman && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Boatman Cost')} ({percentages.boatman}%):
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											LKR {boatmanCost.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								{percentages.customGuide && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Guide Cost')} ({percentages.guide}%):
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											LKR {guideCost.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								{percentages.customGift && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Gift Cost')}:
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											LKR {giftCost.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								{percentages.customCompany && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Company Cost')} ({percentages.company}%):
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											LKR {companyCost.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								{percentages.less && (
									<CostItem>
										<Typography
											variant="body2"
											className="label"
										>
											{t('Less Amount')}:
										</Typography>
										<Typography
											variant="body2"
											className="value"
										>
											LKR {lessAmount.toFixed(2)}
										</Typography>
									</CostItem>
								)}
								<CostItem>
									<Typography
										variant="body2"
										className="label"
									>
										{t('Total Amount')}:
									</Typography>
									<Typography
										variant="body2"
										className="value"
										sx={{ fontWeight: 'bold', color: '#d32f2f' }}
									>
										LKR {totalAmount.toFixed(2)}
									</Typography>
								</CostItem>
							</Box>
							<Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
								<PlaceOrderButton
									variant="contained"
									fullWidth
									onClick={handlePrintBill}
									disabled={cartItems.length === 0 || !guideName.trim() || !boatmanName.trim() || !demonstratorName.trim()}
									startIcon={<NoteAlt />}
								>
									{t('Print Bill')}
								</PlaceOrderButton>
								<PlaceOrderButton
									variant="contained"
									fullWidth
									onClick={handlePlaceOrder}
									disabled={cartItems.length === 0 || !guideName.trim() || !boatmanName.trim() || !demonstratorName.trim()}
									startIcon={<ShoppingBagIcon />}
								>
									{t('Place Order')}
								</PlaceOrderButton>
							</Box>
						</Box>
					</StyledPaper>
				</Grid>
				<Grid
					item
					xs={12}
				>
					<MaterialTableWrapper
						title={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<ShoppingCartIcon /> {t('Cart Items')}
							</Box>
						}
						filterChanged={null}
						handleColumnFilter={null}
						tableColumns={tableColumns}
						handlePageChange={() => {}}
						handlePageSizeChange={() => {}}
						handleCommonSearchBar={null}
						pageSize={5}
						disableColumnFiltering
						loading={loading}
						setPageSize={() => {}}
						pageIndex={0}
						searchByText=""
						count={cartItems.length}
						externalAdd={null}
						externalEdit={null}
						externalView={null}
						selection={false}
						selectionExport={null}
						isColumnVisible
						records={cartItems}
						tableRowDeleteHandler={handleDeleteItem}
						sx={{ bgcolor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
					/>
				</Grid>
			</Grid>
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				aria-labelledby="orderNumber-dialog-title"
				aria-describedby="order-number-dialog-description"
			>
				<DialogTitle id="orderNumber-dialog-title">{t('Confirm Delete')}</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						{t('Are you sure you want to delete this item from the cart?')}
						{itemToDelete && (
							<>
								<br />
								<Box component="strong">{itemToDelete.productName}</Box> (Qty: {itemToDelete.quantity})
							</>
						)}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
					<Button
						onClick={confirmDelete}
						color="error"
						autoFocus
					>
						{t('Delete')}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={billDialogOpen}
				onClose={() => setBillDialogOpen(false)}
				maxWidth="md"
				fullWidth
				aria-labelledby="bill-dialog-title"
			>
				<DialogTitle
					id="bill-dialog-title"
					sx={{ fontSize: 18, py: 1.5 }}
				>
					Invoice Preview
				</DialogTitle>
				<DialogContent sx={{ p: 2 }}>
					<Box
						sx={{
							position: 'relative',
							display: 'block',
							p: 2,
							bgcolor: '#fff',
							border: '1px solid #ddd',
							borderRadius: '5px',
							fontSize: '13px'
						}}
						ref={billRef}
					>
						{emailStatus && (
							<Box
								sx={{
									position: 'absolute',
									top: '-32px',
									left: '0',
									right: '0',
									textAlign: 'center',
									p: 1,
									borderRadius: '5px',
									fontSize: '13px',
									backgroundColor: emailStatus === 'success' ? '#4caf50' : '#f44336',
									color: '#fff'
								}}
							>
								{emailStatus === 'success' ? 'Invoice sent successfully!' : 'Failed to send invoice. Please try again.'}
							</Box>
						)}
						<IconButton
							sx={{ position: 'absolute', top: '4px', right: '4px', p: 0.5 }}
							onClick={() => setBillDialogOpen(false)}
							size="small"
						>
							<CloseIcon fontSize="small" />
						</IconButton>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								borderBottom: '1.5px solid #333',
								pb: 1
							}}
						>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 'bold', color: '#333', fontSize: 16 }}
								>
									CINNAMON MIRACLE RETAIL
								</Typography>
							</Box>
							<Typography
								variant="subtitle1"
								sx={{ fontWeight: 'bold', color: '#f56c00', fontSize: 18 }}
							>
								INVOICE
							</Typography>
						</Box>
						<Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
							<Box>
								<Typography variant="body2">
									<strong>Contact:</strong> (+94) (011) 2683171
								</Typography>
								<Typography variant="body2">
									<strong>Address:</strong> 137 1/1 Cotta Road, Colombo 08
								</Typography>
								<Typography variant="body2">
									<strong>Email:</strong> info@megacityretail.com
								</Typography>
							</Box>
							<Box>
								<Typography variant="body2">
									<strong>Group Code:</strong> {categoryCode}
								</Typography>
								<Typography variant="body2">
									<strong>Order Number:</strong> {orderNumber}
								</Typography>
								{percentages.exoticTich && (
									<Typography variant="body2">
										<strong>Exotic:</strong> Yes
									</Typography>
								)}
							</Box>
						</Box>
						<Box sx={{ mt: 2 }}>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: '2fr 1fr 1fr 1fr',
									bgcolor: '#333',
									color: '#fff',
									p: 0.5
								}}
							>
								<Typography sx={{ p: 0.5, border: '1px solid #333', fontSize: 13 }}>
									DESCRIPTION
								</Typography>
								<Typography sx={{ p: 0.5, border: '1px solid #333', fontSize: 13 }}>
									QUANTITY
								</Typography>
								<Typography sx={{ p: 0.5, border: '1px solid #333', fontSize: 13 }}>
									PRICE
								</Typography>
								<Typography sx={{ p: 0.5, border: '1px solid #333', fontSize: 13 }}>
									TOTAL
								</Typography>
							</Box>
							{cartItems.map((item, index) => (
								<Box
									key={index}
									sx={{
										display: 'grid',
										gridTemplateColumns: '2fr 1fr 1fr 1fr',
										borderBottom: '1px solid #ddd',
										p: 0.5
									}}
								>
									<Typography
										sx={{
											p: 0.5,
											border: '1px solid #ddd',
											fontSize: 13
										}}
									>
										{item.productName}
									</Typography>
									<Typography
										sx={{
											p: 0.5,
											border: '1px solid #ddd',
											fontSize: 13
										}}
									>
										{item.quantity}
									</Typography>
									<Typography
										sx={{
											p: 0.5,
											border: '1px solid #ddd',
											fontSize: 13
										}}
									>
										LKR {item.price.toFixed(2)}
									</Typography>
									<Typography
										sx={{
											p: 0.5,
											border: '1px solid #ddd',
											fontSize: 13
										}}
									>
										LKR {item.total.toFixed(2)}
									</Typography>
								</Box>
							))}
						</Box>
						<Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
							<Box sx={{ width: '220px' }}>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										borderBottom: '1px solid #ddd',
										pb: 0.5,
										mb: 0.5
									}}
								>
									<Typography variant="body2">
										SUB TOTAL
									</Typography>
									<Typography variant="body2">
										LKR {subtotal.toFixed(2)}
									</Typography>
								</Box>
								{percentages.customDiscount && (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											borderBottom: '1px solid #ddd',
											pb: 0.5,
											mb: 0.5
										}}
									>
										<Typography variant="body2">
											DISCOUNT ({percentages.discount}%)
										</Typography>
										<Typography variant="body2">
											-LKR {discountAmount.toFixed(2)}
										</Typography>
									</Box>
								)}
								{percentages.customGift && (
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											borderBottom: '1px solid #ddd',
											pb: 0.5,
											mb: 0.5
										}}
									>
										<Typography variant="body2">
											GIFT
										</Typography>
										<Typography variant="body2">
											LKR {giftCost.toFixed(2)}
										</Typography>
									</Box>
								)}
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										fontWeight: 'bold',
										color: '#f56c00'
									}}
								>
									<Typography variant="body2">
										GRAND TOTAL
									</Typography>
									<Typography variant="body2">
										LKR {totalAmount.toFixed(2)}
									</Typography>
								</Box>
							</Box>
						</Box>
						<Box sx={{ mt: 2, borderTop: '1px solid #ddd', pt: 1 }}>
							<Typography variant="caption">
								TERMS: Payments must be made in full upon order completion via cash, card, or digital
								payment methods. Any disputes regarding pricing must be raised immediately.
							</Typography>
						</Box>
						<Box sx={{ mt: 2, textAlign: 'center', color: '#555' }}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 'bold', fontSize: 14 }}
							>
								Thank you for choosing Cinnamon Miracle! We appreciate your trust and look forward to
								serving you again.
							</Typography>
							<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 0.5 }}>
								<Typography variant="caption">
									© 2025 Cinnamon Miracle
								</Typography>
								<Typography variant="caption">
									@CinnamonMiracle
								</Typography>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 2, py: 1 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleDownloadPDF}
						disabled={sendingEmail}
						sx={{ mr: 1, py: 0.5, px: 2, fontSize: 13 }}
					>
						{sendingEmail ? 'Processing...' : 'Download Invoice'}
					</Button>
					<Button
						onClick={() => setBillDialogOpen(false)}
						color="secondary"
						sx={{ py: 0.5, px: 2, fontSize: 13 }}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default NewOrders;