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
var logger_1 = require("../logger");
var flushPromises = function () {
    return new Promise(function (resolve) { return setImmediate(resolve); });
};
describe('logger runtime metrics integration', function () {
    it('tracks logs, dispatches, successful writes, and transport errors correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var snapshots, successfulTransport, failingTransport, onError, logger, metrics, snapshot;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    snapshots = [];
                    successfulTransport = {
                        write: jest.fn().mockResolvedValue(undefined),
                        flush: jest.fn().mockResolvedValue(undefined),
                        close: jest.fn().mockResolvedValue(undefined),
                    };
                    failingTransport = {
                        write: jest.fn().mockRejectedValue(new Error('transport failed')),
                        flush: jest.fn().mockResolvedValue(undefined),
                        close: jest.fn().mockResolvedValue(undefined),
                    };
                    onError = jest.fn();
                    logger = (0, logger_1.createLogger)({
                        level: 'info',
                        colorize: false,
                        json: true,
                        transports: [successfulTransport, failingTransport],
                        hooks: {
                            onError: onError,
                        },
                        enableMetrics: {
                            enabled: true,
                            logInterval: 60000,
                            reporter: function (snapshot) {
                                snapshots.push(snapshot);
                            },
                        },
                    });
                    logger.info('Runtime metric test', {
                        source: 'LoggerTest',
                        tenantId: 'tenant-1',
                    });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _c.sent();
                    expect(successfulTransport.write).toHaveBeenCalledTimes(1);
                    expect(failingTransport.write).toHaveBeenCalledTimes(1);
                    expect(onError).toHaveBeenCalledTimes(1);
                    metrics = (_a = logger.getMetrics) === null || _a === void 0 ? void 0 : _a.call(logger);
                    expect(metrics).toBeDefined();
                    snapshot = metrics.getSnapshot();
                    expect(snapshot.totalLogs).toBe(1);
                    expect(snapshot.transportDispatches).toBe(2);
                    expect(snapshot.successfulTransportWrites).toBe(1);
                    expect(snapshot.transportErrors).toBe(1);
                    expect(snapshot.droppedLogs).toBe(0);
                    return [4 /*yield*/, ((_b = logger.shutdown) === null || _b === void 0 ? void 0 : _b.call(logger))];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('attaches runtime context from contextProvider', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transport, logger, entry;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    transport = {
                        write: jest.fn().mockResolvedValue(undefined),
                        flush: jest.fn().mockResolvedValue(undefined),
                        close: jest.fn().mockResolvedValue(undefined),
                    };
                    logger = (0, logger_1.createLogger)({
                        level: 'info',
                        colorize: false,
                        json: true,
                        transports: [transport],
                        contextProvider: function () { return ({
                            tenantId: 'tenant-runtime',
                            requestId: 'req-runtime',
                            dbName: 'tenant_db',
                            collectionName: 'orders',
                            meta: {
                                runtime: 'test',
                            },
                        }); },
                    });
                    logger.info('Context-aware log', {
                        operation: 'findOne',
                    });
                    return [4 /*yield*/, flushPromises()];
                case 1:
                    _b.sent();
                    entry = transport.write.mock.calls[0][0];
                    expect(entry.context).toMatchObject({
                        tenantId: 'tenant-runtime',
                        requestId: 'req-runtime',
                        dbName: 'tenant_db',
                        collectionName: 'orders',
                    });
                    expect(entry.meta).toMatchObject({
                        runtime: 'test',
                        operation: 'findOne',
                    });
                    return [4 /*yield*/, ((_a = logger.shutdown) === null || _a === void 0 ? void 0 : _a.call(logger))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
