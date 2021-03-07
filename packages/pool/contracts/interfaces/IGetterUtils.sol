//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./IStateUtils.sol";

interface IGetterUtils is IStateUtils {
    function balanceOfAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256);

    function balanceOf(address userAddress)
        external
        view
        returns(uint256);

    function totalSupplyAt(uint256 fromBlock)
        external
        view
        returns(uint256);

    function totalSupply()
        external
        view
        returns(uint256);

    function totalStakeAt(uint256 fromBlock)
        external
        view
        returns(uint256);

    function totalStake()
        external
        view
        returns(uint256);

    function userSharesAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256);

    function userShares(address userAddress)
        external
        view
        returns(uint256);

    function userStakeAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256);

    function userStake(address userAddress)
        external
        view
        returns(uint256);

    function userReceivedDelegationAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256);

    function userReceivedDelegation(address userAddress)
        external
        view
        returns(uint256);

    function userDelegateAt(
        uint256 _block,
        address userAddress
        )
        external
        view
        returns(address);

    function userDelegate(address userAddress)
        external
        view
        returns(address);
}
