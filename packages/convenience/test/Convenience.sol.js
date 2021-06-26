const { expect } = require("chai");
const { ethers } = require("hardhat");

let mockApi3VotingPrimary,
  mockApi3VotingSecondary,
  mockApi3Token,
  mockOtherToken,
  api3Pool,
  convenience;
let roles, erc20Tokens;

const VotingAppType = Object.freeze({ Primary: 0, Secondary: 1 });
const VoterStateType = Object.freeze({ ABSENT: 0, YEA: 1, NAY: 2 });

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    contractOwner: accounts[1],
    user1: accounts[2],
    user2: accounts[3],
    user3: accounts[4],
    mockTimeLockManager: accounts[4],
    randomPerson: accounts[9],
  };

  const mockApi3VotingFactory = await ethers.getContractFactory(
    "MockApi3Voting",
    roles.deployer
  );
  mockApi3VotingPrimary = await mockApi3VotingFactory.deploy();
  mockApi3VotingSecondary = await mockApi3VotingFactory.deploy();

  const mockApi3TokenFactory = await ethers.getContractFactory(
    "MockApi3Token",
    roles.deployer
  );
  mockApi3Token = await mockApi3TokenFactory.deploy("API3", "API3");
  mockOtherToken = await mockApi3TokenFactory.deploy("API-four", "API4");

  erc20Tokens = [mockApi3Token, mockOtherToken];

  const api3PoolFactory = await ethers.getContractFactory(
    "Api3Pool",
    roles.deployer
  );
  api3Pool = await api3PoolFactory.deploy(
    mockApi3Token.address,
    roles.mockTimeLockManager.address
  );

  await api3Pool.setDaoApps(
    mockApi3VotingPrimary.address,
    mockApi3VotingSecondary.address,
    mockApi3VotingPrimary.address,
    mockApi3VotingSecondary.address
  );

  // Stake Tokens in the Pool For User 1
  const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
  await mockApi3Token
    .connect(roles.deployer)
    .approve(api3Pool.address, user1Stake);
  await api3Pool
    .connect(roles.mockTimeLockManager)
    .deposit(roles.deployer.address, user1Stake, roles.user1.address);
  // Stake half the tokens
  await api3Pool.connect(roles.user1).stake(user1Stake.div(2));
  // Delegate To User 2
  await api3Pool.connect(roles.user1).delegateVotingPower(roles.user2.address);

  // Stake Tokens in the Pool For User 3
  const user3Stake = ethers.utils.parseEther("20" + "000" + "000");
  await mockApi3Token
    .connect(roles.deployer)
    .approve(api3Pool.address, user3Stake);
  await api3Pool
    .connect(roles.mockTimeLockManager)
    .deposit(roles.deployer.address, user3Stake, roles.user3.address);
  // Stake half the tokens
  await api3Pool.connect(roles.user3).stake(user3Stake.div(2));

  const convenienceFactory = await ethers.getContractFactory(
    "Convenience",
    roles.deployer
  );
  convenience = await convenienceFactory.deploy(api3Pool.address);

  // set default erc20 Addresses
  await convenience.setErc20Addresses(
    erc20Tokens.map((token) => token.address)
  );
});

// Cast Votes in the mock contract
async function castVotes(open, votingContract) {
  const timestamp = (
    await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
  ).timestamp;
  for (let i = 0; i < 5; i++) {
    await votingContract.addVote(
      open,
      true,
      timestamp - 7 * 24 * 60 * 60 - 30 + i * 10,
      987654,
      (50 * 10) ^ 16,
      (25 * 10) ^ 16,
      8000,
      1000,
      10000,
      "0xabcdef"
    );
  }
  return { voteIds: [4, 3, 2, 1, 0], timestamp };
}

