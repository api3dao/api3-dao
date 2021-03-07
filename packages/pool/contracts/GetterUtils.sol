//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./StateUtils.sol";
import "./interfaces/IGetterUtils.sol";

/// @title Contract that implements getters
contract GetterUtils is StateUtils, IGetterUtils {
    /// @param api3TokenAddress API3 token contract address
    constructor(address api3TokenAddress)
        public
        StateUtils(api3TokenAddress)
    {}

    /// @notice Called to get the voting power of a user at a specific block
    /// @dev This method is used to implement the MiniMe interface for the
    /// Aragon Voting app
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Voting power of the user at the block
    function balanceOfAt(
        uint256 fromBlock,
        address userAddress
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
        return userSharesThen.add(delegatedToUserThen);
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
        return balanceOfAt(block.number, userAddress);
    }

    /// @notice Called to get the total voting power at a specific block
    /// @dev This method is used to implement the MiniMe interface for the
    /// Aragon Voting app
    /// @param fromBlock Block number for which the query is being made for
    /// @return Total voting power at the block
    function totalSupplyAt(uint256 fromBlock)
        public
        view
        override
        returns(uint256)
    {
        return getValueAt(totalShares, fromBlock);
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
        return totalSupplyAt(block.number);
    }

    /// @notice Called to get the total staked tokens at a specific block
    /// @param fromBlock Block number for which the query is being made for
    /// @return Total staked tokens at the block
    function totalStakeAt(uint256 fromBlock)
        public
        view
        override
        returns(uint256)
    {
        return getValueAt(totalStaked, fromBlock);
    }

    /// @notice Called to get the current total staked tokens
    /// @return Current total staked tokens
    function totalStake()
        public
        view
        override
        returns(uint256)
    {
        return totalStakeAt(block.number);
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
        return getValueAt(users[userAddress].shares, fromBlock);
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

    /// @notice Called to get the staked tokens of the user at a specific block
    /// @param fromBlock Block number for which the query is being made for
    /// @param userAddress User address
    /// @return Staked tokens of the user at the block
    function userStakeAt(
        uint256 fromBlock,
        address userAddress
        )
        public
        view
        override
        returns(uint256)
    {
        return userSharesAt(fromBlock, userAddress).mul(totalStakeAt(fromBlock)).div(totalSupplyAt(fromBlock));
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
        return userStakeAt(block.number, userAddress);
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
        return getValueAt(users[userAddress].delegatedTo, fromBlock);
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
    /// @param _block Block number
    /// @param userAddress User address
    /// @return Delegate of the user at the specific block
    function userDelegateAt(
        uint256 _block,
        address userAddress
        )
        public
        view
        override
        returns(address)
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
        returns(address)
    {
        return userDelegateAt(block.number, userAddress);
    }

    /// @notice Called to get the value of a checkpoint array at a specific
    /// block
    /// @dev From 
    /// https://github.com/aragon/minime/blob/1d5251fc88eee5024ff318d95bc9f4c5de130430/contracts/MiniMeToken.sol#L431
    /// @param checkpoints Checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Value of the checkpoint array at the block
    function getValueAt(
        Checkpoint[] storage checkpoints,
        uint _block
        )
        internal
        view
        returns(uint)
    {
        if (checkpoints.length == 0)
            return 0;

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock)
            return checkpoints[checkpoints.length.sub(1)].value;
        if (_block < checkpoints[0].fromBlock)
            return 0;

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length.sub(1);
        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }
        return checkpoints[min].value;
    }

    /// @notice Called to get the current value of the checkpoint array
    /// @param checkpoints Checkpoints array
    /// @return Current value of the checkpoint array
    function getValue(Checkpoint[] storage checkpoints)
        internal
        view
        returns (uint256)
    {
        return getValueAt(checkpoints, block.number);
    }

    /// @notice Called to get the value of an address checkpoint array at a
    /// specific block
    /// @dev This is same as `getValueAt()`, except the value being kept in the
    /// checkpoints is an address
    /// @param checkpoints Address checkpoints array
    /// @param _block Block number for which the query is being made
    /// @return Address value of the checkpoint array at the block
    function getAddressAt(
        AddressCheckpoint[] storage checkpoints,
        uint _block
        )
        internal
        view
        returns(address)
    {
        if (checkpoints.length == 0)
            return address(0);

        // Shortcut for the actual value
        if (_block >= checkpoints[checkpoints.length.sub(1)].fromBlock)
            return checkpoints[checkpoints.length.sub(1)]._address;
        if (_block < checkpoints[0].fromBlock)
            return address(0);

        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length.sub(1);
        while (max > min) {
            uint mid = (max.add(min).add(1)).div(2);
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid.sub(1);
            }
        }
        return checkpoints[min]._address;
    }

    /// @notice Called to get the current value of an address checkpoint array
    /// @param checkpoints Address checkpoints array
    /// @return Current address value of the checkpoint array
    function getAddress(AddressCheckpoint[] storage checkpoints)
        internal
        view
        returns(address)
    {
        return getAddressAt(checkpoints, block.number);
    }
}
