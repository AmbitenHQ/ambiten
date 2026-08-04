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
var transports_1 = require("../transports");
var createEntry = function (message, level) {
    if (level === void 0) { level = 'info'; }
    return ({
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        meta: {},
    });
};
describe('AsyncBatchTransporter', function () {
    var mockSendBatch;
    var onError;
    var onDrop;
    beforeEach(function () {
        jest.useFakeTimers();
        mockSendBatch = jest.fn().mockResolvedValue(undefined);
        onError = jest.fn();
        onDrop = jest.fn();
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            jest.useRealTimers();
            jest.clearAllMocks();
            return [2 /*return*/];
        });
    }); });
    it('should send logs when batch size is reached', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 3,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('one'), 'one')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('two'), 'two')];
                case 2:
                    _a.sent();
                    expect(mockSendBatch).not.toHaveBeenCalled();
                    return [4 /*yield*/, transporter.write(createEntry('three'), 'three')];
                case 3:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(1);
                    expect(mockSendBatch).toHaveBeenCalledWith([
                        expect.objectContaining({ message: 'one' }),
                        expect.objectContaining({ message: 'two' }),
                        expect.objectContaining({ message: 'three' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should flush pending logs manually', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('one'), 'one')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('two'), 'two')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, transporter.flush()];
                case 3:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(1);
                    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should flush pending logs when stopped', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('one'), 'one')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('two'), 'two')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, transporter.stop()];
                case 3:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(1);
                    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not send if buffer is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.flush()];
                case 1:
                    _a.sent();
                    expect(mockSendBatch).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should add tag into metadata when tag is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 1,
                        flushInterval: 1000,
                        tag: 'remote',
                        sendBatch: mockSendBatch,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(__assign(__assign({}, createEntry('tagged')), { meta: { foo: 'bar' } }), 'tagged')];
                case 1:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(1);
                    expect(mockSendBatch.mock.calls[0][0][0].meta).toMatchObject({
                        foo: 'bar',
                        type: 'remote',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('should call onError when sendBatch fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error, transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    error = new Error('Network error');
                    mockSendBatch.mockRejectedValueOnce(error);
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 1,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        onError: onError,
                        retryAttempts: 0,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('failure'), 'failure')];
                case 1:
                    _a.sent();
                    expect(onError).toHaveBeenCalledTimes(1);
                    expect(onError).toHaveBeenCalledWith(error, [expect.objectContaining({ message: 'failure' })]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should retry failed batches before reporting error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error, transporter, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    error = new Error('Temporary failure');
                    mockSendBatch
                        .mockRejectedValueOnce(error)
                        .mockRejectedValueOnce(error)
                        .mockResolvedValueOnce(undefined);
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 1,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        retryAttempts: 2,
                        retryDelay: 10,
                        startImmediately: false,
                        onError: onError,
                    });
                    promise = transporter.write(createEntry('retry'), 'retry');
                    return [4 /*yield*/, jest.runAllTimersAsync()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, promise];
                case 2:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(3);
                    expect(onError).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should drop the oldest log when maxBufferSize is exceeded and dropOnOverflow is true', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        maxBufferSize: 2,
                        dropOnOverflow: true,
                        sendBatch: mockSendBatch,
                        onDrop: onDrop,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('one'), 'one')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('two'), 'two')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('three'), 'three')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, transporter.flush()];
                case 4:
                    _a.sent();
                    expect(onDrop).toHaveBeenCalledTimes(1);
                    expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ message: 'one' }));
                    expect(mockSendBatch.mock.calls[0][0]).toEqual([
                        expect.objectContaining({ message: 'two' }),
                        expect.objectContaining({ message: 'three' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should flush instead of dropping when maxBufferSize is exceeded and dropOnOverflow is false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        maxBufferSize: 2,
                        dropOnOverflow: false,
                        sendBatch: mockSendBatch,
                        onDrop: onDrop,
                        startImmediately: false,
                    });
                    return [4 /*yield*/, transporter.write(createEntry('one'), 'one')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('two'), 'two')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, transporter.write(createEntry('three'), 'three')];
                case 3:
                    _a.sent();
                    expect(onDrop).not.toHaveBeenCalled();
                    expect(mockSendBatch).toHaveBeenCalledTimes(1);
                    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);
                    return [4 /*yield*/, transporter.flush()];
                case 4:
                    _a.sent();
                    expect(mockSendBatch).toHaveBeenCalledTimes(2);
                    expect(mockSendBatch.mock.calls[1][0]).toEqual([
                        expect.objectContaining({ message: 'three' }),
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should start and clear interval when enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var setIntervalSpy, clearIntervalSpy, transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
                    clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: true,
                        enableTimerInTest: true,
                    });
                    expect(setIntervalSpy).toHaveBeenCalled();
                    return [4 /*yield*/, transporter.stop()];
                case 1:
                    _a.sent();
                    expect(clearIntervalSpy).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not start interval in test environment', function () { return __awaiter(void 0, void 0, void 0, function () {
        var setIntervalSpy, transporter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
                    transporter = new transports_1.AsyncBatchTransporter({
                        batchSize: 10,
                        flushInterval: 1000,
                        sendBatch: mockSendBatch,
                        startImmediately: true,
                    });
                    expect(setIntervalSpy).not.toHaveBeenCalled();
                    return [4 /*yield*/, transporter.stop()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
