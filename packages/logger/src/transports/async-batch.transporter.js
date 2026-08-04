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
exports.AsyncBatchTransporter = void 0;
var utils_1 = require("../utils");
var AsyncBatchTransporter = /** @class */ (function () {
    function AsyncBatchTransporter(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.buffer = [];
        this.isFlushing = false;
        this.isClosed = false;
        this.batchSize = (_a = options.batchSize) !== null && _a !== void 0 ? _a : 10;
        this.flushInterval = (_b = options.flushInterval) !== null && _b !== void 0 ? _b : 5000;
        this.maxBufferSize = (_c = options.maxBufferSize) !== null && _c !== void 0 ? _c : 1000;
        this.dropOnOverflow = (_d = options.dropOnOverflow) !== null && _d !== void 0 ? _d : true;
        this.enableTimerInTest = (_e = options.enableTimerInTest) !== null && _e !== void 0 ? _e : false;
        this.retryAttempts = (_f = options.retryAttempts) !== null && _f !== void 0 ? _f : 2;
        this.retryDelay = (_g = options.retryDelay) !== null && _g !== void 0 ? _g : 500;
        this.sendBatch = options.sendBatch;
        this.tag = options.tag;
        this.onError = options.onError;
        this.onDrop = options.onDrop;
        if ((_h = options.startImmediately) !== null && _h !== void 0 ? _h : true) {
            this.start();
        }
    }
    AsyncBatchTransporter.prototype.write = function (entry, _formatted) {
        return __awaiter(this, void 0, void 0, function () {
            var nextEntry, dropped;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        nextEntry = this.tag
                            ? this.withTag(entry, this.tag)
                            : entry;
                        if (!(this.buffer.length >= this.maxBufferSize)) return [3 /*break*/, 3];
                        if (!this.dropOnOverflow) return [3 /*break*/, 1];
                        dropped = this.buffer.shift();
                        if (dropped) {
                            (_a = this.onDrop) === null || _a === void 0 ? void 0 : _a.call(this, dropped);
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.flush()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        this.buffer.push(nextEntry);
                        if (!(this.buffer.length >= this.batchSize)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.flush()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AsyncBatchTransporter.prototype.withTag = function (entry, tag) {
        return __assign(__assign({}, entry), { meta: __assign(__assign({}, entry.meta), { type: tag }) });
    };
    AsyncBatchTransporter.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entries, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (this.isFlushing)
                            return [2 /*return*/];
                        if (this.buffer.length === 0)
                            return [2 /*return*/];
                        this.isFlushing = true;
                        entries = this.buffer.splice(0, this.buffer.length);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.sendWithRetry(entries)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, error_1, entries);
                        return [3 /*break*/, 5];
                    case 4:
                        this.isFlushing = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AsyncBatchTransporter.prototype.sendWithRetry = function (entries) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= this.retryAttempts)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.sendBatch(entries)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4:
                        error_2 = _a.sent();
                        attempt++;
                        if (attempt > this.retryAttempts) {
                            throw error_2;
                        }
                        return [4 /*yield*/, new Promise(function (resolve) {
                                setTimeout(resolve, _this.retryDelay);
                            })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AsyncBatchTransporter.prototype.start = function () {
        var _this = this;
        if (this.timer)
            return;
        var isTest = process.env.JEST_WORKER_ID !== undefined ||
            process.env.NODE_ENV === 'test';
        if (isTest && !this.enableTimerInTest) {
            return;
        }
        this.timer = (0, utils_1.registerInterval)(setInterval(function () {
            void _this.flush();
        }, this.flushInterval));
    };
    AsyncBatchTransporter.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pending, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        this.isClosed = true;
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = undefined;
                        }
                        pending = this.buffer.splice(0, this.buffer.length);
                        if (!(pending.length > 0)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sendWithRetry(pending)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, error_3, pending);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, (0, utils_1.clearAllTimers)()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AsyncBatchTransporter.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AsyncBatchTransporter;
}());
exports.AsyncBatchTransporter = AsyncBatchTransporter;
