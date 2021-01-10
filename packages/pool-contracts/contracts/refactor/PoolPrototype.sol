pragma solidity ^0.7.0;

import "@aragon/minime/MiniMeToken.sol";
import "@aragon/minime/MiniMeTokenFactory.sol";

contract PoolPrototype is MiniMeToken {
    IInflation inflationManager;
    IApi3Token api3Token;

    Checkpoint[] public poolInflationaryRewards;
    mapping(address => Checkpoint) unstakeRequests;

    //1 week = 43200 blocks
    uint256 public constant unstakeWaitingPeriod = 43200;

    event UnstakeRequest(address indexed owner, uint256 amount);
    event CancelUnstakeRequest(address indexed owner, uint256 requestStartBlock, uint256 amount);
    event Unstake(address indexed owner, uint256 amount);

    constructor(IInflation _inflationManager, IApi3Token _api3Token) public MiniMeToken(
        _tokenFactory,
        0x0,
        0,
        _tokenName,
        _decimalUnits,
        _tokenSymbol,
        false
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

    function balanceOfAt(address owner, uint256 fromBlock) public
    returns (uint256) {
        Checkpoint _lastOwnerBalance = super.balanceOfAt(owner, block.number);
        Checkpoint _lastSupply = super.totalSupplyAt(block.number);
        uint256 accumulatedStake = _lastOwnerBalance.value;
        uint256 i = getCheckpointIndex(
            totalSupplyHistory,
            _lastOwnerBalance.fromBlock
        );
        while (balances[owner][i].fromBlock < fromBlock) {
            uint256 share = accumulatedStake
                            .mul(_poolInflationaryRewards[j + 1].value)
                            .div(_totalSupplyHistory[j].value);
            accumulatedStake += share;
            i++;
        }
        return accumulatedStake;
    }

    function balanceOf(address owner) public 
    returns (uint256) {
        return balanceOfAt(owner, block.number);
    }

    function stake(uint256 amount) public {
        api3Token.transferFrom(msg.sender, address(this), amount);
        generateTokens(msg.sender, amount);
        if (inflationManager.isEpochEnd()) {
            inflationManager.mintRewards();
        }
    }

    function distributeInflationaryRewards(uint256 amount) public {
        require(msg.sender == address(inflationManager));

        api3Token.transferFrom(address(inflationManager), address(this), amount);
        uint256 newSupply = totalSupply() += amount;
        updateValueAtNow(totalSupplyHistory, newSupply);
        updateValueAtNow(inflationRewardDistributions, amount);
    }

    function unstakeRequest(uint256 amount) public {
        Checkpoint currentOwnerBalance = balanceOfAt(msg.sender, block.number);

        require(!unstakeRequests[msg.sender], "Only one unstake request can be pending");
        require(amount <= currentOwnerBalance, "Insufficient funds");

        unstakeRequests[msg.sender] = Checkpoint(amount, block.number);
        //amount is deducted from balance - for slashing purposes, the Claims proxy will use new balance + amount of request to determine owner share
        updateValueAtNow(balances[msg.sender], currentOwnerBalance - amount);

        emit UnstakeRequest(msg.sender, block.number, amount);
    }

    function cancelUnstakeRequest() public {
        require(unstakeRequests[msg.sender], "Sender has no current unstake request");

        Checkpoint _request = unstakeRequests[msg.sender];
        uint256 lastBalanceIndex = balances[msg.sender].length - 1;
        uint256 oldBalance = balances[msg.sender][lastBalanceIndex].value + _request.value;
        updateValueAtNow(balances[msg.sender], oldBalance);
        delete unstakeRequests[msg.sender];

        emit CancelUnstakeRequest(msg.sender, _request.fromBlock, _request.value);
    }

    function unstake() public {
        require(unstakeRequests[owner], "Sender has no current unstake request");
        uint256 unlockHeight = unstakeRequests[owner].fromBlock + unstakeWaitingPeriod;
        require(unlockHeight <= block.number, 
                "Unstake waiting period has " + (unlockHeight - block.number) + " blocks remaining");

        _unstake(msg.sender);
    }

    function _unstake(address owner) internal {
        Checkpoint _request = unstakeRequests[owner];

        if (inflationManager.isEpochEnd()) {
            inflationManager.mintRewards();
        }
        api3Token.transferFrom(address(this), msg.sender, _request.value);
        updateValueAtNow(totalSupplyHistory, totalSupply() - _request.value);
        delete unstakeRequests[msg.sender];

        emit Unstake(owner, _request.value);
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
