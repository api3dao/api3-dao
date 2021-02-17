pragma solidity 0.6.12;

import './Api3Pool.sol';

contract TestPool is Api3Pool {
    constructor(address api3TokenAddress)
        Api3Pool(api3TokenAddress)
        public
    {}

    function testUpdateCurrentApr(uint256 _totalStaked, uint256 _stakeTarget, uint256 _currentApr) public {
        totalStaked.push(Checkpoint(block.number, _totalStaked));
        currentApr = _currentApr;
        stakeTarget = _stakeTarget;
        updateCurrentApr();
        // totalStaked.pop();
    }

    function testPayReward(uint256 deltaTotalStaked) public {
        uint256 _totalStaked = this.totalSupply();
        totalStaked.push(Checkpoint(block.number, _totalStaked + deltaTotalStaked));
        payReward();
    }
}