import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Action, AsyncActionCreators, Failure, Success } from 'typescript-fsa';
declare module 'typescript-fsa' {
    interface ActionCreatorFactory {
        async<State, Params, Result, Err>(prefix?: string, commonMeta?: Meta): ThunkActionCreators<State, Params, Result, Err>;
    }
}
export interface ThunkActionCreators<State, Params, Result, Err> extends AsyncActionCreators<Params, Result, Err> {
}
export declare type AsyncWorker<State, Params, Result, Extra = any> = (params: Params, dispatch: Dispatch<State>, getState: () => State, extra: Extra) => Result | Promise<Result> | undefined | void;
export declare const isPromise: <T>(thing?: void | T | Promise<T> | undefined) => thing is Promise<T>;
export declare const isFailure: <Params, Result, Err>(action?: Action<Success<Params, Result> | Failure<Params, Err>> | undefined) => action is Action<Failure<Params, Err>>;
export declare const isSuccess: <Params, Result, Err>(action?: Action<Success<Params, Result> | Failure<Params, Err>> | undefined) => action is Action<Success<Params, Result>>;
export declare const thunkToAction: <State, Params, Result, Err>(thunk: (params?: Params | undefined) => ThunkAction<Result, State, any>) => (params?: Params | undefined) => Result;
export declare const bindThunkAction: <State, Params, Result, Err, Extra = any>(asyncAction: ThunkActionCreators<State, Params, Result, Err>, worker: AsyncWorker<State, Params, Result, Extra>) => (params?: Params | undefined) => (dispatch: Dispatch<State>, getState: () => State, e: Extra) => Action<Success<Params, Result>> | Promise<Action<Success<Params, Result> | Failure<Params, Err>>> | Action<Failure<Params, Err>>;
export default bindThunkAction;
