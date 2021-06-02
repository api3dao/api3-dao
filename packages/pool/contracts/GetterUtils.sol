//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./StateUtils.sol";
import "./interfaces/IGetterUtils.sol";

/// @title Contract that implements getters
abstract contract GetterUtils is StateUtils, IGetterUtils {
    /// @notice Called to get the voting power of a user at a specific block
    /// @param userAddress User address
    /// @param _block Block number for which the query is being made for
    /// @return Voting power of the user at the block
    function userVotingPowerAt(
        address userAddress,
        uint256 _block
        )
        public
        view
        override
        returns (uint256)
    {
        // Users that delegate have no voting power
        if (userDelegateAt(userAddress, _block) != address(0))
        {
            return 0;
        }
        return userSharesAt(userAddress, _block)
            + userReceivedDelegationAt(userAddress, _block);
    }

    /// @notice Called to get the current voting power of a user
    /// @param userAddress User address
    /// @return Current voting power of the user
    function userVotingPower(address userAddress)
        external
        view
        override
        returns (uint256)
    {
        return userVotingPowerAt(userAddress, block.number);
    }

    /// @notice Called to get the total voting power one block ago
    /// @dev This method is meant to be used by the API3 DAO's Api3Voting apps
    /// to get the total voting power at vote creation-time
    /// @return Total voting power one block ago
    function totalVotingPowerOneBlockAgo()
        external
        view
        override
        returns (uint256)
    {
        return totalSharesOneBlockAgo();
    }

    /// @notice Called to get the current total voting power
    /// @return Current total voting power
    function totalVotingPower()
        external
        view
        override
        returns (uint256)
    {
        return totalShares();
    }

    /// @notice Called to get the pool shares of a user at a specific block
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
        returns (uint256)
    {
        return getValueAt(users[userAddress].shares, _block);
    }

    /// @notice Called to get the current pool shares of a user
    /// @param userAddress User address
    /// @return Current pool shares of the user
    function userShares(address userAddress)
        public
        view
        override
        returns (uint256)
    {
        return userSharesAt(userAddress, block.number);
    }

    /// @notice Called to get the current staked tokens of the user
    /// @param userAddress User address
    /// @return Current staked tokens of the user
    function userStake(address userAddress)
        public
        view
        override
        returns (uint256)
    {
        return (userShares(userAddress) * totalStake) / totalShares();
    }

    /// @notice Called to get the voting power delegated to a user at a
    /// specific block
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
        returns (uint256)
    {
        return getValueAt(users[userAddress].delegatedTo, _block);
    }

    /// @notice Called to get the current voting power delegated to a user
    /// @param userAddress User address
    /// @return Current voting power delegated to the user
    function userReceivedDelegation(address userAddress)
        public
        view
        override
        returns (uint256)
    {
        return userReceivedDelegationAt(userAddress, block.number);
    }

    /// @notice Called to get the delegate of the user at a specific block
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
        returns (address)
    {
        return getAddressAt(users[userAddress].delegates, _block);
    }

    /// @notice Called to get the current delegate of the user
    /// @param userAddress User address
    /// @return Current delegate of the user
    function userDelegate(address userAddress)
        public
        view
        override
        returns (address)
    {
        return userDelegateAt(userAddress, block.number);
    }

    /// @notice Called to get the current locked tokens of the user
    /// @param userAddress User address
    /// @return locked Current locked tokens of the user
    function userLocked(address userAddress)
        public
        view
        override
        returns (uint256 locked)
    {
        Checkpoint[] storage _userShares = users[userAddress].shares;
        uint256 currentEpoch = block.timestamp / EPOCH_LENGTH;
        uint256 oldestLockedEpoch =
            currentEpoch - REWARD_VESTING_PERIOD > genesisEpoch
                ? currentEpoch - REWARD_VESTING_PERIOD + 1
                : genesisEpoch + 1;

        if (_userShares.length == 0) {
            return 0;
        }
        uint256 indUserShares = _userShares.length - 1;
        for (
            uint256 indEpoch = currentEpoch;
            indEpoch >= oldestLockedEpoch;
            indEpoch--
        ) {
            Reward storage lockedReward = epochIndexToReward[indEpoch];
            if (lockedReward.atBlock != 0) {
                for (; indUserShares >= 0; indUserShares--) {
                    Checkpoint storage userShare = _userShares[indUserShares];
                    if (userShare.fromBlock <= lockedReward.atBlock) {
                        locked +=
                            (lockedReward.amount * userShare.value) /
                            lockedReward.totalSharesThen;
                        break;
                    }
                }
            }
        }
    }

    /// @notice Called to get the details of a user
    /// @param userAddress User address
    /// @return unstaked Amount of unstaked API3 tokens
    /// @return vesting Amount of API3 tokens locked by vesting
    /// @return lastDelegationUpdateTimestamp Time of most recent delegation
    /// update
    /// @return unstakeScheduledFor Time unstaking is scheduled for
    /// @return unstakeAmount Amount scheduled to unstake
    /// @return mostRecentProposalTimestamp Time when the user made their most
    /// recent proposal
    function getUser(address userAddress)
        external
        view
        override
        returns (
            uint256 unstaked,
            uint256 vesting,
            uint256 lastDelegationUpdateTimestamp,
            uint256 unstakeScheduledFor,
            uint256 unstakeAmount,
            uint256 mostRecentProposalTimestamp
        )
    {
        User storage user = users[userAddress];
        unstaked = user.unstaked;
        vesting = user.vesting;
        lastDelegationUpdateTimestamp = user.lastDelegationUpdateTimestamp;
        unstakeScheduledFor = user.unstakeScheduledFor;
        unstakeAmount = user.unstakeAmount;
        mostRecentProposalTimestamp = user.mostRecentProposalTimestamp;
    }

    /// @notice Called to get the value of a checkpoint array at a specific
    /// block using binary search
    /// @dev Adapted from
    /// https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// @param checkpoints Checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Value of the checkpoint array at the block
    function getValueAt(
        Checkpoint[] storage checkpoints,
        uint256 _block
        )
        internal
        view
        returns (uint256)
    {
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length - 1].fromBlock)
            return checkpoints[checkpoints.length - 1].value;
        if (_block < checkpoints[0].fromBlock)
            return 0;

        // Limit the search to the last 1024 elements if the value being
        // searched falls within that window
        uint256 min;
        if (
            checkpoints.length > 1024 &&
            checkpoints[checkpoints.length - 1024].fromBlock < _block
            ) {
            min = checkpoints.length - 1024;
        } else {
            min = 0;
        }

        // Binary search of the value in the array
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
    }

    /// @notice Called to get the value of an address-checkpoint array at a
    /// specific block using binary search
    /// @dev Adapted from
    /// https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// @param checkpoints Address-checkpoint array
    /// @param _block Block number for which the query is being made
    /// @return Value of the address-checkpoint array at the block
    function getAddressAt(
        AddressCheckpoint[] storage checkpoints,
        uint256 _block
        )
        private
        view
        returns (address)
    {
        if (checkpoints.length == 0)
            return address(0);

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length - 1].fromBlock)
            return checkpoints[checkpoints.length - 1]._address;
        if (_block < checkpoints[0].fromBlock) return address(0);

        // Limit the search to the last 1024 elements if the value being
        // searched falls within that window
        uint256 min;
        if (
            checkpoints.length > 1024 &&
            checkpoints[checkpoints.length - 1024].fromBlock < _block
        ) {
            min = checkpoints.length - 1024;
        } else {
            min = 0;
        }

        // Binary search of the value in the array
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min]._address;
    }
}
