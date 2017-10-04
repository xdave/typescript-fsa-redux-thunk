import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
	Action,
	AsyncActionCreators,
	ActionCreatorFactory,
	Failure,
	Success
} from 'typescript-fsa';

declare module 'typescript-fsa' {
	export interface ActionCreatorFactory {
		async<State, Params, Result, Err>(
			prefix?: string,
			commonMeta?: Meta
		): ThunkActionCreators<State, Params, Result, Err>;
	}
}

export interface ThunkActionCreators<State, Params, Result, Err>
	extends AsyncActionCreators<Params, Result, Err> {}

export type AsyncWorker<State, Params, Result, Extra = any> = (
	params: Params,
	dispatch: Dispatch<State>,
	getState: () => State,
	extra: Extra
) => Result | Promise<Result> | undefined | void;

export const isPromise = <T>(
	thing?: T | Promise<T> | void
): thing is Promise<T> => thing instanceof Promise;

export const isFailure = <Params, Result, Err>(
	action?: Action<Success<Params, Result> | Failure<Params, Err>>
): action is Action<Failure<Params, Err>> => !!action && !!action.error;

export const isSuccess = <Params, Result, Err>(
	action?: Action<Success<Params, Result> | Failure<Params, Err>>
): action is Action<Success<Params, Result>> => !!action && !!!action.error;

export const thunkToAction = <State, Params, Result, Err>(
	thunk: (params?: Params) => ThunkAction<Result, State, any>
) => thunk as any as (params?: Params) => Result;

export const bindThunkAction = <State, Params, Result, Err, Extra = any>(
	asyncAction: ThunkActionCreators<State, Params, Result, Err>,
	worker: AsyncWorker<State, Params, Result, Extra>
) => (params?: Params) =>
		(dispatch: Dispatch<State>, getState: () => State, e: Extra) => {
			dispatch(asyncAction.started(params as Params));
			try {
				const result = worker(params as Params, dispatch, getState, e);
				if (isPromise(result)) {
					return (
						result.then(result => dispatch(asyncAction.done({
							params: params as Params, result
						}))).catch(error => dispatch(asyncAction.failed({
							params: params as Params, error
						})))
					) as Promise<Action<Success<Params, Result> | Failure<Params, Err>>>;
				}
				return dispatch(asyncAction.done({
					params: params as Params,
					result: result as Result
				}));
			} catch (error) {
				return dispatch(asyncAction.failed({
					params: params as Params,
					error
				}));
			}
		};

export default bindThunkAction;
