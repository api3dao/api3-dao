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
var chai_1 = require("chai");
require("mocha");
describe('TransferUtils', function () {
    var accounts;
    var token;
    var pool;
    var ownerAccount;
    var testValues = [1, 2, 3, 10, 100, 1000, '1000000000000000000', -1];
    var testTotal = hre.ethers.BigNumber.from(0);
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        var api3TokenFactory, api3PoolFactory, signer0;
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
                    return [4 /*yield*/, hre.ethers.getContractFactory("Api3Pool")];
                case 4:
                    api3PoolFactory = _a.sent();
                    return [4 /*yield*/, api3PoolFactory.deploy(token.address)];
                case 5:
                    pool = (_a.sent());
                    signer0 = hre.waffle.provider.getSigner(0);
                    ownerAccount = token.connect(signer0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('transfer tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, testValues_1, amount, balance, signer1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    for (_i = 0, testValues_1 = testValues; _i < testValues_1.length; _i++) {
                        amount = testValues_1[_i];
                        testTotal = testTotal.add(amount);
                    }
                    return [4 /*yield*/, ownerAccount.transfer(accounts[1], testTotal)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, token.balanceOf(accounts[1])];
                case 2:
                    balance = _a.sent();
                    chai_1.expect(balance).to.equal(testTotal);
                    signer1 = hre.waffle.provider.getSigner(1);
                    return [4 /*yield*/, token.connect(signer1).approve(pool.address, balance)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Deposit tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokenHolder, poolBalance, userBalance, deposited, _i, testValues_2, amount, prePoolBalance, preUserBalance, unstaked;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenHolder = accounts[1];
                    return [4 /*yield*/, token.balanceOf(pool.address)];
                case 1:
                    poolBalance = _a.sent();
                    return [4 /*yield*/, token.balanceOf(tokenHolder)];
                case 2:
                    userBalance = _a.sent();
                    // pre-totals
                    chai_1.expect(poolBalance).to.equal(0);
                    chai_1.expect(userBalance).to.equal(testTotal);
                    deposited = hre.ethers.BigNumber.from(0);
                    _i = 0, testValues_2 = testValues;
                    _a.label = 3;
                case 3:
                    if (!(_i < testValues_2.length)) return [3 /*break*/, 9];
                    amount = testValues_2[_i];
                    prePoolBalance = poolBalance;
                    preUserBalance = userBalance;
                    return [4 /*yield*/, pool.deposit(tokenHolder, amount, tokenHolder)];
                case 4:
                    _a.sent();
                    deposited = deposited.add(amount);
                    return [4 /*yield*/, token.balanceOf(pool.address)];
                case 5:
                    // confirm pool token balance
                    poolBalance = _a.sent();
                    chai_1.expect(poolBalance).to.equal(prePoolBalance.add(amount));
                    return [4 /*yield*/, token.balanceOf(tokenHolder)];
                case 6:
                    // depositor token balance
                    userBalance = _a.sent();
                    chai_1.expect(userBalance).to.equal(preUserBalance.sub(amount));
                    return [4 /*yield*/, pool.users(tokenHolder)];
                case 7:
                    unstaked = (_a.sent()).unstaked;
                    chai_1.expect(unstaked).to.equal(deposited);
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    // post-totals
                    chai_1.expect(poolBalance).to.equal(testTotal);
                    chai_1.expect(userBalance).to.equal(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Withdraw tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokenHolder, signer1, user, preUnstaked, preLocked, poolBalance, userBalance, withdrawn, _i, testValues_3, amount, prePoolBalance, preUserBalance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenHolder = accounts[1];
                    signer1 = hre.waffle.provider.getSigner(1);
                    return [4 /*yield*/, pool.updateUserState(tokenHolder, hre.waffle.provider.blockNumber)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, pool.users(tokenHolder)];
                case 2:
                    user = _a.sent();
                    preUnstaked = user.unstaked;
                    preLocked = user.locked;
                    return [4 /*yield*/, token.balanceOf(pool.address)];
                case 3:
                    poolBalance = _a.sent();
                    return [4 /*yield*/, token.balanceOf(tokenHolder)];
                case 4:
                    userBalance = _a.sent();
                    // pre-totals
                    chai_1.expect(poolBalance).to.equal(testTotal);
                    chai_1.expect(userBalance).to.equal(0);
                    withdrawn = hre.ethers.BigNumber.from(0);
                    _i = 0, testValues_3 = testValues;
                    _a.label = 5;
                case 5:
                    if (!(_i < testValues_3.length)) return [3 /*break*/, 11];
                    amount = testValues_3[_i];
                    prePoolBalance = poolBalance;
                    preUserBalance = userBalance;
                    return [4 /*yield*/, pool.connect(signer1).withdraw(tokenHolder, amount)];
                case 6:
                    _a.sent();
                    withdrawn = withdrawn.add(amount);
                    return [4 /*yield*/, token.balanceOf(pool.address)];
                case 7:
                    // confirm pool token balance
                    poolBalance = _a.sent();
                    chai_1.expect(poolBalance).to.equal(prePoolBalance.sub(amount));
                    return [4 /*yield*/, token.balanceOf(tokenHolder)];
                case 8:
                    // depositor token balance
                    userBalance = _a.sent();
                    chai_1.expect(userBalance).to.equal(preUserBalance.add(amount));
                    return [4 /*yield*/, pool.users(tokenHolder)];
                case 9:
                    // confirm depositor pool balances
                    user = _a.sent();
                    chai_1.expect(user.unstaked).to.equal(preUnstaked.sub(withdrawn));
                    chai_1.expect(user.locked).to.equal(preLocked);
                    chai_1.expect(user.unstaked).to.be.gte(user.locked);
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 5];
                case 11:
                    // post-totals
                    chai_1.expect(poolBalance).to.equal(0);
                    chai_1.expect(userBalance).to.equal(testTotal);
                    return [2 /*return*/];
            }
        });
    }); });
});
