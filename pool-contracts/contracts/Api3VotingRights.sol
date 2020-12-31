pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";
import "./interfaces/IGetterUtils.sol";
import "./interfaces/IApi3Token.sol";

/// @dev this contract is a fork of LidVotingRights from the LID DAO
/// @dev I believe voting rights will be based on the API3 token, not a reputation token
/// @dev In that case, this wouldn't need to be an ERC20
/// @dev Also, we haven't started development yet so the API3 DAO architecture can still change
/// @dev TODO: rewrite contract functions for API3 DAO needs
/// @dev TODO: refer to other proxies instead of interfaces
contract Api3VotingRights is Initializable, IERC20 {
    IGetterUtils public getterUtils;
    IApi3Token public api3Token;

    function initialize(IGetterUtils _getterUtils, IApi3Token _api3Token)
        external
        initializer
    {
        getterUtils = _getterUtils;
        api3Token = _api3Token;
    }

    function name() public view returns (string memory) {
        return "API3 Voting Rights";
    }

    function symbol() public view returns (string memory) {
        return "API3-VR";
    }

    function decimals() public view returns (uint8) {
        return api3Token.decimals();
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return
            getterUtils.getStaked(_owner, getterUtils.getCurrentEpochIndex());
    }

    function totalSupply() public view returns (uint256) {
        return getterUtils.getTotalStaked(getterUtils.getCurrentEpochIndex());
    }

    function balanceOfAt(address _owner, uint256 _timeStamp)
        public
        view
        returns (uint256)
    {
        return
            getterUtils.getStaked(
                _owner,
                getterUtils.getEpochIndex(_timeStamp)
            );
    }

    function totalSupplyAt(uint256 _timeStamp) public view returns (uint256) {
        return
            getterUtils.getTotalStaked(getterUtils.getEpochIndex(_timeStamp));
    }
}
