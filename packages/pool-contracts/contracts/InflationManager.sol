//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IApi3Token.sol";
import "./interfaces/IApi3Pool.sol";
import "./interfaces/IInflationManager.sol";

/// @title Contract where the inflation schedule is defined and API3 tokens are
/// minted
/// @notice After deploying this contract, the API3 token owner (i.e., the API3
/// DAO) should call updateMinterStatus() at Api3Token to authorize it as a
/// minter. To update the inflation schedule, another InflationManager should
/// be deployed, the previous InflationManager's minting authorization should
/// be revoked and given to the new one.
/// @dev The decaying inflation rate is independent from the token total
/// supply, while the terminal inflation rate is not. This means that if
/// another contract also mints API3 tokens during the decaying period, the
/// number of minted tokens will not increase to keep the inflation rate
/// constant.
contract InflationManager is IInflationManager {
    using SafeMath for uint256;

    /// Number of tokens that will be minted on week #1
    /// Initial annual inflation rate: 0.75
    /// Initial weekly inflation rate: 0.75 / 52
    /// Initial token supply (in Wei): 1e8 * 1e18 = 1e26
    /// Initial weekly inflationary supply: 1e26 * 0.75 / 52 = 1442307692307692307692307
    uint256 public constant INITIAL_WEEKLY_SUPPLY = 1442307692307692307692307;

    /// Coefficient that will be multiplied with the number of tokens that will
    /// be minted on one week to find the number of tokens that will be
    /// minted the week after (times 1e18)
    /// Weekly supply decay rate: 0.00965
    /// Weekly supply update coefficient: 1e18 * (1 - 0.00965) = 990350000000000000
    uint256 public constant WEEKLY_SUPPLY_UPDATE_COEFF = 990350000000000000;

    /// Coefficient that will be multiplied with the total token supply to find
    /// the number of tokens that will be minted on a week after the
    /// terminal epoch (times 1e18)
    /// Terminal annual inflation rate: 0.025
    /// Terminal weekly inflation rate: 0.025 / 52
    /// Terminal weekly inflationary supply rate: 1e18 * 0.025 / 52 = 480769230769230
    uint256 public constant TERMINAL_WEEKLY_SUPPLY_RATE = 480769230769230;

    /// Time period during which the number of minted tokens will decay
    /// exponentially
    /// 5 years * 52 weeks/year = 260
    uint256 public constant DECAY_PERIOD = 260;

    /// API3 token contract
    IApi3Token public immutable api3Token;
    /// API3 pool contract
    IApi3Pool public immutable api3Pool;

    /// @dev Mapping of epochs to if inflationary rewards are minted
    mapping(uint256 => bool) private mintedInflationaryRewardsAtEpoch;
    /// @dev Array that keeps the number of tokens that will be minted each
    /// week
    uint256[] internal weeklySupplies;
    /// Epoch when the inflationary rewards will start
    uint256 public immutable startEpoch;
    /// Epoch when the inflation rate is set to its constant value
    uint256 public immutable terminalEpoch;

    /// @param api3TokenAddress Address of the API3 token contract
    /// @param api3PoolAddress Address of the API3 pool contract
    /// @param _startEpoch Epoch when the inflationary rewards will start
    constructor(
        address api3TokenAddress,
        address api3PoolAddress,
        uint256 _startEpoch
    ) public {
        api3Token = IApi3Token(api3TokenAddress);
        api3Pool = IApi3Pool(api3PoolAddress);

        startEpoch = _startEpoch;
        terminalEpoch = _startEpoch.add(DECAY_PERIOD);

        // Pre-calculate the weekly supplies
        weeklySupplies = new uint256[](DECAY_PERIOD);
        uint256 weeklySupply = INITIAL_WEEKLY_SUPPLY;
        weeklySupplies[0] = weeklySupply;
        for (uint256 indWeek = 1; indWeek < DECAY_PERIOD; indWeek++) {
            weeklySupply = weeklySupply.mul(WEEKLY_SUPPLY_UPDATE_COEFF).div(
                1e18
            );
            weeklySupplies[indWeek] = weeklySupply;
        }
    }

    /// @notice Mints inflationary rewards to the API3 pool
    /// @dev Gets called automatically when a user calls collect() at the pool
    /// contract. It can also be called manually. Note that for week #1, users
    /// will not be calling collect(), so this will have to be called manually.
    function mintInflationaryRewardsToPool() external override {
        uint256 currentEpochIndex = api3Pool.getCurrentEpochIndex();
        if (!mintedInflationaryRewardsAtEpoch[currentEpochIndex]) {
            uint256 amount = getDeltaTokenSupply(currentEpochIndex);
            api3Token.mint(address(this), amount);
            api3Token.approve(address(api3Pool), amount);
            api3Pool.addVestedRewards(address(this), amount);
            mintedInflationaryRewardsAtEpoch[currentEpochIndex] = true;
            emit InflationaryRewardsMinted(currentEpochIndex);
        }
    }

    /// @notice Returns the number of tokens that needs to be minted for an
    /// epoch
    /// @param indEpoch Epoch index (not the week index)
    function getDeltaTokenSupply(uint256 indEpoch)
        private
        view
        returns (uint256 deltaTokenSupply)
    {
        if (indEpoch < startEpoch) {
            return 0;
        } else if (indEpoch <= terminalEpoch) {
            return weeklySupplies[indEpoch.sub(startEpoch)];
        } else {
            return
                api3Token.totalSupply().mul(TERMINAL_WEEKLY_SUPPLY_RATE).div(
                    1e18
                );
        }
    }
}
