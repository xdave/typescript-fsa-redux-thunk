var _this = this;
import * as tslib_1 from "tslib";
export var bindThunkAction = function (asyncAction, worker) { return function (params) { return function (dispatch, getState, extra) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var result, error_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dispatch(asyncAction.started(params));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, worker(params, dispatch, getState, extra)];
            case 2:
                result = _a.sent();
                dispatch(asyncAction.done({ params: params, result: result }));
                return [2 /*return*/, result];
            case 3:
                error_1 = _a.sent();
                dispatch(asyncAction.failed({ params: params, error: error_1 }));
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); }; }; };
export default bindThunkAction;
//# sourceMappingURL=index.js.map