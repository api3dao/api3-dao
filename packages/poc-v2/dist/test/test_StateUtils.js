"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
var hre = __importStar(require("hardhat"));
require("mocha");
var ethers_1 = require("ethers");
var test_config_1 = require("../test_config");
var tokenDigits = ethers_1.BigNumber.from('1000000000000000000');
var paramDigits = ethers_1.BigNumber.from('1000000');
describe('StateUtils', function () {
    var accounts;
    var token;
    var pool;
    var ownerAccount;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var api3TokenFactory, testPoolFactory, signer0;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hre.waffle.provider.listAccounts()];
                case 1:
                    accounts = _a.sent();
                    return [4 /*yield*/, hre.ethers.getContractFactory("Api3Token")];
                case 2:
                    api3TokenFactory = _a.sent();
                    return [4 /*yield*/, api3TokenFactory.deploy(accounts[0], accounts[0])];
                case 3:
                    token = (_a.sent());
                    return [4 /*yield*/, hre.ethers.getContractFactory("TestPool")];
                case 4:
                    testPoolFactory = _a.sent();
                    return [4 /*yield*/, testPoolFactory.deploy(token.address)];
                case 5:
                    pool = (_a.sent());
                    signer0 = hre.waffle.provider.getSigner(0);
                    ownerAccount = token.connect(signer0);
                    return [4 /*yield*/, ownerAccount.updateMinterStatus(pool.address, true)];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('update APR', function () { return __awaiter(void 0, void 0, void 0, function () {
        var minApr, maxApr, sensitivity;
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
                    // expect(await pool.currentApr()).to.equal(minApr);
                    test_config_1.testCases.forEach(function (test, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var staked, target, apr, delta, deltaPercent, aprUpdate, nextExpectedApr, waitForApr;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(index);
                                    staked = test.staked, target = test.target, apr = test.apr;
                                    delta = target.sub(staked);
                                    deltaPercent = delta.mul(100000000).div(target);
                                    aprUpdate = deltaPercent.mul(sensitivity).div(paramDigits);
                                    console.log('Update ' + aprUpdate);
                                    nextExpectedApr = apr.mul(aprUpdate.add(100000000)).div(100000000);
                                    console.log('Next ' + nextExpectedApr);
                                    if (nextExpectedApr > maxApr) {
                                        console.log(nextExpectedApr > maxApr);
                                        nextExpectedApr = maxApr;
                                    }
                                    else if (nextExpectedApr < minApr) {
                                        nextExpectedApr = minApr;
                                    }
                                    console.log('Expected ' + nextExpectedApr);
                                    return [4 /*yield*/, pool.testUpdateCurrentApr(staked, target, apr)];
                                case 1:
                                    _a.sent();
                                    waitForApr = function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var result;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, pool.currentApr()];
                                                case 1:
                                                    result = _a.sent();
                                                    console.log('Result ' + result + '/n/n');
                                                    return [2 /*return*/, result];
                                            }
                                        });
                                    }); };
                                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var result;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, waitForApr()];
                                                case 1:
                                                    result = _a.sent();
                                                    console.log(result);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, 5000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); });
    // it('test payReward() function', async () => {
    //   const stakeValues = [
    //     // [oldStaked, expectedReward, newStaked]
    //     ['10000000000000000000000000', '4807692307692310000000', '10004807692307700000000000'],
    //     ['1000000000000000000000000', '913461538461539000000', '1000913461538460000000000'],
    //     ['1500000000000000000000000', '2534855769230770000000', '1502534855769230000000000'],
    //     ['15000000000000000000000000', '38022836538461500000000', '15038022836538500000000000']
    //   ]
    //   const roundingError = hre.ethers.BigNumber.from('10000000000000000'); // 10^16
    //   for (let [oldStaked, expectedReward, newStaked] of stakeValues) {
    //     const oldPoolBalance = await token.balanceOf(pool.address);
    //     await pool.testPayReward(hre.ethers.BigNumber.from(oldStaked));
    //     // check new total staked value
    //     const realStakedNow = await pool.getTotalStakedNow();
    //     const newStakedBN = hre.ethers.BigNumber.from(newStaked);
    //     const stakeDifference = realStakedNow.sub(newStakedBN).abs();
    //     expect(stakeDifference).to.be.lte(roundingError);
    //     // check that pool balance increased by expected reward amount
    //     const newPoolBalance = await token.balanceOf(pool.address);
    //     const balanceDifference = newPoolBalance.sub(oldPoolBalance);
    //     const expectedRewardBN = hre.ethers.BigNumber.from(expectedReward);
    //     const rewardDifference = balanceDifference.sub(expectedRewardBN).abs();
    //     expect(rewardDifference).to.be.lte(roundingError);
    //   }
    // })
});
