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
exports.createLogger = createLogger;
var colorizer_1 = require("./colorizer");
var levels_1 = require("./levels");
var defaultLogger_1 = require("./defaultLogger");
var utils_1 = require("../utils");
function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function normalizeMeta(meta) {
    if (meta.length === 0)
        return {};
    if (meta.length === 1 && isPlainObject(meta[0]))
        return meta[0];
    return {
        args: meta,
    };
}
function resolveSource(meta, fallback) {
    var source = meta.source;
    if (typeof source === 'string')
        return source;
    return fallback;
}
function shouldLogLevel(configuredLevel, currentLevel) {
    return levels_1.LOG_LEVELS[currentLevel] >= levels_1.LOG_LEVELS[configuredLevel];
}
function isRemoteTransporter(transport) {
    return typeof transport === 'function';
}
function createLogger(config) {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (config === void 0) { config = {}; }
    var _k = config.level, level = _k === void 0 ? 'info' : _k, _l = config.colorize, colorize = _l === void 0 ? true : _l, _m = config.json, json = _m === void 0 ? false : _m, _o = config.excludedSources, excludedSources = _o === void 0 ? [] : _o, formatOptions = config.formatOptions, hooks = config.hooks, contextProvider = config.contextProvider, circuitBreaker = config.circuitBreaker, _p = config.logger, logger = _p === void 0 ? defaultLogger_1.DefaultLogger : _p;
    var metrics = new utils_1.MetricsTracker({
        enabled: (_b = (_a = config.enableMetrics) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false,
        interval: (_d = (_c = config.enableMetrics) === null || _c === void 0 ? void 0 : _c.logInterval) !== null && _d !== void 0 ? _d : 60000,
        reporter: (_e = config.enableMetrics) === null || _e === void 0 ? void 0 : _e.reporter,
    });
    var transports = ((_f = config.transports) === null || _f === void 0 ? void 0 : _f.length)
        ? config.transports
        : (0, utils_1.resolveLoggerTransports)((_g = config.transportConfigs) !== null && _g !== void 0 ? _g : [], {
            loggerConfig: config,
            metrics: metrics,
        });
    var isTest = process.env.NODE_ENV === 'test';
    if (!isTest && ((_h = config.enableMetrics) === null || _h === void 0 ? void 0 : _h.enabled) === true) {
        metrics.start((_j = config.enableMetrics.logInterval) !== null && _j !== void 0 ? _j : 60000);
    }
    var buildEntry = function (levelKey, message, metaArgs) {
        var _a, _b, _c;
        var rawMeta = normalizeMeta(metaArgs);
        var context = (_a = contextProvider === null || contextProvider === void 0 ? void 0 : contextProvider()) !== null && _a !== void 0 ? _a : undefined;
        var mergedMeta = __assign(__assign({}, ((_b = context === null || context === void 0 ? void 0 : context.meta) !== null && _b !== void 0 ? _b : {})), rawMeta);
        var source = resolveSource(mergedMeta, (_c = context === null || context === void 0 ? void 0 : context.source) !== null && _c !== void 0 ? _c : formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.source);
        var entry = {
            timestamp: typeof (formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.timestamp) === 'function'
                ? formatOptions.timestamp()
                : (0, utils_1.now)(),
            level: levelKey,
            message: message,
            meta: mergedMeta,
            context: context,
            source: source,
        };
        return config.enrichMetadata ? config.enrichMetadata(entry) : entry;
    };
    var formatEntry = function (entry) {
        if (json || (formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.json)) {
            return (0, utils_1.formatJSON)({
                timestamp: entry.timestamp,
                level: entry.level,
                message: entry.message,
                meta: entry.meta,
                context: entry.context,
                source: entry.source,
                prefix: formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.prefix,
            });
        }
        return (0, utils_1.formatMsg)(entry.level, entry.message, __assign(__assign({}, entry.meta), { context: entry.context, source: entry.source }), formatOptions);
    };
    var writeToTransports = function (entry, formatted) { return __awaiter(_this, void 0, void 0, function () {
        var _i, transports_1, transport, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, transports_1 = transports;
                    _b.label = 1;
                case 1:
                    if (!(_i < transports_1.length)) return [3 /*break*/, 9];
                    transport = transports_1[_i];
                    metrics.trackTransportDispatch();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    if (!(typeof transport === 'function')) return [3 /*break*/, 4];
                    return [4 /*yield*/, transport(formatted, entry)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, transport.write(entry, formatted)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    metrics.trackSuccessfulTransportWrite();
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    metrics.trackTransportError();
                    (_a = hooks === null || hooks === void 0 ? void 0 : hooks.onError) === null || _a === void 0 ? void 0 : _a.call(hooks, error_1, entry);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var writeWithRetry = function (entry, formatted) { return __awaiter(_this, void 0, void 0, function () {
        var maxAttempts, retryDelay, attempt, error_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!!(circuitBreaker === null || circuitBreaker === void 0 ? void 0 : circuitBreaker.enabled)) return [3 /*break*/, 2];
                    return [4 /*yield*/, writeToTransports(entry, formatted)];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
                case 2:
                    maxAttempts = (_a = circuitBreaker.retryAttempts) !== null && _a !== void 0 ? _a : 3;
                    retryDelay = (_b = circuitBreaker.retryDelay) !== null && _b !== void 0 ? _b : 1000;
                    attempt = 0;
                    _d.label = 3;
                case 3:
                    if (!(attempt <= maxAttempts)) return [3 /*break*/, 9];
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 8]);
                    return [4 /*yield*/, writeToTransports(entry, formatted)];
                case 5:
                    _d.sent();
                    return [2 /*return*/];
                case 6:
                    error_2 = _d.sent();
                    attempt++;
                    if (attempt > maxAttempts) {
                        (_c = hooks === null || hooks === void 0 ? void 0 : hooks.onError) === null || _c === void 0 ? void 0 : _c.call(hooks, new Error("Logger transport failed after ".concat(maxAttempts, " attempts")), entry);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay); })];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 3];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var emitToExternalLogger = function (entry, formatted) {
        var externalLog = logger.log;
        if (typeof externalLog === 'function') {
            externalLog(entry.level, formatted, entry.meta, entry.context);
            return;
        }
        var levelMethod = logger[entry.level];
        if (typeof levelMethod === 'function') {
            levelMethod(formatted, entry.meta, entry.context);
        }
    };
    var log = function (levelKey) {
        return function (message) {
            var _a;
            var metaArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                metaArgs[_i - 1] = arguments[_i];
            }
            var entry = buildEntry(levelKey, message, metaArgs);
            if (entry.source && excludedSources.includes(entry.source))
                return;
            if (!shouldLogLevel(level, levelKey))
                return;
            if (typeof config.shouldLog === 'function') {
                var allowed = config.shouldLog(levelKey, entry);
                if (!allowed)
                    return;
            }
            var formatted = formatEntry(entry);
            var output = colorize || (formatOptions === null || formatOptions === void 0 ? void 0 : formatOptions.colorize)
                ? (0, colorizer_1.colorByLevel)(levelKey, formatted)
                : formatted;
            metrics.trackLog();
            (_a = hooks === null || hooks === void 0 ? void 0 : hooks.onLog) === null || _a === void 0 ? void 0 : _a.call(hooks, entry);
            /**
             * We can call external logger here if we like but the createLogger()
             * will log with side effect by logging twice per log
             */
            // emitToExternalLogger(entry, output);
            void writeWithRetry(entry, output);
        };
    };
    var shutdown = function () { return __awaiter(_this, void 0, void 0, function () {
        var _i, transports_2, transport, error_3;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    (_a = metrics.stop) === null || _a === void 0 ? void 0 : _a.call(metrics);
                    _i = 0, transports_2 = transports;
                    _k.label = 1;
                case 1:
                    if (!(_i < transports_2.length)) return [3 /*break*/, 7];
                    transport = transports_2[_i];
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 5, , 6]);
                    if (!transport || isRemoteTransporter(transport))
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, ((_b = transport.flush) === null || _b === void 0 ? void 0 : _b.call(transport))];
                case 3:
                    _k.sent();
                    return [4 /*yield*/, ((_c = transport.close) === null || _c === void 0 ? void 0 : _c.call(transport))];
                case 4:
                    _k.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _k.sent();
                    (_d = hooks === null || hooks === void 0 ? void 0 : hooks.onError) === null || _d === void 0 ? void 0 : _d.call(hooks, error_3);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [4 /*yield*/, ((_f = (_e = config.logger) === null || _e === void 0 ? void 0 : _e.shutdown) === null || _f === void 0 ? void 0 : _f.call(_e))];
                case 8:
                    _k.sent();
                    return [4 /*yield*/, ((_g = logger.shutdown) === null || _g === void 0 ? void 0 : _g.call(logger))];
                case 9:
                    _k.sent();
                    return [4 /*yield*/, ((_h = logger.stop) === null || _h === void 0 ? void 0 : _h.call(logger))];
                case 10:
                    _k.sent();
                    return [4 /*yield*/, ((_j = logger.close) === null || _j === void 0 ? void 0 : _j.call(logger))];
                case 11:
                    _k.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        trace: log('trace'),
        debug: log('debug'),
        info: log('info'),
        warn: log('warn'),
        error: log('error'),
        fatal: log('fatal'),
        getMetrics: function () { return metrics; },
        stop: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, metrics.stop()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        close: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, metrics.stop()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        shutdown: shutdown,
    };
}
;
