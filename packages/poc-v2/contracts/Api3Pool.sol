//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TimelockUtils.sol";


contract Api3Pool is TimelockUtils {
    constructor(address api3TokenAddress)
        TimelockUtils(api3TokenAddress)
        public
    {}
}
