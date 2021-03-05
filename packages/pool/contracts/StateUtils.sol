//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./auxiliary/interfaces/IApi3Token.sol";

/// @title Contract that keeps state variables
contract StateUtils {
    using SafeMath for uint256;

    struct Checkpoint {
        uint256 fromBlock;
        uint256 value;
    }

    struct Reward {
        uint256 atBlock;
        uint256 amount;
    }

    struct Delegation {
        uint256 fromBlock;
        address delegate;
    }

    struct User {
        uint256 unstaked;
        Checkpoint[] shares;
        uint256 locked;
        uint256 vesting;
        Delegation[] delegates;
        Checkpoint[] delegatedTo;
        uint256 unstakeScheduledFor;
        uint256 unstakeAmount;
        mapping(uint256 => bool) epochIndexToRewardRevocationStatus;
        uint256 lastUpdateEpoch;
        uint256 oldestLockedEpoch;
    }

    /// @notice API3 token contract
    IApi3Token public api3Token;

    /// @notice Address of the Agent app of the API3 DAO
    /// @dev Since the pool contract will be deployed before the DAO contracts,
    /// `daoAgent` will not be set in the constructor, but later on. Once it is
    /// set, it will be immutable.
    address public daoAgent;

    /// @notice Mapping that keeps the claims manager statuses of addresses
    /// @dev A claims manager is a contract that is authorized to pay out
    /// claims from the staking pool, effectively slashing the stakers. The
    /// statuses are kept as a mapping to support multiple claims managers.
    mapping(address => bool) public claimsManagerStatus;

    /// @notice Length of the epoch in which staking reward is paid out once.
    /// Hardcoded as 7 days in seconds.
    /// @dev In addition to regulating reward payments, this variable is used
    /// for two additional things:
    /// (1) Once an unstaking scheduling matures, the staker has `epochLength`
    /// to execute the unstaking before it expires
    /// (2) After a staker makes a proposal, they cannot make a second one
    /// before `epochLength` has passed
    uint256 public constant epochLength = 7 * 24 * 60 * 60;

    /// @notice Number of epochs before the staking rewards get unlocked.
    /// Hardcoded as 52 epochs (corresponding to a year).
    uint256 public constant rewardVestingPeriod = 52;

    /// @notice Epochs are indexed as `now / epochLength`. `genesisEpoch` is
    /// the index of the epoch in which the pool is deployed.
    uint256 public immutable genesisEpoch;

    /// @notice Records of rewards paid in epochs
    mapping(uint256 => Reward) public epochIndexToReward;

    /// @notice Epoch index of the most recent reward payment
    uint256 public epochIndexOfLastRewardPayment;

    /// @notice User (staker) rewards
    mapping(address => User) public users;

    /// @notice Total number of tokens staked at the pool, kept in checkpoints
    Checkpoint[] public totalStaked;

    /// @notice Total number of shares at the pool, kept in checkpoints
    Checkpoint[] public totalShares;

    
    // All percentage values are represented by multiplying by 1e6
    uint256 internal constant onePercent = 1_000_000;
    uint256 internal constant hundredPercent = 100_000_000;
    
    /// @notice Minimum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 2.5%. This parameter is governable by the DAO.
    uint256 public minApr = 2_500_000;

    /// @notice Maximum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 75%. This parameter is governable by the DAO.
    uint256 public maxApr = 75_000_000;

    /// @notice Stake target the pool will aim to meet. The staking rewards
    /// increase if the total staked amount is below this, and vice versa.
    /// @dev Unit is API3 tokens. Since API3 `decimals` is 18, `ether` is used
    /// here. Default target is 30 million tokens. This parameter is governable
    /// by the DAO.
    uint256 public stakeTarget = 30_000_000 ether;

    /// @notice Coefficient that represents how aggresively the APR will be
    /// updated to meet the stake target.
    /// @dev Since this is a coefficient, it has no unit. A coefficient of 1e6
    /// means 1% deviation from the stake target results in 1% update in APR.
    /// This parameter is governable by the DAO.
    uint256 public updateCoeff = 1_000_000;

    /// @notice Users need to schedule an unstaking and wait for
    /// `unstakeWaitPeriod` before being able to unstake. This is to prevent
    /// the stakers from frontrunning insurance claims by unstaking to evade
    /// them.
    /// @dev This parameter is governable by the DAO, and the DAO is expected
    /// to set this large enough to allow insurance claims to be resolved.
    uint256 public unstakeWaitPeriod = epochLength;

    /// @notice APR that will be paid next epoch
    /// @dev This is initialized at maximum APR, but will come to an
    /// equilibrium based on the stake target.
    uint256 public currentApr = maxApr;

    event PaidReward(
        uint256 indexed epoch,
        uint256 rewardAmount,
        uint256 newApr
        );

    event UpdatedUserLocked(
        address indexed user,
        uint256 toEpoch,
        uint256 locked
        );

    event SetDaoAgent(address daoAgent);

    /// @dev Pays the epoch reward before the modified function
    modifier payEpochRewardBefore {
        payReward();
        _;
    }

    /// @dev Pays the epoch reward after the modified function.
    /// Used if the function changes the reward amount.
    modifier payEpochRewardAfter {
        _;
        payReward();
    }

    /// @dev Reverts if the caller is not the claims manager
    modifier onlyClaimsManager() {
        require(claimsManagerStatus[msg.sender], "Unauthorized");
        _;
    }

    /// @dev Reverts if the caller is not the DAO Agent App
    modifier onlyDaoAgent() {
        require(msg.sender == daoAgent, "Unauthorized");
        _;
    }

    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        public
    {
        api3Token = IApi3Token(api3TokenAddress);
        // Initialize the share price at 1
        totalShares.push(Checkpoint(block.number, 1));
        totalStaked.push(Checkpoint(block.number, 1));
        // Set the current epoch as the genesis epoch and skip its reward
        // payment
        uint256 currentEpoch = now.div(epochLength);
        genesisEpoch = currentEpoch;
        epochIndexOfLastRewardPayment = currentEpoch;
        epochIndexToReward[currentEpoch] = Reward(0, block.number);
    }

    /// @notice Called after deployment to set the address of the DAO Agent app
    /// @dev The DAO Agent app will be authorized to act on behalf of the DAO
    /// to update parameters, which is why we need to specify it. However, the
    /// pool and the DAO contracts refer to each other cyclically, which is why
    /// we cannot set it in the constructor. Instead, the pool will be
    /// deployed, the DAO contracts will be deployed with the pool address as
    /// a constructor argument, then this method will be called to set the DAO
    /// Agent address. Before using the resulting setup, it must be verified
    /// that the Agent address is set correctly.
    /// This method can be called only once. Therefore, no access control is
    /// needed.
    /// @param _daoAgent Address of the Agent app of the API3 DAO
    function setDaoAgent(address _daoAgent)
        external
    {
        require(daoAgent == address(0), "DAO Agent already set");
        daoAgent = _daoAgent;
        emit SetDaoAgent(daoAgent);
    }

    /// @notice Updates the current APR before paying the reward
    /// @param totalStakedNow Total number of tokens staked at the pool now
    function updateCurrentApr(uint256 totalStakedNow)
        internal
    {
        if (stakeTarget == 0) {
            currentApr = minApr;
            return;
        }
        // Calculate what % we are off from the target
        uint256 deltaAbsolute = totalStakedNow < stakeTarget 
            ? stakeTarget.sub(totalStakedNow) : totalStakedNow.sub(stakeTarget);
        uint256 deltaPercentage = deltaAbsolute.mul(hundredPercent).div(stakeTarget);
        // Use the update coefficient to calculate what % we need to update
        // the APR with
        uint256 aprUpdate = deltaPercentage.mul(updateCoeff).div(onePercent);

        uint256 newApr;
        if (totalStakedNow < stakeTarget) {
            newApr = currentApr.mul(hundredPercent.add(aprUpdate)).div(hundredPercent);
        }
        else {
            newApr = hundredPercent > aprUpdate
                ? currentApr.mul(hundredPercent.sub(aprUpdate)).div(hundredPercent)
                : 0;
        }

        if (newApr < minApr) {
            currentApr = minApr;
        }
        else if (newApr > maxApr) {
            currentApr = maxApr;
        }
        else {
            currentApr = newApr;
        }
    }

    /// @notice Called to pay the reward for the current epoch
    /// @dev Skips past epochs for which rewards have not been paid for.
    /// Skips the reward payment if the pool is not authorized to mint tokens.
    /// Neither of these conditions will happen in practice.
    function payReward()
        public
    {
        uint256 currentEpoch = now.div(epochLength);
        // This will be skipped in most cases because someone else has
        // triggered the payment for this epoch
        if (epochIndexOfLastRewardPayment != currentEpoch)
        {
            if (api3Token.getMinterStatus(address(this)))
            {
                uint256 totalStakedNow = getValue(totalStaked);
                updateCurrentApr(totalStakedNow);
                uint256 rewardAmount = totalStakedNow.mul(currentApr).div(rewardVestingPeriod).div(hundredPercent);
                epochIndexToReward[currentEpoch] = Reward(rewardAmount, block.number);
                if (rewardAmount > 0) {
                    api3Token.mint(address(this), rewardAmount);
                    totalStaked.push(Checkpoint(block.number, totalStakedNow.add(rewardAmount)));
                }
                emit PaidReward(currentEpoch, rewardAmount, currentApr);
            }
            epochIndexOfLastRewardPayment = currentEpoch;
        }
    }

    /// @notice Updates the locked tokens of the user
    /// @dev The user has to update their locked tokens up to the current epoch
    /// before withdrawing. In case this costs too much gas, this method
    /// accepts a `targetEpoch` parameter for the user to be able to make this
    /// update through successive transactions.
    /// @param userAddress User address
    /// @param targetEpoch Epoch index until the locked tokens will be updated
    function updateUserLocked(
        address userAddress,
        uint256 targetEpoch
        )
        public
    {
        uint256 newLocked = getUserLockedAt(userAddress, targetEpoch);
        User storage user = users[userAddress];
        user.locked = newLocked;
        user.oldestLockedEpoch = getOldestLockedEpoch();
        user.lastUpdateEpoch = targetEpoch;
        emit UpdatedUserLocked(userAddress, targetEpoch, user.locked);
    }

    /// @notice Called to get the locked tokens of the user at a specific epoch
    /// @param userAddress User address
    /// @param targetEpoch Epoch index for which the locked tokens will be
    /// returned
    /// @return Locked tokens of the user at the epoch
    function getUserLockedAt(
        address userAddress,
        uint256 targetEpoch
        )
        public
        payEpochRewardBefore
        returns(uint256)
    {
        uint256 currentEpoch = now.div(epochLength);
        uint256 oldestLockedEpoch = getOldestLockedEpoch();
        User storage user = users[userAddress];
        uint256 lastUpdateEpoch = user.lastUpdateEpoch;
        require(targetEpoch <= currentEpoch
                && targetEpoch > lastUpdateEpoch
                && targetEpoch > oldestLockedEpoch,
                "Invalid target");
        // If the last update has been way in the past, we can just reset all
        // locked and lock back rewards paid in the last `rewardVestingPeriod`
        if (lastUpdateEpoch < oldestLockedEpoch) {
            uint256 locked = 0;
            for (
                uint256 ind = oldestLockedEpoch;
                ind <= targetEpoch;
                ind = ind.add(1)
            ) {
                Reward storage lockedReward = epochIndexToReward[ind];
                uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
                locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
            }
            return locked;
        }
        // ...otherwise, start by locking the rewards since the last update
        uint256 locked = user.locked;
        for (
            uint256 ind = lastUpdateEpoch.add(1);
            ind <= targetEpoch;
            ind = ind.add(1)
        ) {
            Reward storage lockedReward = epochIndexToReward[ind];
            uint256 totalSharesThen = getValueAt(totalShares, lockedReward.atBlock);
            uint256 userSharesThen = getValueAt(user.shares, lockedReward.atBlock);
            locked = locked.add(lockedReward.amount.mul(userSharesThen).div(totalSharesThen));
        }
        // ...then apply the reward unlocks if applicable
        if (targetEpoch >= genesisEpoch.add(rewardVestingPeriod)) {
            for (
                uint256 ind = user.oldestLockedEpoch;
                ind <= oldestLockedEpoch.sub(1);
                ind = ind.add(1)
            ) {
                Reward storage unlockedReward = epochIndexToReward[ind.sub(rewardVestingPeriod)];
                uint256 totalSharesThen = getValueAt(totalShares, unlockedReward.atBlock);
                uint256 userSharesThen = getValueAt(user.shares, unlockedReward.atBlock);
                uint256 toUnlock = unlockedReward.amount.mul(userSharesThen).div(totalSharesThen);
                // `locked` has a risk to underflow due to the reward
                // revocations during scheduling unstakings, which is why we
                // clip it at 0
                locked = locked > toUnlock ? locked.sub(toUnlock) : 0;
            }
        }
        return locked;
    }

    /// @notice Called to get the locked tokens of the user
    /// @dev This can be called statically by clients to get the locked tokens
    /// of the user without actually updating it
    /// @param userAddress User address
    /// @return Locked tokens of the user in the current epoch
    function getUserLocked(address userAddress)
        external
        returns(uint256)
    {
        return getUserLockedAt(userAddress, now.div(epochLength));
    }

    /// @notice Called to get the index of the oldest epoch whose reward is
    /// still locked
    /// @return Index of the oldest epoch whose reward is still locked
    function getOldestLockedEpoch()
        internal
        view
        returns(uint256)
    {
        uint256 currentEpoch = now.div(epochLength);
        return currentEpoch >= genesisEpoch.add(rewardVestingPeriod) ?
                currentEpoch.sub(rewardVestingPeriod) : genesisEpoch;
    }

    /// @notice Called to get the value of a checkpoint array at a specific
    /// block
    /// @dev From https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// @param checkpoints Checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Value of the checkpoint array at the block
    function getValueAt(
        Checkpoint[] storage checkpoints,
        uint _block
        )
        internal
        view
        returns(uint)
    {
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock)
            return checkpoints[checkpoints.length.sub(1)].value;
        if (_block < checkpoints[0].fromBlock)
            return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length.sub(1);
        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }
        return checkpoints[min].value;
    }

    /// @notice Called to get the current value of the checkpoint array
    /// @param checkpoints Checkpoints array
    /// @return Current value of the checkpoint array
    function getValue(Checkpoint[] storage checkpoints)
        internal
        view
        returns (uint256)
    {
        return getValueAt(checkpoints, block.number);
    }
}
