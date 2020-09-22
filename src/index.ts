import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type {
  ActionCreatorFactory,
  AnyAction,
  AsyncActionCreators,
  Meta,
} from 'typescript-fsa';

/**
 * This interface can be augmented by users to add default types for the root state when
 * using `typescript-fsa-redux-thunk`.
 * Use module augmentation to append your own type definition in a your_custom_type.d.ts file.
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultRootState {}

/**
 * It's either a promise, or it isn't
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export type AsyncWorker<
  InputType,
  ReturnType,
  State = DefaultRootState,
  Extra = unknown
> = (
  params: InputType,
  dispatch: ThunkDispatch<State, Extra, AnyAction>,
  getState: () => State,
  extraArgument: Extra,
) => MaybePromise<ReturnType>;

/** Workaround for typescript-fsa issue #77 */
export type ThunkReturnType<T> = T extends void
  ? unknown
  : T extends Promise<T>
  ? Promise<T>
  : T;

type SmartThunkFunction<
  State,
  InputType,
  ReturnType,
  Error,
  Extra
> = unknown extends InputType
  ? ThunkFunctionWithoutParams<ThunkReturnType<ReturnType>, State, Error, Extra>
  : ThunkFunction<InputType, ThunkReturnType<ReturnType>, State, Error, Extra>;

/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
export const asyncFactory = <State = DefaultRootState, Extra = unknown>(
  factory: ActionCreatorFactory,
  resolve: () => Promise<void> = Promise.resolve.bind(Promise),
) => <InputType, ReturnType, Error = unknown>(
  type: string,
  worker: AsyncWorker<InputType, ThunkReturnType<ReturnType>, State, Extra>,
  commonMeta?: Meta,
): SmartThunkFunction<State, InputType, ReturnType, Error, Extra> => {
  type Procedure = ThunkFunction<
    InputType,
    ThunkReturnType<ReturnType>,
    State,
    Error,
    Extra
  >;
  const async = factory.async<InputType, ThunkReturnType<ReturnType>, Error>(
    type,
    commonMeta,
  );
  const fn: Procedure = (params) => (dispatch, getState, extraArgument) =>
    resolve()
      .then(() => {
        dispatch(async.started(params));
      })
      .then(() => worker(params, dispatch, getState, extraArgument))
      .then(
        (result) => {
          dispatch(async.done({ params, result }));
          return result;
        },
        (error) => {
          dispatch(async.failed({ params, error }));
          throw error;
        },
      );
  fn.action = (params) => fn(params);
  fn.async = async;
  return (fn as unknown) as SmartThunkFunction<
    State,
    InputType,
    ReturnType,
    Error,
    Extra
  >;
};
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */

export type ThunkFunctionAction<
  ReturnType,
  State = DefaultRootState,
  Extra = unknown
> = (
  dispatch: ThunkDispatch<State, Extra, AnyAction>,
  getState: () => State,
  extraArgument: Extra,
) => Promise<ReturnType>;

export interface ThunkFunction<
  InputType,
  ReturnType,
  State = DefaultRootState,
  Error = unknown,
  Extra = unknown
> {
  (params: InputType): ThunkFunctionAction<ReturnType, State, Extra>;
  action(params: InputType): ThunkFunctionAction<ReturnType, State, Extra>;
  async: AsyncActionCreators<InputType, ReturnType, Error>;
}

export interface ThunkFunctionWithoutParams<
  ReturnType,
  State = DefaultRootState,
  Error = unknown,
  Extra = unknown
> {
  (): ThunkFunctionAction<ReturnType, State, Extra>;
  action(): ThunkFunctionAction<ReturnType, State, Extra>;
  async: AsyncActionCreators<unknown, ReturnType, Error>;
}

/** Utility type for a function that takes paras and returns a redux-thunk */
export type ThunkCreator<InputType, ReturnType, State = DefaultRootState> = (
  params?: InputType,
) => ThunkAction<Promise<ReturnType>, State, unknown, AnyAction>;

/** The result type for thunkToAction below */
export type ThunkFn<InputType, ReturnType> = (
  params?: InputType,
) => Promise<ReturnType>;

/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export function thunkToAction<InputType, ReturnType, State = DefaultRootState>(
  thunkCreator: ThunkCreator<InputType, ReturnType, State>,
): ThunkFn<InputType, ReturnType> {
  return (thunkCreator as unknown) as ThunkFn<InputType, ReturnType>;
}

export default asyncFactory;
