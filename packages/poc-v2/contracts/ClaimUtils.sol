//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StakeUtils.sol";


// In general, the claims logic (their IDs, etc.) is implemented at a
// ClaimsManager contracts authorized by the DAO to call the methods below.
// Therefore, the function prototypes are rather simple and the specifics
// are out of the scope of the pool contract.
contract ClaimUtils is StakeUtils {
    constructor(address api3TokenAddress)
        StakeUtils(api3TokenAddress)
        public
    {}

    event Claim(uint256 amount);
    event ClaimRelease(uint256 indexed claimBlock, uint256 amount);
    event ClaimPayout(uint256 indexed claimBlock, uint256 amount);

    // Called externally when the claim is made
    function makeClaim(uint256 amount)
        external
        // `onlyClaimsManager`
    {
        claimLocks.push(Checkpoint(block.number, amount));
        emit Claim(amount);
    }

    // Called externally when the claim is finalized (accepted/rejected).
    // claimReferenceBlock is when the original claim was made.
    function releaseClaim(uint256 claimReferenceBlock)
        external
        // `onlyClaimsManager`
    {
        uint256 claimAmount = getIndexOf(claimLocks, claimReferenceBlock);
        resolveClaim(claimReferenceBlock);
        emit ClaimRelease(claimReferenceBlock, claimAmount);
    }

    function payOutClaim(
        uint256 payoutAmount,
        uint256 claimReferenceBlock
        )
        external triggerEpochAfter
        // `onlyClaimsManager`
    {
        uint256 totalStakedNow = getValue(totalStaked);
        totalStaked.push(Checkpoint(block.number, totalStakedNow - payoutAmount));
        api3Token.transfer(msg.sender, payoutAmount);
        resolveClaim(claimReferenceBlock);
        emit ClaimPayout(claimReferenceBlock, payoutAmount);
    }

    function resolveClaim(uint256 claimReferenceBlock) internal {
        uint256 lockIndex = getIndexOf(claimLocks, claimReferenceBlock);
        delete claimLocks[lockIndex];
    }
}