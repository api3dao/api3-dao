const { assert } = require('chai')

const { getEventArgument } = require('@aragon/test-helpers/events')
const { assertRole, assertMissingRole, assertRoleNotGranted } = require('@aragon/templates-shared/helpers/assertRole')(web3)

const { getENS, getTemplateAddress } = require('../scripts/lib/ens')(web3, artifacts)
const { getInstalledAppsById } = require('../scripts/helpers/events')(artifacts)
const { newLidEnv } = require('../scripts/new-lid-env')
const { APP_IDS } = require('../scripts/helpers/apps')
const time = require('../scripts/helpers/time')(web3)

const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const EVMScriptRegistry = artifacts.require('EVMScriptRegistry')
const Agent = artifacts.require('Agent')
const Voting = artifacts.require('Voting')
const LidDaoTemplate = artifacts.require('LidDaoTemplate')

contract('LidDaoTemplate', (accounts) => {
  let ens, template, lidVotingRight, admin

  before('fetch LidDaoTemplate and ENS', async () => {
    ens = await getENS()
    template = LidDaoTemplate.at(await getTemplateAddress())
    lidVotingRight = await newLidEnv(web3, accounts)
    admin = accounts[0]
  });

  it('Create new instance', async () => {

    const receipt = await template.newInstance(
      "lid",
      lidVotingRight.options.address,
      [50e16 /*50%*/, 5e16 /*5%*/, time.duration.days(2).toNumber()],
      admin
    )
    const dao = Kernel.at(getEventArgument(receipt, 'DeployDao', 'dao'))
    const acl = ACL.at(await dao.acl())

    assert.equal(
      dao.address,
      getEventArgument(receipt, 'SetupDao', 'dao'),
      'should have emitted a SetupDao event'
    )

    // Lets check apps!
    const apps = getInstalledAppsById(receipt);
    assert.equal(apps.agent.length, 1, 'show have installed agent app')
    const agent = Agent.at(apps.agent[0])
    assert.equal(apps.voting.length, 1, 'show have installed voting app')
    const voting = Voting.at(apps.voting[0])

    // Voting app correctly set up
    assert.isTrue(await voting.hasInitialized(), 'voting not initialized')
    assert.equal((await voting.supportRequiredPct()).toString(), 50e16)
    assert.equal((await voting.minAcceptQuorumPct()).toString(), 5e16)
    assert.equal((await voting.voteTime()).toString(), time.duration.days(2))

    // Agent app correctly set up
    assert.isTrue(await agent.hasInitialized(), 'agent not initialized')
    assert.equal(await agent.designatedSigner(), '0x'.padEnd(42, '0'))
    assert.equal(await dao.recoveryVaultAppId(), APP_IDS.agent, 'agent app is not being used as the vault app of the DAO')
    assert.equal(web3.toChecksumAddress(await dao.getRecoveryVault()), agent.address, 'agent app is not being used as the vault app of the DAO')
    await assertMissingRole(acl, agent, 'DESIGNATE_SIGNER_ROLE')
    await assertMissingRole(acl, agent, 'ADD_PRESIGNED_HASH_ROLE')

    // Only the admin can manage apps
    await assertRoleNotGranted(acl, dao, 'APP_MANAGER_ROLE', template)
    await assertRole(acl, dao, { address: admin }, 'APP_MANAGER_ROLE')

    // Only the admin can create permissions
    await assertRoleNotGranted(acl, acl, 'CREATE_PERMISSIONS_ROLE', template)
    await assertRoleNotGranted(acl, acl, 'CREATE_PERMISSIONS_ROLE', voting)
    await assertRole(acl, acl, { address: admin }, 'CREATE_PERMISSIONS_ROLE')

    // Only the admin can manager and add EVM scripts
    const reg = await EVMScriptRegistry.at(await acl.getEVMScriptRegistry()) 
    await assertRole(acl, reg, { address: admin }, 'REGISTRY_ADD_EXECUTOR_ROLE')
    await assertRole(acl, reg, { address: admin }, 'REGISTRY_MANAGER_ROLE')

    // Voting can execute all actions on agent
    await assertRole(acl, agent, { address: admin }, 'EXECUTE_ROLE', voting)
    await assertRole(acl, agent, { address: admin }, 'RUN_SCRIPT_ROLE', voting)

    // The voting app can modify voting configurations
    await assertRole(acl, voting, { address: admin }, 'MODIFY_SUPPORT_ROLE', voting)
    await assertRole(acl, voting, { address: admin }, 'MODIFY_QUORUM_ROLE', voting)
  });
});