describe("constructor", function () {
  context("Valid Pool Address", function () {
    it("deploys contract", async function () {
      const convenienceFactory = await ethers.getContractFactory(
        "Convenience",
        roles.deployer
      );
      convenience = await convenienceFactory.deploy(api3Pool.address);
      expect(convenience.functions.setErc20Addresses).to.exist;
      expect(convenience.functions.getDynamicVoteData).to.exist;
      expect(convenience.functions.getOpenVoteIds).to.exist;
      expect(convenience.functions.getStaticVoteData).to.exist;
      expect(convenience.functions.getTreasuryAndUserDelegationData).to.exist;
      expect(convenience.functions.getUserStakingData).to.exist;
      expect(convenience.functions.api3Pool).to.exist;
      expect(convenience.functions.api3Token).to.exist;
      expect(convenience.functions.erc20Addresses).to.exist;
    });
  });
  context("Invalid Pool Address", function () {
    it("reverts", async function () {
      const convenienceFactory = await ethers.getContractFactory(
        "Convenience",
        roles.deployer
      );
      await expect(
        convenienceFactory.deploy(mockApi3VotingPrimary.address)
      ).to.be.reverted;
      await expect(
        convenienceFactory.deploy(roles.randomPerson.address)
      ).to.be.reverted;
    });
  });
});

describe("setErc20Addresses", function () {
  it("sets the erc20Addresses", async function () {
    const erc20TokenAddresses = erc20Tokens.map((token) => token.address);
    await expect(convenience.setErc20Addresses(erc20TokenAddresses))
      .to.emit(convenience, "SetErc20Addresses")
      .withArgs(erc20TokenAddresses);
    for (let i = 0; i < erc20Tokens.length; i++) {
      expect(await convenience.erc20Addresses(i)).to.be.equal(
        erc20TokenAddresses[i]
      );
    }
  });
});

describe("setDiscussionUrl", function () {
  context("called by Owner", function () {
    context("Voting App type is Valid", function () {
      it("sets the DiscussionUrl", async function () {
        await expect(
          convenience.setDiscussionUrl(
            VotingAppType.Primary,
            0,
            "https://api3.org/discussion1"
          )
        )
          .to.emit(convenience, "SetDiscussionUrl")
          .withArgs(VotingAppType.Primary, 0, "https://api3.org/discussion1");
        expect(
          await convenience.votingAppTypeToVoteIdToDiscussionUrl(
            VotingAppType.Primary,
            0
          )
        ).to.deep.equal("https://api3.org/discussion1");

        await expect(
          convenience.setDiscussionUrl(
            VotingAppType.Secondary,
            0,
            "https://api3.org/discussion2"
          )
        )
          .to.emit(convenience, "SetDiscussionUrl")
          .withArgs(VotingAppType.Secondary, 0, "https://api3.org/discussion2");
        expect(
          await convenience.votingAppTypeToVoteIdToDiscussionUrl(
            VotingAppType.Secondary,
            0
          )
        ).to.deep.equal("https://api3.org/discussion2");
      });
    });
    context("Voting App type is Invalid", function () {
      it("reverts", async function () {
        await expect(
          convenience.setDiscussionUrl(5, 0, "https://api3.org/discussion")
        ).to.be.reverted;
      });
    });
  });
  context("not called by the Owner", function () {
    it("reverts", async function () {
      await expect(
        convenience
          .connect(roles.randomPerson)
          .setDiscussionUrl(
            VotingAppType.Primary,
            0,
            "https://api3.org/discussion"
          )
      ).to.be.revertedWith("caller is not the owner");
    });
  });
});

