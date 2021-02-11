//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";

contract ClaimUtils is StakeUtils {
    constructor(address api3TokenAddress)
        StakeUtils(api3TokenAddress)
        public
    {}

    event ClaimPayout(uint256 indexed claimBlock, uint256 amount);

    function payOutClaim(
        uint256 payoutAmount,
        uint256 claimReferenceBlock
        )
        external triggerEpochAfter
        // `onlyClaimsManager`
    {
        uint256 totalStakedNow = getValue(totalStaked);
        totalStaked.push(Checkpoint(block.number, totalStakedNow.sub(payoutAmount)));
        api3Token.transfer(msg.sender, payoutAmount);
        emit ClaimPayout(claimReferenceBlock, payoutAmount);
    }
}