"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
exports.asyncFactory = function (create) {
    return function (type, worker) {
        var async = create.async(type);
        var fn = function (params) { return function (dispatch, getState) { return Promise.resolve()
            .then(function () { dispatch(async.started(params)); })
            .then(function () { return worker(params, dispatch, getState); })
            .then(function (result) {
            dispatch(async.done({ params: params, result: result }));
            return result;
        })
            .catch(function (error) {
            dispatch(async.failed({ params: params, error: error }));
            return Promise.reject(error);
        }); }; };
        fn.action = fn;
        fn.async = async;
        return fn;
    };
};
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
exports.thunkToAction = function (thunkCreator) { return thunkCreator; };
exports.default = exports.asyncFactory;
//# sourceMappingURL=index.js.map