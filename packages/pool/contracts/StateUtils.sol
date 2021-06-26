//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./auxiliary/interfaces/v0.8.4/IApi3Token.sol";
import "./interfaces/IStateUtils.sol";

/// @title Contract that keeps state variables
contract StateUtils is IStateUtils {
    struct Checkpoint {
        uint32 fromBlock;
        uint224 value;
    }

    struct AddressCheckpoint {
        uint32 fromBlock;
        address _address;
    }

    struct Reward {
        uint32 atBlock;
        uint224 amount;
        uint256 totalSharesThen;
    }

    struct User {
        Checkpoint[] shares;
        Checkpoint[] delegatedTo;
        AddressCheckpoint[] delegates;
        uint256 unstaked;
        uint256 vesting;
        uint256 unstakeAmount;
        uint256 unstakeShares;
        uint256 unstakeScheduledFor;
        uint256 lastDelegationUpdateTimestamp;
        uint256 lastProposalTimestamp;
    }

    struct LockedCalculation {
        uint256 initialIndEpoch;
        uint256 nextIndEpoch;
        uint256 locked;
    }

    /// @notice Length of the epoch in which the staking reward is paid out
    /// once. It is hardcoded as 7 days.
    /// @dev In addition to regulating reward payments, this variable is used
    /// for two additional things:
    /// (1) After a user makes a proposal, they cannot make a second one
    /// before `EPOCH_LENGTH` has passed
    /// (2) After a user updates their delegation status, they have to wait
    /// `EPOCH_LENGTH` before updating it again
    uint256 public constant EPOCH_LENGTH = 1 weeks;

    /// @notice Number of epochs before the staking rewards get unlocked.
    /// Hardcoded as 52 epochs, which corresponds to a year with an
    /// `EPOCH_LENGTH` of 1 week.
    uint256 public constant REWARD_VESTING_PERIOD = 52;

    // All percentage values are represented as 1e18 = 100%
    uint256 internal constant ONE_PERCENT = 1e18 / 100;
    uint256 internal constant HUNDRED_PERCENT = 1e18;

    /// @notice Epochs are indexed as `block.timestamp / EPOCH_LENGTH`.
    /// `genesisEpoch` is the index of the epoch in which the pool is deployed.
    /// @dev No reward gets paid and proposals are not allowed in the genesis
    /// epoch
    uint256 public immutable genesisEpoch;

    /// @notice API3 token contract
    IApi3Token public immutable api3Token;

    /// @notice TimelockManager contract
    address public immutable timelockManager;

    /// @notice Address of the primary Agent app of the API3 DAO
    /// @dev Primary Agent can be operated through the primary Api3Voting app.
    /// The primary Api3Voting app requires a higher quorum by default, and the
    /// primary Agent is more privileged.
    address public agentAppPrimary;

    /// @notice Address of the secondary Agent app of the API3 DAO
    /// @dev Secondary Agent can be operated through the secondary Api3Voting
    /// app. The secondary Api3Voting app requires a lower quorum by default,
    /// and the primary Agent is less privileged.
    address public agentAppSecondary;

    /// @notice Address of the primary Api3Voting app of the API3 DAO
    /// @dev Used to operate the primary Agent
    address public votingAppPrimary;

    /// @notice Address of the secondary Api3Voting app of the API3 DAO
    /// @dev Used to operate the secondary Agent
    address public votingAppSecondary;

    /// @notice Mapping that keeps the claims manager statuses of addresses
    /// @dev A claims manager is a contract that is authorized to pay out
    /// claims from the staking pool, effectively slashing the stakers. The
    /// statuses are kept as a mapping to support multiple claims managers.
    mapping(address => bool) public claimsManagerStatus;

    /// @notice Records of rewards paid in each epoch
    /// @dev `.atBlock` of a past epoch's reward record being `0` means no
    /// reward was paid for that epoch
    mapping(uint256 => Reward) public epochIndexToReward;

    /// @notice Epoch index of the most recent reward
    uint256 public epochIndexOfLastReward;

    /// @notice Total number of tokens staked at the pool
    uint256 public totalStake;

    /// @notice Stake target the pool will aim to meet in percentages of the
    /// total token supply. The staking rewards increase if the total staked
    /// amount is below this, and vice versa.
    /// @dev Default value is 50% of the total API3 token supply. This
    /// parameter is governable by the DAO.
    uint256 public stakeTarget = 50 * ONE_PERCENT;

    /// @notice Minimum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 2.5%. This parameter is governable by the DAO.
    uint256 public minApr = ONE_PERCENT * 25 / 10;

    /// @notice Maximum APR (annual percentage rate) the pool will pay as
    /// staking rewards in percentages
    /// @dev Default value is 75%. This parameter is governable by the DAO.
    uint256 public maxApr = 75 * ONE_PERCENT;

    /// @notice Steps in which APR will be updated in percentages
    /// @dev Default value is 1%. This parameter is governable by the DAO.
    uint256 public aprUpdateStep = ONE_PERCENT;

    /// @notice Users need to schedule an unstake and wait for
    /// `unstakeWaitPeriod` before being able to unstake. This is to prevent
    /// the stakers from frontrunning insurance claims by unstaking to evade
    /// them, or repeatedly unstake/stake to work around the proposal spam
    /// protection. The tokens awaiting to be unstaked during this period do
    /// not grant voting power or rewards.
    /// @dev This parameter is governable by the DAO, and the DAO is expected
    /// to set this to a value that is large enough to allow insurance claims
    /// to be resolved.
    uint256 public unstakeWaitPeriod = EPOCH_LENGTH;

    /// @notice Minimum voting power the users must have to be able to make
    /// proposals (in percentages)
    /// @dev Delegations count towards voting power.
    /// Default value is 0.1%. This parameter is governable by the DAO.
    uint256 public proposalVotingPowerThreshold = ONE_PERCENT / 10;

    /// @notice APR that will be paid next epoch
    /// @dev This value will reach an equilibrium based on the stake target.
    /// Every epoch (week), APR/52 of the total staked tokens will be added to
    /// the pool, effectively distributing them to the stakers.
    uint256 public apr = (maxApr + minApr) / 2;

    /// @notice User records
    mapping(address => User) public users;

    // Keeps the total number of shares of the pool
    Checkpoint[] public poolShares;

    // Keeps user states used in `withdrawPrecalculated()` calls
    mapping(address => LockedCalculation) public userToLockedCalculation;

    // Kept to prevent third parties from frontrunning the initialization
    // `setDaoApps()` call and grief the deployment
    address private deployer;

    /// @dev Reverts if the caller is not an API3 DAO Agent
    modifier onlyAgentApp() {
        require(
            msg.sender == agentAppPrimary || msg.sender == agentAppSecondary,
            "Pool: Caller not agent"
            );
        _;
    }

    /// @dev Reverts if the caller is not the primary API3 DAO Agent
    modifier onlyAgentAppPrimary() {
        require(
            msg.sender == agentAppPrimary,
            "Pool: Caller not primary agent"
            );
        _;
    }

    /// @dev Reverts if the caller is not an API3 DAO Api3Voting app
    modifier onlyVotingApp() {
        require(
            msg.sender == votingAppPrimary || msg.sender == votingAppSecondary,
            "Pool: Caller not voting app"
            );
        _;
    }

    /// @param api3TokenAddress API3 token contract address
    /// @param timelockManagerAddress Timelock manager contract address
    constructor(
        address api3TokenAddress,
        address timelockManagerAddress
        )
    {
        require(
            api3TokenAddress != address(0),
            "Pool: Invalid Api3Token"
            );
        require(
            timelockManagerAddress != address(0),
            "Pool: Invalid TimelockManager"
            );
        deployer = msg.sender;
        api3Token = IApi3Token(api3TokenAddress);
        timelockManager = timelockManagerAddress;
        // Initialize the share price at 1
        poolShares.push(Checkpoint({
            fromBlock: uint32(block.number),
            value: 1
            }));
        totalStake = 1;
        // Set the current epoch as the genesis epoch and skip its reward
        // payment
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        genesisEpoch = currentEpoch;
        epochIndexOfLastReward = currentEpoch;
    }

    /// @notice Called after deployment to set the addresses of the DAO apps
    /// @dev This can also be called later on by the primary Agent to update
    /// all app addresses as a means of an upgrade
    /// @param _agentAppPrimary Address of the primary Agent
    /// @param _agentAppSecondary Address of the secondary Agent
    /// @param _votingAppPrimary Address of the primary Api3Voting app
    /// @param _votingAppSecondary Address of the secondary Api3Voting app
    function setDaoApps(
        address _agentAppPrimary,
        address _agentAppSecondary,
        address _votingAppPrimary,
        address _votingAppSecondary
        )
        external
        override
    {
        // solhint-disable-next-line reason-string
        require(
            msg.sender == agentAppPrimary
                || (agentAppPrimary == address(0) && msg.sender == deployer),
            "Pool: Caller not primary agent or deployer initializing values"
            );
        require(
            _agentAppPrimary != address(0)
                && _agentAppSecondary != address(0)
                && _votingAppPrimary != address(0)
                && _votingAppSecondary != address(0),
            "Pool: Invalid DAO apps"
            );
        agentAppPrimary = _agentAppPrimary;
        agentAppSecondary = _agentAppSecondary;
        votingAppPrimary = _votingAppPrimary;
        votingAppSecondary = _votingAppSecondary;
        emit SetDaoApps(
            agentAppPrimary,
            agentAppSecondary,
            votingAppPrimary,
            votingAppSecondary
            );
    }

    /// @notice Called by the primary DAO Agent to set the authorization status
    /// of a claims manager contract
    /// @dev The claims manager is a trusted contract that is allowed to
    /// withdraw as many tokens as it wants from the pool to pay out insurance
    /// claims.
    /// Only the primary Agent can do this because it is a critical operation.
    /// WARNING: A compromised contract being given claims manager status may
    /// result in loss of staked funds. If a proposal has been made to call
    /// this method to set a contract as a claims manager, you are recommended
    /// to review the contract yourself and/or refer to the audit reports to
    /// understand the implications.
    /// @param claimsManager Claims manager contract address
    /// @param status Authorization status
    function setClaimsManagerStatus(
        address claimsManager,
        bool status
        )
        external
        override
        onlyAgentAppPrimary()
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
        onlyAgentApp()
    {
        require(
            _stakeTarget <= HUNDRED_PERCENT,
            "Pool: Invalid percentage value"
            );
        stakeTarget = _stakeTarget;
        emit SetStakeTarget(_stakeTarget);
    }

    /// @notice Called by the DAO Agent to set the maximum APR
    /// @param _maxApr Maximum APR
    function setMaxApr(uint256 _maxApr)
        external
        override
        onlyAgentApp()
    {
        require(
            _maxApr >= minApr,
            "Pool: Max APR smaller than min"
            );
        maxApr = _maxApr;
        emit SetMaxApr(_maxApr);
    }

    /// @notice Called by the DAO Agent to set the minimum APR
    /// @param _minApr Minimum APR
    function setMinApr(uint256 _minApr)
        external
        override
        onlyAgentApp()
    {
        require(
            _minApr <= maxApr,
            "Pool: Min APR larger than max"
            );
        minApr = _minApr;
        emit SetMinApr(_minApr);
    }

    /// @notice Called by the primary DAO Agent to set the unstake waiting
    /// period
    /// @dev This may want to be increased to provide more time for insurance
    /// claims to be resolved.
    /// Even when the insurance functionality is not implemented, the minimum
    /// valid value is `EPOCH_LENGTH` to prevent users from unstaking,
    /// withdrawing and staking with another address to work around the
    /// proposal spam protection.
    /// Only the primary Agent can do this because it is a critical operation.
    /// @param _unstakeWaitPeriod Unstake waiting period
    function setUnstakeWaitPeriod(uint256 _unstakeWaitPeriod)
        external
        override
        onlyAgentAppPrimary()
    {
        require(
            _unstakeWaitPeriod >= EPOCH_LENGTH,
            "Pool: Period shorter than epoch"
            );
        unstakeWaitPeriod = _unstakeWaitPeriod;
        emit SetUnstakeWaitPeriod(_unstakeWaitPeriod);
    }

    /// @notice Called by the primary DAO Agent to set the APR update steps
    /// @dev aprUpdateStep can be 0% or 100%+.
    /// Only the primary Agent can do this because it is a critical operation.
    /// @param _aprUpdateStep APR update steps
    function setAprUpdateStep(uint256 _aprUpdateStep)
        external
        override
        onlyAgentAppPrimary()
    {
        aprUpdateStep = _aprUpdateStep;
        emit SetAprUpdateStep(_aprUpdateStep);
    }

    /// @notice Called by the primary DAO Agent to set the voting power
    /// threshold for proposals
    /// @dev Only the primary Agent can do this because it is a critical
    /// operation.
    /// @param _proposalVotingPowerThreshold Voting power threshold for
    /// proposals
    function setProposalVotingPowerThreshold(uint256 _proposalVotingPowerThreshold)
        external
        override
        onlyAgentAppPrimary()
    {
        require(
            _proposalVotingPowerThreshold >= ONE_PERCENT / 10
                && _proposalVotingPowerThreshold <= 10 * ONE_PERCENT,
            "Pool: Threshold outside limits");
        proposalVotingPowerThreshold = _proposalVotingPowerThreshold;
        emit SetProposalVotingPowerThreshold(_proposalVotingPowerThreshold);
    }

    /// @notice Called by a DAO Api3Voting app at proposal creation-time to
    /// update the timestamp of the user's last proposal
    /// @param userAddress User address
    function updateLastProposalTimestamp(address userAddress)
        external
        override
        onlyVotingApp()
    {
        users[userAddress].lastProposalTimestamp = block.timestamp;
        emit UpdatedLastProposalTimestamp(
            userAddress,
            block.timestamp,
            msg.sender
            );
    }

    /// @notice Called to check if we are in the genesis epoch
    /// @dev Voting apps use this to prevent proposals from being made in the
    /// genesis epoch
    /// @return If the current epoch is the genesis epoch
    function isGenesisEpoch()
        external
        view
        override
        returns (bool)
    {
        return block.timestamp / EPOCH_LENGTH == genesisEpoch;
    }
}
