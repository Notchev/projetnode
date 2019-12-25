"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var metrics_1 = require("./metrics");
var leveldb_1 = require("./leveldb");
var a = 0;
var dbPath = 'db/test';
var dbMet;
describe('Metrics', function () {
    before(function () {
        leveldb_1.LevelDB.clear(dbPath);
        dbMet = new metrics_1.MetricsHandler(dbPath);
    });
    after(function () {
        dbMet.closeDB();
    });
    describe('#get', function () {
        it('should get empty array on non existing group', function () {
            dbMet.getAll("0", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
            });
        });
        it('should save and get', function () {
            var met = [];
            met.push(new metrics_1.Metric('122211212', 10));
            dbMet.save("1", met, function (err) {
                dbMet.getAll("1", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    console.log(result);
                    if (result)
                        chai_1.expect(result[0].value).to.equal(10);
                });
            });
        });
    });
});
