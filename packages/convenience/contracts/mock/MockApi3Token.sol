pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/// @title API3 token contract
/// @notice The API3 token contract is owned by the API3 DAO, which can grant
/// minting privileges to addresses. Any account is allowed to burn their 
/// tokens, but this functionality is put behind a barrier that requires the
/// account to make a call to remove.
contract MockApi3Token is ERC20, Ownable {
    /// @dev If an address is authorized to mint tokens.
    /// Token minting authorization is granted by the token contract owner
    /// (i.e., the API3 DAO).
    mapping(address => bool) private isMinter;
    /// @dev If an address is authorized to burn tokens.
    /// Token burning authorization is granted by the address itself, i.e.,
    /// anyone can declare themselves a token burner.
    mapping(address => bool) private isBurner;

    /// @param contractOwner Address that will receive the ownership of the
    /// token contract
    /// @param mintingDestination Address that the tokens will be minted to
    constructor(
        address contractOwner,
        address mintingDestination
        )
        public
        ERC20("API3", "API3")
        {
            transferOwnership(contractOwner);
            // Initial supply is 100 million (100e6)
            // We are using ether because the token has 18 decimals like ETH
            _mint(mintingDestination, 100e6 ether);
        }

    /// @notice The OpenZeppelin renounceOwnership() implementation is
    /// overriden to prevent ownership from being renounced accidentally.
    function renounceOwnership()
        public
        override
        onlyOwner
    {
        revert("Ownership cannot be renounced");
    }

    /// @notice Updates if an address is authorized to mint tokens
    /// @param minterAddress Address whose minter authorization status will be
    /// updated
    /// @param minterStatus Updated minter authorization status
    function updateMinterStatus(
        address minterAddress,
        bool minterStatus
        )
        external
        onlyOwner
    {
        require(
            isMinter[minterAddress] != minterStatus,
            "Input will not update state"
            );
        isMinter[minterAddress] = minterStatus;
    }

    /// @notice Updates if the caller is authorized to burn tokens
    /// @param burnerStatus Updated minter authorization status
    function updateBurnerStatus(bool burnerStatus)
        external
    {
        require(
            isBurner[msg.sender] != burnerStatus,
            "Input will not update state"
            );
        isBurner[msg.sender] = burnerStatus;
    }

    /// @notice Mints tokens
    /// @param account Address that will receive the minted tokens
    /// @param amount Amount that will be minted
    function mint(
        address account,
        uint256 amount
        )
        external
    {
        require(isMinter[msg.sender], "Only minters are allowed to mint");
        _mint(account, amount);
    }

    /// @notice Burns caller's tokens
    /// @param amount Amount that will be burned
    function burn(uint256 amount)
        external
    {
        require(isBurner[msg.sender], "Only burners are allowed to burn");
        _burn(msg.sender, amount);
    }

    /// @notice Returns if an address is authorized to mint tokens
    /// @param minterAddress Address whose minter authorization status will be
    /// returned
    /// @return minterStatus Minter authorization status
    function getMinterStatus(address minterAddress)
        external
        view
        returns(bool minterStatus)
    {
        return false;
    }

    /// @notice Returns if an address is authorized to burn tokens
    /// @param burnerAddress Address whose burner authorization status will be
    /// returned
    /// @return burnerStatus Burner authorization status
    function getBurnerStatus(address burnerAddress)
        external
        view
        returns(bool burnerStatus)
    {
        return false;
    }
}