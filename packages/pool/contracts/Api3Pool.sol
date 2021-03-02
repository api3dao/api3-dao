//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./GovernanceUtils.sol";


contract Api3Pool is GovernanceUtils {    
    constructor(address api3TokenAddress)
        GovernanceUtils(api3TokenAddress)
        public
    {}
}
