import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
	Action,
	AsyncActionCreators,
	ActionCreatorFactory,
	Failure,
	Success
} from 'typescript-fsa';

/**
 * It's either a promise, or it isn't
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export type AsyncWorker<P, S, T, U = any> = (
	params: P,
	dispatch: Dispatch<T>,
	getState: () => T,
	extra: U
) => MaybePromise<S>;

/** A function that takes parameters and returns a redux-thunk */
export type ThunkActionCreator<P, R, S, U> =
	(params?: P) => ThunkAction<R, S, U>;

/**
 * Bind a redux-thunk to typescript-fsa async action creators
 * @param actionCreators The typescript-fsa async action creators
 * @param asyncWorker A redux-thunk with extra `params` as the first argument
 * @returns a ThunkActionCreator, the result of which you can pass to dispatch()
 */
export const bindThunkAction = <P, S, E, T, U = any>(
	actionCreators: AsyncActionCreators<P, S, E>,
	asyncWorker: AsyncWorker<P, S, T, U>
): ThunkActionCreator<P, Promise<S>, T, U> => params => async (
	dispatch,
	getState,
	extra
) => {
	try {
		dispatch(actionCreators.started(params!));
		const result = await asyncWorker(params!, dispatch, getState, extra);
		dispatch(actionCreators.done({ params: params!, result }));
		return result;
	} catch (error) {
		dispatch(actionCreators.failed({ params: params!, error }));
		throw error;
	}
};

/**
 * Factory function to easily create a typescript-fsa redux thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */

export const asyncFactory = <T = any, U = any>(
	factory: ActionCreatorFactory
) => <P, S, E = Error>(
	type: string,
	fn: AsyncWorker<P, S, T, U>,
	async = factory.async<P, S, E>(type)
) => ({ async, action: bindThunkAction(async, fn) });

/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkActionCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkActionCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export const thunkToAction = <P, R, S, U>(
	thunkActionCreator: ThunkActionCreator<P, R, S, U>
): ((params?: P) => R) => thunkActionCreator as any;

export default bindThunkAction;
