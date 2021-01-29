"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-waffle");
require("hardhat-typechain");
var config = {
    solidity: {
        compilers: [{ version: "0.6.12", settings: {} }],
    }
};
exports.default = config;
