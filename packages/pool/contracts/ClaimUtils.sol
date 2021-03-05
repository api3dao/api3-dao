//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";

/// @title Contract that implements the insurance claim payout functionality
contract ClaimUtils is StakeUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        StakeUtils(api3TokenAddress)
        public
    {}

    event ClaimPayout(
        uint256 indexed claimBlock,
        uint256 amount
        );

    /// @notice Called by a claims manager to pay out an insurance claim
    /// @dev The claims manager is a trusted contract that is allowed to
    /// withdraw as many tokens as it wants from the pool to pay our insurance
    /// claims. Any kind of limiting logic (e.g., maximum amount of tokens that
    /// can be withdrawn) is implemented at its end and is out of the scope of
    /// this contract.
    /// This will revert if the pool does not have enough funds.
    /// @param amount Amount of tokens that will be paid out
    function payOutClaim(uint256 amount)
        external
        payEpochRewardBefore()
        onlyClaimsManager()
    {
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalStakedAfter = totalStakedNow > amount ? totalStakedNow.sub(amount) : 1;
        totalStaked.push(Checkpoint(block.number, totalStakedAfter));
        api3Token.transfer(msg.sender, amount);
        emit ClaimPayout(block.number, amount);
    }
}