describe("getUserStakingData", function () {
  it("returns User Staking Data", async function () {
    const userStakingData = await convenience.getUserStakingData(
      roles.user1.address
    );
    const api3PoolUser = await api3Pool.getUser(roles.user1.address);

    expect(userStakingData.apr).to.equal(await api3Pool.apr());
    expect(userStakingData.api3Supply).to.equal(
      await mockApi3Token.totalSupply()
    );
    expect(userStakingData.totalStake).to.equal(await api3Pool.totalStake());
    expect(userStakingData.totalShares).to.equal(await api3Pool.totalShares());
    expect(userStakingData.stakeTarget).to.equal(await api3Pool.stakeTarget());
    expect(userStakingData.userApi3Balance).to.equal(
      await mockApi3Token.balanceOf(roles.user1.address)
    );
    expect(userStakingData.userStaked).to.equal(
      await api3Pool.userStake(roles.user1.address)
    );
    expect(userStakingData.userUnstaked).to.equal(api3PoolUser.unstaked);
    expect(userStakingData.userVesting).to.equal(api3PoolUser.vesting);
    expect(userStakingData.userUnstakeShares).to.equal(
      api3PoolUser.unstakeShares
    );
    expect(userStakingData.userUnstakeAmount).to.equal(
      api3PoolUser.unstakeAmount
    );
    expect(userStakingData.userUnstakeScheduledFor).to.equal(
      api3PoolUser.unstakeScheduledFor
    );
  });
});

describe("getTreasuryAndUserDelegationData", function () {
  context("ERC20 addresses array is empty", function () {
    it("returns the user delegation data", async function () {
      await convenience.setErc20Addresses([]);
      const TreasuryAndUserDelegationData =
        await convenience.getTreasuryAndUserDelegationData(roles.user1.address);
      const api3PoolUser = await api3Pool.getUser(roles.user1.address);

      expect(TreasuryAndUserDelegationData.names).to.deep.equal([]);
      expect(TreasuryAndUserDelegationData.symbols).to.deep.equal([]);
      expect(TreasuryAndUserDelegationData.decimals).to.deep.equal([]);
      expect(
        TreasuryAndUserDelegationData.balancesOfPrimaryAgent
      ).to.deep.equal([]);
      expect(
        TreasuryAndUserDelegationData.balancesOfSecondaryAgent
      ).to.deep.equal([]);
      expect(
        TreasuryAndUserDelegationData.proposalVotingPowerThreshold
      ).to.equal(await api3Pool.proposalVotingPowerThreshold());
      expect(TreasuryAndUserDelegationData.userVotingPower).to.equal(
        await api3Pool.userVotingPower(roles.user1.address)
      );
      expect(TreasuryAndUserDelegationData.delegate).to.equal(
        await api3Pool.userDelegate(roles.user1.address)
      );
      expect(TreasuryAndUserDelegationData.delegate).to.equal(
        roles.user2.address
      );
      expect(
        TreasuryAndUserDelegationData.lastDelegationUpdateTimestamp
      ).to.equal(api3PoolUser.lastDelegationUpdateTimestamp);
      expect(TreasuryAndUserDelegationData.lastProposalTimestamp).to.equal(
        api3PoolUser.lastProposalTimestamp
      );
    });
  });
  context("ERC20 addresses array is not empty", function () {
    context(" some ERC20 addresses are not valid", function () {
      it("reverts", async function () {
        await convenience.setErc20Addresses([
          mockApi3Token.address,
          roles.randomPerson.address,
        ]);
        await expect(
          convenience.getTreasuryAndUserDelegationData(roles.user1.address)
        ).to.be.reverted;
      });
    });

    context("all ERC20 addresses are valid", function () {
      it("returns the user delegation data", async function () {
        await convenience.setErc20Addresses(
          erc20Tokens.map((token) => token.address)
        );
        const TreasuryAndUserDelegationData =
          await convenience.getTreasuryAndUserDelegationData(
            roles.user1.address
          );
        const api3PoolUser = await api3Pool.getUser(roles.user1.address);

        for (let i = 0; i < erc20Tokens.length; i++) {
          expect(TreasuryAndUserDelegationData.names[i]).to.equal(
            await erc20Tokens[i].name()
          );
          expect(TreasuryAndUserDelegationData.symbols[i]).to.equal(
            await erc20Tokens[i].symbol()
          );
          expect(TreasuryAndUserDelegationData.decimals[i]).to.equal(
            await erc20Tokens[i].decimals()
          );
          expect(
            TreasuryAndUserDelegationData.balancesOfPrimaryAgent[i]
          ).to.equal(
            await erc20Tokens[i].balanceOf(await api3Pool.agentAppPrimary())
          );
          expect(
            TreasuryAndUserDelegationData.balancesOfSecondaryAgent[i]
          ).to.equal(
            await erc20Tokens[i].balanceOf(await api3Pool.agentAppSecondary())
          );
        }

        expect(
          TreasuryAndUserDelegationData.proposalVotingPowerThreshold
        ).to.equal(await api3Pool.proposalVotingPowerThreshold());
        expect(TreasuryAndUserDelegationData.userVotingPower).to.equal(
          await api3Pool.userVotingPower(roles.user1.address)
        );
        expect(TreasuryAndUserDelegationData.delegate).to.equal(
          await api3Pool.userDelegate(roles.user1.address)
        );
        expect(TreasuryAndUserDelegationData.delegate).to.equal(
          roles.user2.address
        );
        expect(
          TreasuryAndUserDelegationData.lastDelegationUpdateTimestamp
        ).to.equal(api3PoolUser.lastDelegationUpdateTimestamp);
        expect(TreasuryAndUserDelegationData.lastProposalTimestamp).to.equal(
          api3PoolUser.lastProposalTimestamp
        );
      });
    });
  });
});

