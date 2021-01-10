//SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "./IStakeUtils.sol";

interface IPoolUtils is IStakeUtils {
    event Pooled(
        address indexed userAddress,
        uint256 amount,
        uint256 amountInShares
    );

    event RequestedToUnpool(address indexed userAddress);

    event Unpooled(
        address indexed userAddress,
        uint256 amount,
        uint256 amountInShares
    );

    function pool(uint256 amount) external;

    function requestToUnpool() external;

    function unpool(uint256 amountInShares) external;
}
