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
    address voting,
    address agent
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
  * @param _votingSettings Array of [supportRequired, minAcceptanceQuorum, voteDuration, minProposerPower] to set up the voting app of the organization
  * @param _permissionManager The administrator that's initially granted control over the DAO's permissions
  */
  function newInstance(
    string memory _id,
    MiniMeToken _api3Pool,
    uint64[3] memory _votingSettings,
    address _permissionManager
  )
  public
  {
    require(_api3Pool != address(0), "Invalid API3 Voting Rights");

    _validateId(_id);
    _validateVotingSettings(_votingSettings);

    (Kernel dao, ACL acl) = _createDAO();
    (Voting voting, Agent agent) = _setupApps(
      dao, acl, _api3Pool, _votingSettings, _permissionManager
    );
    _transferRootPermissionsFromTemplateAndFinalizeDAO(dao, _permissionManager);
    _registerID(_id, dao);

    emit Api3DaoDeployed(
      address(dao),
      address(acl),
      address(_api3Pool),
      address(voting),
      address(agent)
    );
  }

  function _setupApps(
    Kernel _dao,
    ACL _acl,
    MiniMeToken _api3Pool,
    uint64[3] memory _votingSettings,
    address _permissionManager
  )
  internal
  returns (Voting, Agent)
  {
    Agent agent = _installDefaultAgentApp(_dao);
    Voting voting = _installVotingApp(_dao, _api3Pool, _votingSettings);

    _setupPermissions(
      _acl,
      agent,
      voting,
      _permissionManager
    );

    return (voting, agent);
  }

  function _setupPermissions(
    ACL _acl,
    Agent _agent,
    Voting _voting,
    address _permissionManager
  )
  internal
  {
    _createAgentPermissions(_acl, _agent, _voting, _permissionManager);
    _createVaultPermissions(_acl, Vault(_agent), _voting, _permissionManager);
    _createEvmScriptsRegistryPermissions(_acl, _permissionManager, _permissionManager);
    _createVotingPermissions(_acl, _voting, _voting, ANY_ENTITY, _permissionManager);
  }

  function _validateVotingSettings(uint64[3] memory _votingSettings) private pure {
    require(_votingSettings.length == 3, ERROR_BAD_VOTE_SETTINGS);
  }
}
