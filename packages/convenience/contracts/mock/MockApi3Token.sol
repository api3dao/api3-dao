pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockApi3Token is ERC20 {
    constructor(
        string memory name,
        string memory symbol
        )
        public
        ERC20(name, symbol)
    {
        _mint(msg.sender, 100e6 ether);
    }

    function getMinterStatus(address minterAddress)
        external
        view
        returns (bool)
    {
        return false;
    }
}
