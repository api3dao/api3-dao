/*global artifacts, before, contract, expect*/
const {
  pct16,
  getEventArgument,
  ZERO_ADDRESS,
} = require("@aragon/contract-helpers-test");
const {
  newDao,
  installNewApp,
  ANY_ENTITY,
  EMPTY_CALLS_SCRIPT,
} = require("@aragon/contract-helpers-test/src/aragon-os");
const { time, expectRevert } = require("@openzeppelin/test-helpers");

const Voting = artifacts.require("Api3VotingMock");

const Api3TokenMock = artifacts.require("Api3TokenMock");
const Api3Pool = artifacts.require("Api3Pool");

const createdVoteId = (receipt) =>
  getEventArgument(receipt, "StartVote", "voteId");

const MOCK_TIMELOCKMANAGER_ADDRESS =
  "0x0000000000000000000000000000000000000001";

contract(
  "API3 Voting App delegation tests",
  ([root, voter1, voter2, voter3]) => {
    let api3Pool, votingBase, voting, token;
    let CREATE_VOTES_ROLE, MODIFY_SUPPORT_ROLE, MODIFY_QUORUM_ROLE;

    const NOW = 1;
    const APP_ID =
      "0x1234123412341234123412341234123412341234123412341234123412341234";

    before("Create token, pool and voting", async () => {
      token = await Api3TokenMock.new(
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        0,
        "n",
        0,
        "n",
        true
      );

      votingBase = await Voting.new();
      api3Pool = await Api3Pool.new(
        token.address,
        MOCK_TIMELOCKMANAGER_ADDRESS
      );
      // Wait for the Genesis epoch to pass
      const latest = Number(await time.latest());
      await time.increaseTo(
        latest + (await api3Pool.EPOCH_LENGTH()).toNumber() + 1
      );

      // ROLES are below
      CREATE_VOTES_ROLE = await votingBase.CREATE_VOTES_ROLE();
      MODIFY_SUPPORT_ROLE = await votingBase.MODIFY_SUPPORT_ROLE();
      MODIFY_QUORUM_ROLE = await votingBase.MODIFY_QUORUM_ROLE();
    });

    context("delegation for the voting working properly", () => {
      const balance1 = 20;
      const balance2 = 40;
      const balance3 = 10;

      before("", async () => {
        const { dao, acl } = await newDao(root);
        voting = await Voting.at(
          await installNewApp(dao, APP_ID, votingBase.address, root)
        );
        await voting.mockSetTimestamp(NOW);
        await acl.createPermission(
          ANY_ENTITY,
          voting.address,
          CREATE_VOTES_ROLE,
          root,
          { from: root }
        );
        await acl.createPermission(
          ANY_ENTITY,
          voting.address,
          MODIFY_SUPPORT_ROLE,
          root,
          { from: root }
        );
        await acl.createPermission(
          ANY_ENTITY,
          voting.address,
          MODIFY_QUORUM_ROLE,
          root,
          { from: root }
        );

        // Generating balance for the voters

        await token.generateTokens(voter1, balance1);
        await token.generateTokens(voter2, balance2);
        await token.generateTokens(voter3, balance3);

        await token.approve(api3Pool.address, balance1, { from: voter1 });
        await api3Pool.depositAndStake(balance1, { from: voter1 });

        await token.approve(api3Pool.address, balance2, { from: voter2 });
        await api3Pool.depositAndStake(balance2, { from: voter2 });

        await token.approve(api3Pool.address, balance3, { from: voter3 });
        await api3Pool.depositAndStake(balance3, { from: voter3 });

        await api3Pool.setDaoApps(
          voting.address,
          voting.address,
          voting.address,
          voting.address
        );
      });

      it("delegate to myself or to 0 address", async () => {
        await expectRevert(
          api3Pool.delegateVotingPower(voter3, { from: voter3 }),
          "Pool: Invalid delegate"
        );
        await expectRevert(
          api3Pool.delegateVotingPower(
            "0x0000000000000000000000000000000000000000",
            { from: voter3 }
          ),
          "Pool: Invalid delegate"
        );
      });

      it("need to delegate", async () => {
        await api3Pool.delegateVotingPower(voter2, { from: voter1 });
        const neededSupport = pct16(60);
        const minimumAcceptanceQuorum = pct16(20);
        await voting.initialize(
          api3Pool.address,
          neededSupport,
          minimumAcceptanceQuorum
        );
        const voteId = createdVoteId(
          await voting.newVote(EMPTY_CALLS_SCRIPT, "metadata", { from: voter3 })
        );
        await voting.vote(voteId, true, false, { from: voter2 });
        const result = await voting.getVote(voteId);
        expect(Number(result.yea)).to.equal(balance1 + balance2 + balance3);
      });

      it("delegate after already delegated", async () => {
        await expectRevert(
          api3Pool.delegateVotingPower(voter3, { from: voter1 }),
          "Pool: Updated delegate recently"
        );
      });

      it("undo delegate earlier then after a week", async () => {
        await expectRevert(
          api3Pool.undelegateVotingPower({ from: voter1 }),
          "Pool: Updated delegate recently"
        );
      });

      it("undo delegate", async () => {
        const latest = Number(await time.latest());
        await time.increaseTo(
          latest + (await api3Pool.EPOCH_LENGTH()).toNumber() + 1
        );
        await api3Pool.undelegateVotingPower({ from: voter1 });
        const voteId = createdVoteId(
          await voting.newVote(EMPTY_CALLS_SCRIPT, "metadata", { from: voter3 })
        );
        await voting.vote(voteId, true, false, { from: voter2 });
        const result = await voting.getVote(voteId);
        expect(Number(result.yea)).to.equal(balance2 + balance3);
      });

      it("delegate delegated", async () => {
        let latest = Number(await time.latest());
        await time.increaseTo(
          latest + (await api3Pool.EPOCH_LENGTH()).toNumber() + 1
        );
        await api3Pool.delegateVotingPower(voter2, { from: voter1 });
        await api3Pool.delegateVotingPower(voter3, { from: voter2 });
        const voteId = createdVoteId(
          await voting.newVote(EMPTY_CALLS_SCRIPT, "metadata", { from: voter3 })
        );
        const result = await voting.getVote(voteId);
        expect(Number(result.yea)).to.equal(balance2 + balance3);
      });

      it("delegate delegated in a cycle", async () => {
        let latest = Number(await time.latest());
        await time.increaseTo(
          latest + (await api3Pool.EPOCH_LENGTH()).toNumber() + 1
        );
        await api3Pool.undelegateVotingPower({ from: voter2 });
        await expectRevert(
          api3Pool.delegateVotingPower(voter2, { from: voter1 }),
          "Pool: Already delegated"
        );
        latest = Number(await time.latest());
        await time.increaseTo(
          latest + (await api3Pool.EPOCH_LENGTH()).toNumber() + 1
        );
        await expectRevert(
          api3Pool.delegateVotingPower(voter1, { from: voter2 }),
          "Pool: Delegate is delegating"
        );
      });
    });
  }
);
