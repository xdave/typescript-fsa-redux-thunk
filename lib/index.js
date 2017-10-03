"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = function (thing) {
    return thing instanceof Promise;
};
exports.isFailure = function (action) { return !!action.error; };
exports.isSuccess = function (action) { return !!!action.error; };
exports.bindThunkAction = function (asyncAction, worker) { return function (params) {
    return function (dispatch, getState, e) {
        dispatch(asyncAction.started(params));
        try {
            var result = worker(params, dispatch, getState, e);
            if (exports.isPromise(result)) {
                return result
                    .then(function (r) {
                    return dispatch(asyncAction.done({
                        params: params, result: r
                    }));
                }).catch(function (error) {
                    return dispatch(asyncAction.failed({
                        params: params, error: error
                    }));
                });
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