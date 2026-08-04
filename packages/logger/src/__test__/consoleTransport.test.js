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
var transports_1 = require("../transports");
var createEntry = function (level) {
    if (level === void 0) { level = 'info'; }
    return ({
        timestamp: new Date().toISOString(),
        level: level,
        message: 'Test message',
        meta: {},
    });
};
describe('consoleTransport', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    afterEach(function () {
        jest.restoreAllMocks();
    });
    it('should expose a write method', function () {
        var transport = (0, transports_1.consoleTransport)(true);
        expect(transport).toHaveProperty('write');
        expect(typeof transport.write).toBe('function');
    });
    it('should write info logs using console.info', function () { return __awaiter(void 0, void 0, void 0, function () {
        var infoSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    infoSpy = jest
                        .spyOn(console, 'info')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(false);
                    return [4 /*yield*/, transport.write(createEntry('info'), '[INFO] Test message')];
                case 1:
                    _a.sent();
                    expect(infoSpy).toHaveBeenCalledTimes(1);
                    expect(infoSpy).toHaveBeenCalledWith('[INFO] Test message');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should write warn logs using console.warn', function () { return __awaiter(void 0, void 0, void 0, function () {
        var warnSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    warnSpy = jest
                        .spyOn(console, 'warn')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(false);
                    return [4 /*yield*/, transport.write(createEntry('warn'), '[WARN] Test message')];
                case 1:
                    _a.sent();
                    expect(warnSpy).toHaveBeenCalledTimes(1);
                    expect(warnSpy).toHaveBeenCalledWith('[WARN] Test message');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should write error logs using console.error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorSpy = jest
                        .spyOn(console, 'error')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(false);
                    return [4 /*yield*/, transport.write(createEntry('error'), '[ERROR] Test message')];
                case 1:
                    _a.sent();
                    expect(errorSpy).toHaveBeenCalledTimes(1);
                    expect(errorSpy).toHaveBeenCalledWith('[ERROR] Test message');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should write debug logs using console.debug', function () { return __awaiter(void 0, void 0, void 0, function () {
        var debugSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debugSpy = jest
                        .spyOn(console, 'debug')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(false);
                    return [4 /*yield*/, transport.write(createEntry('debug'), '[DEBUG] Test message')];
                case 1:
                    _a.sent();
                    expect(debugSpy).toHaveBeenCalledTimes(1);
                    expect(debugSpy).toHaveBeenCalledWith('[DEBUG] Test message');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should support colorized output', function () { return __awaiter(void 0, void 0, void 0, function () {
        var infoSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    infoSpy = jest
                        .spyOn(console, 'info')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(true);
                    return [4 /*yield*/, transport.write(createEntry('info'), '[INFO] Colored message')];
                case 1:
                    _a.sent();
                    expect(infoSpy).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should support metadata in log entries', function () { return __awaiter(void 0, void 0, void 0, function () {
        var infoSpy, transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    infoSpy = jest
                        .spyOn(console, 'info')
                        .mockImplementation(function () { });
                    transport = (0, transports_1.consoleTransport)(false);
                    return [4 /*yield*/, transport.write(__assign(__assign({}, createEntry('info')), { meta: {
                                tenantId: 'tenant-1',
                                requestId: 'req-1',
                            } }), '[INFO] Metadata message')];
                case 1:
                    _a.sent();
                    expect(infoSpy).toHaveBeenCalledWith('[INFO] Metadata message');
                    return [2 /*return*/];
            }
        });
    }); });
});
