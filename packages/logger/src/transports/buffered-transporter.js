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
exports.BufferedTransporter = void 0;
var utils_1 = require("../utils");
var BufferedTransporter = /** @class */ (function () {
    function BufferedTransporter(transporter, options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c, _d;
        this.buffer = [];
        this.isFlushing = false;
        this.isClosed = false;
        this.transporter = transporter;
        this.flushInterval = (_a = options.flushInterval) !== null && _a !== void 0 ? _a : 5000;
        this.flushSize = (_b = options.flushSize) !== null && _b !== void 0 ? _b : 10;
        this.maxBufferSize = (_c = options.maxBufferSize) !== null && _c !== void 0 ? _c : 1000;
        this.dropOnOverflow = (_d = options.dropOnOverflow) !== null && _d !== void 0 ? _d : true;
        this.onError = options.onError;
        this.onDrop = options.onDrop;
        this.startAutoFlush();
    }
    BufferedTransporter.prototype.write = function (entry, formatted) {
        return __awaiter(this, void 0, void 0, function () {
            var dropped;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (!(this.buffer.length >= this.maxBufferSize)) return [3 /*break*/, 3];
                        if (!this.dropOnOverflow) return [3 /*break*/, 1];
                        dropped = this.buffer.shift();
                        if (dropped) {
                            (_a = this.onDrop) === null || _a === void 0 ? void 0 : _a.call(this, dropped.entry);
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.flush()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        this.buffer.push({ entry: entry, formatted: formatted });
                        if (!(this.buffer.length >= this.flushSize)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.flush()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BufferedTransporter.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entries, _i, entries_1, item, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (this.isFlushing)
                            return [2 /*return*/];
                        if (this.buffer.length === 0)
                            return [2 /*return*/];
                        this.isFlushing = true;
                        entries = this.buffer.splice(0, this.buffer.length);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, , 9, 10]);
                        _i = 0, entries_1 = entries;
                        _d.label = 2;
                    case 2:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 7];
                        item = entries_1[_i];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.transporter.write(item.entry, item.formatted)];
                    case 4:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
                        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, error_1, item.entry);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, ((_c = (_b = this.transporter).flush) === null || _c === void 0 ? void 0 : _c.call(_b))];
                    case 8:
                        _d.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        this.isFlushing = false;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    BufferedTransporter.prototype.startAutoFlush = function () {
        var _this = this;
        if (process.env.JEST_WORKER_ID !== undefined ||
            process.env.NODE_ENV === 'test') {
            return;
        }
        this.timer = (0, utils_1.registerInterval)(setInterval(function () {
            void _this.flush();
        }, this.flushInterval));
    };
    BufferedTransporter.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = undefined;
                        }
                        return [4 /*yield*/, this.flush()];
                    case 1:
                        _c.sent();
                        this.isClosed = true;
                        return [4 /*yield*/, ((_b = (_a = this.transporter).close) === null || _b === void 0 ? void 0 : _b.call(_a))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BufferedTransporter.prototype.stop = function () {
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
    return BufferedTransporter;
}());
exports.BufferedTransporter = BufferedTransporter;
