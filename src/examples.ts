import 'isomorphic-fetch';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import actionCreatorFactory from 'typescript-fsa';
import { asyncFactory } from '.';

/** Parameters used for logging in */
interface LoginParams {
	email: string;
	password: string;
}

/** The object that comes back from the server on successful login */
interface UserToken {
	token: string;
}

/** The shape of our Redux store's state */
interface State {
	title: string;
	userToken: UserToken;
	loggingIn?: boolean;
	error?: Error;
}

/** The typescript-fsa action creator factory function */
const create = actionCreatorFactory('examples');

/** The typescript-fsa-redux-thunk async action creator factory function */
const createAsync = asyncFactory<State>(create);

/** Normal synchronous action */
const changeTitle = create<string>('Change the title');

/** The asynchronous login action */
const login = createAsync<LoginParams, UserToken>(
	'Login',
	async (params, dispatch) => {
		const url = `https://reqres.in/api/login`;
		const options: RequestInit = {
			method: 'POST',
			body: JSON.stringify(params),
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		};
		const res = await fetch(url, options);
		if (!res.ok) {
			throw new Error(
				`Error ${res.status}: ${res.statusText} ${await res.text()}`);
		}

		dispatch(changeTitle('You are logged-in'));

		return res.json();
	}
);

/** An initial value for the application state */
const initial: State = {
	title: 'Please login',
	userToken: {
		token: ''
	}
};

/** Reducer, handling updates to indicate logging-in status/error */
const reducer = reducerWithInitialState(initial)
	.case(changeTitle, (state, title) => ({
		...state,
		title
	}))
	.case(login.async.started, state => ({
		...state,
		loggingIn: true,
		error: undefined
	}))
	.case(login.async.failed, (state, { error }) => ({
		...state,
		loggingIn: false,
		error
	}))
	.case(login.async.done, (state, { result: userToken }) => ({
		...state,
		userToken,
		loggingIn: false,
		error: undefined
	}));

/** Putting it all together */
(async () => {
	const store = createStore(reducer, applyMiddleware(thunkMiddleware));
	console.log(store.getState().title);

	try {
		const userToken = await store.dispatch(login.action({
			email: 'test@example.com',
			password: 'password'
		}));

		console.log(store.getState().title, userToken);
	} catch (err) {
		console.log(err);
	}
})();
