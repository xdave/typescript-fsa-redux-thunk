/**
 * Factory function to easily create a thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const asyncFactory = (create, resolve = Promise.resolve.bind(Promise)) => (type, worker, commonMeta) => {
    const async = create.async(type, commonMeta);
    const fn = (params) => (dispatch, getState, extraArgument) => resolve()
        .then(() => {
        dispatch(async.started(params));
    })
        .then(() => worker(params, dispatch, getState, extraArgument))
        .then((result) => {
        dispatch(async.done({ params: params, result }));
        return result;
    }, (error) => {
        dispatch(async.failed({ params: params, error }));
        throw error;
    });
    fn.action = fn;
    fn.async = async;
    return fn;
};
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
export function thunkToAction(thunkCreator) {
    return thunkCreator;
}
export default asyncFactory;
//# sourceMappingURL=index.js.map