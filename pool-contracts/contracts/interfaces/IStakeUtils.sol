//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IVestingUtils.sol";

interface IStakeUtils is IVestingUtils {
    event Staked(address indexed userAddress, uint256 amountInShares);

    event UpdatedDelegate(
        address indexed userAddress,
        address indexed delegate
    );

    event Collected(
        address indexed userAddress,
        uint256 vestedRewards,
        uint256 instantRewards
    );

    function stake(address userAddress) external;

    function updateDelegate(address delegate) external;

    function collect(address userAddress) external;
}
