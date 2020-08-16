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
export type MaybePromise<T> = T | PromiseLike<T>;

/**
 * A redux-thunk with the params as the first argument.  You don't have to
 * return a promise; but, the result of the dispatch will be one.
 */
export type AsyncWorker<P, R, S = DefaultRootState, A = unknown> = (
  params: P,
  dispatch: ThunkDispatch<S, A, AnyAction>,
  getState: () => S,
  extraArgument: A,
) => MaybePromise<R>;

/** Workaround for typescript-fsa issue #77 */
export type ThunkReturnType<T> = T extends void
  ? unknown
  : T extends PromiseLike<T>
  ? PromiseLike<T>
  : T;

type SmartThunkFunction<S, P, R, E, A> = unknown extends P
  ? ThunkFunctionWithoutParams<S, ThunkReturnType<R>, E, A>
  : ThunkFunction<S, P, ThunkReturnType<R>, E, A>;

/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const asyncFactory = <S = DefaultRootState, A = unknown>(
  factory: ActionCreatorFactory,
  resolve: () => PromiseLike<void> = Promise.resolve.bind(Promise),
) => <P, R, E = unknown>(
  type: string,
  worker: AsyncWorker<P, ThunkReturnType<R>, S, A>,
  commonMeta?: Meta,
) => {
  type Procedure = ThunkFunction<S, P, ThunkReturnType<R>, E, A>;
  const async = factory.async<P, ThunkReturnType<R>, E>(type, commonMeta);
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
  return (fn as unknown) as SmartThunkFunction<S, P, R, E, A>;
};
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */

export type ThunkFunctionAction<S, A, R> = (
  dispatch: ThunkDispatch<S, A, AnyAction>,
  getState: () => S,
  extraArgument: A,
) => PromiseLike<R>;

export interface ThunkFunction<S, P, R, E, A> {
  (params: P): ThunkFunctionAction<S, A, R>;
  action(params: P): ThunkFunctionAction<S, A, R>;
  // tslint:disable-next-line: member-ordering
  async: AsyncActionCreators<P, R, E>;
}

export interface ThunkFunctionWithoutParams<S, R, E, A> {
  (): ThunkFunctionAction<S, A, R>;
  action(): ThunkFunctionAction<S, A, R>;
  // tslint:disable-next-line: member-ordering
  async: AsyncActionCreators<unknown, R, E>;
}

/** Utility type for a function that takes paras and returns a redux-thunk */
export type ThunkCreator<P, R, S = DefaultRootState> = (
  params?: P,
) => ThunkAction<PromiseLike<R>, S, unknown, AnyAction>;

/** The result type for thunkToAction below */
export type ThunkFn<P, R> = (params?: P) => PromiseLike<R>;

/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export function thunkToAction<P, R, S = DefaultRootState>(
  thunkCreator: ThunkCreator<P, R, S>,
): ThunkFn<P, R> {
  return (thunkCreator as unknown) as ThunkFn<P, R>;
}

export default asyncFactory;
