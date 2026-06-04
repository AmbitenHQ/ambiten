"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLoggerTransports = resolveLoggerTransports;
var transports_1 = require("../transports");
function resolveLoggerTransports(transportConfigs, options) {
    var _a;
    if (transportConfigs === void 0) { transportConfigs = []; }
    if (options === void 0) { options = {}; }
    var loggerConfig = options.loggerConfig;
    var metrics = options.metrics;
    var globalCompress = ((_a = loggerConfig === null || loggerConfig === void 0 ? void 0 : loggerConfig.compress) === null || _a === void 0 ? void 0 : _a.enabled) === true;
    return transportConfigs.map(function (transportConfig) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        switch (transportConfig.type) {
            case 'console': {
                return (0, transports_1.consoleTransport)((_c = (_b = (_a = transportConfig.options) === null || _a === void 0 ? void 0 : _a.colorize) !== null && _b !== void 0 ? _b : loggerConfig === null || loggerConfig === void 0 ? void 0 : loggerConfig.colorize) !== null && _c !== void 0 ? _c : true);
            }
            case 'file': {
                return (0, transports_1.createFileTransporter)(transportConfig.options.filename);
            }
            case 'rotating-file': {
                var transportOptions = (_d = transportConfig.options) !== null && _d !== void 0 ? _d : {};
                return new transports_1.AdvancedRollingFileTransporter({
                    filename: (_e = transportOptions.filename) !== null && _e !== void 0 ? _e : './logs/ambiten.log',
                    frequency: (_f = transportOptions.frequency) !== null && _f !== void 0 ? _f : 'daily',
                    maxSize: (_g = transportOptions.maxSize) !== null && _g !== void 0 ? _g : 5 * 1024 * 1024,
                    backupCount: (_h = transportOptions.backupCount) !== null && _h !== void 0 ? _h : 10,
                    compress: typeof transportOptions.compress === 'boolean'
                        ? transportOptions.compress
                        : globalCompress,
                    flushInterval: (_j = transportOptions.flushInterval) !== null && _j !== void 0 ? _j : 3000,
                    encoding: (_k = transportOptions.encoding) !== null && _k !== void 0 ? _k : 'utf8',
                    metrics: metrics,
                });
            }
            case 'http': {
                var baseTransport = (0, transports_1.createHttpTransport)(transportConfig.options.url);
                return transportConfig.options.resilient
                    ? (0, transports_1.createResilientTransporter)(baseTransport)
                    : baseTransport;
            }
            case 'elasticsearch': {
                var baseTransport = (0, transports_1.createElasticTransport)(transportConfig.options.url, transportConfig.options.index);
                return transportConfig.options.resilient
                    ? (0, transports_1.createResilientTransporter)(baseTransport)
                    : baseTransport;
            }
            case 'loki': {
                var baseTransport = (0, transports_1.createLokiTransport)(transportConfig.options.pushUrl, (_l = transportConfig.options.labels) !== null && _l !== void 0 ? _l : {});
                return transportConfig.options.resilient
                    ? (0, transports_1.createResilientTransporter)(baseTransport)
                    : baseTransport;
            }
            default: {
                var exhaustiveCheck = transportConfig;
                throw new Error("Unsupported logger transport type: ".concat(exhaustiveCheck.type));
            }
        }
    });
}
