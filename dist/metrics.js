"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LevelDB = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(ts, v) {
        this.timestamp = ts;
        this.value = v;
    }
    Metric.prototype.getMetrics = function () {
        return ('Timestamp : ' + this.timestamp + ', value : ' + this.value + '.');
    };
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = LevelDB.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + m.timestamp, value: m.value });
        });
        stream.end();
    };
    MetricsHandler.prototype.closeDB = function () {
        this.db.close();
    };
    MetricsHandler.prototype.getAll = function (key, callback) {
        var stream = this.db.createReadStream();
        var met = [];
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), _ = _a[0], k = _a[1], timestamp = _a[2];
            var value = data.value;
            if (key != k) {
                console.log("LevelDB error: " + data + " does not match key " + key);
            }
            else {
                met.push(new Metric(timestamp, value));
            }
        })
            .on('end', function (err) {
            callback(null, met);
        });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
//for only one key 
//let timestamp : string = data.key.split(':') [1]
