//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./ClaimUtils.sol";


contract Api3Pool is ClaimUtils {
    constructor(address api3TokenAddress)
        ClaimUtils(api3TokenAddress)
        public
    {}
}
