//SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import "./IStateUtils.sol";

interface IGetterUtils is IStateUtils {
    function userVotingPowerAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(uint256);

    function userVotingPower(address userAddress)
        external
        view
        returns(uint256);

    function totalVotingPowerOneBlockAgo()
        external
        view
        returns(uint256);

    function totalVotingPower()
        external
        view
        returns(uint256);

    function userSharesAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(uint256);

    function userShares(address userAddress)
        external
        view
        returns(uint256);

    function userStake(address userAddress)
        external
        view
        returns(uint256);

    function delegatedToUserAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(uint256);

    function delegatedToUser(address userAddress)
        external
        view
        returns(uint256);

    function userDelegateAt(
        address userAddress,
        uint256 _block
        )
        external
        view
        returns(address);

    function userDelegate(address userAddress)
        external
        view
        returns(address);

    function userLocked(address userAddress)
        external
        view
        returns(uint256);

    function getUser(address userAddress)
        external
        view
        returns(
            uint256 unstaked,
            uint256 vesting,
            uint256 lastDelegationUpdateTimestamp,
            uint256 unstakeScheduledFor,
            uint256 unstakeAmount,
            uint256 mostRecentProposalTimestamp
            );
}
