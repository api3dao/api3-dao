pragma solidity ^0.7.0;

import "@aragon/minime/MiniMeToken.sol";
import "@aragon/minime/MiniMeTokenFactory.sol";

contract PoolPrototype is MiniMeToken {
    IInflation inflationManager;
    IApi3Token api3Token;

    Checkpoint[] public poolInflationaryRewards;
    mapping(address => Checkpoint[]) unstakeRequests;

    //1 week = 43200 blocks
    uint256 public unstakeWaitingPeriod = 43200;

    event UnstakeRequest(
        address indexed owner,
        uint256 indexed unlockHeight,
        uint256 amount,
        uint requestIndex);

    constructor(IInflation _inflationManager, IApi3Token _api3Token) public MiniMeToken(
        _tokenFactory,
        _parentToken,
        _parentSnapShotBlock,
        _tokenName,
        _decimalUnits,
        _tokenSymbol,
        _transfersEnabled
    ) {
        api3Token = IApi3Token(_api3Token);
        inflationManager = IInflation(_inflationManager);
        tokenFactory = MiniMeTokenFactory(_tokenFactory);
        name = _tokenName;                                 // Set the name
        decimals = _decimalUnits;                          // Set the decimals
        symbol = _tokenSymbol;                             // Set the symbol
        parentToken = MiniMeToken(_parentToken);
        parentSnapShotBlock = _parentSnapShotBlock;
        transfersEnabled = _transfersEnabled;
        creationBlock = block.number;
    }

    function balanceOfAt(address owner, uint256 blockHeight)
    public override
    returns (uint256) {
        Checkpoint _lastOwnerBalance = balances[owner][balances[owner].length - 1];
        Checkpoint _lastSupply = totalSupplyHistory[totalSupplyHistory.length - 1];

        uint256 accumulatedStake = _lastOwnerBalance.value;
        uint256 i = getCheckpointIndex(
            totalSupplyHistory,
            _lastOwnerBalance.fromBlock
        );
        while (balances[owner][i].fromBlock < blockHeight) {
            uint256 share = accumulatedStake
                            .mul(_poolInflationaryRewards[j + 1].value)
                            .div(_totalSupplyHistory[j].value);
            accumulatedStake += share;
            i++;
        }

        if (blockHeight > inflationManager.lastUpdateTime()) {
            uint256 _currentUnmintedRewards = inflationManager.getCurrentUnmintedRewards();
            uint256 share = _currentUnmintedRewards
                            .mul(accumulatedStake)
                            .div(_lastSupply.value);
            accumulatedStake += share;
        }

            return accumulatedStake;
    }

    function distributeInflationaryRewards(uint256 amount) public {
        require(msg.sender == address(inflationManager));
        api3Token.transferFrom(address(inflationManager), address(this), amount);
        uint256 newSupply = totalSupply() += amount;
        updateValueAtNow(totalSupplyHistory, newSupply);
        updateValueAtNow(inflationRewardDistributions, amount);
    }

    function unstakeRequest(uint256 amount) public {
        require(amount <= getCurrentBalance(msg.sender));
        //call Claims minime contract for IOU handling when implemented
        unstakeRequests[msg.sender].push(Checkpoint(amount, block.number));
        uint256 unstakeHeight = block.number + unstakeWaitingPeriod;
        emit UnstakeRequest(msg.sender, unstakeHeight, amount, unstakeRequests[msg.sender].length - 1);
    }

    function unstake(uint requestIndex) public {
        _unstake(msg.sender, requestIndex);
    }

    function balanceOf(address owner) public override {
        return getCurrentBalance(owner);
    }

    function _unstake(address owner, uint requestIndex) internal {
        // checks
        Checkpoint[] _senderUnstakeRequests = unstakeRequests[owner];
        require(requestIndex < _senderUnstakeRequests.length);
        Checkpoint request = _senderUnstakeRequests[requestIndex];
        require(request.fromBlock <= block.number);
        // effects
        if (inflationManager.isEpochEnd()) {
            inflationManager.mintRewards();
        }
        api3Token.transferFrom(this.address, msg.sender, request.value);
        updateValueAtNow(totalSupplyHistory, totalSupply() - request.value);
        updateValueAtNow(balances[msg.sender], balanceOf(msg.sender) - request.value);
        Transfer(msg.sender, 0, request.value);
        delete unstakeRequests[msg.sender][requestIndex];
    }

    function getCheckpointIndex(
        Checkpoint[] storage checkpoints,
        uint256 _block
    ) internal returns (uint256) {
        if (checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length - 1].fromBlock)
            return checkpoints[checkpoints.length - 1].value;
        if (_block < checkpoints[0].fromBlock) return 0;

        // Binary search of the value in the array
        uint256 min = 0;
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return min;
    }
}
