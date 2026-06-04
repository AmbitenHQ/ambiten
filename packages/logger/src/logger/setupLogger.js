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
exports.setupLogger = setupLogger;
var loggerFactory_1 = require("./loggerFactory");
function setupLogger(config) {
    if (config === void 0) { config = {}; }
    return (0, loggerFactory_1.createLogger)(__assign({}, config));
}
