//SPDX-License-Identifier: MIT
pragma solidity 0.4.24;

import "./Api3BaseTemplate.sol";

contract Api3Template is Api3BaseTemplate {
    string constant private ERROR_BAD_VOTE_SETTINGS = "API3_DAO_BAD_VOTE_SETTINGS";

    address private constant ANY_ENTITY = address(-1);

    event Api3DaoDeployed(
      address dao,
      address acl,
      address api3Pool,
      address mainVoting,
      address secondaryVoting,
      address mainAgent,
      address secondaryAgent
    );

    constructor(
      DAOFactory _daoFactory,
      ENS _ens,
      MiniMeTokenFactory _minimeTokenFactory,
      IFIFSResolvingRegistrar _aragonID
    )
    public
    Api3BaseTemplate(_daoFactory, _ens, _minimeTokenFactory, _aragonID)
    {
        _ensureAragonIdIsValid(_aragonID);
    }

    /**
    * @dev Deploy an authoritative DAO using the API3 Staking Pool
    * @param _id String with the name for org, will assign `[id].aragonid.eth`
    * @param _api3Pool Address of the API3 staking pool, supplies voting power
    * @param _mainVotingSettings Array of [supportRequired, minAcceptanceQuorum, voteDuration] to set up the voting app of the organization
    * @param _secondaryVotingSettings Array of [supportRequired, minAcceptanceQuorum, voteDuration] to set up the voting app of the organization
    * @param _permissionManager The administrator that's initially granted control over the DAO's permissions
    */
    function newInstance(
        string memory _id,
        MiniMeToken _api3Pool,
        uint64[3] memory _mainVotingSettings,
        uint64[3] memory _secondaryVotingSettings,
        address _permissionManager
    )
    public
    {
        require(_api3Pool != address(0), "Invalid API3 Voting Rights");

        _validateId(_id);
        _validateVotingSettings(_mainVotingSettings);
        _validateVotingSettings(_secondaryVotingSettings);

        (Kernel dao, ACL acl) = _createDAO();
        (Api3Voting mainVoting, Api3Voting secondaryVoting, Agent mainAgent, Agent secondaryAgent) = _setupApps(
            dao, acl, _api3Pool, _mainVotingSettings,_secondaryVotingSettings, _permissionManager
        );
        _transferRootPermissionsFromTemplateAndFinalizeDAO(dao, _permissionManager);
        _registerID(_id, dao);

        emit Api3DaoDeployed(
            address(dao),
            address(acl),
            address(_api3Pool),
            address(mainVoting),
            address(secondaryVoting),
            address(mainAgent),
            address(secondaryAgent)
        );
    }

    function _setupApps(
        Kernel _dao,
        ACL _acl,
        MiniMeToken _api3Pool,
        uint64[3] memory _mainVotingSettings,
        uint64[3] memory _secondaryVotingSettings,
        address _permissionManager
    )
    internal
    returns (Api3Voting, Api3Voting, Agent, Agent)
    {
        Agent mainAgent = _installDefaultAgentApp(_dao);
        Agent secondaryAgent = _installNonDefaultAgentApp(_dao);
        Api3Voting mainVoting = _installVotingApp(_dao, _api3Pool, _mainVotingSettings);
        Api3Voting secondaryVoting = _installVotingApp(_dao, _api3Pool, _secondaryVotingSettings);

        _setupPermissions(
            _acl,
            mainAgent,
            mainVoting,
            secondaryAgent,
            secondaryVoting,
            _permissionManager
        );

        return (mainVoting, secondaryVoting, mainAgent, secondaryAgent);
    }

    function _setupPermissions(
        ACL _acl,
        Agent _mainAgent,
        Api3Voting _mainVoting,
        Agent _secondaryAgent,
        Api3Voting _secondaryVoting,
        address _permissionManager
    )
    internal
    {
        _createAgentPermissions(_acl, _mainAgent, _mainVoting, _permissionManager);
        _createAgentPermissions(_acl, _secondaryAgent, _secondaryVoting, _permissionManager);
        _createVaultPermissions(_acl, Vault(_mainAgent), _mainVoting, _permissionManager);
        _createEvmScriptsRegistryPermissions(_acl, _permissionManager, _permissionManager);
        _createVotingPermissions(_acl, _mainVoting, _mainAgent, ANY_ENTITY, _permissionManager);
        _createVotingPermissions(_acl, _secondaryVoting, _mainAgent, ANY_ENTITY, _permissionManager);
    }

    function _validateVotingSettings(uint64[3] memory _votingSettings) private pure {
        require(_votingSettings.length == 3, ERROR_BAD_VOTE_SETTINGS);
    }
}
