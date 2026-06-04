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
describe('createCircuitBreaker', function () {
    afterEach(function () {
        jest.useRealTimers();
        jest.clearAllMocks();
    });
    it('should call the wrapped function and return its result', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, breaker, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest.fn().mockResolvedValue('success');
                    breaker = (0, utils_1.createCircuitBreaker)(fn);
                    return [4 /*yield*/, breaker('test')];
                case 1:
                    result = _a.sent();
                    expect(result).toBe('success');
                    expect(fn).toHaveBeenCalledWith('test');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should reset failures after a successful call', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, breaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest
                        .fn()
                        .mockRejectedValueOnce(new Error('fail'))
                        .mockResolvedValueOnce('ok')
                        .mockRejectedValueOnce(new Error('fail again'));
                    breaker = (0, utils_1.createCircuitBreaker)(fn, {
                        failureThreshold: 2,
                        cooldownPeriod: 1000,
                    });
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).resolves.toBe('ok')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail again')];
                case 3:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(3);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should open the circuit after the failure threshold is reached', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, onOpen, breaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    fn = jest.fn().mockRejectedValue(new Error('fail'));
                    onOpen = jest.fn();
                    breaker = (0, utils_1.createCircuitBreaker)(fn, {
                        failureThreshold: 2,
                        cooldownPeriod: 10000,
                        onOpen: onOpen,
                    });
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('Circuit breaker is open. Execution skipped.')];
                case 3:
                    _a.sent();
                    expect(fn).toHaveBeenCalledTimes(2);
                    expect(onOpen).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should move to half-open after cooldown and try again', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, onHalfOpen, onClose, breaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    fn = jest
                        .fn()
                        .mockRejectedValueOnce(new Error('fail'))
                        .mockResolvedValueOnce('recovered');
                    onHalfOpen = jest.fn();
                    onClose = jest.fn();
                    breaker = (0, utils_1.createCircuitBreaker)(fn, {
                        failureThreshold: 1,
                        cooldownPeriod: 5000,
                        successThreshold: 1,
                        onHalfOpen: onHalfOpen,
                        onClose: onClose,
                    });
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('Circuit breaker is open. Execution skipped.')];
                case 2:
                    _a.sent();
                    jest.advanceTimersByTime(5001);
                    return [4 /*yield*/, expect(breaker()).resolves.toBe('recovered')];
                case 3:
                    _a.sent();
                    expect(onHalfOpen).toHaveBeenCalledTimes(1);
                    expect(onClose).toHaveBeenCalledTimes(1);
                    expect(fn).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should reopen if half-open attempt fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, onOpen, onHalfOpen, breaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    fn = jest.fn().mockRejectedValue(new Error('still failing'));
                    onOpen = jest.fn();
                    onHalfOpen = jest.fn();
                    breaker = (0, utils_1.createCircuitBreaker)(fn, {
                        failureThreshold: 1,
                        cooldownPeriod: 5000,
                        onOpen: onOpen,
                        onHalfOpen: onHalfOpen,
                    });
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('still failing')];
                case 1:
                    _a.sent();
                    jest.advanceTimersByTime(5001);
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('still failing')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('Circuit breaker is open. Execution skipped.')];
                case 3:
                    _a.sent();
                    expect(onHalfOpen).toHaveBeenCalledTimes(1);
                    expect(onOpen).toHaveBeenCalledTimes(2);
                    expect(fn).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should require multiple successful calls in half-open state when successThreshold is greater than 1', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, onClose, breaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.useFakeTimers();
                    fn = jest
                        .fn()
                        .mockRejectedValueOnce(new Error('fail'))
                        .mockResolvedValueOnce('ok-1')
                        .mockResolvedValueOnce('ok-2');
                    onClose = jest.fn();
                    breaker = (0, utils_1.createCircuitBreaker)(fn, {
                        failureThreshold: 1,
                        cooldownPeriod: 5000,
                        successThreshold: 2,
                        onClose: onClose,
                    });
                    return [4 /*yield*/, expect(breaker()).rejects.toThrow('fail')];
                case 1:
                    _a.sent();
                    jest.advanceTimersByTime(5001);
                    return [4 /*yield*/, expect(breaker()).resolves.toBe('ok-1')];
                case 2:
                    _a.sent();
                    expect(onClose).not.toHaveBeenCalled();
                    return [4 /*yield*/, expect(breaker()).resolves.toBe('ok-2')];
                case 3:
                    _a.sent();
                    expect(onClose).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should work with functions that take arguments', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fn, breaker, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fn = jest.fn(function (a, b) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, a + b];
                    }); }); });
                    breaker = (0, utils_1.createCircuitBreaker)(fn);
                    return [4 /*yield*/, breaker(2, 3)];
                case 1:
                    result = _a.sent();
                    expect(result).toBe(5);
                    expect(fn).toHaveBeenCalledWith(2, 3);
                    return [2 /*return*/];
            }
        });
    }); });
});
