/*global artifacts, web3, contract, before, assert*/
/*eslint no-undef: "error"*/

// const { APP_IDS } = require('@aragon/templates-shared/helpers/apps')
const { hash } = require('eth-ens-namehash');
const { assertRole } = require('@aragon/templates-shared/helpers/assertRole')(web3);
const { getEventArgument } = require('@aragon/test-helpers/events');
const { getENS, getTemplateAddress } = require('@aragon/templates-shared/lib/ens')(web3, artifacts);
const { getInstalledAppsById } = require('@aragon/templates-shared/helpers/events')(artifacts);

const ACL = artifacts.require('ACL');
const Kernel = artifacts.require('Kernel');
const Api3Voting = artifacts.require('Api3Voting');
const Api3Template = artifacts.require('Api3Template');
const Api3Pool = artifacts.require('Api3Pool');

contract('Api3Template', ([_, deployer, tokenAddress, authorized]) => { // eslint-disable-line no-unused-vars
  let api3Template, dao, acl, receipt1,receipt2, CREATE_VOTES_ROLE;

  const SUPPORT_1 = 80e16;
  const ACCEPTANCE_1 = 40e16;
  const VOTING_DURATION_1 = 100;

  const SUPPORT_2 = 50e16;
  const ACCEPTANCE_2 = 20e16;
  const VOTING_DURATION_2 = 60;

  before('fetch bare template', async () => {
    api3Template = Api3Template.at(await getTemplateAddress())
  });

  before('create bare entity', async () => {

    receipt1 = await api3Template.newInstance('api3-heavy', deployer, [SUPPORT_1, ACCEPTANCE_1, VOTING_DURATION_1], deployer, { from: deployer });
    receipt2 = await api3Template.newInstance('api3-light', deployer, [SUPPORT_2, ACCEPTANCE_2, VOTING_DURATION_2], deployer, { from: deployer });

    dao = Kernel.at(getEventArgument(receipt1, 'DeployDao', 'dao'));
    acl = ACL.at(await dao.acl());

    assert.equal(dao.address, getEventArgument(receipt1, 'SetupDao', 'dao'), 'should have emitted a SetupDao event')
  });

  it('sets up DAO and ACL permissions correctly', async () => {
    await assertRole(acl, dao, { address: deployer }, 'APP_MANAGER_ROLE');
    await assertRole(acl, acl, { address: deployer }, 'CREATE_PERMISSIONS_ROLE')
  });

  it('installs the requested application correctly', async () => {
    const ens = await getENS();
    let installedApps = getInstalledAppsById(receipt1);
    assert.equal(installedApps.voting.length, 1, 'should have installed 1 voting app');
    const voting_1 = Api3Voting.at(installedApps.voting[0]);
    installedApps = getInstalledAppsById(receipt2);
    assert.equal(installedApps.voting.length, 1, 'should have installed 1 voting app');
    const voting_2 = Api3Voting.at(installedApps.voting[0]);

    assert.isTrue(await voting_1.hasInitialized(), 'voting not initialized');
    assert.equal((await voting_1.voteTime()).toString(), VOTING_DURATION_1);
    assert.equal((await voting_1.supportRequiredPct()).toString(), SUPPORT_1);
    assert.equal((await voting_1.minAcceptQuorumPct()).toString(), ACCEPTANCE_1);

    assert.isTrue(await voting_2.hasInitialized(), 'voting not initialized');
    assert.equal((await voting_2.voteTime()).toString(), VOTING_DURATION_2);
    assert.equal((await voting_2.supportRequiredPct()).toString(), SUPPORT_2);
    assert.equal((await voting_2.minAcceptQuorumPct()).toString(), ACCEPTANCE_2);


    assert.equal((await voting_1.api3Pool()), (await voting_2.api3Pool()));

    await assertRole(acl, voting_1, { address: deployer }, 'CREATE_VOTES_ROLE', { address: authorized })

    const api3Pool = Api3Pool.new(await voting_1.api3Pool());
  })
});
