import { AnyAction } from 'redux';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { AsyncActionCreators, ActionCreatorFactory } from 'typescript-fsa';
/**
 * It's either a promise, or it isn't
 */
export declare type MaybePromise<Type> = Type | Promise<Type>;
/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export declare type AsyncWorker<Params, Succ, State, Extra = any> = (params: Params, dispatch: ThunkDispatch<State, Extra, AnyAction>, getState: () => State, extra: Extra) => MaybePromise<Succ>;
/** A function that takes parameters and returns a redux-thunk */
export declare type ThunkActionCreator<Params, Result, State, Extra> = (params?: Params) => ThunkAction<Result, State, Extra, AnyAction>;
/**
 * Bind a redux-thunk to typescript-fsa async action creators
 * @param actionCreators The typescript-fsa async action creators
 * @param asyncWorker A redux-thunk with extra `params` as the first argument
 * @returns a ThunkActionCreator, the result of which you can pass to dispatch()
 */
export declare const bindThunkAction: <Params, Succ, Err, State, Extra = any>(actionCreators: AsyncActionCreators<Params, Succ, Err>, asyncWorker: AsyncWorker<Params, Succ, State, Extra>) => ThunkActionCreator<Params, Promise<Succ>, State, Extra>;
/**
 * Factory function to easily create a typescript-fsa redux thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
export declare const asyncFactory: <State = any, Extra = any>(factory: ActionCreatorFactory) => <Params, Succ, Err = Error>(type: string, fn: AsyncWorker<Params, Succ, State, Extra>, async?: AsyncActionCreators<Params, Succ, Err>) => {
    async: AsyncActionCreators<Params, Succ, Err>;
    action: ThunkActionCreator<Params, Promise<Succ>, State, Extra>;
};
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkActionCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkActionCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export declare const thunkToAction: <Params, Succ, State, Extra>(thunkActionCreator: ThunkActionCreator<Params, Succ, State, Extra>) => (params?: Params | undefined) => Succ;
export default bindThunkAction;
