//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";

contract ClaimUtils is StakeUtils {
    constructor(address api3TokenAddress)
        StakeUtils(api3TokenAddress)
        public
    {}

    event ClaimPayout(uint256 indexed claimBlock, uint256 amount);

    function payOutClaim(uint256 amount, uint256 atBlock)
        external triggerEpochBefore
        onlyClaimsManager(msg.sender)
    {
        uint256 totalStakedNow = getValue(totalStaked);
        uint256 totalStakedAfter = totalStakedNow > amount ? totalStakedNow.sub(amount) : 1;
        totalStaked.push(Checkpoint(block.number, totalStakedAfter));
        api3Token.transfer(msg.sender, amount);
        emit ClaimPayout(atBlock, amount);
    }
}