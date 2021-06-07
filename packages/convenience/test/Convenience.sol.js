const { expect } = require("chai");
const { ethers } = require("hardhat");

let mockApi3Voting, mockApi3Token, api3Pool, convenience;
let roles;

const VOTER_STATE = ["ABSENT", "YEA", "NAY"].reduce((state, key, index) => {
  state[key] = index;
  return state;
}, {});

const VOTING_TYPE = ["Primary", "Secondary"].reduce((state, key, index) => {
  state[key] = index;
  return state;
}, {});

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    contractOwner: accounts[1],
    user1: accounts[2],
    user2: accounts[3],
    mockTimeLockManager: accounts[4],
    randomPerson: accounts[9],
  };

  const mockApi3VotingFactory = await ethers.getContractFactory(
    "MockApi3Voting",
    roles.deployer
  );
  mockApi3Voting = await mockApi3VotingFactory.deploy();

  const mockApi3TokenFactory = await ethers.getContractFactory(
    "MockApi3Token",
    roles.deployer
  );
  mockApi3Token = await mockApi3TokenFactory.deploy(
    roles.deployer.address,
    roles.deployer.address
  );

  mockApi3Token2 = await mockApi3TokenFactory.deploy(
    roles.deployer.address,
    roles.deployer.address
  );

  api3PoolFactory = await ethers.getContractFactory("Api3Pool", roles.deployer);

  api3Pool = await api3PoolFactory.deploy(mockApi3Token.address,roles.mockTimeLockManager.address);

  EPOCH_LENGTH = await api3Pool.EPOCH_LENGTH();

  await api3Pool.setDaoApps(
    mockApi3Voting.address,
    mockApi3Voting.address,
    mockApi3Voting.address,
    mockApi3Voting.address
  );

  // Stake Tokens in the Pool
  const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
  await mockApi3Token
    .connect(roles.deployer)
    .approve(api3Pool.address, user1Stake);
  await api3Pool
    .connect(roles.mockTimeLockManager)
    .deposit(roles.deployer.address, user1Stake, roles.user1.address);
  // Stake half the tokens
  await api3Pool
    .connect(roles.user1)
    .stake(user1Stake.div(ethers.BigNumber.from(2)));
  // Delegate
  await api3Pool.connect(roles.user1).delegateVotingPower(roles.user2.address);

  expect(await api3Pool.userStake(roles.user1.address)).to.equal(
    user1Stake.div(ethers.BigNumber.from(2))
  );

  const convenienceFactory = await ethers.getContractFactory(
    "Convenience",
    roles.deployer
  );

  convenience = await convenienceFactory.deploy(api3Pool.address);

  await convenience.setErc20Addresses([mockApi3Token.address,mockApi3Token2.address])
});

//Cast Votes in the mock contract
castVotes = async () => {
  for (i = 1; i < 6; i++) {
    await mockApi3Voting.addVote(
      true,
      true,
      60 * 60 * 24 * 30 + 60 * 60 * 24 * i,
      987654,
      (50 * 10) ^ 16,
      (25 * 10) ^ 16,
      8000,
      1000,
      10000,
      "0xabcdef"
    );
  }
  return [4, 3, 2, 1, 0];
};

describe("getUserStakingData", function () {
  context("Valid User Address", function () {
    it("returns User Staking Data", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      const userStakingData = await convenience.getUserStakingData(
        roles.user1.address
      );
      expect(userStakingData.userStaked).to.equal(
        user1Stake.div(ethers.BigNumber.from(2))
      );
    });
  });
});

describe("getTreasuryAndUserDelegationData", function () {
  context("Valid User Address", function () {
    it("returns the user delegation data", async function () {
      const TreasuryAndUserDelegationData = await convenience.getTreasuryAndUserDelegationData(
        roles.user1.address
      );
      expect(TreasuryAndUserDelegationData.delegate).to.equal(
        roles.user2.address
      );
    });
  });
});

