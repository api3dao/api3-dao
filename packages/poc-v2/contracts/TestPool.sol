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
        updateCurrentApr(_totalStaked);
        // totalStaked.pop();
    }

//    function testPayReward(uint256 deltaTotalStaked) public {
//        uint256 _totalStaked = this.totalSupply();
//        totalStaked.push(Checkpoint(block.number, _totalStaked + deltaTotalStaked));
//        payReward();
//    }

    function getRewardTargetEpochTest() external view returns(uint256) {
        uint256 currentEpoch = now.div(rewardEpochLength);
        uint256 unpaidEpochs = currentEpoch.sub(lastEpochPaid);
        return unpaidEpochs <= 5 ? currentEpoch : lastEpochPaid.add(unpaidEpochs.div(2));
    }

    function updateCurrentAprTest() public {
        updateCurrentApr(totalStake());
    }

    function getCurrentEpoch() external view returns(uint256) {
        return now.div(rewardEpochLength);
    }
}