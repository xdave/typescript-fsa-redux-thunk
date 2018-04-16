"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Bind a redux-thunk to typescript-fsa async action creators
 * @param actionCreators The typescript-fsa async action creators
 * @param asyncWorker A redux-thunk with extra `params` as the first argument
 * @returns a ThunkActionCreator, the result of which you can pass to dispatch()
 */
exports.bindThunkAction = function (actionCreators, asyncWorker) { return function (params) { return function (dispatch, getState, extra) { return __awaiter(_this, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dispatch(actionCreators.started(params));
                return [4 /*yield*/, asyncWorker(params, dispatch, getState, extra)];
            case 1:
                result = _a.sent();
                dispatch(actionCreators.done({ params: params, result: result }));
                return [2 /*return*/, result];
            case 2:
                error_1 = _a.sent();
                dispatch(actionCreators.failed({ params: params, error: error_1 }));
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); }; }; };
/**
 * Factory function to easily create a typescript-fsa redux thunk
 * @param factory typescript-fsa action creator factory
 * @returns an function that takes
 *  - the `type` of the action,
 *  - the your worker thunk function
 * And returns object with the async actions and the thunk itself
 */
exports.asyncFactory = function (factory) { return function (type, fn, async) {
    if (async === void 0) { async = factory.async(type); }
    return ({ async: async, action: exports.bindThunkAction(async, fn) });
}; };
/**
 * Passing the result of this to bindActionCreators and then calling the result
 * is equivalent to calling `store.dispatch(thunkActionCreator(params))`. Useful
 * for when you pass it to `connect()` in an action creators map object.
 * @param thunkActionCreator The thunk action creator
 * @returns thunkAction as if it was bound
 */
exports.thunkToAction = function (thunkActionCreator) { return thunkActionCreator; };
exports.default = exports.bindThunkAction;
//# sourceMappingURL=index.js.map