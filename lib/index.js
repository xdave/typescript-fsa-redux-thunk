"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thunkToAction = exports.asyncFactory = void 0;
/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
var asyncFactory = function (factory, resolve) {
    if (resolve === void 0) { resolve = Promise.resolve.bind(Promise); }
    return function (type, worker, commonMeta) {
        var async = factory.async(type, commonMeta);
        var fn = function (params) { return function (dispatch, getState, extraArgument) {
            return resolve()
                .then(function () {
                dispatch(async.started(params));
            })
                .then(function () { return worker(params, dispatch, getState, extraArgument); })
                .then(function (result) {
                dispatch(async.done({ params: params, result: result }));
                return result;
            }, function (error) {
                dispatch(async.failed({ params: params, error: error }));
                throw error;
            });
        }; };
        fn.action = function (params) { return fn(params); };
        fn.async = async;
        return fn;
    };
};
exports.asyncFactory = asyncFactory;
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
function thunkToAction(thunkCreator) {
    return thunkCreator;
}
exports.thunkToAction = thunkToAction;
exports.default = exports.asyncFactory;
//# sourceMappingURL=index.js.map