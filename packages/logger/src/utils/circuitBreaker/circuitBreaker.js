"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCircuitBreaker = createCircuitBreaker;
function createCircuitBreaker(fn, options) {
    var _this = this;
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var failureThreshold = (_a = options.failureThreshold) !== null && _a !== void 0 ? _a : 3;
    var cooldownPeriod = (_b = options.cooldownPeriod) !== null && _b !== void 0 ? _b : 10000;
    var successThreshold = (_c = options.successThreshold) !== null && _c !== void 0 ? _c : 1;
    var state = 'closed';
    var failures = 0;
    var successes = 0;
    var lastFailureTime = 0;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var currentTime, canAttemptAgain, result, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentTime = Date.now();
                        if (state === 'open') {
                            canAttemptAgain = currentTime - lastFailureTime >= cooldownPeriod;
                            if (!canAttemptAgain) {
                                throw new Error('Circuit breaker is open. Execution skipped.');
                            }
                            state = 'half-open';
                            (_a = options.onHalfOpen) === null || _a === void 0 ? void 0 : _a.call(options);
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fn.apply(void 0, args)];
                    case 2:
                        result = _d.sent();
                        if (state === 'half-open') {
                            successes++;
                            if (successes >= successThreshold) {
                                state = 'closed';
                                failures = 0;
                                successes = 0;
                                (_b = options.onClose) === null || _b === void 0 ? void 0 : _b.call(options);
                            }
                        }
                        else {
                            failures = 0;
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _d.sent();
                        failures++;
                        successes = 0;
                        lastFailureTime = Date.now();
                        if (failures >= failureThreshold) {
                            state = 'open';
                            (_c = options.onOpen) === null || _c === void 0 ? void 0 : _c.call(options, error_1);
                        }
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
}
