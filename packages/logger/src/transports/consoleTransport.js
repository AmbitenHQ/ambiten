"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleTransport = void 0;
var logger_1 = require("../logger");
var consoleTransport = function (colorize) {
    if (colorize === void 0) { colorize = true; }
    return ({
        write: function (entry, formatted) {
            var output = colorize
                ? (0, logger_1.colorByLevel)(entry.level, formatted)
                : formatted;
            var writer = entry.level === 'error' || entry.level === 'fatal'
                ? console.error
                : entry.level === 'warn'
                    ? console.warn
                    : entry.level === 'debug' || entry.level === 'trace'
                        ? console.debug
                        : console.info;
            writer(output);
            return Promise.resolve();
        },
    });
};
exports.consoleTransport = consoleTransport;
