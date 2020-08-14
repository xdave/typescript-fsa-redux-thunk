import { expect } from 'chai';
import { Middleware, AnyAction } from 'redux';
import thunkMiddleware, { ThunkDispatch } from 'redux-thunk';
import configureStore, { MockStore } from 'redux-mock-store';
import factory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { thunkToAction, asyncFactory } from '.';

interface Ext {
	dispatch: ThunkDispatch<State, any, AnyAction>;
}

const fakeError = new Error('Fake Error');

class OtherError extends Error {}

const otherError = new OtherError('Another fake error');

interface State {
	foo: string;
	updating?: boolean;
	error?: Error;
	otherError?: OtherError;
}

interface Params {
	param: number;
}
type Succ = string;

const create = factory('test');
const createAsync = asyncFactory<State>(create);

const successTest = createAsync('success', () => {
	/* noop */
});
// const failureTest = createAsync('failure', () => { throw fakeError; });

const test1 = createAsync<Params, Succ>('test1', async ({ param }) => {
	if (param === 2) {
		throw fakeError;
	}
	return '';
});

const test2 = createAsync('test2', () => '');

const test3 = createAsync('test3', () => {
	throw fakeError;
});

const test4 = createAsync<Params, Succ, Error>(
	'test4',
	async ({ param }, dispatch, getState) => {
		await dispatch(test1({ param }));
		await dispatch(test2());
		try {
			await dispatch(test3());
		} catch (err) {
			// noop
		}
		return 'This is a test.';
	},
);

const test5 = createAsync<Params, Succ, OtherError>(
	'test5',
	async ({ param }) => {
		if (param === 2) {
			throw otherError;
		}
		return '';
	},
);

const test6 = createAsync('test6', Promise.resolve);
const test7 = createAsync('test7', () => {
	/* noop */
});

const initial: State = { foo: 'test' };

const reducer = reducerWithInitialState(initial)
	.case(test4.async.started, (state) => ({
		...state,
		updating: true,
	}))
	.case(test4.async.failed, (state, { error }) => ({
		...state,
		updating: false,
		error,
	}))
	.case(test4.async.done, (state, { result: foo }) => ({
		...state,
		updating: false,
		foo,
	}))
	.case(test5.async.failed, (state, { error: otherError }) => ({
		...state,
		otherError,
	}))
	.case(test6.async.started, (state) => state)
	.case(test6.async.failed, (state) => state)
	.case(test6.async.done, (state) => state)
	.case(test7.async.started, (state) => state)
	.case(test7.async.failed, (state) => state)
	.case(test7.async.done, (state) => state)
	.build();

describe('typescript-fsa-redux-thunk', () => {
	type StoreType = MockStore<State> & Ext;
	let middleware: Middleware[] = [];
	let createMockStore: (initial: State) => StoreType;
	let store: StoreType;

	beforeEach(() => {
		middleware = [thunkMiddleware];
		createMockStore = configureStore(middleware);
		store = createMockStore(initial);
	});

	describe('ThunkActionCreators', () => {
		it('started', () => {
			const result = store.dispatch(test1.async.started({ param: 1 }));
			expect(result).to.eql({
				type: 'test/test1_STARTED',
				payload: { param: 1 },
			});
		});
		it('failed', () => {
			const result = store.dispatch(
				test1.async.failed({
					params: { param: 1 },
					error: fakeError,
				}),
			);
			expect(result).to.eql({
				type: 'test/test1_FAILED',
				error: true,
				payload: {
					params: { param: 1 },
					error: fakeError,
				},
			});
		});
		it('done', async () => {
			const promise = await Promise.resolve('');
			const result = store.dispatch(
				test1.async.done({
					params: { param: 1 },
					result: promise,
				}),
			);
			expect(result).to.eql({
				type: 'test/test1_DONE',
				payload: {
					params: { param: 1 },
					result: promise,
				},
			});
		});
		it('full dispatch (success)', async () => {
			await store.dispatch(test1({ param: 1 }));

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test1_STARTED',
					payload: { param: 1 },
				},
				{
					type: 'test/test1_DONE',
					payload: {
						params: { param: 1 },
						result: '',
					},
				},
			]);
		});
		it('full dispatch (failure)', async () => {
			let thrown;
			try {
				await store.dispatch(test1({ param: 2 }));
			} catch (err) {
				thrown = err;
			}

			expect(thrown).to.eql(fakeError);

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test1_STARTED',
					payload: { param: 2 },
				},
				{
					type: 'test/test1_FAILED',
					error: true,
					payload: {
						params: { param: 2 },
						error: fakeError,
					},
				},
			]);
		});
		it('full dispatch (failure with error type)', async () => {
			let thrown;
			try {
				await store.dispatch(test5({ param: 2 }));
			} catch (err) {
				thrown = err;
			}

			expect(thrown).to.eql(otherError);

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test5_STARTED',
					payload: { param: 2 },
				},
				{
					type: 'test/test5_FAILED',
					error: true,
					payload: {
						params: { param: 2 },
						error: otherError,
					},
				},
			]);

			const [, failed] = actions;
			const initialState = store.getState();
			const failedState = reducer(initialState, failed);
			expect(failedState).to.eql({
				...initialState,
				otherError,
			});
		});
		it('dispatch without an argument', async () => {
			await store.dispatch(test2());

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test2_STARTED',
					payload: undefined,
				},
				{
					type: 'test/test2_DONE',
					payload: {
						params: undefined,
						result: '',
					},
				},
			]);
		});

		it('dispatch without an argument (failure)', async () => {
			let thrown;
			try {
				await store.dispatch(test3());
			} catch (err) {
				thrown = err;
			}

			expect(thrown).to.eql(fakeError);

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test3_STARTED',
					payload: undefined,
				},
				{
					type: 'test/test3_FAILED',
					error: true,
					payload: {
						params: undefined,
						error: fakeError,
					},
				},
			]);
		});

		it('full test', async () => {
			await store.dispatch(test4({ param: 1 }));

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test4_STARTED',
					payload: { param: 1 },
				},
				{
					type: 'test/test1_STARTED',
					payload: { param: 1 },
				},
				{
					type: 'test/test1_DONE',
					payload: {
						params: { param: 1 },
						result: '',
					},
				},
				{
					type: 'test/test2_STARTED',
					payload: undefined,
				},
				{
					type: 'test/test2_DONE',
					payload: {
						params: undefined,
						result: '',
					},
				},
				{
					type: 'test/test3_STARTED',
					payload: undefined,
				},
				{
					type: 'test/test3_FAILED',
					error: true,
					payload: {
						params: undefined,
						error: fakeError,
					},
				},
				{
					type: 'test/test4_DONE',
					payload: {
						params: { param: 1 },
						result: 'This is a test.',
					},
				},
			]);
		});

		it('thunkToAction', async () => {
			const action = thunkToAction(successTest);
			expect(action).to.eql(successTest);
		});

		it('reducer test', async () => {
			await store.dispatch(test4({ param: 1 }));

			const [started, done] = store
				.getActions()
				.filter((action) => action.type.includes('test4'));

			const beforeState = store.getState();
			expect(beforeState).to.eql(initial);

			const startedState = reducer(beforeState, started);
			expect(startedState).to.eql({
				...beforeState,
				updating: true,
			});

			const doneState = reducer(startedState, done);
			expect(doneState).to.eql({
				...startedState,
				updating: false,
				foo: 'This is a test.',
			});
		});
	});
});
