pragma solidity 0.6.12;

import "./TimelockUtils.sol";

contract GovernanceUtils is TimelockUtils {
    constructor(address api3TokenAddress)
        TimelockUtils(api3TokenAddress)
        public
    {}

    event NewStakeTarget(uint256 oldTarget, uint256 newTarget);
    event NewMaxApr(uint256 oldMax, uint256 newMax);
    event NewMinApr(uint256 oldMin, uint256 newMin);
    event NewUnstakeWaitPeriod(uint256 oldPeriod, uint256 newPeriod);
    event NewUpdateCoefficient(uint256 oldCoeff, uint256 newCoeff);
    
    modifier noZeroValue(uint256 value) {
        require(value > 0);
        _;
    }

    function setStakeTarget(uint256 _stakeTarget)
        external noZeroValue(_stakeTarget) triggerEpochBefore
        //onlyDao
    {
        uint256 oldTarget = stakeTarget;
        stakeTarget = _stakeTarget;
        emit NewStakeTarget(oldTarget, stakeTarget);
    }

    function setMaxApr(uint256 _maxApr)
        external triggerEpochAfter
        //onlyDao
    {
        require(_maxApr > minApr);
        uint256 oldMax = maxApr;
        maxApr = _maxApr;
        emit NewMaxApr(oldMax, maxApr);
    }

    function setMinApr(uint256 _minApr)
        external noZeroValue(_minApr) triggerEpochAfter
        //onlyDao
    {
        require(_minApr < maxApr);
        uint256 oldMin = minApr;
        minApr = _minApr;
        emit NewMinApr(oldMin, minApr);
    }

    function setUnstakeWaitPeriod(uint256 _unstakeWaitPeriod)
        external
        //onlyDao
    {
        //Sanity check at 1 year max, 2 week min, 50% rate of change
        require(_unstakeWaitPeriod <= 2246400 
                && _unstakeWaitPeriod >= rewardEpochLength * 2);
        uint256 delta = _unstakeWaitPeriod < unstakeWaitPeriod ? 
                        unstakeWaitPeriod - _unstakeWaitPeriod : 
                        _unstakeWaitPeriod - unstakeWaitPeriod;
        require(delta * 2 <= unstakeWaitPeriod);
        uint256 oldPeriod = unstakeWaitPeriod;
        unstakeWaitPeriod = _unstakeWaitPeriod;
        emit NewUnstakeWaitPeriod(oldPeriod, unstakeWaitPeriod);
    }

    function setUpdateCoefficient(uint256 _updateCoeff)
        external noZeroValue(_updateCoeff) triggerEpochAfter
        //onlyDao
    {
        //Sanity check at 100X
        require(_updateCoeff < 100000000);
        uint256 oldCoeff = updateCoeff;
        updateCoeff = _updateCoeff;
        emit NewUpdateCoefficient(oldCoeff, updateCoeff);
    }
}