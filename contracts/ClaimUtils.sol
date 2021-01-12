//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./RewardUtils.sol";


// In general, the claims logic (their IDs, etc.) is implemented at a
// ClaimsManager contract authorized by the DAO to call the methods below.
// Therefore, the function prototypes are rather simple and the specifics
// are out of the scope of the pool contract.
contract ClaimUtils is RewardUtils {
    constructor(address api3TokenAddress)
        RewardUtils(api3TokenAddress)
        public
    {}

    // Called externally when the claim is made
    function makeClaim(uint256 amount)
        external
        // `onlyClaimsManager`
    {
        locks.push(Checkpoint(block.number, amount));
    }

    // Called externally if the claim is rejected.
    // claimEventBlock is when the original claim was made.
    function cancelClaim(
        uint256 amount,
        uint256 claimEventBlock
        )
        external
        // `onlyClaimsManager`
    {
        claimReleases.push(Checkpoint(block.number, amount));
        claimReleaseEventBlocks.push(claimEventBlock);
    }

    // Called externally if the claim is accepted.
    // claimEventBlock is when the original claim was made.
    // Note that claims burn shares both from `totalShares` and from
    // individual users while they are updating their state. Claims can't
    // be paid out "automatically" simply by depreciating share prices 
    // because they are not applied to all stakers (but only to stakers that
    // had stakes at the time the claim was made). In contrast, rewards can
    // be paid out simply by increasing share price, which is why `payRewards()`
    // is simpler than `executeClaim()`.
    function executeClaim(
        uint256 amount,
        uint256 claimEventBlock
        )
        external
        // `onlyClaimsManager`
    {
        // No longer need to lock tokens
        claimReleases.push(Checkpoint(block.number, amount));
        claimReleaseEventBlocks.push(claimEventBlock);

        claims.push(Checkpoint(block.number, amount));
        claimEventBlocks.push(claimEventBlock);

        // `totalStaked` is updated based on how many tokens are staked now
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        totalStaked.push(Checkpoint(block.number, totalStakedNow - amount));

        // `totalShares` is updated based on the state at the time the claim was made
        uint256 totalStakedThen = getValueAt(totalStaked, claimEventBlock);
        uint256 totalSharesThen = getValueAt(totalShares, claimEventBlock);
        uint256 totalSharesBurned = amount * totalSharesThen / totalStakedThen;
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        totalShares.push(Checkpoint(block.number, totalSharesNow - totalSharesBurned));

        api3Token.transferFrom(address(this), msg.sender, amount);
    }
}