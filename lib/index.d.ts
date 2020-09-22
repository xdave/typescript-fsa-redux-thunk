import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type { ActionCreatorFactory, AnyAction, AsyncActionCreators } from 'typescript-fsa';
/**
 * This interface can be augmented by users to add default types for the root state when
 * using `typescript-fsa-redux-thunk`.
 * Use module augmentation to append your own type definition in a your_custom_type.d.ts file.
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
export interface DefaultRootState {
}
/**
 * It's either a promise, or it isn't
 */
export declare type MaybePromise<T> = T | Promise<T>;
/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export declare type AsyncWorker<InputType, ReturnType, State = DefaultRootState, Extra = unknown> = (params: InputType, dispatch: ThunkDispatch<State, Extra, AnyAction>, getState: () => State, extraArgument: Extra) => MaybePromise<ReturnType>;
/** Workaround for typescript-fsa issue #77 */
export declare type ThunkReturnType<T> = T extends void ? unknown : T extends Promise<T> ? Promise<T> : T;
declare type SmartThunkFunction<State, InputType, ReturnType, Error, Extra> = unknown extends InputType ? ThunkFunctionWithoutParams<ThunkReturnType<ReturnType>, State, Error, Extra> : ThunkFunction<InputType, ThunkReturnType<ReturnType>, State, Error, Extra>;
/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
export declare const asyncFactory: <State = DefaultRootState, Extra = unknown>(factory: ActionCreatorFactory, resolve?: () => Promise<void>) => <InputType, ReturnType_1, Error_1 = unknown>(type: string, worker: AsyncWorker<InputType, ThunkReturnType<ReturnType_1>, State, Extra>, commonMeta?: {
    [key: string]: any;
} | null | undefined) => SmartThunkFunction<State, InputType, ReturnType_1, Error_1, Extra>;
export declare type ThunkFunctionAction<ReturnType, State = DefaultRootState, Extra = unknown> = (dispatch: ThunkDispatch<State, Extra, AnyAction>, getState: () => State, extraArgument: Extra) => Promise<ReturnType>;
export interface ThunkFunction<InputType, ReturnType, State = DefaultRootState, Error = unknown, Extra = unknown> {
    (params: InputType): ThunkFunctionAction<ReturnType, State, Extra>;
    action(params: InputType): ThunkFunctionAction<ReturnType, State, Extra>;
    async: AsyncActionCreators<InputType, ReturnType, Error>;
}
export interface ThunkFunctionWithoutParams<ReturnType, State = DefaultRootState, Error = unknown, Extra = unknown> {
    (): ThunkFunctionAction<ReturnType, State, Extra>;
    action(): ThunkFunctionAction<ReturnType, State, Extra>;
    async: AsyncActionCreators<unknown, ReturnType, Error>;
}
/** Utility type for a function that takes paras and returns a redux-thunk */
export declare type ThunkCreator<InputType, ReturnType, State = DefaultRootState> = (params?: InputType) => ThunkAction<Promise<ReturnType>, State, unknown, AnyAction>;
/** The result type for thunkToAction below */
export declare type ThunkFn<InputType, ReturnType> = (params?: InputType) => Promise<ReturnType>;
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export declare function thunkToAction<InputType, ReturnType, State = DefaultRootState>(thunkCreator: ThunkCreator<InputType, ReturnType, State>): ThunkFn<InputType, ReturnType>;
export default asyncFactory;
//# sourceMappingURL=index.d.ts.map