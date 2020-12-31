//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IouUtils.sol";
import "./interfaces/IVestingUtils.sol";

/// @title Contract where the vesting logic of the API3 pool is implemented
contract VestingUtils is IouUtils, IVestingUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        IouUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Locks amount number of tokens of the user in a vesting
    /// @param userAddress User address
    /// @param amount Number of tokens to be vested
    /// @param vestingEpoch Index of the epoch when the funds will be available
    /// to be vested
    function createVesting(
        address userAddress,
        uint256 amount,
        uint256 vestingEpoch
    ) internal {
        unvestedFunds[userAddress] = unvestedFunds[userAddress].add(amount);
        bytes32 vestingId = keccak256(abi.encodePacked(noVestings, this));
        noVestings = noVestings.add(1);
        vestings[vestingId] = Vesting({
            userAddress: userAddress,
            amount: amount,
            epoch: vestingEpoch
        });
        emit VestingCreated(vestingId, userAddress, amount, vestingEpoch);
    }

    /// @notice Resolves a vesting
    /// @param vestingId Vesting ID
    function vest(bytes32 vestingId) external override {
        Vesting memory vesting = vestings[vestingId];
        require(
            getCurrentEpochIndex() >= vesting.epoch,
            "Cannot vest before vesting.epoch"
        );
        unvestedFunds[vesting.userAddress] = unvestedFunds[vesting.userAddress]
            .sub(vesting.amount);
        delete vestings[vestingId];
        emit VestingResolved(vestingId);
    }
}
