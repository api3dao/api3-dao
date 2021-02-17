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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.calculateExpected = void 0;
var test_config_1 = require("../test_config");
var calculateExpected = function (pool) { return __awaiter(void 0, void 0, void 0, function () {
    var minApr, maxApr, sensitivity, output, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.minApr()];
            case 1:
                minApr = _a.sent();
                return [4 /*yield*/, pool.maxApr()];
            case 2:
                maxApr = _a.sent();
                return [4 /*yield*/, pool.updateCoeff()
                    // expect(await pool.currentApr()).to.equal(minApr);
                ];
            case 3:
                sensitivity = _a.sent();
                output = [];
                return [4 /*yield*/, Promise.all(test_config_1.testCases.map(function (test, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var staked, target, apr, delta, deltaPercent, aprUpdate, nextApr, nextExpectedApr, result;
                        return __generator(this, function (_a) {
                            staked = test.staked, target = test.target, apr = test.apr;
                            delta = target.sub(staked);
                            deltaPercent = delta.mul(100000000).div(target);
                            aprUpdate = deltaPercent.mul(sensitivity).div(1000000);
                            nextApr = apr.mul(aprUpdate.add(100000000)).div(100000000);
                            nextExpectedApr = nextApr;
                            if (nextApr > maxApr) {
                                nextExpectedApr = maxApr;
                            }
                            else if (nextApr < minApr) {
                                nextExpectedApr = minApr;
                            }
                            result = {
                                staked: staked.toString(),
                                target: target.toString(),
                                apr: apr.toString(),
                                update: aprUpdate.toString(),
                                calculated: nextApr.toString(),
                                expected: nextExpectedApr.toString()
                            };
                            console.log(JSON.parse(JSON.stringify(result)));
                            return [2 /*return*/, result];
                        });
                    }); }))];
            case 4:
                results = _a.sent();
                console.log(JSON.parse(JSON.stringify(results)));
                // writeFile('./calculated.json', JSON.stringify(output), (err) => {
                //     console.log('callback')
                //     if (err) { console.log(err) }
                // })
                return [2 /*return*/, results];
        }
    });
}); };
exports.calculateExpected = calculateExpected;
// calculateExpected()
