import React from 'react';
import JwtSignInForm from '../../../auth/services/jwt/components/JwtSignInForm';

function JwtSignInTab() {
	return (
		<div className="w-full">
			<JwtSignInForm />

			<div className="mt-32 flex items-center">
				<div className="mt-px flex-auto border-t" />
				<span
					style={{
						padding: '4px 12px',
						borderRadius: '16px',
						color: '#3fd32f',
						backgroundColor: '#f4fdf3',
						fontSize: '12px',
						fontWeight: 500,
						textAlign: 'center',
						minWidth: '80px',
						zIndex: 1
					}}
				>
					Welcome to the Nexora HR management System.
				</span>
				<div className="mt-px flex-auto border-t" />
			</div>

			{/* <div className="mt-32 flex items-center space-x-16"> */}
			{/*	<Button */}
			{/*		variant="outlined" */}
			{/*		className="flex-auto" */}
			{/*		sx={{ */}
			{/*			borderColor: '#4267B2', */}
			{/*			color: '#4267B2', */}
			{/*			'&:hover': { */}
			{/*				borderColor: '#4267B2', */}
			{/*				backgroundColor: 'rgba(66, 103, 178, 0.04)' */}
			{/*			} */}
			{/*		}} */}
			{/*	> */}
			{/*		<svg */}
			{/*			xmlns="http://www.w3.org/2000/svg" */}
			{/*			width="20" */}
			{/*			height="20" */}
			{/*			viewBox="0 0 24 24" */}
			{/*			fill="#4267B2" */}
			{/*		> */}
			{/*			<path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" /> */}
			{/*		</svg> */}
			{/*	</Button> */}
			{/*	<Button */}
			{/*		variant="outlined" */}
			{/*		className="flex-auto" */}
			{/*		sx={{ */}
			{/*			borderColor: '#1DA1F2', */}
			{/*			color: '#1DA1F2', */}
			{/*			'&:hover': { */}
			{/*				borderColor: '#1DA1F2', */}
			{/*				backgroundColor: 'rgba(29, 161, 242, 0.04)' */}
			{/*			} */}
			{/*		}} */}
			{/*	> */}
			{/*		<svg */}
			{/*			xmlns="http://www.w3.org/2000/svg" */}
			{/*			width="20" */}
			{/*			height="20" */}
			{/*			viewBox="0 0 24 24" */}
			{/*			fill="#1DA1F2" */}
			{/*		> */}
			{/*			<path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" /> */}
			{/*		</svg> */}
			{/*	</Button> */}
			{/*	<Button */}
			{/*		variant="outlined" */}
			{/*		className="flex-auto" */}
			{/*		sx={{ */}
			{/*			borderColor: '#333', */}
			{/*			color: '#333', */}
			{/*			'&:hover': { */}
			{/*				borderColor: '#333', */}
			{/*				backgroundColor: 'rgba(51, 51, 51, 0.04)' */}
			{/*			} */}
			{/*		}} */}
			{/*	> */}
			{/*		<svg */}
			{/*			xmlns="http://www.w3.org/2000/svg" */}
			{/*			width="20" */}
			{/*			height="20" */}
			{/*			viewBox="0 0 24 24" */}
			{/*			fill="#333" */}
			{/*		> */}
			{/*			<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /> */}
			{/*		</svg> */}
			{/*	</Button> */}
			{/* </div> */}
		</div>
	);
}

export default JwtSignInTab;