describe("getStaticVoteData", function () {
  context("Voting App type is Valid", function () {
    context("Votes are casted in Primary Voting App", async function () {
      it("returns the vote data for voteIds in Primary Voting App", async function () {
        const { voteIds, timestamp } = await castVotes(
          true,
          mockApi3VotingPrimary
        );

        for (let i = 0; i < 5; i++) {
          await convenience.setDiscussionUrl(
            VotingAppType.Primary,
            i,
            `https://api3.org/discussion${i}`
          );
        }

        const staticVoteData = await convenience.getStaticVoteData(
          VotingAppType.Primary,
          roles.user1.address,
          voteIds
        );

        for (let i = 0; i < 5; i++) {
          expect(staticVoteData.startDate[4 - i]).to.be.equal(
            timestamp - 7 * 24 * 60 * 60 - 30 + i * 10
          );
          expect(staticVoteData.supportRequired[i]).to.be.equal((50 * 10) ^ 16);
          expect(staticVoteData.minAcceptQuorum[i]).to.be.equal((25 * 10) ^ 16);
          expect(staticVoteData.votingPower[i]).to.be.equal(10000);
          expect(staticVoteData.script[i]).to.be.equal("0xabcdef");
          expect(staticVoteData.discussionUrl[i]).to.be.equal(
            `https://api3.org/discussion${4 - i}`
          );
        }
      });

      it("reverts for voteIds in Secondary Voting App", async function () {
        const { voteIds } = await castVotes(true, mockApi3VotingPrimary);
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Secondary,
            roles.user1.address,
            voteIds
          )
        ).to.be.revertedWith("No such vote");
      });
    });

    context("Votes are casted in Secondary Voting App", async function () {
      it("returns the vote data for voteIds in Secondary Voting App", async function () {
        const { voteIds, timestamp } = await castVotes(
          true,
          mockApi3VotingSecondary
        );

        for (let i = 0; i < 5; i++) {
          await convenience.setDiscussionUrl(
            VotingAppType.Secondary,
            i,
            `https://api3.org/discussion${i}`
          );
        }

        const staticVoteData = await convenience.getStaticVoteData(
          VotingAppType.Secondary,
          roles.user1.address,
          voteIds
        );

        for (let i = 0; i < 5; i++) {
          expect(staticVoteData.startDate[4 - i]).to.be.equal(
            timestamp - 7 * 24 * 60 * 60 - 30 + i * 10
          );
          expect(staticVoteData.supportRequired[i]).to.be.equal((50 * 10) ^ 16);
          expect(staticVoteData.minAcceptQuorum[i]).to.be.equal((25 * 10) ^ 16);
          expect(staticVoteData.votingPower[i]).to.be.equal(10000);
          expect(staticVoteData.script[i]).to.be.equal("0xabcdef");
          expect(staticVoteData.discussionUrl[i]).to.be.equal(
            `https://api3.org/discussion${4 - i}`
          );
        }
      });

      it("reverts for voteIds in Primary Voting App", async function () {
        const { voteIds } = await castVotes(true, mockApi3VotingSecondary);
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Primary,
            roles.user1.address,
            voteIds
          )
        ).to.be.revertedWith("No such vote");
      });
    });

    context("Votes are not casted", function () {
      it("returns empty arrays on no voteIds", async function () {
        const staticVoteDataPrimary = await convenience.getStaticVoteData(
          VotingAppType.Primary,
          roles.user1.address,
          []
        );
        expect(staticVoteDataPrimary.startDate).to.deep.equal([]);
        expect(staticVoteDataPrimary.supportRequired).to.deep.equal([]);
        expect(staticVoteDataPrimary.minAcceptQuorum).to.deep.equal([]);
        expect(staticVoteDataPrimary.votingPower).to.deep.equal([]);
        expect(staticVoteDataPrimary.script).to.deep.equal([]);
        expect(staticVoteDataPrimary.discussionUrl).to.deep.equal([]);

        const staticVoteDataSecondary = await convenience.getStaticVoteData(
          VotingAppType.Secondary,
          roles.user1.address,
          []
        );
        expect(staticVoteDataSecondary.startDate).to.deep.equal([]);
        expect(staticVoteDataSecondary.supportRequired).to.deep.equal([]);
        expect(staticVoteDataSecondary.minAcceptQuorum).to.deep.equal([]);
        expect(staticVoteDataSecondary.votingPower).to.deep.equal([]);
        expect(staticVoteDataSecondary.script).to.deep.equal([]);
        expect(staticVoteDataSecondary.discussionUrl).to.deep.equal([]);
      });
      it("reverts on invalid voteIds", async function () {
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Primary,
            roles.user1.address,
            [1, 2, 3]
          )
        ).to.be.revertedWith("No such vote");
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Secondary,
            roles.user1.address,
            [1, 2, 3]
          )
        ).to.be.revertedWith("No such vote");
      });
    });
  });
  context("Voting App type is invalid", function () {
    it("reverts", async function () {
      const { voteIds } = await castVotes(true, mockApi3VotingPrimary);
      await expect(
        convenience.getStaticVoteData(5, roles.user1.address, voteIds)
      ).to.be.reverted;
    });
  });
});

