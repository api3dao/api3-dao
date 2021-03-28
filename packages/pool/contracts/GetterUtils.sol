//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./StateUtils.sol";
import "./interfaces/IGetterUtils.sol";

/// @title Contract that implements getters
contract GetterUtils is StateUtils, IGetterUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        StateUtils(api3TokenAddress)
    {}

    /// @notice Called to get the voting power of a user at a specific block
    /// @dev This method is used to implement the MiniMe interface for the
    /// Aragon Voting app
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Voting power of the user at the block
    function balanceOfAt(
        address userAddress,
        uint256 fromBlock
        )
        public
        view
        override
        returns(uint256)
    {
        // Users that delegate have no voting power
        if (userDelegateAt(fromBlock, userAddress) != address(0))
        {
            return 0;
        }
        uint256 userSharesThen = userSharesAt(fromBlock, userAddress);
        uint256 delegatedToUserThen = userReceivedDelegationAt(fromBlock, userAddress);
        return userSharesThen + delegatedToUserThen;
    }

    /// @notice Called to get the current voting power of a user
    /// @dev This method is used to implement the MiniMe interface for the
    /// Aragon Voting app
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
    /// Aragon Voting app
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
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Pool shares of the user at the block
    function userSharesAt(
        uint256 fromBlock,
        address userAddress
        )
        public
        view
        override
        returns(uint256)
    {
        return getValueAt(users[userAddress].shares, fromBlock, 0);
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
        return userSharesAt(block.number, userAddress);
    }

    /// @notice Called to get the pool shares of a user at a specific block
    /// using binary search
    /// @dev From 
    /// https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// This method is not used by the current iteration of the DAO/pool and is
    /// implemented for future external contracts to use to get the user shares
    /// at an arbitrary block.
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Pool shares of the user at the block
    function userSharesAtWithBinarySearch(
        address userAddress,
        uint256 fromBlock
        )
        external
        view
        override
        returns(uint256)
    {
        Checkpoint[] storage checkpoints = users[userAddress].shares;
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (fromBlock >= checkpoints[checkpoints.length -1].fromBlock)
            return checkpoints[checkpoints.length - 1].value;
        if (fromBlock < checkpoints[0].fromBlock)
            return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length - 1;
        while (max > min) {
            uint mid = (max + min + 1) / 2;
            if (checkpoints[mid].fromBlock <= fromBlock) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
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
        return userShares(userAddress) * totalStake / totalSupply();
    }

    /// @notice Called to get the voting power delegated to a user at a
    /// specific block
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Voting power delegated to the user at the block
    function userReceivedDelegationAt(
        uint256 fromBlock,
        address userAddress
        )
        public
        view
        override
        returns(uint256)
    {
        Checkpoint[] storage delegatedTo = users[userAddress].delegatedTo;
        uint256 minimumCheckpointIndex = delegatedTo.length > MAX_INTERACTION_FREQUENCY
            ? delegatedTo.length - MAX_INTERACTION_FREQUENCY
            : 0;
        return getValueAt(delegatedTo, fromBlock, minimumCheckpointIndex);
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
        return userReceivedDelegationAt(block.number, userAddress);
    }

    /// @notice Called to get the delegate of the user at a specific block
    /// @param fromBlock Block number
    /// @param userAddress User address
    /// @return Delegate of the user at the specific block
    function userDelegateAt(
        uint256 fromBlock,
        address userAddress
        )
        public
        view
        override
        returns(address)
    {
        AddressCheckpoint[] storage delegates = users[userAddress].delegates;
        if (delegates.length == 0)
        {
            return address(0);
        }
        uint256 oldestCheckpointIndex = delegates.length > MAX_INTERACTION_FREQUENCY
            ? delegates.length - MAX_INTERACTION_FREQUENCY
            : 0;
        for (
            uint256 i = delegates.length;
            i > oldestCheckpointIndex;
            i--
            )
        {
            if (delegates[i - 1].fromBlock <= fromBlock)
            {
                return delegates[i - 1]._address;
            }
        }
        return address(0);
    }

    /// @notice Called to get the current delegate of the user
    /// @param userAddress User address
    /// @return Current delegate of the user
    function userDelegate(address userAddress)
        public
        view
        override
        returns(address)
    {
        return userDelegateAt(block.number, userAddress);
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
        if (checkpoints.length == 0)
        {
            return 0;
        }
        for (
            uint256 i = checkpoints.length;
            i > minimumCheckpointIndex;
            i--
            )
        {
            if (checkpoints[i - 1].fromBlock <= _block)
            {
                return checkpoints[i - 1].value;
            }
        }
        return 0;
    }

    /// @notice Called to get the current value of the checkpoint array
    /// @param checkpoints Checkpoints array
    /// @return Current value of the checkpoint array
    function getValue(Checkpoint[] storage checkpoints)
        internal
        view
        returns (uint256)
    {
        return getValueAt(checkpoints, block.number, 0);
    }
}
