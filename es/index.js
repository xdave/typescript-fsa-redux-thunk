import * as tslib_1 from "tslib";
export const bindThunkAction = (asyncAction, worker) => (params) => (dispatch, getState, extra) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    dispatch(asyncAction.started(params));
    try {
        const result = yield worker(params, dispatch, getState, extra);
        dispatch(asyncAction.done({ params, result }));
        return result;
    }
    catch (error) {
        dispatch(asyncAction.failed({ params, error }));
        throw error;
    }
});
export default bindThunkAction;
//# sourceMappingURL=index.js.map