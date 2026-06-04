"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRotatingFileTransporter = createRotatingFileTransporter;
var path_1 = require("path");
var AdvancedRollingFileTransporter_1 = require("./AdvancedRollingFileTransporter");
var buffered_transporter_1 = require("./buffered-transporter");
function createRotatingFileTransporter(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var filename = (_a = options === null || options === void 0 ? void 0 : options.filename) !== null && _a !== void 0 ? _a : path_1.default.resolve(process.cwd(), 'logs', 'ambiten.log');
    var rollingTransport = new AdvancedRollingFileTransporter_1.AdvancedRollingFileTransporter({
        filename: filename,
        frequency: (_b = options === null || options === void 0 ? void 0 : options.frequency) !== null && _b !== void 0 ? _b : 'daily',
        maxSize: (_c = options === null || options === void 0 ? void 0 : options.maxSize) !== null && _c !== void 0 ? _c : 5 * 1024 * 1024,
        backupCount: (_d = options === null || options === void 0 ? void 0 : options.backupCount) !== null && _d !== void 0 ? _d : 10,
        compress: (_e = options === null || options === void 0 ? void 0 : options.compress) !== null && _e !== void 0 ? _e : false,
        flushInterval: (_f = options === null || options === void 0 ? void 0 : options.flushInterval) !== null && _f !== void 0 ? _f : 3000,
        encoding: (_g = options === null || options === void 0 ? void 0 : options.encoding) !== null && _g !== void 0 ? _g : 'utf8',
        metrics: options === null || options === void 0 ? void 0 : options.metrics
    });
    return new buffered_transporter_1.BufferedTransporter(rollingTransport, {
        flushInterval: (_h = options === null || options === void 0 ? void 0 : options.flushInterval) !== null && _h !== void 0 ? _h : 3000,
        flushSize: (_j = options === null || options === void 0 ? void 0 : options.flushSize) !== null && _j !== void 0 ? _j : 20,
        maxBufferSize: (_k = options === null || options === void 0 ? void 0 : options.maxBufferSize) !== null && _k !== void 0 ? _k : 1000,
        dropOnOverflow: (_l = options === null || options === void 0 ? void 0 : options.dropOnOverflow) !== null && _l !== void 0 ? _l : true
    });
}
