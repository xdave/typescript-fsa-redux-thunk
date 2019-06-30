"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
var redux_1 = require("redux");
var redux_thunk_1 = __importDefault(require("redux-thunk"));
var typescript_fsa_reducers_1 = require("typescript-fsa-reducers");
var typescript_fsa_1 = __importDefault(require("typescript-fsa"));
var _1 = require(".");
/** The typescript-fsa action creator factory function */
var create = typescript_fsa_1.default('examples');
/** The typescript-fsa-redux-thunk async action creator factory function */
var createAsync = _1.asyncFactory(create);
/** Normal synchronous action */
var changeTitle = create('Change the title');
/** The asynchronous login action */
var login = createAsync('Login', function (params, dispatch) { return __awaiter(_this, void 0, void 0, function () {
    var url, options, res, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                url = "https://reqres.in/api/login";
                options = {
                    method: 'POST',
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                };
                return [4 /*yield*/, fetch(url, options)];
            case 1:
                res = _c.sent();
                if (!!res.ok) return [3 /*break*/, 3];
                _a = Error.bind;
                _b = "Error " + res.status + ": " + res.statusText + " ";
                return [4 /*yield*/, res.text()];
            case 2: throw new (_a.apply(Error, [void 0, _b + (_c.sent())]))();
            case 3:
                dispatch(changeTitle('You are logged-in'));
                return [2 /*return*/, res.json()];
        }
    });
}); });
/** An initial value for the application state */
var initial = {
    title: 'Please login',
    userToken: {
        token: ''
    }
};
/** Reducer, handling updates to indicate logging-in status/error */
var reducer = typescript_fsa_reducers_1.reducerWithInitialState(initial)
    .case(changeTitle, function (state, title) { return (__assign({}, state, { title: title })); })
    .case(login.async.started, function (state) { return (__assign({}, state, { loggingIn: true, error: undefined })); })
    .case(login.async.failed, function (state, _a) {
    var error = _a.error;
    return (__assign({}, state, { loggingIn: false, error: error }));
})
    .case(login.async.done, function (state, _a) {
    var userToken = _a.result;
    return (__assign({}, state, { userToken: userToken, loggingIn: false, error: undefined }));
});
/** Putting it all together */
(function () { return __awaiter(_this, void 0, void 0, function () {
    var thunk, store, _a, title, userToken, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                thunk = redux_thunk_1.default;
                store = redux_1.createStore(reducer, redux_1.applyMiddleware(thunk));
                console.log(store.getState().title);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                // See https://reqres.in/api/users for valid users on this site
                return [4 /*yield*/, store.dispatch(login.action({
                        email: 'eve.holt@reqres.in',
                        password: 'cityslicka'
                    }))];
            case 2:
                // See https://reqres.in/api/users for valid users on this site
                _b.sent();
                _a = store.getState(), title = _a.title, userToken = _a.userToken;
                console.log(title, userToken);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _b.sent();
                console.log(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=examples.js.map