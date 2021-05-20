//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./StateUtils.sol";
import "./interfaces/IGetterUtils.sol";

/// @title Contract that implements getters
abstract contract GetterUtils is StateUtils, IGetterUtils {

    string private constant CHECKPOINT_NOT_FOUND = "API3DAO.GetterUtils: Value cannot be found after provided checkpoint";

    /// @notice Called to get the voting power of a user at a specific block
    /// @dev This method is used to implement the MiniMe interface for the
    /// Api3Voting app
    /// @param userAddress User address
    /// @param _block Block number for which the query is being made for
    /// @return Voting power of the user at the block
    function balanceOfAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        override
        returns(uint256)
    {
        // Users that delegate have no voting power
        if (userDelegateAt(userAddress, _block) != address(0))
        {
            return 0;
        }
        uint256 userSharesThen = userSharesAt(userAddress, _block);
        uint256 delegatedToUserThen = userReceivedDelegationAt(userAddress, _block);
        return userSharesThen + delegatedToUserThen;
    }

    /// @notice Called to get the current voting power of a user
    /// @dev This method is used to implement the MiniMe interface for the
    /// Api3Voting app
    /// @param userAddress User address
    /// @return Current voting power of the user
    function balanceOf(address userAddress)
        public
        view
        override
        returns(uint256)
    {
        return balanceOfAt(userAddress, block.number);
    }

    /// @notice Called to get the total voting power one block ago
    /// @dev This method is used to implement the MiniMe interface for the
    /// Api3Voting app
    /// @return Total voting power one block ago
    function totalSupplyOneBlockAgo()
        public
        view
        override
        returns(uint256)
    {
        return totalSharesOneBlockAgo();
    }

    /// @notice Called to get the current total voting power
    /// @dev This method is used to implement the MiniMe interface for the
    /// Aragon Voting app
    /// @return Current total voting power
    function totalSupply()
        public
        view
        override
        returns(uint256)
    {
        return totalShares();
    }

    /// @notice Called to get the pool shares of a user at a specific block
    /// @dev Starts from the most recent value in `user.shares` and searches
    /// backwards one element at a time
    /// @param userAddress User address
    /// @param _block Block number for which the query is being made for
    /// @return Pool shares of the user at the block
    function userSharesAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        override
        returns(uint256)
    {
        return getValueAt(users[userAddress].shares, _block, 0);
    }

    /// @notice Called to get the current pool shares of a user
    /// @param userAddress User address
    /// @return Current pool shares of the user
    function userShares(address userAddress)
        public
        view
        override
        returns(uint256)
    {
        return userSharesAt(userAddress, block.number);
    }

    /// @notice Called to get the pool shares of a user at a specific block
    /// using binary search
    /// @dev This method is not used by the current iteration of the DAO/pool
    /// and is implemented for future external contracts to use to get the user
    /// shares at an arbitrary block.
    /// @param userAddress User address
    /// @param _block Block number for which the query is being made for
    /// @return Pool shares of the user at the block
    function userSharesAtWithBinarySearch(
        address userAddress,
        uint256 _block
        )
        external
        view
        override
        returns(uint256)
    {
        return getValueAtWithBinarySearch(
            users[userAddress].shares,
            _block,
            0
            );
    }

    /// @notice Called to get the current staked tokens of the user
    /// @param userAddress User address
    /// @return Current staked tokens of the user
    function userStake(address userAddress)
        public
        view
        override
        returns(uint256)
    {
        return userShares(userAddress) * totalStake / totalShares();
    }

    /// @notice Called to get the voting power delegated to a user at a
    /// specific block
    /// @dev `user.delegatedTo` cannot have grown more than 1000 checkpoints
    /// in the last epoch due to `proposalVotingPowerThreshold` having a lower
    /// limit of 0.1%.
    /// @param userAddress User address
    /// @param _block Block number for which the query is being made for
    /// @return Voting power delegated to the user at the block
    function userReceivedDelegationAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        override
        returns(uint256)
    {
        // Binary searching a 1000-long array takes up to 10 storage reads
        // (2^10 = 1024). If we approximate the average number of reads
        // required to be 5 and consider that it is much more likely for the
        // value we are looking for will be at the end of the array (because
        // not many proposals will be made per epoch), it is preferable to do
        // a linear search at the end of the array if possible. Here, the
        // length of "the end of the array" is specified to be 5 (which was the
        // expected number of iterations we will need for a binary search).
        uint256 maximumLengthToLinearSearch = 5;
        // If the value we are looking for is not among the last
        // `maximumLengthToLinearSearch`, we will fall back to binary search.
        // Here, we will only search through the last 1000 checkpoints because
        // `user.delegatedTo` cannot have grown more than 1000 checkpoints in
        // the last epoch due to `proposalVotingPowerThreshold` having a lower
        // limit of 0.1%.
        uint256 maximumLengthToBinarySearch = 1000;
        Checkpoint[] storage delegatedTo = users[userAddress].delegatedTo;
        if (delegatedTo.length < maximumLengthToLinearSearch) {
            return getValueAt(delegatedTo, _block, 0);
        }
        uint256 minimumCheckpointIndexLinearSearch = delegatedTo.length - maximumLengthToLinearSearch;
        if (delegatedTo[minimumCheckpointIndexLinearSearch].fromBlock < _block) {
            return getValueAt(delegatedTo, _block, minimumCheckpointIndexLinearSearch);
        }
        // It is very unlikely for the method to not have returned until here
        // because it means there have been `maximumLengthToLinearSearch`
        // proposals made in the current epoch.
        uint256 minimumCheckpointIndexBinarySearch = delegatedTo.length > maximumLengthToBinarySearch
            ? delegatedTo.length - maximumLengthToBinarySearch
            : 0;
        // The below will revert if the value being searched is not within the
        // last `minimumCheckpointIndexBinarySearch` (which is not possible if
        // `_block` is the snapshot block of an open vote of Api3Voting,
        // because its vote duration is `EPOCH_LENGTH`).
        return getValueAtWithBinarySearch(delegatedTo, _block, minimumCheckpointIndexBinarySearch);
    }

    /// @notice Called to get the current voting power delegated to a user
    /// @param userAddress User address
    /// @return Current voting power delegated to the user
    function userReceivedDelegation(address userAddress)
        public
        view
        override
        returns(uint256)
    {
        return userReceivedDelegationAt(userAddress, block.number);
    }

    /// @notice Called to get the delegate of the user at a specific block
    /// @dev Starts from the most recent value in `user.delegates` and
    /// searches backwards one element at a time. If `_block` is within
    /// `EPOCH_LENGTH`, this call is guaranteed to find the value among
    /// the last 2 elements because a user cannot update delegate more
    /// frequently than once an `EPOCH_LENGTH`.
    /// @param userAddress User address
    /// @param _block Block number
    /// @return Delegate of the user at the specific block
    function userDelegateAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        override
        returns(address)
    {
        AddressCheckpoint[] storage delegates = users[userAddress].delegates;
        for (uint256 i = delegates.length; i > 0; i--)
        {
            if (delegates[i - 1].fromBlock <= _block)
            {
                return delegates[i - 1]._address;
            }
        }
        return address(0);
    }

    /// @notice Called to get the current delegate of the user
    /// @param userAddress User address
    /// @return Current delegate of the user
    function getUserDelegate(address userAddress)
        public
        view
        override
        returns(address)
    {
        return userDelegateAt(userAddress, block.number);
    }

    /// @notice Called to get the current locked tokens of the user
    /// @param userAddress User address
    /// @return locked Current locked tokens of the user
    function getUserLocked(address userAddress)
        public
        view
        override
        returns(uint256 locked)
    {
        Checkpoint[] storage _userShares = users[userAddress].shares;
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        uint256 oldestLockedEpoch = currentEpoch - REWARD_VESTING_PERIOD > genesisEpoch
            ? currentEpoch - REWARD_VESTING_PERIOD + 1
            : genesisEpoch + 1;

        if (_userShares.length == 0)
        {
            return 0;
        }
        uint256 indUserShares = _userShares.length - 1;
        for (
                uint256 indEpoch = currentEpoch;
                indEpoch >= oldestLockedEpoch;
                indEpoch--
            )
        {
            Reward storage lockedReward = epochIndexToReward[indEpoch];
            if (lockedReward.atBlock != 0)
            {
                for (; indUserShares >= 0; indUserShares--)
                {
                    Checkpoint storage userShare = _userShares[indUserShares];
                    if (userShare.fromBlock <= lockedReward.atBlock)
                    {
                        locked += lockedReward.amount * userShare.value / lockedReward.totalSharesThen;
                        break;
                    }
                }
            }
        }
    }

    function getUser(address userAddress)
        external
        view
        override
        returns(
            uint256 unstaked,
            uint256 vesting,
            uint256 unstakeScheduledFor,
            uint256 unstakeAmount,
            uint256 mostRecentProposalTimestamp,
            uint256 mostRecentVoteTimestamp,
            uint256 mostRecentDelegationTimestamp,
            uint256 mostRecentUndelegationTimestamp
            )
    {
        User storage user = users[userAddress];
        unstaked = user.unstaked;
        vesting = user.vesting;
        unstakeScheduledFor = user.unstakeScheduledFor;
        unstakeAmount = user.unstakeAmount;
        mostRecentProposalTimestamp = user.mostRecentProposalTimestamp;
        mostRecentVoteTimestamp = user.mostRecentVoteTimestamp;
        mostRecentDelegationTimestamp = user.mostRecentDelegationTimestamp;
        mostRecentUndelegationTimestamp = user.mostRecentUndelegationTimestamp;
    }

    /// @notice Called to get the value of a checkpoint array at a specific
    /// block
    /// @param checkpoints Checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Value of the checkpoint array at the block
    function getValueAt(
        Checkpoint[] storage checkpoints,
        uint256 _block,
        uint256 minimumCheckpointIndex
        )
        internal
        view
        returns(uint256)
    {
        uint256 i = checkpoints.length;
        for (; i > minimumCheckpointIndex; i--)
        {
            if (checkpoints[i - 1].fromBlock <= _block)
            {
                return checkpoints[i - 1].value;
            }
        }
        // Revert if the value being searched for comes before
        // `minimumCheckpointIndex`
        require(i == 0, CHECKPOINT_NOT_FOUND);
        return 0;
    }

    /// @notice Called to get the value of the checkpoint array at a specific
    /// block
    /// @dev Adapted from
    /// https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// Allows the caller to specify the portion of the array that will be
    /// searched. This allows us to avoid having to search arrays that can grow
    /// unboundedly.
    /// @param checkpoints Checkpoint array
    /// @param _block Block number for which the query is being made
    /// @param minimumCheckpointIndex Index of the earliest checkpoint that may
    /// be keeping the value we are looking for
    /// @return Value of the checkpoint array at `_block`
    function getValueAtWithBinarySearch(
        Checkpoint[] storage checkpoints,
        uint256 _block,
        uint256 minimumCheckpointIndex
        )
        internal
        view
        returns(uint256)
    {
        if (checkpoints.length == 0)
            return 0;
        assert(checkpoints.length > minimumCheckpointIndex);

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length - 1].fromBlock) {
            return checkpoints[checkpoints.length - 1].value;
        }
        // Revert if the value being searched for comes before
        // `minimumCheckpointIndex`
        if (_block < checkpoints[minimumCheckpointIndex].fromBlock) {
            if (minimumCheckpointIndex == 0) {
                return 0;
            }
            else {
                revert(CHECKPOINT_NOT_FOUND);
            }
        }

        // Binary search of the value in the array
        uint min = minimumCheckpointIndex;
        uint max = checkpoints.length - 1;
        while (max > min) {
            uint mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
    }
}
