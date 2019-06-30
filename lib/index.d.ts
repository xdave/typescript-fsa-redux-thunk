import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { ActionCreatorFactory, AnyAction } from 'typescript-fsa';
/**
 * It's either a promise, or it isn't
 */
export declare type MaybePromise<T> = T | PromiseLike<T>;
/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export declare type AsyncWorker<P, R, S> = (params: P, dispatch: ThunkDispatch<S, any, AnyAction>, getState: () => S) => MaybePromise<R>;
/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
export declare const asyncFactory: <S>(create: ActionCreatorFactory) => <P, R>(type: string, worker: AsyncWorker<P, R, S>) => {
    async: import("typescript-fsa").AsyncActionCreators<P, R, Error>;
    action(params?: P | undefined): ThunkAction<PromiseLike<R>, S, any, AnyAction>;
};
/** Utility type for a function that takes paras and returns a redux-thunk */
export declare type ThunkCreator<P, R, S> = (params?: P) => ThunkAction<PromiseLike<R>, S, any, AnyAction>;
/** The result type for thunkToAction below */
export declare type ThunkFn<P, R> = (params?: P) => PromiseLike<R>;
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export declare const thunkToAction: <P, R, S>(thunkCreator: ThunkCreator<P, R, S>) => ThunkFn<P, R>;
export default asyncFactory;
