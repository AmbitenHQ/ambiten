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
var logger_1 = require("../logger");
var flushPromises = function () { return new Promise(function (resolve) { return setImmediate(resolve); }); };
describe('createLogger', function () {
    var mockTransport;
    var mockLogger;
    var config;
    beforeEach(function () {
        jest.clearAllMocks();
        mockTransport = {
            write: jest.fn().mockResolvedValue(undefined),
            flush: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
        };
        mockLogger = {
            log: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            fatal: jest.fn(),
            shutdown: jest.fn(),
            stop: jest.fn(),
            close: jest.fn(),
        };
        config = {
            level: 'info',
            transports: [mockTransport],
            colorize: false,
            json: false,
            excludedSources: [],
            formatOptions: {
                colorize: false,
                timestamp: true,
            },
            logger: mockLogger,
            hooks: {
                onLog: jest.fn(),
                onError: jest.fn(),
            },
        };
    });
    it('should log info messages and call transport write', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger, _a, entry, formatted;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Test message', { foo: 'bar' });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _c.sent();
                    expect(mockTransport.write).toHaveBeenCalledTimes(1);
                    expect(mockLogger.log).not.toHaveBeenCalled();
                    expect((_b = config.hooks) === null || _b === void 0 ? void 0 : _b.onLog).toHaveBeenCalledTimes(1);
                    _a = mockTransport.write.mock.calls[0], entry = _a[0], formatted = _a[1];
                    expect(entry).toMatchObject({
                        level: 'info',
                        message: 'Test message',
                        meta: { foo: 'bar' },
                    });
                    expect(formatted).toContain('Test message');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not log messages below the configured level', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config.level = 'warn';
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Should not log');
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _b.sent();
                    expect(mockTransport.write).not.toHaveBeenCalled();
                    expect(mockLogger.log).not.toHaveBeenCalled();
                    expect((_a = config.hooks) === null || _a === void 0 ? void 0 : _a.onLog).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not log if source is excluded', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config.excludedSources = ['excludedSource'];
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Should not log', { source: 'excludedSource' });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _a.sent();
                    expect(mockTransport.write).not.toHaveBeenCalled();
                    expect(mockLogger.log).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should use enrichMetadata if provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger, _a, entry, formatted;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config.enrichMetadata = function (entry) { return (__assign(__assign({}, entry), { meta: __assign(__assign({}, entry.meta), { enriched: true }) })); };
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Enrich test', { foo: 'bar' });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _b.sent();
                    expect(mockTransport.write).toHaveBeenCalledTimes(1);
                    _a = mockTransport.write.mock.calls[0], entry = _a[0], formatted = _a[1];
                    expect(entry.meta).toMatchObject({
                        foo: 'bar',
                        enriched: true,
                    });
                    expect(formatted).toContain('Enrich test');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should log in JSON format if json=true', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger, _a, formatted, parsed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config.json = true;
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Json test', { foo: 'baz' });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _b.sent();
                    expect(mockTransport.write).toHaveBeenCalledTimes(1);
                    _a = mockTransport.write.mock.calls[0], formatted = _a[1];
                    parsed = JSON.parse(formatted);
                    expect(parsed).toMatchObject({
                        level: 'info',
                        message: 'Json test',
                    });
                    expect(parsed.meta).toMatchObject({
                        foo: 'baz',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('should use shouldLog function if provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config.shouldLog = jest.fn(function () { return false; });
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Should not log');
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _a.sent();
                    expect(mockTransport.write).not.toHaveBeenCalled();
                    expect(config.shouldLog).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should attach context from contextProvider', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger, entry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config.contextProvider = function () { return ({
                        tenantId: 'tenant-1',
                        requestId: 'req-1',
                        dbName: 'tenant_db',
                        collectionName: 'users',
                        operation: 'create',
                        meta: {
                            runtime: 'test',
                        },
                    }); };
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Context test', { foo: 'bar' });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _a.sent();
                    expect(mockTransport.write).toHaveBeenCalledTimes(1);
                    entry = mockTransport.write.mock.calls[0][0];
                    expect(entry.context).toMatchObject({
                        tenantId: 'tenant-1',
                        requestId: 'req-1',
                        dbName: 'tenant_db',
                        collectionName: 'users',
                        operation: 'create',
                    });
                    expect(entry.meta).toMatchObject({
                        runtime: 'test',
                        foo: 'bar',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('should call all log levels allowed by configured level', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger, levels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config.level = 'trace';
                    logger = (0, logger_1.createLogger)(config);
                    logger.trace('trace');
                    logger.debug('debug');
                    logger.info('info');
                    logger.warn('warn');
                    logger.error('error');
                    logger.fatal('fatal');
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _a.sent();
                    expect(mockTransport.write).toHaveBeenCalledTimes(6);
                    expect(mockLogger.log).not.toHaveBeenCalled();
                    levels = mockTransport.write.mock.calls.map(function (_a) {
                        var entry = _a[0];
                        return entry.level;
                    });
                    expect(levels).toEqual([
                        'trace',
                        'debug',
                        'info',
                        'warn',
                        'error',
                        'fatal',
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should call onError when transport write fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error, logger;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    error = new Error('Transport failed');
                    mockTransport.write.mockRejectedValueOnce(error);
                    logger = (0, logger_1.createLogger)(config);
                    logger.info('Failure test');
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _b.sent();
                    expect((_a = config.hooks) === null || _a === void 0 ? void 0 : _a.onError).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should shutdown transports and external logger', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logger;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger = (0, logger_1.createLogger)(config);
                    return [4 /*yield*/, ((_a = logger.shutdown) === null || _a === void 0 ? void 0 : _a.call(logger))];
                case 1:
                    _b.sent();
                    expect(mockTransport.flush).toHaveBeenCalled();
                    expect(mockTransport.close).toHaveBeenCalled();
                    expect(mockLogger.shutdown).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
