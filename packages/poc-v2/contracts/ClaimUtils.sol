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

    // Called externally when the claim is made
    function makeClaim(uint256 amount)
        external
        // `onlyClaimsManager`
    {
        locks.push(Checkpoint(block.number, amount));
    }

    // Called externally when the claim is finalized (accepted/rejected).
    // claimReferenceBlock is when the original claim was made.
    function releaseClaim(
        uint256 amount,
        uint256 claimReferenceBlock
        )
        external
        // `onlyClaimsManager`
    {
        uint256 lockIndex = getIndexOf(locks, claimReferenceBlock);
        locks[lockIndex].value = 0;
    }

    function payOutClaim(
        uint256 payoutAmount,
        uint256 claimReferenceBlock
        )
        external
        // `onlyClaimsManager`
    {
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        totalStaked.push(Checkpoint(block.number, totalStakedNow - payoutAmount));
        api3Token.transfer(msg.sender, payoutAmount);
        uint256 lockIndex = getIndexOf(locks, claimReferenceBlock);
        locks[lockIndex].value = 0;
        if (!rewardPaidForEpoch[now / rewardEpochLength])
        {
            payReward();
        }
    }
}