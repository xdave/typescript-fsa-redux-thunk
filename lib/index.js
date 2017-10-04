"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = function (thing) { return thing instanceof Promise; };
exports.isFailure = function (action) { return !!action && !!action.error; };
exports.isSuccess = function (action) { return !!action && !!!action.error; };
exports.thunkToAction = function (thunk) { return thunk; };
exports.bindThunkAction = function (asyncAction, worker) { return function (params) {
    return function (dispatch, getState, e) {
        dispatch(asyncAction.started(params));
        try {
            var result = worker(params, dispatch, getState, e);
            if (exports.isPromise(result)) {
                return (result.then(function (result) { return dispatch(asyncAction.done({
                    params: params, result: result
                })); }).catch(function (error) { return dispatch(asyncAction.failed({
                    params: params, error: error
                })); }));
            }
            return dispatch(asyncAction.done({
                params: params,
                result: result
            }));
        }
        catch (error) {
            return dispatch(asyncAction.failed({
                params: params,
                error: error
            }));
        }
    };
}; };
exports.default = exports.bindThunkAction;
//# sourceMappingURL=index.js.map