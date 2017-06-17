import { Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { ThunkActionCreators } from "typescript-fsa";
declare module "typescript-fsa" {
    interface ThunkActionCreators<State, P, S, E> extends AsyncActionCreators<P, S, E> {
    }
    interface ActionCreatorFactory {
        async<S, P, R, E>(prefix?: string, commonMeta?: Meta): ThunkActionCreators<S, P, R, E>;
    }
}
export declare type Thunk<R, S> = ThunkAction<Promise<R>, S, any>;
export declare type AsyncWorker<R, P, S, T = any> = (params: P, dispatch: Dispatch<S>, getState: () => S, extra: T) => Promise<R>;
export declare const bindThunkAction: <S, P, R, E>(asyncAction: ThunkActionCreators<S, P, R, E>, worker: AsyncWorker<R, P, S, any>) => (params: P) => ThunkAction<Promise<R>, S, any>;
export default bindThunkAction;
