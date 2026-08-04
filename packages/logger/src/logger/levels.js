"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogLevelPriority = exports.isLogLevel = exports.getLogLevel = exports.LOG_LEVELS = void 0;
exports.shouldLog = shouldLog;
exports.LOG_LEVELS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};
/** * Determines if a message at a given log level should be logged based on the current configuration level.
 * @param level - The log level of the message.
 * @param configLevel - The configured log level.
 * @returns True if the message should be logged, false otherwise.
 */
function shouldLog(level, configLevel) {
    return exports.LOG_LEVELS[level] >= exports.LOG_LEVELS[configLevel];
}
/** * Retrieves the log level.
 * @param level - The log level to retrieve.
 * @returns The log level.
 */
var getLogLevel = function (level) {
    return level;
};
exports.getLogLevel = getLogLevel;
/** * Type guard to check if a string is a valid LogLevel.
 * @param level - The string to check.
 * @returns True if the string is a valid LogLevel, false otherwise.
 */
var isLogLevel = function (level) {
    return level in exports.LOG_LEVELS;
};
exports.isLogLevel = isLogLevel;
/** * Retrieves the numeric priority of a given log level.
 * @param level - The log level.
 * @returns The numeric priority of the log level.
 */
var getLogLevelPriority = function (level) {
    return exports.LOG_LEVELS[level];
};
exports.getLogLevelPriority = getLogLevelPriority;
