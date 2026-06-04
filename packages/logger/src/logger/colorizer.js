"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorize = void 0;
exports.colorByLevel = colorByLevel;
/**
 * Colorizes a log message based on its level.
 * @param level - The log level (e.g., 'info', 'debug', 'warn', 'error', 'fatal', 'trace').
 * @param message - The log message to colorize.
 * @returns A string with the colored log message.
 */
function colorByLevel(level, message) {
    switch (level) {
        case 'info': return (0, exports.colorize)(message, 'blue');
        case 'debug': return (0, exports.colorize)(message, 'silver');
        case 'warn': return (0, exports.colorize)(message, 'yellow');
        case 'error': return (0, exports.colorize)(message, 'red');
        case 'fatal': return (0, exports.colorize)(message, 'red');
        case 'trace': return (0, exports.colorize)(message, 'magenta');
        default: return message;
    }
}
;
var colorize = function (text, platform) {
    switch (platform) {
        case 'red':
            return "\u001B[31m".concat(text, "\u001B[0m"); // Red color
        case 'green':
            return "\u001B[32m".concat(text, "\u001B[0m"); // Green color
        case 'magenta':
            return "\u001B[35m".concat(text, "\u001B[0m"); // Magenta color
        case 'cyan':
            return "\u001B[36m".concat(text, "\u001B[0m"); // Cyan color
        case 'yellow':
            return "\u001B[33m".concat(text, "\u001B[0m"); // Yellow color
        case 'blue':
            return "\u001B[34m".concat(text, "\u001B[0m"); // Blue color
        case 'silver':
            return "\u001B[90m".concat(text, "\u001B[0m"); // Gray color
        default:
            break;
    }
    return "\u001B[36m".concat(text, "\u001B[0m");
};
exports.colorize = colorize;
