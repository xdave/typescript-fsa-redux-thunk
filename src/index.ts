import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { ActionCreatorFactory, AnyAction, AsyncActionCreators } from 'typescript-fsa';

/**
 * It's either a promise, or it isn't
 */
export type MaybePromise<T> = T | PromiseLike<T>;

/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export type AsyncWorker<P, R, S> = (
	params: P,
	dispatch: ThunkDispatch<S, any, AnyAction>,
	getState: () => S,
) => MaybePromise<R>;

/** Work around for typescript-fsa issue #77 */
export type ThunkReturnType<R> = R extends void
	? unknown
	: R extends PromiseLike<R> ? PromiseLike<R> : R;

/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
export const asyncFactory = <S>(create: ActionCreatorFactory) =>
	<P, R, E extends Error = Error>(
		type: string,
		worker: AsyncWorker<P, ThunkReturnType<R>, S>,
	) => {
		type Procedure = ThunkFunction<S, P, ThunkReturnType<R>, E>;
		const async = create.async<P, ThunkReturnType<R>, E>(type);
		const fn: Procedure = (params) => (dispatch, getState) => Promise.resolve()
			.then(() => { dispatch(async.started(params!)); })
			.then(() => worker(params!, dispatch, getState))
			.then((result) => {
				dispatch(async.done({ params: params!, result }));
				return result;
			})
			.catch((error) => {
				dispatch(async.failed({ params: params!, error }));
				return Promise.reject(error);
			});
		fn.action = fn;
		fn.async = async;
		return fn;
	};


export interface ThunkFunction<S, P, R, E> {
	(params?: P): (
		(dispatch: ThunkDispatch<S, any, AnyAction>, getState: () => S)
		=> Promise<R>
	);
	action(params?: P): ReturnType<this>;
	// tslint:disable-next-line: member-ordering
	async: AsyncActionCreators<P, R, E>;
}

/** Utility type for a function that takes paras and returns a redux-thunk */
export type ThunkCreator<P, R, S> =
	(params?: P) => ThunkAction<PromiseLike<R>, S, any, AnyAction>;

/** The result type for thunkToAction below */
export type ThunkFn<P, R> = (params?: P) => PromiseLike<R>;

/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export const thunkToAction = <P, R, S>(
	thunkCreator: ThunkCreator<P, R, S>,
): ThunkFn<P, R> => thunkCreator as any;

export default asyncFactory;
