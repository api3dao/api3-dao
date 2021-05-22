/*global artifacts, web3, contract, before, assert*/
/*eslint no-undef: "error"*/
const { hash: namehash } = require("eth-ens-namehash");

// const { APP_IDS } = require('@aragon/templates-shared/helpers/apps')
const {
  assertRole,
  assertMissingRole,
} = require("@aragon/templates-shared/helpers/assertRole")(web3);
const { getEventArgument } = require("@aragon/test-helpers/events");
const { getTemplateAddress } = require("@aragon/templates-shared/lib/ens")(
  web3,
  artifacts
);
const {
  getInstalledAppsById,
  getInstalledApps,
} = require("@aragon/templates-shared/helpers/events")(artifacts);

const ACL = artifacts.require("ACL");
const Kernel = artifacts.require("Kernel");
const Api3Voting = artifacts.require("Api3Voting");
const Api3Template = artifacts.require("Api3Template");
const Api3Pool = artifacts.require("Api3Pool");
const Agent = artifacts.require("Agent");

contract("Api3Template", ([, deployer, tokenAddress, authorized]) => {
  // eslint-disable-line no-unused-vars
  let api3Template, dao, acl, receipt1, api3Pool;

  const SUPPORT_1 = 80e16;
  const ACCEPTANCE_1 = 40e16;
  const VOTING_DURATION_1 = 60 * 60 * 24 * 7;

  const SUPPORT_2 = 50e16;
  const ACCEPTANCE_2 = 20e16;
  const VOTING_DURATION_2 = 60 * 60 * 24 * 7;

  before("fetch bare template", async () => {
    api3Template = Api3Template.at(await getTemplateAddress());
  });

  before("create bare entity", async () => {
    api3Pool = await Api3Pool.new(tokenAddress);
    receipt1 = await api3Template.newInstance(
      "api3template_test",
      api3Pool.address,
      [SUPPORT_1, ACCEPTANCE_1, VOTING_DURATION_1],
      [SUPPORT_2, ACCEPTANCE_2, VOTING_DURATION_2],
      { from: deployer }
    );

    console.log("even here");
    dao = Kernel.at(getEventArgument(receipt1, "DeployDao", "dao"));
    acl = ACL.at(await dao.acl());

    assert.equal(
      dao.address,
      getEventArgument(receipt1, "SetupDao", "dao"),
      "should have emitted a SetupDao event"
    );
  });

  it("installs the requested application correctly", async () => {
    const installedApps = getInstalledAppsById(receipt1);
    const votingApps = getInstalledApps(
      receipt1,
      namehash("api3voting.aragonpm.eth")
    );
    assert.equal(votingApps.length, 2, "should have installed 2 voting apps");
    assert.equal(
      installedApps.agent.length,
      2,
      "should have installed 2 agent apps"
    );
    const votingMain = Api3Voting.at(votingApps[0]);
    const votingSecondary = Api3Voting.at(votingApps[1]);
    const agentMain = Agent.at(installedApps.agent[0]);
    const agentSecondary = Agent.at(installedApps.agent[1]);

    await assertRole(
      acl,
      dao,
      { address: votingMain.address },
      "APP_MANAGER_ROLE"
    );
    await assertRole(
      acl,
      acl,
      { address: votingMain.address },
      "CREATE_PERMISSIONS_ROLE"
    );

    assert.isTrue(await votingMain.hasInitialized(), "voting not initialized");
    assert.equal((await votingMain.voteTime()).toString(), VOTING_DURATION_1);
    assert.equal((await votingMain.supportRequiredPct()).toString(), SUPPORT_1);
    assert.equal(
      (await votingMain.minAcceptQuorumPct()).toString(),
      ACCEPTANCE_1
    );

    assert.isTrue(
      await votingSecondary.hasInitialized(),
      "voting not initialized"
    );
    assert.equal(
      (await votingSecondary.voteTime()).toString(),
      VOTING_DURATION_2
    );
    assert.equal(
      (await votingSecondary.supportRequiredPct()).toString(),
      SUPPORT_2
    );
    assert.equal(
      (await votingSecondary.minAcceptQuorumPct()).toString(),
      ACCEPTANCE_2
    );

    assert.equal(await votingMain.api3Pool(), api3Pool.address);

    assert.isTrue(
      await agentMain.hasInitialized(),
      "Main agent not initialized"
    );
    assert.isTrue(
      await agentSecondary.hasInitialized(),
      "Secondary agent not initialized"
    );
    assert.equal(await agentMain.designatedSigner(), "0x".padEnd(42, "0"));
    assert.equal(await agentSecondary.designatedSigner(), "0x".padEnd(42, "0"));
    await assertMissingRole(acl, agentMain, "DESIGNATE_SIGNER_ROLE");
    await assertMissingRole(acl, agentMain, "ADD_PRESIGNED_HASH_ROLE");
    await assertMissingRole(acl, agentSecondary, "DESIGNATE_SIGNER_ROLE");
    await assertMissingRole(acl, agentSecondary, "ADD_PRESIGNED_HASH_ROLE");

    // The main agent app can modify voting configurations
    await assertRole(
      acl,
      votingMain,
      { address: votingMain.address },
      "MODIFY_SUPPORT_ROLE",
      { address: agentMain.address }
    );
    await assertRole(
      acl,
      votingMain,
      { address: votingMain.address },
      "MODIFY_QUORUM_ROLE",
      { address: agentMain.address }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingMain.address },
      "MODIFY_SUPPORT_ROLE",
      { address: agentMain.address }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingMain.address },
      "MODIFY_QUORUM_ROLE",
      { address: agentMain.address }
    );

    await assertRole(
      acl,
      votingMain,
      { address: votingMain.address },
      "CREATE_VOTES_ROLE",
      { address: authorized }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingMain.address },
      "CREATE_VOTES_ROLE",
      { address: authorized }
    );

    // Voting can execute all actions on agent which is connected to this voting
    await assertRole(
      acl,
      agentMain,
      { address: votingMain.address },
      "EXECUTE_ROLE",
      { address: votingMain.address }
    );
    await assertRole(
      acl,
      agentMain,
      { address: votingMain.address },
      "RUN_SCRIPT_ROLE",
      { address: votingMain.address }
    );

    await assertRole(
      acl,
      agentSecondary,
      { address: votingMain.address },
      "EXECUTE_ROLE",
      { address: votingSecondary.address }
    );
    await assertRole(
      acl,
      agentSecondary,
      { address: votingMain.address },
      "RUN_SCRIPT_ROLE",
      { address: votingSecondary.address }
    );

    await api3Pool.setDaoApps(
      agentMain.address,
      agentSecondary.address,
      votingMain.address,
      votingSecondary.address
    );
  });
});
