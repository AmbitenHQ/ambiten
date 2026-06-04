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
exports.MetricsTracker = void 0;
var TimerRegistry_1 = require("./TimerRegistry");
var MetricsTracker = /** @class */ (function () {
    function MetricsTracker(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.totalLogs = 0;
        this.transportDispatches = 0;
        this.successfulTransportWrites = 0;
        this.flushedBuffers = 0;
        this.rotations = 0;
        this.transportErrors = 0;
        this.droppedLogs = 0;
        this.lastTotalLogs = 0;
        this.startedAt = new Date();
        this.lastSnapshotAt = new Date();
    }
    MetricsTracker.prototype.trackLog = function (count) {
        if (count === void 0) { count = 1; }
        this.totalLogs += count;
    };
    MetricsTracker.prototype.trackFlush = function (count) {
        if (count === void 0) { count = 1; }
        this.flushedBuffers += count;
    };
    MetricsTracker.prototype.trackRotation = function (count) {
        if (count === void 0) { count = 1; }
        this.rotations += count;
    };
    MetricsTracker.prototype.trackTransportDispatch = function (count) {
        if (count === void 0) { count = 1; }
        this.transportDispatches += count;
    };
    MetricsTracker.prototype.trackSuccessfulTransportWrite = function (count) {
        if (count === void 0) { count = 1; }
        this.successfulTransportWrites += count;
    };
    MetricsTracker.prototype.trackTransportError = function (count) {
        if (count === void 0) { count = 1; }
        this.transportErrors += count;
    };
    MetricsTracker.prototype.trackDroppedLog = function (count) {
        if (count === void 0) { count = 1; }
        this.droppedLogs += count;
    };
    MetricsTracker.prototype.start = function (interval) {
        var _this = this;
        var _a;
        if (interval === void 0) { interval = (_a = this.options.interval) !== null && _a !== void 0 ? _a : 60000; }
        if (this.intervalId)
            return;
        if (this.options.enabled === false)
            return;
        this.intervalId = (0, TimerRegistry_1.registerInterval)(setInterval(function () {
            var snapshot = _this.getSnapshot();
            if (_this.options.reporter) {
                _this.options.reporter(snapshot);
            }
            else if (process.env.NODE_ENV !== 'test') {
                console.info('📈 Ambiten Logger Metrics:', snapshot);
            }
            _this.resetForNextCycle();
        }, interval));
    };
    MetricsTracker.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.intervalId)
                            return [2 /*return*/];
                        clearInterval(this.intervalId);
                        this.intervalId = undefined;
                        return [4 /*yield*/, (0, TimerRegistry_1.clearAllTimers)()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MetricsTracker.prototype.isTrackingMetrics = function () {
        return this.intervalId !== undefined;
    };
    MetricsTracker.prototype.getSnapshot = function () {
        var now = new Date();
        return {
            totalLogs: this.totalLogs,
            transportDispatches: this.transportDispatches,
            successfulTransportWrites: this.successfulTransportWrites,
            flushedBuffers: this.flushedBuffers,
            rotations: this.rotations,
            transportErrors: this.transportErrors,
            droppedLogs: this.droppedLogs,
            logsPerInterval: this.totalLogs - this.lastTotalLogs,
            startedAt: this.startedAt.toISOString(),
            lastSnapshotAt: now.toISOString(),
        };
    };
    MetricsTracker.prototype.resetForNextCycle = function () {
        this.transportDispatches = 0;
        this.successfulTransportWrites = 0;
        this.flushedBuffers = 0;
        this.rotations = 0;
        this.transportErrors = 0;
        this.droppedLogs = 0;
        this.lastTotalLogs = this.totalLogs;
        this.lastSnapshotAt = new Date();
    };
    return MetricsTracker;
}());
exports.MetricsTracker = MetricsTracker;
;
