import * as chai from 'chai';
import { Middleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import configureStore, { MockStore } from 'redux-mock-store';
import factory from 'typescript-fsa';
import thunk, { isPromise, isFailure, isSuccess } from '.';

const { expect } = chai;


interface S { foo: string; }
interface P { param: number; }
type R = string;

const initial: S = { foo: 'test' };
const fakeError = new Error('Fake Error');

const create = factory('test');

const successTestA = create.async<undefined, undefined>('success');
const successTest = thunk(successTestA, () => { /* noop */ });
const failureTestT = create.async<undefined, undefined, Error>('failure');
const failureTest = thunk(successTestA, () => { throw fakeError; });

const test1A = create.async<S, P, Promise<R>, Error>('test1');
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

const test4A = create.async<S, P, Promise<R>, Error>('test4');
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
		it('done', () => {
			const promise = Promise.resolve('');
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
	});
});
