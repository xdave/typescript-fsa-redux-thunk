import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { ThunkActionCreators } from "typescript-fsa";

declare module "typescript-fsa" {
  export interface ThunkActionCreators<State, P, S, E>
    extends AsyncActionCreators<P, S, E> {
  }

  export interface ActionCreatorFactory {
    async<S, P, R, E>(prefix?: string, commonMeta?: Meta)
      : ThunkActionCreators<S, P, R, E>;
  }
}

export type Thunk<R, S> = ThunkAction<Promise<R>, S, any>;

export type AsyncWorker<R, P, S, T = any> =
  (params: P, dispatch: Dispatch<S>, getState: () => S, extra: T) => Promise<R>;

export const bindThunkAction = <S, P, R, E>(
  asyncAction: ThunkActionCreators<S, P, R, E>,
  worker: AsyncWorker<R, P, S>,
) => (params: P): Thunk<R, S> => async (dispatch, getState, extra) => {
  dispatch(asyncAction.started(params));
  try {
    const result = await worker(params, dispatch, getState, extra);
    dispatch(asyncAction.done({ params, result }));
    return result;
  } catch (error) {
    dispatch(asyncAction.failed({ params, error }));
    throw error;
  }
};

export default bindThunkAction;