describe("getDynamicVoteData", function () {
  context("Voting App type is valid", function () {
    context("Votes are casted in the Primary Voting App", function () {
      it("reverts for voteIds in the Secondary App", async function () {
        const { voteIds } = await castVotes(true, mockApi3VotingPrimary);
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Secondary,
            roles.user1.address,
            voteIds
          )
        ).to.be.revertedWith("No such vote");
      });

      context("user has delegated", function () {
        it("returns the the user Vote Data", async function () {
          await castVotes(true, mockApi3VotingPrimary);
          const dynamicVoteData = await convenience.getDynamicVoteData(
            VotingAppType.Primary,
            roles.user1.address,
            [0]
          );

          expect(dynamicVoteData.executed[0]).to.be.equal(true);
          expect(dynamicVoteData.yea[0]).to.be.equal("8000");
          expect(dynamicVoteData.nay[0]).to.be.equal("1000");
          expect(dynamicVoteData.delegateAt[0]).to.be.equal(
            roles.user2.address
          );
          expect(dynamicVoteData.delegateState[0]).to.be.equal(
            VoterStateType.NAY
          ); // The Mock Contract returns NAY on all ids except 1 and 2
        });
      });

      context("user has not delegated", function () {
        it("returns the the user Vote Data", async function () {
          await castVotes(true, mockApi3VotingPrimary);
          const dynamicVoteData = await convenience.getDynamicVoteData(
            VotingAppType.Primary,
            roles.user3.address,
            [0]
          );
          expect(dynamicVoteData.executed[0]).to.be.equal(true);
          expect(dynamicVoteData.yea[0]).to.be.equal("8000");
          expect(dynamicVoteData.nay[0]).to.be.equal("1000");
          expect(dynamicVoteData.delegateAt[0]).to.be.equal(
            ethers.constants.AddressZero
          );
          expect(dynamicVoteData.voterState[0]).to.be.equal(VoterStateType.NAY); // The Mock Contract returns NAY on all ids except 1 and 2
        });
      });
    });

    context("Votes are casted in the Secondary Voting App", function () {
      it("reverts for voteIds in the Primary App", async function () {
        const { voteIds } = await castVotes(true, mockApi3VotingSecondary);
        await expect(
          convenience.getStaticVoteData(
            VotingAppType.Primary,
            roles.user1.address,
            voteIds
          )
        ).to.be.revertedWith("No such vote");
      });

      context("user has delegated", function () {
        it("returns the the user Vote Data", async function () {
          await castVotes(true, mockApi3VotingSecondary);
          const dynamicVoteData = await convenience.getDynamicVoteData(
            VotingAppType.Secondary,
            roles.user1.address,
            [0]
          );

          expect(dynamicVoteData.executed[0]).to.be.equal(true);
          expect(dynamicVoteData.yea[0]).to.be.equal("8000");
          expect(dynamicVoteData.nay[0]).to.be.equal("1000");
          expect(dynamicVoteData.delegateAt[0]).to.be.equal(
            roles.user2.address
          );
          expect(dynamicVoteData.delegateState[0]).to.be.equal(
            VoterStateType.NAY
          ); // The Mock Contract returns NAY on all ids except 1 and 2
        });
      });

      context("user has not delegated", function () {
        it("returns the the user Vote Data", async function () {
          await castVotes(true, mockApi3VotingSecondary);
          const dynamicVoteData = await convenience.getDynamicVoteData(
            VotingAppType.Secondary,
            roles.user3.address,
            [0]
          );
          expect(dynamicVoteData.executed[0]).to.be.equal(true);
          expect(dynamicVoteData.yea[0]).to.be.equal("8000");
          expect(dynamicVoteData.nay[0]).to.be.equal("1000");
          expect(dynamicVoteData.delegateAt[0]).to.be.equal(
            ethers.constants.AddressZero
          );
          expect(dynamicVoteData.voterState[0]).to.be.equal(VoterStateType.NAY); // The Mock Contract returns NAY on all ids except 1 and 2
        });
      });
    });

    context("Votes are not casted", function () {
      it("returns empty arrays on no voteIds", async function () {
        const userVoteDataPrimary = await convenience.getDynamicVoteData(
          VotingAppType.Primary,
          roles.user1.address,
          []
        );

        const userVoteDataSecondary = await convenience.getDynamicVoteData(
          VotingAppType.Secondary,
          roles.user1.address,
          []
        );

        expect(userVoteDataPrimary.executed).to.deep.equal([]);
        expect(userVoteDataPrimary.yea).to.deep.equal([]);
        expect(userVoteDataPrimary.nay).to.deep.equal([]);
        expect(userVoteDataPrimary.voterState).to.deep.equal([]);
        expect(userVoteDataPrimary.delegateAt).to.deep.equal([]);
        expect(userVoteDataPrimary.delegateState).to.deep.equal([]);

        expect(userVoteDataSecondary.executed).to.deep.equal([]);
        expect(userVoteDataSecondary.yea).to.deep.equal([]);
        expect(userVoteDataSecondary.nay).to.deep.equal([]);
        expect(userVoteDataSecondary.voterState).to.deep.equal([]);
        expect(userVoteDataSecondary.delegateAt).to.deep.equal([]);
        expect(userVoteDataSecondary.delegateState).to.deep.equal([]);
      });

      it("reverts on invalid voteIds", async function () {
        await expect(
          convenience.getDynamicVoteData(
            VotingAppType.Primary,
            roles.user1.address,
            [1, 2, 3]
          )
        ).to.be.revertedWith("No such vote");

        await expect(
          convenience.getDynamicVoteData(
            VotingAppType.Secondary,
            roles.user1.address,
            [1, 2, 3]
          )
        ).to.be.revertedWith("No such vote");
      });
    });
  });
  context("Voting App type is invalid", function () {
    it("reverts", async function () {
      const { voteIds } = await castVotes(true, mockApi3VotingPrimary);
      await expect(convenience.getDynamicVoteData(5, voteIds)).to.be.reverted;
    });
  });
});

