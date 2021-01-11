pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "../interfaces/IApi3Pool.sol";
import "../interfaces/IApi3Token.sol";

contract Inflation is Ownable {
    using SafeMath for uint256;

    IApi3Pool public api3Pool;
    IApi3Token public api3Token;
    IVoting public api3Voting;

    uint256 public targetStake;
    uint256 public currentAPR;
    uint256 public minAPR;
    uint256 public maxAPR;
    uint256 public updateCoefficient;

    uint256 public lastUpdateTime;

    uint256 public constant epochLength = 60 * 60 * 2;
    uint256 public constant epochsPerYear = epochLength / (365 * 24 * 60 * 60);
    uint256 public firstEpochTimestamp;

    struct Checkpoint {
        uint256 fromBlock;
        uint256 value;
    }

    Checkpoint public currentInflationPerEpoch;

    event RateUpdate(uint256 inflationPerEpoch, uint256 APR);

    constructor(address _api3Pool, address _api3Token, address _api3Voting) {
        api3Pool = IApi3Pool(_api3Pool);
        api3Token = IApi3Token(_api3Token);
        api3Voting = IVoting(_api3Voting);
        firstEpochTimestamp = block.timestamp;
    }

    modifier onlyVote {
        require(msg.sender == address(api3Voting), 
        "Function can only be called by Aragon voting app");
    }

    modifier epochCompleted {
        require(isEpochEnd(), "Function can only be called after completion of the previous epoch");
    }

    function getCurrentUnmintedRewards() external returns (uint256) {
        //Code for per-block rather than epoch-based calculation
        //
        //        uint256 blocksElapsed = block.number - currentInflationPerBlock.fromBlock;
        //        uint256 tokenSupply = api3Token.totalSupply();
        //        uint256 newSupply = compound(tokenSupply, currentInflationPerBlock.value, blocksElapsed);
        //        return newSupply - tokenSupply;
        //
        uint256 epochsElapsed =
            (block.timestamp.sub(lastUpdateTime)).div(epochLength);
        uint256 tokenSupply = api3Token.totalSupply();
        uint256 newSupply =
            compound(
                tokenSupply,
                currentInflationPerEpoch.value,
                epochsElapsed
            );
        return newSupply.sub(tokenSupply);
    }

    function mintRewards() external epochCompleted {
        _mintRewards();
    }

    function updateStakeTarget(uint256 target) external onlyVote {
        targetStake = target;
        _mintRewards();
    }

    function _mintRewards() internal {
        uint256 _currentUnminted = getCurrentUnmintedRewards();
        _setInflationPerEpoch();
        // lastUpdateTime factors in remainder seconds to every second is counted, despite integer epochs
        lastUpdateTime = block.timestamp.sub(
                            block.timestamp.sub(lastUpdateTime)
                            .mod(epochLength));

        // interactions
        api3Token.mint(address(this), _currentUnminted);
        api3Token.approve(address(api3Pool), _currentUnminted);
        api3Pool.distributeInflationaryRewards();
    }

    function _setInflationPerEpoch() internal {
        uint256 currentStaked = api3Pool.totalSupply();

        uint256 deltaAbsolute =
            currentStaked < targetStake
                ? targetStake.sub(currentStaked)
                : currentStaked.sub(targetStake);
        uint256 deltaPercentage =
            deltaAbsolute.mul(100_000_000).div(tokenSupply);

        // this updates the currentAPR incrementally
        // so currentAPR is not a deterministic function of abs(currentStaked - targetStake)
        uint256 aprUpdate =
            deltaPercentage.mul(updateCoefficient).div(1_000_000);
        currentAPR = currentStaked < targetStake
            ? currentAPR.add(aprUpdate)
            : currentAPR.sub(aprUpdate);

        // updated next line to reflect number of epochs per year
        uint256 nextInflationPerEpoch =
            currentAPR.mul(tokenSupply).div(100_000_000 * epochsPerYear);
        currentInflationPerEpoch = Checkpoint(block.number, nextInflationPerBlock);

        emit RateUpdate(nextInflationPerEpoch, currentAPR);
    }

    function compound(
        uint256 principal,
        uint256 ratio,
        uint256 n
    ) internal pure returns (uint256) {
        return
            ABDKMath64x64.mulu(
                ABDKMath64x64.pow(
                    ABDKMath64x64.add(
                        ABDKMath64x64.fromUInt(1),
                        ABDKMath64x64.divu(ratio, 10**18)
                    ),
                    n
                ),
                principal
            );
    }

    function isEpochEnd() public view returns (bool) {
        return block.timestamp.sub(lastUpdateTime) > epochLength;
    }
}
