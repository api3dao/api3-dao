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

    function getTotalSharesAt(uint256 fromBlock) public view returns(uint256) {
        return getValueAt(totalShares, fromBlock);
    }

    function getTotalShares() public view returns(uint256) {
        return getTotalSharesAt(block.number);
    }

    function getUnstaked(address _address) public view returns(uint256) {
        return users[_address].unstaked;
    }

    function getScheduledUnstake(address userAddress) external view returns (uint256) {
        return users[userAddress].unstakeScheduledAt;
    }

    function getUnstakeAmount(address userAddress) external view returns (uint256) {
        return users[userAddress].unstakeAmount;
    }

    function totalStakedAt(uint256 fromBlock) external view returns (uint256) {
        return getValueAt(totalStaked, fromBlock);
    }

    function totalStakedNow() external view returns (uint256) {
        return this.totalStakedAt(block.number);
    }

}