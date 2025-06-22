import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import CardContent from '@mui/material/CardContent';
import JwtLoginTab from './tabs/JwtSignInTab';
import FirebaseSignInTab from './tabs/FirebaseSignInTab';
import AwsSignInTab from './tabs/AwsSignInTab';
import image from '../../assets/charming-blonde-employee-having-fun-with-colleagues-posing-photo-light-room-team-it-specialists-ended-big-hard-business-project-shaking-hands.jpg';

const tabs = [
	{
		id: 'jwt',
		title: 'JWT',
		logo: 'assets/images/logo/jwt.svg',
		logoClass: 'h-80 p-4 rounded-12'
	}
];

/**
 * The sign in page.
 */
function SignInPage() {
	const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

	function handleSelectTab(id: string) {
		setSelectedTabId(id);
	}

	return (
		<div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-40">
			<Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
				<div className="w-full px-16 py-32 ltr:border-r-1 rtl:border-l-1 sm:w-auto sm:p-48 md:p-64">
					<CardContent className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
						{/* <img
							className="w-48"
							src="assets/images/logo/logo.svg"
							alt="logo"
						/> */}

						<Typography className="text-4xl text-gray-800 font-extrabold leading-tight tracking-tight">
							Sign In
						</Typography>
						<div className="mt-2 flex items-baseline font-medium">
							{/* <Typography>Don't have an account?</Typography> */}
							{/* <Link */}
							{/*	className="ml-4" */}
							{/*	// to="/sign-up" */}
							{/*	to="" */}
							{/* > */}
							{/*	Sign up */}
							{/* </Link> */}
						</div>

						{/* Remove Logo */}

						{/* eslint-disable-next-line react/jsx-no-undef */}

						{selectedTabId === 'jwt' && <JwtLoginTab />}
						{selectedTabId === 'firebase' && <FirebaseSignInTab />}
						{selectedTabId === 'aws' && <AwsSignInTab />}
					</CardContent>
				</div>
				<Box
					className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
					sx={{
						backgroundImage: `url(${image})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center'
					}}
				/>
			</Paper>
		</div>
	);
}

export default SignInPage;