describe("getOpenVoteIds", function () {
  context("Voting app type is valid", function () {
    context("Votes are casted in Primary Voting App", function () {
      context("There are open votes", async function () {
        it("returns empty array when using the Secondary Voting App", async function () {
          await castVotes(true, mockApi3VotingPrimary);
          expect(
            await convenience.getOpenVoteIds(VotingAppType.Secondary)
          ).to.deep.equal([]);
        });

        it("returns the ids of the votes that are open", async function () {
          const { timestamp } = await castVotes(true, mockApi3VotingPrimary);

          // Cast a last vote that is not open
          await mockApi3VotingPrimary.addVote(
            false,
            true,
            timestamp - 7 * 24 * 60 * 60 - 30 + 6 * 10,
            987654,
            (50 * 10) ^ 16,
            (25 * 10) ^ 16,
            8000,
            1000,
            10000,
            "0xabcdef"
          );

          const openVoteIds = await convenience.getOpenVoteIds(
            VotingAppType.Primary
          );
          expect(openVoteIds.length).to.be.equal(2);
          expect(openVoteIds[0]).to.be.equal(4);
          expect(openVoteIds[1]).to.be.equal(3);
        });
      });
      context("There are no open votes", async function () {
        it("returns empty array", async function () {
          await castVotes(false, mockApi3VotingPrimary);
          expect(
            await convenience.getOpenVoteIds(VotingAppType.Primary)
          ).to.deep.equal([]);
        });
      });
    });
    context("Votes are casted in Secondary Voting App", function () {
      context("There are open votes", async function () {
        it("returns empty array when using the Primary Voting App", async function () {
          await castVotes(true, mockApi3VotingSecondary);
          expect(
            await convenience.getOpenVoteIds(VotingAppType.Primary)
          ).to.deep.equal([]);
        });

        it("returns the ids of the votes that are open", async function () {
          const { timestamp } = await castVotes(true, mockApi3VotingSecondary);

          // Cast a last vote that is not open
          await mockApi3VotingSecondary.addVote(
            false,
            true,
            timestamp - 7 * 24 * 60 * 60 - 30 + 6 * 10,
            987654,
            (50 * 10) ^ 16,
            (25 * 10) ^ 16,
            8000,
            1000,
            10000,
            "0xabcdef"
          );
          const openVoteIds = await convenience.getOpenVoteIds(
            VotingAppType.Secondary
          );
          expect(openVoteIds.length).to.be.equal(2);
          expect(openVoteIds[0]).to.be.equal(4);
          expect(openVoteIds[1]).to.be.equal(3);
        });
      });
      context("There are no open votes", async function () {
        it("returns empty array", async function () {
          await castVotes(false, mockApi3VotingSecondary);
          expect(
            await convenience.getOpenVoteIds(VotingAppType.Secondary)
          ).to.deep.equal([]);
        });
      });
    });
    context("Votes are not casted", function () {
      it("returns empty array", async function () {
        expect(
          await convenience.getOpenVoteIds(VotingAppType.Primary)
        ).to.deep.equal([]);
        expect(
          await convenience.getOpenVoteIds(VotingAppType.Secondary)
        ).to.deep.equal([]);
      });
    });
  });

  context("Voting app type is invalid", function () {
    it("reverts", async function () {
      await castVotes(true, mockApi3VotingPrimary);
      await expect(convenience.getOpenVoteIds(5)).to.be.reverted;
    });
  });
});
