/*global artifacts, web3, contract, before, assert*/
const { hash: namehash } = require("eth-ens-namehash");
const { assertRole, assertMissingRole } =
  require("@aragon/templates-shared/helpers/assertRole")(web3);
const { getEventArgument } = require("@aragon/test-helpers/events");
const { getTemplateAddress } = require("@aragon/templates-shared/lib/ens")(
  web3,
  artifacts
);
const { getInstalledAppsById, getInstalledApps } =
  require("@aragon/templates-shared/helpers/events")(artifacts);

const ACL = artifacts.require("ACL");
const Kernel = artifacts.require("Kernel");
const Api3Voting = artifacts.require("Api3Voting");
const Api3Template = artifacts.require("Api3Template");
const Api3Pool = artifacts.require("Api3Pool");
const Agent = artifacts.require("Agent");

contract("Api3Template", ([, deployer, tokenAddress, authorized]) => {
  let api3Template, dao, acl, receipt1, api3Pool;

  const SUPPORT_1 = 50e16;
  const ACCEPTANCE_1 = 50e16;

  const SUPPORT_2 = 50e16;
  const ACCEPTANCE_2 = 15e16;

  const epochLength = 7 * 24 * 60 * 60;

  before("fetch bare template", async () => {
    api3Template = Api3Template.at(await getTemplateAddress());
  });

  before("create bare entity", async () => {
    // Set TimelockManager as deployer
    api3Pool = await Api3Pool.new(tokenAddress, deployer, epochLength, { from: deployer });
    receipt1 = await api3Template.newInstance(
      "api3template_test",
      api3Pool.address,
      [SUPPORT_1, ACCEPTANCE_1],
      [SUPPORT_2, ACCEPTANCE_2],
      { from: deployer }
    );

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
    const votingPrimary = Api3Voting.at(votingApps[0]);
    const votingSecondary = Api3Voting.at(votingApps[1]);
    const agentPrimary = Agent.at(installedApps.agent[0]);
    const agentSecondary = Agent.at(installedApps.agent[1]);

    await assertRole(
      acl,
      dao,
      { address: votingPrimary.address },
      "APP_MANAGER_ROLE"
    );
    await assertRole(
      acl,
      acl,
      { address: votingPrimary.address },
      "CREATE_PERMISSIONS_ROLE"
    );

    assert.isTrue(
      await votingPrimary.hasInitialized(),
      "voting not initialized"
    );
    assert.equal(
      (await votingPrimary.voteTime()).toString(),
      (7 * 24 * 60 * 60).toString()
    );
    assert.equal(
      (await votingPrimary.supportRequiredPct()).toString(),
      SUPPORT_1
    );
    assert.equal(
      (await votingPrimary.minAcceptQuorumPct()).toString(),
      ACCEPTANCE_1
    );

    assert.isTrue(
      await votingSecondary.hasInitialized(),
      "voting not initialized"
    );
    assert.equal(
      (await votingSecondary.voteTime()).toString(),
      (7 * 24 * 60 * 60).toString()
    );
    assert.equal(
      (await votingSecondary.supportRequiredPct()).toString(),
      SUPPORT_2
    );
    assert.equal(
      (await votingSecondary.minAcceptQuorumPct()).toString(),
      ACCEPTANCE_2
    );

    assert.equal(await votingPrimary.api3Pool(), api3Pool.address);
    assert.equal(await votingSecondary.api3Pool(), api3Pool.address);

    assert.isTrue(
      await agentPrimary.hasInitialized(),
      "Primary agent not initialized"
    );
    assert.isTrue(
      await agentSecondary.hasInitialized(),
      "Secondary agent not initialized"
    );
    assert.equal(await agentPrimary.designatedSigner(), "0x".padEnd(42, "0"));
    assert.equal(await agentSecondary.designatedSigner(), "0x".padEnd(42, "0"));
    await assertMissingRole(acl, agentPrimary, "REMOVE_PROTECTED_TOKEN_ROLE");
    await assertMissingRole(acl, agentPrimary, "SAFE_EXECUTE_ROLE");
    await assertMissingRole(acl, agentPrimary, "DESIGNATE_SIGNER_ROLE");
    await assertMissingRole(acl, agentPrimary, "ADD_PRESIGNED_HASH_ROLE");
    await assertMissingRole(acl, agentPrimary, "ADD_PROTECTED_TOKEN_ROLE");
    await assertMissingRole(acl, agentSecondary, "REMOVE_PROTECTED_TOKEN_ROLE");
    await assertMissingRole(acl, agentSecondary, "SAFE_EXECUTE_ROLE");
    await assertMissingRole(acl, agentSecondary, "DESIGNATE_SIGNER_ROLE");
    await assertMissingRole(acl, agentSecondary, "ADD_PRESIGNED_HASH_ROLE");
    await assertMissingRole(acl, agentSecondary, "ADD_PROTECTED_TOKEN_ROLE");

    // The primary agent app can modify voting configurations
    await assertRole(
      acl,
      votingPrimary,
      { address: votingPrimary.address },
      "MODIFY_SUPPORT_ROLE",
      { address: agentPrimary.address }
    );
    await assertRole(
      acl,
      votingPrimary,
      { address: votingPrimary.address },
      "MODIFY_QUORUM_ROLE",
      { address: agentPrimary.address }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingPrimary.address },
      "MODIFY_SUPPORT_ROLE",
      { address: agentPrimary.address }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingPrimary.address },
      "MODIFY_QUORUM_ROLE",
      { address: agentPrimary.address }
    );

    await assertRole(
      acl,
      votingPrimary,
      { address: votingPrimary.address },
      "CREATE_VOTES_ROLE",
      { address: authorized }
    );
    await assertRole(
      acl,
      votingSecondary,
      { address: votingPrimary.address },
      "CREATE_VOTES_ROLE",
      { address: authorized }
    );

    // Voting can execute all actions on agent which is connected to this voting
    await assertRole(
      acl,
      agentPrimary,
      { address: votingPrimary.address },
      "EXECUTE_ROLE",
      { address: votingPrimary.address }
    );
    await assertRole(
      acl,
      agentPrimary,
      { address: votingPrimary.address },
      "RUN_SCRIPT_ROLE",
      { address: votingPrimary.address }
    );
    await assertRole(
      acl,
      agentPrimary,
      { address: votingPrimary.address },
      "TRANSFER_ROLE",
      { address: votingPrimary.address }
    );

    await assertRole(
      acl,
      agentSecondary,
      { address: votingPrimary.address },
      "EXECUTE_ROLE",
      { address: votingSecondary.address }
    );
    await assertRole(
      acl,
      agentSecondary,
      { address: votingPrimary.address },
      "RUN_SCRIPT_ROLE",
      { address: votingSecondary.address }
    );
    await assertRole(
      acl,
      agentSecondary,
      { address: votingPrimary.address },
      "TRANSFER_ROLE",
      { address: votingSecondary.address }
    );
  });
});
