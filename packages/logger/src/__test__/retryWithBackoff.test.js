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
var utils_1 = require("../utils");
describe('retryWithBackoff', function () {
    beforeEach(function () {
        jest.useFakeTimers();
    });
    afterEach(function () {
        jest.useRealTimers();
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should resolve if function succeeds on first try', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest.fn().mockResolvedValue('success');
                    return [4 /*yield*/, expect((0, utils_1.retryWithBackoff)(fn)).resolves.toBe('success')];
                case 1:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should retry until success', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest
                        .fn()
                        .mockRejectedValueOnce(new Error('fail-1'))
                        .mockRejectedValueOnce(new Error('fail-2'))
                        .mockResolvedValueOnce('success');
                    promise = (0, utils_1.retryWithBackoff)(fn, {
                        attempts: 3,
                        delay: 100,
                        jitter: false,
                    });
                    return [4 /*yield*/, jest.runAllTimersAsync()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(promise).resolves.toBe('success')];
                case 2:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should throw after exhausting retries', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, promise, expectation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest.fn().mockRejectedValue(new Error('permanent failure'));
                    promise = (0, utils_1.retryWithBackoff)(fn, {
                        attempts: 3,
                        delay: 100,
                        jitter: false,
                    });
                    expectation = expect(promise).rejects.toThrow('permanent failure');
                    return [4 /*yield*/, jest.runAllTimersAsync()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expectation];
                case 2:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should stop retrying when shouldRetry returns false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, shouldRetry, promise, expectation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest.fn().mockRejectedValue(new Error('fatal'));
                    shouldRetry = jest.fn(function () { return false; });
                    promise = (0, utils_1.retryWithBackoff)(fn, {
                        attempts: 5,
                        delay: 100,
                        jitter: false,
                        shouldRetry: shouldRetry,
                    });
                    expectation = expect(promise).rejects.toThrow('fatal');
                    return [4 /*yield*/, jest.runAllTimersAsync()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expectation];
                case 2:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(1);
                    expect(shouldRetry).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should call onRetry callback', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, onRetry, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest
                        .fn()
                        .mockRejectedValueOnce(new Error('temporary'))
                        .mockResolvedValueOnce('ok');
                    onRetry = jest.fn();
                    promise = (0, utils_1.retryWithBackoff)(fn, {
                        attempts: 2,
                        delay: 100,
                        jitter: false,
                        onRetry: onRetry,
                    });
                    return [4 /*yield*/, jest.runAllTimersAsync()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(promise).resolves.toBe('ok')];
                case 2:
                    _a.sent();
                    expect(onRetry).toHaveBeenCalledTimes(1);
                    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 100);
                    return [2 /*return*/];
            }
        });
    }); });
});
