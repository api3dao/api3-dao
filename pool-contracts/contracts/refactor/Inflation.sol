pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "../interfaces/IApi3Pool.sol";
import "../interfaces/IApi3Token.sol";

contract Inflation is Ownable {
    using SafeMath for uint256;

    IApi3Pool public api3Pool;
    IApi3Token public api3Token;

    uint256 public targetStake;
    uint256 public currentAPR;

    uint256 public minAPR;
    uint256 public maxAPR;
    uint256 public updateCoefficient;

    struct Checkpoint {
        uint256 fromBlock;
        uint256 value;
    }

    Checkpoint public currentInflationPerBlock;

    constructor(address _api3Pool, address _api3Token) {
        api3Pool = IApi3Pool(_api3Pool);
        api3Token = IApi3Token(_api3Token);
    }

    function getCurrentUnmintedRewards() external returns (uint256) {
        uint256 blocksElapsed = block.number - currentInflationPerBlock.fromBlock;
        uint256 tokenSupply = api3Token.totalSupply();
        uint256 newSupply = compound(tokenSupply, currentInflationPerBlock.value, blocksElapsed);
        return newSupply - tokenSupply;
    }

    function mintRewards() external {
        _mintRewards();
    }

    function updateStakeTarget(uint256 target) {
        targetStake = target;
        _mintRewards();
    }

    function _mintRewards() internal {
        uint256 _currentUnminted = getCurrentUnmintedRewards();
        api3Token.mint(address(this), _currentUnminted);
        api3Token.approve(api3Pool.address, _currentUnminted);
        api3Pool.distributeInflationaryRewards();
        _setInflationPerBlock();
    }

    function _setInflationPerBlock() internal {
        uint256 currentStaked = api3Pool.totalSupply();

        uint256 deltaAbsolute = currentStaked < targetStake 
            ? targetStake.sub(currentStaked) : currentStaked.sub(targetStake);
        uint256 deltaPercentage = deltaAbsolute.mul(100000000).div(tokenSupply);
        
        uint256 aprUpdate = deltaPercentage.mul(updateCoefficient).div(1000000);
        currentAPR = currentStaked < targetStake
            ? currentAPR.add(aprUpdate) : currentAPR.sub(aprUpdate);

        uint256 nextInflationPerBlock = currentAPR.mul(tokenSupply).div(100000000 * 6 * 60 * 24 * 365);
        currentInflationPerBlock = Checkpoint(block.number, nextInflationPerBlock);

        emit RateUpdate(nextInflationPerBlock, currentAPR);
        return nextInfl;
    }

    function compound (uint principal, uint ratio, uint n)
    internal pure returns (uint) {
        return ABDKMath64x64.mulu (
            ABDKMath64x64.pow (
                ABDKMath64x64.add (
                    ABDKMath64x64.fromUInt (1), 
                    ABDKMath64x64.divu (
                        ratio,
                        10**18)),
            n),
            principal);
    }
}
