const SignOut = () => {
	const {doRequest} = useReQuest({
		url: '/api/users/currentuser',
		method: 'post',
		body: {},
		onSuccess: () => Router.push('/'),
	});

	useEffect(() => {
		doRequest();
	}, []);
	return <div>Signing you out...</div>;
};

export default SignOut;
