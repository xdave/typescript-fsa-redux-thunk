import * as chai from 'chai';
import { Middleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import configureStore, { MockStore } from 'redux-mock-store';
import factory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import thunk, { isPromise, isFailure, isSuccess } from '.';

const { expect } = chai;

const fakeError = new Error('Fake Error');

interface S {
	foo: string;
	updating?: boolean;
	error?: Error;
}

interface P { param: number; }
type R = string;

const create = factory('test');

const successTestA = create.async<undefined, undefined>('success');
const successTest = thunk(successTestA, () => { /* noop */ });
const failureTestT = create.async<undefined, undefined, Error>('failure');
const failureTest = thunk(successTestA, () => { throw fakeError; });

const test1A = create.async<S, P, R, Error>('test1');
const test1 = thunk(test1A, async ({ param }) => {
	if (param === 2) {
		throw fakeError;
	}
	return '';
});

const test2A = create.async<S, undefined, R, Error>('test2');
const test2 = thunk(test2A, () => '');

const test3A = create.async<S, undefined, R, Error>('test3');
const test3 = thunk(test3A, () => { throw fakeError; });

const test4A = create.async<S, P, R, Error>('test4');
const test4 = thunk(test4A, async ({ param }, dispatch, getState) => {
	const one = await dispatch(test1({ param }));
	if (isSuccess(one)) {
		if (isSuccess(await dispatch(test1({ param: one.payload.params.param })))) {
			const two = dispatch(test2());
			if (!isPromise(two) && isSuccess(two)) {
				const three = dispatch(test3());
				if (!isPromise(three) && isFailure(three)) {
					return 'This is a test.';
				}
			}
		}
	}
	return 'Should not get here';
});

const initial: S = { foo: 'test' };

const reducer = reducerWithInitialState(initial)
	.case(test4A.started, state => ({
		...state,
		updating: true
	}))
	.case(test4A.failed, (state, { error }) => ({
		...state,
		updating: false,
		error
	}))
	.case(test4A.done, (state, { result: foo }) => ({
		...state,
		updating: false,
		foo
	}))
	.build();

describe('typescript-fsa-redux-thunk', () => {
	let middleware: Middleware[] = [];
	let createMockStore: (initial: S) => MockStore<S>;
	let store: MockStore<S>;

	beforeEach(() => {
		middleware = [thunkMiddleware];
		createMockStore = configureStore(middleware);
		store = createMockStore(initial) as MockStore<S>;
	});

	describe('type assertion helpers', () => {
		it('isPromise()', () => {
			expect(isPromise(Promise.resolve('test'))).to.be.true;
			expect(isPromise('test')).to.be.false;
		});

		it('isSuccess()', async () => {
			const success = await store.dispatch(successTest());
			expect(isSuccess(success)).to.be.true;
			const failure = await store.dispatch(failureTest());
			expect(isSuccess(failure)).to.be.false;
		});

		it('isFailure()', async () => {
			const failure = await store.dispatch(failureTest());
			expect(isFailure(failure)).to.be.true;
			const success = await store.dispatch(successTest());
			expect(isFailure(success)).to.be.false;
		});
	});

	describe('ThunkActionCreators', () => {
		it('started', () => {
			const result = store.dispatch(test1A.started({ param: 1 }));
			expect(result).to.eql({
				type: 'test/test1_STARTED',
				payload: { param: 1 }
			});
		});
		it('failed', () => {
			const result = store.dispatch(test1A.failed({
				params: { param: 1 },
				error: fakeError
			}));
			expect(result).to.eql({
				type: 'test/test1_FAILED',
				error: true,
				payload: {
					params: { param: 1 },
					error: fakeError
				}
			});
		});
		it('done', async () => {
			const promise = await Promise.resolve('');
			const result = store.dispatch(test1A.done({
				params: { param: 1 },
				result: promise
			}));
			expect(result).to.eql({
				type: 'test/test1_DONE',
				payload: {
					params: { param: 1 },
					result: promise
				}
			});
		});
		it('full dispatch (success)', async () => {
			const result = await store.dispatch(test1({ param: 1 }));

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test1_STARTED',
					payload: { param: 1 }
				},
				{
					type: 'test/test1_DONE',
					payload: {
						params: { param: 1 },
						result: ''
					}
				}
			]);
		});
		it('full dispatch (failure)', async () => {
			const result = await store.dispatch(test1({ param: 2 }));

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test1_STARTED',
					payload: { param: 2 }
				},
				{
					type: 'test/test1_FAILED',
					error: true,
					payload: {
						params: { param: 2 },
						error: fakeError
					}
				}
			]);
		});
		it('dispatch without an argument', () => {
			const result = store.dispatch(test2());

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test2_STARTED',
					payload: undefined
				},
				{
					type: 'test/test2_DONE',
					payload: {
						params: undefined,
						result: ''
					}
				}
			]);
		});

		it('dispatch without an argument (failure)', () => {
			const result = store.dispatch(test3());

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test3_STARTED',
					payload: undefined
				},
				{
					type: 'test/test3_FAILED',
					error: true,
					payload: {
						params: undefined,
						error: fakeError
					}
				}
			]);
		});

		it('full test', async () => {
			const result = await store.dispatch(test4({ param: 1 }));

			const actions = store.getActions();
			expect(actions).to.eql([
				{
					type: 'test/test4_STARTED',
					payload: { param: 1 }
				},
				{
					type: 'test/test1_STARTED',
					payload: { param: 1 }
				},
				{
					type: 'test/test1_DONE',
					payload: {
						params: { param: 1 },
						result: ''
					}
				},
				{
					type: 'test/test1_STARTED',
					payload: { param: 1 }
				},
				{
					type: 'test/test1_DONE',
					payload: {
						params: { param: 1 },
						result: ''
					}
				},
				{
					type: 'test/test2_STARTED',
					payload: undefined
				},
				{
					type: 'test/test2_DONE',
					payload: {
						params: undefined,
						result: ''
					}
				},
				{
					type: 'test/test3_STARTED',
					payload: undefined
				},
				{
					type: 'test/test3_FAILED',
					error: true,
					payload: {
						params: undefined,
						error: fakeError
					}
				},
				{
					type: 'test/test4_DONE',
					payload: {
						params: { param: 1 },
						result: 'This is a test.'
					}
				}
			]);
		});

		it('reducer test', async () => {
			const result = await store.dispatch(test4({ param: 1 }));

			const [started, done] = store.getActions().filter(action =>
					action.type.includes('test4'));

			const beforeState = store.getState();
			expect(beforeState).to.eql(initial);

			const startedState = reducer(beforeState, started);
			expect(startedState).to.eql({
				...beforeState,
				updating: true
			});

			const doneState = reducer(startedState, done);
			expect(doneState).to.eql({
				...startedState,
				updating: false,
				foo: 'This is a test.'
			});
		});
	});
});
