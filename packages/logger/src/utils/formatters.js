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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMsg = formatMsg;
exports.formatConsole = formatConsole;
exports.formatJSON = formatJSON;
exports.formatError = formatError;
var timeUtils_1 = require("./timeUtils");
/** *
 * Formats a log message based on the provided options.
 * @param level - The log level of the message.
 * @param message - The log message.
 * @param meta - Additional metadata for the log message.
 * @param options - Formatting options.
 * @returns The formatted log message as a string.
 */
function formatMsg(level, message, meta, options) {
    var _a, _b;
    if (meta === void 0) { meta = {}; }
    var timestamp = typeof (options === null || options === void 0 ? void 0 : options.timestamp) === 'function'
        ? options.timestamp()
        : (options === null || options === void 0 ? void 0 : options.timestamp)
            ? (0, timeUtils_1.now)()
            : new Date().toISOString();
    var prefix = (_a = options === null || options === void 0 ? void 0 : options.prefix) !== null && _a !== void 0 ? _a : '';
    var source = (_b = meta.source) !== null && _b !== void 0 ? _b : '';
    var context = meta.context;
    if (options === null || options === void 0 ? void 0 : options.json) {
        return formatJSON({
            timestamp: timestamp,
            level: level,
            prefix: prefix,
            source: source,
            message: message,
            meta: meta,
            context: context,
        });
    }
    var contextParts = [
        (context === null || context === void 0 ? void 0 : context.tenantId) ? "tenant=".concat(context.tenantId) : '',
        (context === null || context === void 0 ? void 0 : context.requestId) ? "request=".concat(context.requestId) : '',
        (context === null || context === void 0 ? void 0 : context.dbName) ? "db=".concat(context.dbName) : '',
        (context === null || context === void 0 ? void 0 : context.collectionName) ? "collection=".concat(context.collectionName) : '',
        (context === null || context === void 0 ? void 0 : context.operation) ? "operation=".concat(context.operation) : '',
    ].filter(Boolean);
    var metaForOutput = __assign({}, meta);
    delete metaForOutput.context;
    delete metaForOutput.source;
    var metaText = Object.keys(metaForOutput).length > 0
        ? JSON.stringify(metaForOutput)
        : '';
    var parts = [
        "[".concat(timestamp, "]"),
        '-',
        "[".concat(level.toUpperCase(), "]"),
        prefix,
        source,
        message,
        contextParts.length ? "{".concat(contextParts.join(' '), "}") : '',
        metaText,
    ].filter(Boolean);
    return parts.join(' ').trim();
}
function formatConsole(level, message, timestamp) {
    return "".concat(timestamp, " [").concat(level.toUpperCase(), "] ").concat(message);
}
;
function formatJSON(metadata) {
    return JSON.stringify(metadata, null, 2);
}
function formatError(error) {
    return "".concat(error.name, ": ").concat(error.message, "\n").concat(error.stack);
}
