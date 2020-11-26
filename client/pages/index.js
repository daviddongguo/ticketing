import buildClient from '../api/build-client';

const LandingPage = ({currentUser}) => {
	return currentUser ? (
		<h1>Your signed in as {currentUser.email}</h1>
	) : (
		<h1>Your are not signed in!</h1>
	);
};

LandingPage.getInitialProps = async (context) => {
	const client = buildClient(context);
	const {data} = await client.get('/api/users/currentuser');
	return data;
};

export default LandingPage;
