//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./auxiliary/interfaces/v0.8.2/IApi3Token.sol";
import "./interfaces/IStateUtils.sol";

/// @title Contract that keeps state variables
contract StateUtils is IStateUtils {
    struct Checkpoint {
        uint256 fromBlock;
        uint256 value;
    }

    struct AddressCheckpoint {
        uint256 fromBlock;
        address _address;
    }

    struct Reward {
        uint256 atBlock;
        uint256 amount;
        uint256 totalSharesThen;
    }

    struct User {
        uint256 unstaked;
        uint256 vesting;
        Checkpoint[] shares;
        AddressCheckpoint[] delegates;
        Checkpoint[] delegatedTo;
        uint256 lastDelegationUpdateTimestamp;
        uint256 unstakeScheduledFor;
        uint256 unstakeAmount;
    }

    string constant internal ERROR_VALUE = "Invalid value";
    string constant internal ERROR_ADDRESS = "Invalid address";
    string constant internal ERROR_UNAUTHORIZED = "Unauthorized";
    string constant internal ERROR_FREQUENCY = "Try again a week later";

    uint256 constant internal MAX_INTERACTION_FREQUENCY = 10;
    
    /// @notice API3 token contract
    IApi3Token public api3Token;

    /// @notice Address of the Agent app of the API3 DAO
    /// @dev Since the pool contract will be deployed before the DAO contracts,
    /// `daoAgent` will not be set in the constructor, but later on. Once it is
    /// set, it will be immutable.
    address public daoAgent;

    /// @notice Address of the DAO Api3Voting apps
    /// @dev Set in a similar way to `daoAgent`
    address[] public votingApps;

    /// @notice Mapping that keeps the claims manager statuses of addresses
    /// @dev A claims manager is a contract that is authorized to pay out
    /// claims from the staking pool, effectively slashing the stakers. The
    /// statuses are kept as a mapping to support multiple claims managers.
    mapping(address => bool) public claimsManagerStatus;

    /// @notice Length of the epoch in which the staking reward is paid out
    /// once. It is hardcoded as 7 days in seconds.
    /// @dev In addition to regulating reward payments, this variable is used
    /// for three additional things:
    /// (1) Once an unstaking scheduling matures, the user has `EPOCH_LENGTH`
    /// to execute the unstaking before it expires
    /// (2) After a user makes a proposal, they cannot make a second one
    /// before `EPOCH_LENGTH` has passed
    /// (3) After a user updates their delegation status, they have to wait
    /// `EPOCH_LENGTH` before updating it again
    uint256 public constant EPOCH_LENGTH = 7 * 24 * 60 * 60;

    /// @notice Number of epochs before the staking rewards get unlocked.
    /// Hardcoded as 52 epochs, which corresponds to a year.
    uint256 public constant REWARD_VESTING_PERIOD = 52;

    /// @notice Epochs are indexed as `block.timestamp / EPOCH_LENGTH`.
    /// `genesisEpoch` is the index of the epoch in which the pool is deployed.
    uint256 public immutable genesisEpoch;

    /// @notice Records of rewards paid in each epoch
    mapping(uint256 => Reward) public epochIndexToReward;

    /// @notice Epoch index of the most recent reward payment
    uint256 public epochIndexOfLastRewardPayment;

    // Snapshot block number of the last vote created at one of the DAO
    // Api3Voting apps
    uint256 private lastVoteSnapshotBlock;
    mapping(uint256 => uint256) private snapshotBlockToTimestamp;

    /// @notice User records
    mapping(address => User) public users;

    /// @notice Total number of tokens staked at the pool
    uint256 public totalStake;

    // We keep checkpoints for two most recent blocks at which totalShares has
    // been updated. Note that the indices do not indicate chronological
    // ordering.
    Checkpoint private totalSharesCheckpoint1;
    Checkpoint private totalSharesCheckpoint2;

    // All percentage values are represented by multiplying by 1e6
    uint256 internal constant ONE_PERCENT = 1_000_000;
    uint256 internal constant HUNDRED_PERCENT = 100_000_000;

    /// @notice Stake target the pool will aim to meet. The staking rewards
    /// increase if the total staked amount is below this, and vice versa.
    /// @dev Default value is 30% of the total API3 token supply. This
    /// parameter is governable by the DAO.
    uint256 public stakeTarget = 30_000_000;

    /// @notice Minimum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 2.5%. This parameter is governable by the DAO.
    uint256 public minApr = 2_500_000;

    /// @notice Maximum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 75%. This parameter is governable by the DAO.
    uint256 public maxApr = 75_000_000;

    /// @notice Coefficient that represents how aggresively the APR will be
    /// updated to meet the stake target.
    /// @dev Since this is a coefficient, it has no unit. A coefficient of 1e6
    /// means 1% deviation from the stake target results in 1% update in APR.
    /// This parameter is governable by the DAO.
    uint256 public aprUpdateCoefficient = 1_000_000;

    /// @notice Users need to schedule an unstake and wait for
    /// `unstakeWaitPeriod` before being able to unstake. This is to prevent
    /// the stakers from frontrunning insurance claims by unstaking to evade
    /// them, or repeatedly unstake/stake to work around the proposal spam
    /// protection.
    /// @dev This parameter is governable by the DAO, and the DAO is expected
    /// to set this to a value that is large enough to allow insurance claims
    /// to be resolved.
    uint256 public unstakeWaitPeriod = EPOCH_LENGTH;

    /// @notice Minimum voting power the users must have to be able to make
    /// proposals (in percentages)
    /// @dev Delegations count towards voting power.
    /// Default value is 0.1%. This parameter is governable by the DAO.
    uint256 public proposalVotingPowerThreshold = 100_000;

    /// @notice APR that will be paid next epoch
    /// @dev This is initialized at maximum APR, but will come to an
    /// equilibrium based on the stake target.
    /// Every epoch (week), APR/52 of the total staked tokens will be added to
    /// the pool, effectively distributing them to the stakers.
    uint256 public currentApr = maxApr;

    /// @notice Mapping that keeps the specs of a proposal provided by a user
    /// @dev After making a proposal through the Agent app, the user publishes
    /// the specs of the proposal (target contract address, function,
    /// parameters) at a URL
    mapping(address => mapping(uint256 => string)) public userAddressToProposalIndexToSpecsUrl;

    /// @dev Reverts if the caller is not the DAO Agent App
    modifier onlyDaoAgent() {
        require(msg.sender == daoAgent, ERROR_UNAUTHORIZED);
        _;
    }

    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
    {
        api3Token = IApi3Token(api3TokenAddress);
        // Initialize the share price at 1
        updateTotalShares(1);
        totalStake = 1;
        // Set the current epoch as the genesis epoch and skip its reward
        // payment
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        genesisEpoch = currentEpoch;
        epochIndexOfLastRewardPayment = currentEpoch;
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
    /// This method can set the DAO Agent only once. Therefore, no access
    /// control is needed.
    /// @param _daoAgent Address of the Agent app of the API3 DAO
    function setDaoAgent(address _daoAgent)
        external
        override
    {
        require(_daoAgent != address(0), ERROR_ADDRESS);
        require(daoAgent == address(0), ERROR_UNAUTHORIZED);
        daoAgent = _daoAgent;
        emit SetDaoAgent(daoAgent);
    }

    /// @notice Called after deployment to set the addresses of the DAO Voting
    /// apps
    /// @param _votingApps Addresses of the DAO Api3Voting apps
    function setVotingApps(address[] calldata _votingApps)
        external
        override
    {
        require(_votingApps.length != 0, ERROR_VALUE);
        require(votingApps.length == 0, ERROR_UNAUTHORIZED);
        votingApps = _votingApps;
        emit SetVotingApps(votingApps);
    }

    /// @notice Called by the DAO Agent to set the authorization status of a
    /// claims manager contract
    /// @dev The claims manager is a trusted contract that is allowed to
    /// withdraw as many tokens as it wants from the pool to pay out insurance
    /// claims.
    /// @param claimsManager Claims manager contract address
    /// @param status Authorization status
    function setClaimsManagerStatus(
        address claimsManager,
        bool status
        )
        external
        override
        onlyDaoAgent()
    {
        claimsManagerStatus[claimsManager] = status;
        emit SetClaimsManagerStatus(
            claimsManager,
            status
            );
    }

    /// @notice Called by the DAO Agent to set the stake target
    /// @param _stakeTarget Stake target
    function setStakeTarget(uint256 _stakeTarget)
        external
        override
        onlyDaoAgent()
    {
        require(
            _stakeTarget <= HUNDRED_PERCENT
                && _stakeTarget >= 0,
            ERROR_VALUE);
        uint256 oldStakeTarget = stakeTarget;
        stakeTarget = _stakeTarget;
        emit SetStakeTarget(
            oldStakeTarget,
            stakeTarget
            );
    }

    /// @notice Called by the DAO Agent to set the maximum APR
    /// @param _maxApr Maximum APR
    function setMaxApr(uint256 _maxApr)
        external
        override
        onlyDaoAgent()
    {
        require(_maxApr >= minApr, ERROR_VALUE);
        uint256 oldMaxApr = maxApr;
        maxApr = _maxApr;
        emit SetMaxApr(
            oldMaxApr,
            maxApr
            );
    }

    /// @notice Called by the DAO Agent to set the minimum APR
    /// @param _minApr Minimum APR
    function setMinApr(uint256 _minApr)
        external
        override
        onlyDaoAgent()
    {
        require(_minApr <= maxApr, ERROR_VALUE);
        uint256 oldMinApr = minApr;
        minApr = _minApr;
        emit SetMinApr(
            oldMinApr,
            minApr
            );
    }

    /// @notice Called by the DAO Agent to set the unstake waiting period
    /// @dev This may want to be increased to provide more time for insurance
    /// claims to be resolved.
    /// Even when the insurance functionality is not implemented, the minimum
    /// valid value is `EPOCH_LENGTH` to prevent users from unstaking,
    /// withdrawing and staking with another address to work around the
    /// proposal spam protection.
    /// @param _unstakeWaitPeriod Unstake waiting period
    function setUnstakeWaitPeriod(uint256 _unstakeWaitPeriod)
        external
        override
        onlyDaoAgent()
    {
        require(_unstakeWaitPeriod >= EPOCH_LENGTH, ERROR_VALUE);
        uint256 oldUnstakeWaitPeriod = unstakeWaitPeriod;
        unstakeWaitPeriod = _unstakeWaitPeriod;
        emit SetUnstakeWaitPeriod(
            oldUnstakeWaitPeriod,
            unstakeWaitPeriod
            );
    }

    /// @notice Called by the DAO Agent to set the APR update coefficient
    /// @param _aprUpdateCoefficient APR update coefficient
    function setAprUpdateCoefficient(uint256 _aprUpdateCoefficient)
        external
        override
        onlyDaoAgent()
    {
        require(
            _aprUpdateCoefficient <= 1_000_000_000
                && _aprUpdateCoefficient > 0,
            ERROR_VALUE
            );
        uint256 oldAprUpdateCoefficient = aprUpdateCoefficient;
        aprUpdateCoefficient = _aprUpdateCoefficient;
        emit SetAprUpdateCoefficient(
            oldAprUpdateCoefficient,
            aprUpdateCoefficient
            );
    }

    /// @notice Called by the DAO Agent to set the voting power threshold for
    /// proposals
    /// @param _proposalVotingPowerThreshold Voting power threshold for
    /// proposals
    function setProposalVotingPowerThreshold(uint256 _proposalVotingPowerThreshold)
        external
        override
        onlyDaoAgent()
    {
        require(
            _proposalVotingPowerThreshold <= 10 * ONE_PERCENT,
            ERROR_VALUE);
        uint256 oldProposalVotingPowerThreshold = proposalVotingPowerThreshold;
        proposalVotingPowerThreshold = _proposalVotingPowerThreshold;
        emit SetProposalVotingPowerThreshold(
            oldProposalVotingPowerThreshold,
            proposalVotingPowerThreshold
            );
    }

    /// @notice Called by the owner of the proposal to publish the specs URL
    /// @dev Since the owner of a proposal is known, users publishing specs for
    /// a proposal that is not their own is not a concern
    /// @param proposalIndex Proposal index
    /// @param specsUrl URL that hosts the specs of the transaction that will
    /// be made if the proposal passes
    function publishSpecsUrl(
        uint256 proposalIndex,
        string calldata specsUrl
        )
        external
        override
    {
        userAddressToProposalIndexToSpecsUrl[msg.sender][proposalIndex] = specsUrl;
        emit PublishedSpecsUrl(
            proposalIndex,
            msg.sender,
            specsUrl
            );
    }

    /// @notice Called by a DAO Api3Voting app to update the last vote snapshot
    /// block number
    /// @param snapshotBlock Last vote snapshot block number
    function updateLastVoteSnapshotBlock(uint256 snapshotBlock)
        external
        override
    {
        bool notAuthorized = true;
        for (uint256 i = 0; i < votingApps.length; i++)
        {
            if (votingApps[i] == msg.sender)
            {
                notAuthorized = false;
                break;
            }
        }
        require(!notAuthorized, ERROR_UNAUTHORIZED);
        lastVoteSnapshotBlock = snapshotBlock;
        snapshotBlockToTimestamp[snapshotBlock] = block.timestamp;
    }

    /// @notice Called internally to update the total shares history
    /// @dev `fromBlock0` and `fromBlock1` will be two different block numbers
    /// when totalShares history was last updated. If one of these
    /// `fromBlock`s match with `block.number`, we simply update the value
    /// (because the history keeps the most recent value from that block). If
    /// not, we can overwrite the older one, as we no longer need it.
    /// @param newTotalShares Total shares value to insert into history
    function updateTotalShares(uint256 newTotalShares)
        internal
    {
        if (block.number == totalSharesCheckpoint1.fromBlock)
        {
            totalSharesCheckpoint1.value = newTotalShares;
        }
        else if (block.number == totalSharesCheckpoint2.fromBlock)
        {
            totalSharesCheckpoint2.value = newTotalShares;
        }
        else {
            if (totalSharesCheckpoint1.fromBlock < totalSharesCheckpoint2.fromBlock)
            {
                totalSharesCheckpoint1.fromBlock = block.number;
                totalSharesCheckpoint1.value = newTotalShares;
            }
            else
            {
                totalSharesCheckpoint2.fromBlock = block.number;
                totalSharesCheckpoint2.value = newTotalShares;
            }
        }
    }

    /// @notice Called internally to get the current total shares
    /// @return Current total shares
    function totalShares()
        internal
        view
        returns (uint256)
    {
        if (totalSharesCheckpoint1.fromBlock < totalSharesCheckpoint2.fromBlock)
        {
            return totalSharesCheckpoint2.value;
        }
        else
        {
            return totalSharesCheckpoint1.value;
        }
    }

    /// @notice Called internally to get the total shares one block ago
    /// @return Total shares one block ago
    function totalSharesOneBlockAgo()
        internal
        view
        returns (uint256)
    {
        if (totalSharesCheckpoint2.fromBlock == block.number)
        {
            return totalSharesCheckpoint1.value;
        }
        else if (totalSharesCheckpoint1.fromBlock == block.number)
        {
            return totalSharesCheckpoint2.value;
        }
        else
        {
            return totalShares();
        }
    }

    /// @notice Called internally to update a checkpoint array
    /// @param checkpointArray Checkpoint array to be updated
    /// @param value Value to be updated with
    function updateCheckpointArray(
        Checkpoint[] storage checkpointArray,
        uint256 value
        )
        internal
    {
        if (checkpointArray.length == 0)
        {
            checkpointArray.push(Checkpoint({
                fromBlock: lastVoteSnapshotBlock,
                value: value
                }));
        }
        else
        {
            if (checkpointArray.length > MAX_INTERACTION_FREQUENCY)
            {
                uint256 interactionTimestampMaxInteractionFrequencyAgo = snapshotBlockToTimestamp[checkpointArray[checkpointArray.length - MAX_INTERACTION_FREQUENCY].fromBlock];
                require(
                    block.timestamp - interactionTimestampMaxInteractionFrequencyAgo > EPOCH_LENGTH,
                    ERROR_FREQUENCY
                    );
            }
            Checkpoint storage lastElement = checkpointArray[checkpointArray.length - 1];
            if (lastElement.fromBlock < lastVoteSnapshotBlock)
            {
                checkpointArray.push(Checkpoint({
                    fromBlock: lastVoteSnapshotBlock,
                    value: value
                    }));
            }
            else
            {
                lastElement.value = value;
            }
        }
    }

    /// @notice Called internally to update an address checkpoint array
    /// @param addressCheckpointArray Address checkpoint array to be updated
    /// @param _address Address to be updated with
    function updateAddressCheckpointArray(
        AddressCheckpoint[] storage addressCheckpointArray,
        address _address
        )
        internal
    {
        if (addressCheckpointArray.length == 0)
        {
            addressCheckpointArray.push(AddressCheckpoint({
                fromBlock: lastVoteSnapshotBlock,
                _address: _address
                }));
        }
        else
        {
            if (addressCheckpointArray.length > MAX_INTERACTION_FREQUENCY)
            {
                uint256 interactionTimestampMaxInteractionFrequencyAgo = snapshotBlockToTimestamp[addressCheckpointArray[addressCheckpointArray.length - MAX_INTERACTION_FREQUENCY].fromBlock];
                require(
                    block.timestamp - interactionTimestampMaxInteractionFrequencyAgo > EPOCH_LENGTH,
                    ERROR_FREQUENCY
                    );
            }
            AddressCheckpoint storage lastElement = addressCheckpointArray[addressCheckpointArray.length - 1];
            if (lastElement.fromBlock < lastVoteSnapshotBlock)
            {
                addressCheckpointArray.push(AddressCheckpoint({
                    fromBlock: lastVoteSnapshotBlock,
                    _address: _address
                    }));
            }
            else
            {
                lastElement._address = _address;
            }
        }
    }
}