describe("getOpenVoteIds", function () {
  context("There are no open votes", function () {
    it("returns empty array", async function () {
      expect(
        await convenience.getOpenVoteIds(VOTING_TYPE.Primary)
      ).to.deep.equal([]);
      expect(
        await convenience.getOpenVoteIds(VOTING_TYPE.Secondary)
      ).to.deep.equal([]);
    });
  });

  context("There are open votes", async function () {
    it("returns the ids of the votes that are open", async function () {
      await castVotes();
      openVoteIds = await convenience.getOpenVoteIds(VOTING_TYPE.Primary);
      expect(openVoteIds.length).to.be.equal(5);
      expect(openVoteIds[0]).to.be.equal(ethers.BigNumber.from(4));
      expect(openVoteIds[1]).to.be.equal(ethers.BigNumber.from(3));
      expect(openVoteIds[2]).to.be.equal(ethers.BigNumber.from(2));
      expect(openVoteIds[3]).to.be.equal(ethers.BigNumber.from(1));
      expect(openVoteIds[4]).to.be.equal(ethers.BigNumber.from(0));
    });
  });
});

describe("getStaticVoteData", function () {
  context("Voting App type is Valid", function () {
    context("Votes are casted", function () {
        it("returns the vote data for the supplied voteIds", async function () {
          voteIds = await castVotes();
          staticVoteData = await convenience.getStaticVoteData(
            VOTING_TYPE.Primary,
            voteIds
          );
          for (i = 1; i < 6; i++) {
            expect(staticVoteData.startDate[5 - i]).to.be.equal(
              ethers.BigNumber.from(60 * 60 * 24 * 30 + 60 * 60 * 24 * i)
            );
            expect(staticVoteData.supportRequired[5 - i]).to.be.equal(
              ethers.BigNumber.from((50 * 10) ^ 16)
            );
            expect(staticVoteData.minAcceptQuorum[5 - i]).to.be.equal(
              ethers.BigNumber.from((25 * 10) ^ 16)
            );
            expect(staticVoteData.votingPower[5 - i]).to.be.equal(
              ethers.BigNumber.from(10000)
            );
            expect(staticVoteData.script[5 - i]).to.be.equal(
              "0xabcdef"
            );
          }
        });
      });

  })
  

  context("Votes are not casted", function () {
    it("returns empty arrays on no voteIds", async function () {
      staticVoteData = await convenience.getStaticVoteData(
        VOTING_TYPE.Primary,
        []
      );
      expect(staticVoteData.startDate).to.deep.equal([]);
      expect(staticVoteData.supportRequired).to.deep.equal([]);
      expect(staticVoteData.minAcceptQuorum).to.deep.equal([]);
      expect(staticVoteData.votingPower).to.deep.equal([]);
      expect(staticVoteData.script).to.deep.equal([]);
    });

    it("reverts on invalid voteIds", async function () {
      await expect(
        convenience.getStaticVoteData(VOTING_TYPE.Primary, [1, 2, 3])
      ).to.be.revertedWith("No such vote");
    });
  });

});

describe("getDynamicVoteData", function () {
  context("Voting App type is valid", function() {
    context("Votes are casted", function () {
        it("returns the the user Vote Data", async function () {
          voteIds = await castVotes();
          dynamicVoteData = await convenience.getDynamicVoteData(
            VOTING_TYPE.Primary,
            roles.user1.address,
            [0]
          );
          expect(dynamicVoteData.executed[0]).to.be.equal(true);
          expect(dynamicVoteData.yea[0]).to.be.equal("8000");
          expect(dynamicVoteData.nay[0]).to.be.equal("1000");
          expect(dynamicVoteData.delegateAt[0]).to.be.equal(roles.user2.address);
          expect(dynamicVoteData.voterState[0]).to.be.equal(VOTER_STATE.NAY); // The Mock Contract returns NAY on all ids except 1 and 2
        });
      });
      context("Votes are not casted", function () {
        it("returns empty arrays on no voteIds", async function () {
            userVoteData = await convenience.getDynamicVoteData(
                VOTING_TYPE.Primary,
                roles.user1.address,
                []
            )
            expect(userVoteData.executed).to.deep.equal([]);
            expect(userVoteData.yea).to.deep.equal([]);
            expect(userVoteData.nay).to.deep.equal([]);
            expect(userVoteData.voterState).to.deep.equal([]);
            expect(userVoteData.delegateAt).to.deep.equal([]);
            expect(userVoteData.delegateState).to.deep.equal([]);
        })
    
        it("reverts on invalid voteIds", async function () {
          await expect(
            convenience.getDynamicVoteData(
                VOTING_TYPE.Primary, 
                roles.user1.address, 
                [1,2,3]
            )
          ).to.be.revertedWith("No such vote");
        });
      });
  })
});