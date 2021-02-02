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
describe('StakeUtils', function () {
    var accounts;
    var token;
    var pool;
    var ownerAccount;
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
    it('transfers tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var balance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ownerAccount.transfer(accounts[1], 100)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, token.balanceOf(accounts[1])];
                case 2:
                    balance = _a.sent();
                    chai_1.expect(balance).to.equal(100);
                    return [2 /*return*/];
            }
        });
    }); });
    it('deposits and stakes tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
        var signer, account, allowance, staker, stakerBalance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    signer = hre.waffle.provider.getSigner(1);
                    account = token.connect(signer);
                    return [4 /*yield*/, account.approve(pool.address, 100)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, token.allowance(accounts[1], pool.address)];
                case 2:
                    allowance = _a.sent();
                    chai_1.expect(allowance).to.equal(100);
                    staker = pool.connect(signer);
                    return [4 /*yield*/, staker.deposit(accounts[1], 100, accounts[1])];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, staker.stake(50)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, staker.balanceOf(accounts[1])];
                case 5:
                    stakerBalance = _a.sent();
                    chai_1.expect(stakerBalance).to.equal(50);
                    return [2 /*return*/];
            }
        });
    }); });
});
