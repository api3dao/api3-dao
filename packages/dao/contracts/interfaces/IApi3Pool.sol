//SPDX-License-Identifier: MIT
pragma solidity 0.4.24;

interface IApi3Pool {
    function EPOCH_LENGTH()
        external
        view
        returns(uint256);

    function proposalVotingPowerThreshold()
        external
        view
        returns(uint256);

    function balanceOfAt(
        uint256 fromBlock,
        address userAddress
        )
        external
        view
        returns(uint256);
}
