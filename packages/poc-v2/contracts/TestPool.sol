pragma solidity 0.6.12;

import './Api3Pool.sol';

contract TestPool is Api3Pool {
    constructor(address api3TokenAddress)
        Api3Pool(api3TokenAddress)
        public
    {}

    function setTestCase(uint256 _totalStaked, uint256 _stakeTarget, uint256 _currentApr) public {
        totalStaked.push(Checkpoint(block.number, _totalStaked));
        currentApr = _currentApr;
        stakeTarget = _stakeTarget;
    }

    function testUpdateCurrentApr(uint256 _totalStaked, uint256 _stakeTarget, uint256 _currentApr) public {
        setTestCase(_totalStaked, _stakeTarget, _currentApr);
        updateCurrentApr();
        // totalStaked.pop();
    }

//    function testPayReward(uint256 deltaTotalStaked) public {
//        uint256 _totalStaked = this.totalSupply();
//        totalStaked.push(Checkpoint(block.number, _totalStaked + deltaTotalStaked));
//        payReward();
//    }

    function testPayReward() public {
        payReward();
    }

    function getLockedAt(uint256 fromBlock) public view returns(uint256) {
        return getValueAt(locks, fromBlock);
    }

    function getRewardReleaseAt(uint256 fromBlock) public view returns(uint256) {
        return getValueAt(rewardReleases, fromBlock);
    }

}