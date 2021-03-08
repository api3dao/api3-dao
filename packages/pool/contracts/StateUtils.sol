//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./auxiliary/interfaces/IApi3Token.sol";
import "./interfaces/IStateUtils.sol";

/// @title Contract that keeps state variables
contract StateUtils is IStateUtils {
    using SafeMath for uint256;

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
        mapping(uint256 => bool) epochIndexToRewardRevocationStatus;
    }

    string constant internal ERROR_VALUE = "Invalid value";
    string constant internal ERROR_ADDRESS = "Invalid address";
    string constant internal ERROR_UNAUTHORIZED = "Unauthorized";
    
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

    /// @notice Epochs are indexed as `now / EPOCH_LENGTH`. `genesisEpoch` is
    /// the index of the epoch in which the pool is deployed.
    uint256 public immutable genesisEpoch;

    /// @notice Records of rewards paid in each epoch
    mapping(uint256 => Reward) public epochIndexToReward;

    /// @notice Epoch index of the most recent reward payment
    uint256 public epochIndexOfLastRewardPayment;

    /// @notice User records
    mapping(address => User) public users;

    /// @notice Total number of tokens staked at the pool, kept in checkpoints
    Checkpoint[] public totalStaked;

    /// @notice Total number of shares at the pool, kept in checkpoints
    Checkpoint[] public totalShares;

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
        public
    {
        api3Token = IApi3Token(api3TokenAddress);
        // Initialize the share price at 1
        totalShares.push(Checkpoint({
            fromBlock: block.number,
            value: 1
            }));
        totalStaked.push(Checkpoint({
            fromBlock: block.number,
            value: 1
            }));
        // Set the current epoch as the genesis epoch and skip its reward
        // payment
        uint256 currentEpoch = now.div(EPOCH_LENGTH);
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
}
