//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TimelockUtils.sol";


contract Api3Pool is TimelockUtils {
    constructor(address api3TokenAddress)
        TimelockUtils(api3TokenAddress)
        public
    {}

    // events for governable parameter updates
    event newMinApr(uint oldMinApr, uint newMinApr);
    event newMaxApr(uint oldMaxApr, uint newMaxApr);
    event newStakeTarget(uint oldStakeTarget, uint newStakeTarget);
    event newUpdateCoeff(uint oldUpdateCoeff, uint newUpdateCoeff);

    // setters for governable parameters
    function setMinApr(uint _minApr) public {
        emit newMinApr(minApr, _minApr);
        minApr = _minApr;
    }

    function setMaxApr(uint _maxApr) public {
        emit newMaxApr(maxApr, _maxApr);
        maxApr = _maxApr;
    }

    function setStakeTarget(uint _stakeTarget) public {
        emit newStakeTarget(stakeTarget, _stakeTarget);
        stakeTarget = _stakeTarget;
    }

    function setUpdateCoeff(uint _updateCoeff) public {
        emit newUpdateCoeff(updateCoeff, _updateCoeff);
        updateCoeff = _updateCoeff;
    }
}
