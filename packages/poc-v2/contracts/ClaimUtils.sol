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
        claimReleases.push(Checkpoint(block.number, amount));
        claimReleaseReferenceBlocks.push(claimReferenceBlock);
    }

    // Called externally if the claim is accepted (should also call `releaseClaim()`
    // separately if `makeClaim()` had been called).
    // claimReferenceBlock is when the original claim was made.
    // Note that claim payouts burn shares both from `totalShares`, and from
    // individual users while they are updating their state. Claims can't
    // be paid out "automatically" simply by depreciating share prices 
    // because they are not applied to all stakers (but only to stakers that
    // had stakes at the time the claim was made). In contrast, rewards can
    // be paid out simply by increasing share price, which is why `payReward()`
    // is simpler than `payOutClaim()`.
    function payOutClaim(
        uint256 payoutAmount,
        uint256 claimReferenceBlock
        )
        external
        // `onlyClaimsManager`
    {
        // claimPayouts.push(Checkpoint(block.number, payoutAmount));
        // claimPayoutReferenceBlocks.push(claimReferenceBlock);

        // uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        // uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        // uint256 totalSharesBurned = payoutAmount * totalSharesNow / totalStakedNow;
        // totalStaked.push(Checkpoint(block.number, totalStakedNow - payoutAmount));
        // totalShares.push(Checkpoint(block.number, totalSharesNow - totalSharesBurned));

        api3Token.transfer(msg.sender, payoutAmount);
    }
}