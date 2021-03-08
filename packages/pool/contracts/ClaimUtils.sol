//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";
import "./interfaces/IClaimUtils.sol";

/// @title Contract that implements the insurance claim payout functionality
contract ClaimUtils is StakeUtils, IClaimUtils {
    /// @dev Reverts if the caller is not a claims manager
    modifier onlyClaimsManager() {
        require(claimsManagerStatus[msg.sender], ERROR_UNAUTHORIZED);
        _;
    }

    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        public
        StakeUtils(api3TokenAddress)
    {}

    /// @notice Called by a claims manager to pay out an insurance claim
    /// @dev The claims manager is a trusted contract that is allowed to
    /// withdraw as many tokens as it wants from the pool to pay out insurance
    /// claims. Any kind of limiting logic (e.g., maximum amount of tokens that
    /// can be withdrawn) is implemented at its end and is out of the scope of
    /// this contract.
    /// This will revert if the pool does not have enough funds.
    /// @param recipient Recipient of the claim
    /// @param amount Amount of tokens that will be paid out
    function payOutClaim(
        address recipient,
        uint256 amount
        )
        external
        override
        payEpochRewardBefore()
        onlyClaimsManager()
    {
        uint256 totalStakedNow = getValue(totalStaked);
        // We need `totalStakedNow` to be greater than `amount` because we 
        // always need at least 1 Wei staked to avoid division by zero errors
        require(totalStakedNow > amount, ERROR_VALUE);
        uint256 totalStakedAfter = totalStakedNow.sub(amount);
        totalStaked.push(Checkpoint({
            fromBlock: block.number,
            value: totalStakedAfter
            }));
        api3Token.transfer(recipient, amount);
        emit PaidOutClaim(
            recipient,
            amount
            );
    }
}
