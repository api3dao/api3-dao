"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCases = void 0;
var ethers_1 = require("ethers");
var cases = [
    {
        staked: '10000000000000000000000000',
        target: '10000000000000000000000000',
        apr: '3000000',
    },
    {
        staked: '6000000000000000000000000',
        target: '10000000000000000000000000',
        apr: '15000000',
    },
    {
        staked: '1000000000000000000000000',
        target: '1000000000000000000000000',
        apr: '2500000',
    },
    {
        staked: '540000000000000000000000',
        target: '180000000000000000000000',
        apr: '35000000',
    },
    {
        staked: '100000000000000000000000',
        target: '10000000000000000000000000',
        apr: '75000000',
    },
    {
        staked: '100000000000000000000000',
        target: '1000000000000000000000000',
        apr: '50000000' //50%
    },
    {
        staked: '1000000000000000000000000',
        target: '100000000000000000000000',
        apr: '25000000' //25%
    }
];
exports.testCases = cases.map(function (val) {
    return {
        staked: ethers_1.BigNumber.from(val.staked),
        apr: ethers_1.BigNumber.from(val.apr),
        target: ethers_1.BigNumber.from(val.target)
    };
});
