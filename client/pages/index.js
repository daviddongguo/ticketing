const LandingPage = ({currentUser}) => {
	return currentUser ? (
		<h1>Signed in as {currentUser.email}</h1>
	) : (
		<h1>NOT signed in!</h1>
	);
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
	return {};
};

export default LandingPage;
