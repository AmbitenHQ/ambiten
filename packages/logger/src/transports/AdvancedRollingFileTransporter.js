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
exports.AdvancedRollingFileTransporter = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var zlib_1 = require("zlib");
var util_1 = require("util");
var stream_1 = require("stream");
var timers_1 = require("timers");
var utils_1 = require("../utils");
var streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
var AdvancedRollingFileTransporter = /** @class */ (function () {
    function AdvancedRollingFileTransporter(options) {
        var _a, _b, _c, _d, _e, _f;
        this.buffer = [];
        this.isClosed = false;
        this.isFlushing = false;
        this.options = {
            filename: options.filename,
            maxSize: (_a = options.maxSize) !== null && _a !== void 0 ? _a : 5 * 1024 * 1024,
            backupCount: (_b = options.backupCount) !== null && _b !== void 0 ? _b : 5,
            frequency: (_c = options.frequency) !== null && _c !== void 0 ? _c : 'daily',
            compress: (_d = options.compress) !== null && _d !== void 0 ? _d : false,
            flushInterval: (_e = options.flushInterval) !== null && _e !== void 0 ? _e : 3000,
            metrics: options.metrics,
            encoding: (_f = options.encoding) !== null && _f !== void 0 ? _f : 'utf8',
        };
        this.ensureDirectoryExists();
        this.metrics = this.options.metrics;
        this.lastRolledAt = new Date();
        this.currentStream = this.createWriteStream();
        if (process.env.NODE_ENV !== 'test') {
            this.startFlusher();
        }
    }
    AdvancedRollingFileTransporter.prototype.createWriteStream = function () {
        return fs_1.default.createWriteStream(this.options.filename, {
            flags: 'a',
            encoding: this.options.encoding,
        });
    };
    AdvancedRollingFileTransporter.prototype.endCurrentStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.currentStream.destroyed)
                            return [2 /*return*/];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.currentStream.once('error', reject);
                                _this.currentStream.end(function () { return resolve(); });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedRollingFileTransporter.prototype.getTimestampSuffix = function () {
        var date = new Date();
        var pad = function (value) { return String(value).padStart(2, '0'); };
        var day = [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate()),
        ].join('-');
        var hour = pad(date.getHours());
        var minute = pad(date.getMinutes());
        var second = pad(date.getSeconds());
        return this.options.frequency === 'daily'
            ? day
            : "".concat(day, "_").concat(hour, "-").concat(minute, "-").concat(second);
    };
    AdvancedRollingFileTransporter.prototype.shouldRotateByTime = function (now) {
        var last = this.lastRolledAt;
        if (this.options.frequency === 'daily') {
            return (now.getFullYear() !== last.getFullYear() ||
                now.getMonth() !== last.getMonth() ||
                now.getDate() !== last.getDate());
        }
        return (now.getFullYear() !== last.getFullYear() ||
            now.getMonth() !== last.getMonth() ||
            now.getDate() !== last.getDate() ||
            now.getHours() !== last.getHours());
    };
    AdvancedRollingFileTransporter.prototype.shouldRotateBySize = function (nextWriteSize) {
        if (nextWriteSize === void 0) { nextWriteSize = 0; }
        var maxSize = this.options.maxSize;
        if (!maxSize || maxSize <= 0)
            return false;
        if (!fs_1.default.existsSync(this.options.filename))
            return false;
        var size = fs_1.default.statSync(this.options.filename).size;
        return size + nextWriteSize >= maxSize;
    };
    AdvancedRollingFileTransporter.prototype.getRotatedFilename = function () {
        var ext = path_1.default.extname(this.options.filename);
        var base = this.options.filename.slice(0, -ext.length);
        var timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-');
        return "".concat(base, ".").concat(timestamp).concat(ext);
    };
    AdvancedRollingFileTransporter.prototype.compressFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var compressedPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compressedPath = "".concat(filePath, ".gz");
                        return [4 /*yield*/, streamPipeline(fs_1.default.createReadStream(filePath), zlib_1.default.createGzip(), fs_1.default.createWriteStream(compressedPath))];
                    case 1:
                        _a.sent();
                        fs_1.default.unlinkSync(filePath);
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedRollingFileTransporter.prototype.rotateIfNeeded = function () {
        return __awaiter(this, arguments, void 0, function (nextWriteSize) {
            var now, shouldRotate, rotatedFile;
            var _a, _b;
            if (nextWriteSize === void 0) { nextWriteSize = 0; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        now = new Date();
                        shouldRotate = this.shouldRotateBySize(nextWriteSize) ||
                            this.shouldRotateByTime(now);
                        if (!shouldRotate)
                            return [2 /*return*/];
                        if (!fs_1.default.existsSync(this.options.filename))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.endCurrentStream()];
                    case 1:
                        _c.sent();
                        rotatedFile = this.getRotatedFilename();
                        fs_1.default.renameSync(this.options.filename, rotatedFile);
                        if (!(this.options.compress === true)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.compressFile(rotatedFile)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        this.cleanupOldLogs();
                        this.currentStream = this.createWriteStream();
                        this.lastRolledAt = now;
                        (_b = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.trackRotation) === null || _b === void 0 ? void 0 : _b.call(_a);
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedRollingFileTransporter.prototype.cleanupOldLogs = function () {
        var dir = path_1.default.dirname(this.options.filename);
        var ext = path_1.default.extname(this.options.filename);
        var baseName = path_1.default.basename(this.options.filename, ext);
        if (!fs_1.default.existsSync(dir))
            return;
        var rotatedFiles = fs_1.default
            .readdirSync(dir)
            .filter(function (file) {
            return file.startsWith("".concat(baseName, ".")) &&
                (file.endsWith(ext) || file.endsWith("".concat(ext, ".gz")));
        })
            .map(function (file) { return ({
            file: file,
            fullPath: path_1.default.join(dir, file),
            modifiedAt: fs_1.default.statSync(path_1.default.join(dir, file)).mtime.getTime(),
        }); })
            .sort(function (a, b) { return b.modifiedAt - a.modifiedAt; });
        for (var _i = 0, _a = rotatedFiles.slice(this.options.backupCount); _i < _a.length; _i++) {
            var item = _a[_i];
            fs_1.default.unlinkSync(item.fullPath);
        }
    };
    AdvancedRollingFileTransporter.prototype.startFlusher = function () {
        var _this = this;
        if (this.flushTimer) {
            (0, timers_1.clearInterval)(this.flushTimer);
        }
        this.flushTimer = (0, utils_1.registerInterval)(setInterval(function () {
            void _this.flush();
        }, this.options.flushInterval));
    };
    AdvancedRollingFileTransporter.prototype.write = function (entry, formatted) {
        return __awaiter(this, void 0, void 0, function () {
            var line, bufferedSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        line = formatted.endsWith('\n') ? formatted : "".concat(formatted, "\n");
                        this.buffer.push(line);
                        bufferedSize = Buffer.byteLength(this.buffer.join(''), this.options.encoding);
                        if (!(bufferedSize >= this.options.maxSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.flush()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedRollingFileTransporter.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var payload, normalizedPayload_1, nextWriteSize;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (this.isFlushing)
                            return [2 /*return*/];
                        if (this.buffer.length === 0)
                            return [2 /*return*/];
                        this.isFlushing = true;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 4, 5]);
                        payload = this.buffer.join('');
                        this.buffer = [];
                        normalizedPayload_1 = payload.endsWith('\n')
                            ? payload
                            : "".concat(payload, "\n");
                        nextWriteSize = Buffer.byteLength(normalizedPayload_1, this.options.encoding);
                        return [4 /*yield*/, this.rotateIfNeeded(nextWriteSize)];
                    case 2:
                        _c.sent();
                        if (this.currentStream.destroyed) {
                            this.currentStream = this.createWriteStream();
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.currentStream.write(normalizedPayload_1, _this.options.encoding, function (error) {
                                    if (error)
                                        reject(error);
                                    else
                                        resolve();
                                });
                            })];
                    case 3:
                        _c.sent();
                        (_b = (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.trackFlush) === null || _b === void 0 ? void 0 : _b.call(_a);
                        return [3 /*break*/, 5];
                    case 4:
                        this.isFlushing = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedRollingFileTransporter.prototype.ensureDirectoryExists = function () {
        var dir = path_1.default.dirname(this.options.filename);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    };
    AdvancedRollingFileTransporter.prototype.getLogDirectory = function () {
        return path_1.default.dirname(this.options.filename);
    };
    AdvancedRollingFileTransporter.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isClosed)
                            return [2 /*return*/];
                        if (this.flushTimer) {
                            (0, timers_1.clearInterval)(this.flushTimer);
                            this.flushTimer = undefined;
                        }
                        return [4 /*yield*/, this.flush()];
                    case 1:
                        _a.sent();
                        this.isClosed = true;
                        return [4 /*yield*/, this.endCurrentStream()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AdvancedRollingFileTransporter;
}());
exports.AdvancedRollingFileTransporter = AdvancedRollingFileTransporter;
;
