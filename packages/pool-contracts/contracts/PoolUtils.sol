//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./StakeUtils.sol";
import "./interfaces/IPoolUtils.sol";

/// @title Contract where the pooling logic of the API3 pool is implemented
contract PoolUtils is StakeUtils, IPoolUtils {
    /// @param api3TokenAddress Address of the API3 token contract
    /// @param epochPeriodInSeconds Length of epochs used to quantize time
    /// @param firstEpochStartTimestamp Starting timestamp of epoch #1
    constructor(
        address api3TokenAddress,
        uint256 epochPeriodInSeconds,
        uint256 firstEpochStartTimestamp
    )
        public
        StakeUtils(
            api3TokenAddress,
            epochPeriodInSeconds,
            firstEpochStartTimestamp
        )
    {}

    /// @notice Has the user pool amount number of tokens and receive shares
    /// @param amount Number of tokens to be pooled
    function pool(uint256 amount) external override {
        // First have the user pool as if there are no active claims
        address userAddress = msg.sender;
        uint256 poolable = balances[userAddress].sub(getPooled(userAddress));
        require(poolable >= amount, "Not enough poolable funds");
        uint256 share = convertToShares(amount);
        shares[userAddress] = shares[userAddress].add(share);
        totalShares = totalShares.add(share);
        totalPooled = totalPooled.add(amount);

        // Then create an IOU for each active claim
        for (uint256 ind = 0; ind < activeClaims.length; ind++) {
            // Simulate a payout for the claim
            bytes32 claimId = activeClaims[ind];
            uint256 totalPooledAfterPayout = totalPooled.sub(
                claims[claimId].amount
            );
            // After the payout, if the user redeems their IOU and unpool, they
            // should get exactly amount number of tokens. Calculate how many
            // shares that many tokens would correspond to after the claim
            // payout.
            uint256 sharesRequiredToNotSufferFromPayout = amount
                .mul(totalShares)
                .div(totalPooledAfterPayout);
            // User already received share number of shares. They will
            // receive the rest as an IOU.
            uint256 iouAmountInShares = sharesRequiredToNotSufferFromPayout.sub(
                share
            );
            createIou(
                userAddress,
                iouAmountInShares,
                claimId,
                ClaimStatus.Accepted
            );
        }
        stake(userAddress);
        emit Pooled(userAddress, amount, share);
    }

    /// @notice Creates a request to unpool, which must be done
    /// unpoolWaitingPeriod epochs before when the user wants to unpool.
    /// The user can request to unpool once every unpoolRequestCooldown epochs.
    /// @dev If a user has made a request to unpool at epoch t, they can't
    /// repeat their request at t+1 to postpone their unpooling to one epoch
    /// later, so they need to be specific with their timing.
    function requestToUnpool() external override {
        address userAddress = msg.sender;
        uint256 currentEpochIndex = getCurrentEpochIndex();
        require(
            unpoolRequestEpochs[userAddress].add(unpoolRequestCooldown) <=
                currentEpochIndex,
            "Have to wait at least unpoolRequestCooldown to request a new unpool"
        );
        unpoolRequestEpochs[userAddress] = currentEpochIndex;
        emit RequestedToUnpool(userAddress);
    }

    /// @notice Has the user unpool sharesToUnpool number of shares
    /// @dev This doesn't take unpoolWaitingPeriod changing after the unpool
    /// request into account.
    /// The user can unpool multiple times with a single unpooling request.
    /// @param shareToUnpool Number of shares that will be unpooled
    function unpool(uint256 shareToUnpool) external override {
        address userAddress = msg.sender;
        uint256 currentEpochIndex = getCurrentEpochIndex();
        require(
            currentEpochIndex ==
                unpoolRequestEpochs[userAddress].add(unpoolWaitingPeriod),
            "Have to unpool unpoolWaitingPeriod epochs after the request"
        );
        uint256 share = shares[userAddress];
        require(shareToUnpool <= share, "Not enough unpoolable shares");

        // Unlike pool(), we create the IOUs before altering the pool state.
        // This is because these IOUs will be redeemable if the claim is not
        // paid out.

        // We do not want to deduct the entire unpooled amount from the pool
        // because we still need them to potentially pay out the current active
        // claims. To this end, the amount that is secured by IOUs will be left
        // in the pool as "ghost shares" (i.e., pool shares with no owner). We
        // calculate totalIouAmount for this purpose.
        uint256 totalIouAmount = 0;
        for (uint256 ind = 0; ind < activeClaims.length; ind++) {
            // Simulate a payout for the claim had the user not unpooled
            bytes32 claimId = activeClaims[ind];
            uint256 iouAmount = share.mul(claims[claimId].amount).div(
                totalShares
            );
            uint256 iouAmountInShares = convertToShares(iouAmount);
            createIou(
                userAddress,
                iouAmountInShares,
                claimId,
                ClaimStatus.Denied
            );
            totalIouAmount = totalIouAmount.add(iouAmount);
        }
        // Deduct the IOUs from the user's balance
        balances[userAddress] = balances[userAddress].sub(totalIouAmount);

        // Update the pool status
        uint256 amountToUnpool = convertFromShares(shareToUnpool);
        shares[userAddress] = shares[userAddress].sub(shareToUnpool);
        totalShares = totalShares.sub(shareToUnpool);
        totalPooled = totalPooled.sub(amountToUnpool);

        // Leave the total IOU amount in the pool as ghost shares
        uint256 totalIouAmountInShares = convertToShares(totalIouAmount);
        totalShares = totalShares.add(totalIouAmountInShares);
        totalGhostShares = totalGhostShares.add(totalIouAmountInShares);
        totalPooled = totalPooled.add(totalIouAmount);

        // Reduce the staked shares of the user if necessary
        stake(userAddress);
        emit Unpooled(userAddress, amountToUnpool, shareToUnpool);
    }
}
