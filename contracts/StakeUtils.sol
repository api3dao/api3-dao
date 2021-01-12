//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./TransferUtils.sol";


contract StakeUtils is TransferUtils {
    constructor(address api3TokenAddress)
        TransferUtils(api3TokenAddress)
        public
    {}
    
    function stake(uint256 amount)
        external
    {
        // We have to update user state because we need the current `shares`
        updateUserState(msg.sender, block.number);
        require(users[msg.sender].unstaked >= amount);
        users[msg.sender].unstaked -= amount;
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 sharesToMint = totalSharesNow * amount / totalStakedNow;
        uint256 userSharesNow = users[msg.sender].shares[users[msg.sender].shares.length - 1].value;
        users[msg.sender].shares.push(Checkpoint(block.number, userSharesNow + sharesToMint));
        totalShares.push(Checkpoint(block.number, totalSharesNow + sharesToMint));
    }

    function unstake(uint256 amount)
        external
    {
        // We have to update user state because we need the current `shares`
        updateUserState(msg.sender, block.number);
        uint256 totalSharesNow = totalShares[totalShares.length - 1].value;
        uint256 totalStakedNow = totalStaked[totalStaked.length - 1].value;
        uint256 userSharesNow = users[msg.sender].shares[users[msg.sender].shares.length - 1].value;
        uint256 sharesToBurn = totalSharesNow * amount / totalStakedNow;
        require(userSharesNow >= sharesToBurn);
        users[msg.sender].unstaked += amount;
        users[msg.sender].shares.push(Checkpoint(block.number, userSharesNow - sharesToBurn));
        totalShares.push(Checkpoint(block.number, totalSharesNow - sharesToBurn));
    }
}