// Getter methods already get tested in the tests of other methods
// We will only be testing the missing ones here
const { expect } = require("chai");

let roles;
let api3Token, api3Pool, api3Voting, api3Staker;
let EPOCH_LENGTH, REWARD_VESTING_PERIOD;

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    agentAppPrimary: accounts[1],
    agentAppSecondary: accounts[2],
    votingAppPrimary: accounts[3],
    votingAppSecondary: accounts[4],
    claimsManager: accounts[5],
    user1: accounts[6],
    user2: accounts[7],
    mockTimelockManager: accounts[8],
    randomPerson: accounts[9],
  };
  const api3TokenFactory = await ethers.getContractFactory(
    "Api3Token",
    roles.deployer
  );
  api3Token = await api3TokenFactory.deploy(
    roles.deployer.address,
    roles.deployer.address
  );
  const api3PoolFactory = await ethers.getContractFactory(
    "Api3Pool",
    roles.deployer
  );
  api3Pool = await api3PoolFactory.deploy(
    api3Token.address,
    roles.mockTimelockManager.address
  );
  const api3VotingFactory = await ethers.getContractFactory(
    "MockApi3Voting",
    roles.deployer
  );
  api3Voting = await api3VotingFactory.deploy(api3Pool.address);
  await api3Pool
    .connect(roles.deployer)
    .setDaoApps(
      roles.agentAppPrimary.address,
      roles.agentAppSecondary.address,
      api3Voting.address,
      roles.votingAppSecondary.address
    );
  const api3StakerFactory = await ethers.getContractFactory(
    "MockApi3Staker",
    roles.deployer
  );
  api3Staker = await api3StakerFactory.deploy(
    api3Token.address,
    api3Pool.address
  );
  EPOCH_LENGTH = await api3Pool.EPOCH_LENGTH();
  REWARD_VESTING_PERIOD = await api3Pool.REWARD_VESTING_PERIOD();
});

describe("totalVotingPowerOneBlockAgo", function () {
  it("gets total voting power one block ago", async function () {
    expect(await api3Pool.totalVotingPowerOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1)
    );
    const stakeAmount = ethers.BigNumber.from(1000);
    await api3Token
      .connect(roles.deployer)
      .transfer(api3Staker.address, stakeAmount.mul(1000));
    await api3Staker.stakeTwice(stakeAmount, stakeAmount);
    expect(await api3Pool.totalVotingPowerOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1)
    );
    await api3Staker.stakeTwice(stakeAmount, stakeAmount);
    expect(await api3Pool.totalVotingPowerOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1).add(stakeAmount).add(stakeAmount)
    );
  });
});

describe("userSharesAt", function () {
  context("User shares checkpoint array is not longer than 1024", function () {
    it("gets user shares at", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositRegular(user1Stake);
      await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
      await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
      await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber)
      ).to.equal(ethers.BigNumber.from(3));
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 1)
      ).to.equal(ethers.BigNumber.from(2));
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 2)
      ).to.equal(ethers.BigNumber.from(1));
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 3)
      ).to.equal(ethers.BigNumber.from(0));
    });
  });
  context("User shares checkpoint array is longer than 1024", function () {
    it("gets user shares at", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositRegular(user1Stake);
      const initialBlockNumber = await ethers.provider.getBlockNumber();
      for (let i = 0; i < 1030; i++) {
        await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
      }
      expect(await api3Pool.userSharesAt(roles.user1.address, 0)).to.equal(
        ethers.BigNumber.from(0)
      );
      for (let i = 0; i < 10; i++) {
        expect(
          await api3Pool.userSharesAt(
            roles.user1.address,
            initialBlockNumber + i
          )
        ).to.equal(ethers.BigNumber.from(i));
      }
    });
  });
});

describe("delegatedToUserAt", function () {
  it("gets user's received delegation at the block", async function () {
    const amount = ethers.BigNumber.from(1000);
    const noDelegations = 20;
    const delegationBlocks = [];
    for (let i = 0; i < noDelegations; i++) {
      delegationBlocks.push(await ethers.provider.getBlockNumber());
      const randomWallet = ethers.Wallet.createRandom().connect(
        ethers.provider
      );
      await roles.deployer.sendTransaction({
        to: randomWallet.address,
        value: ethers.utils.parseEther("1"),
      });
      await api3Token
        .connect(roles.deployer)
        .transfer(randomWallet.address, amount);
      await api3Token
        .connect(randomWallet)
        .approve(api3Pool.address, amount, { gasLimit: 500000 });
      await api3Pool.connect(randomWallet).depositAndStake(amount, {
        gasLimit: 500000,
      });
      await api3Pool
        .connect(randomWallet)
        .delegateVotingPower(roles.user1.address, { gasLimit: 500000 });
    }
    for (let i = 0; i < noDelegations; i++) {
      expect(
        await api3Pool.delegatedToUserAt(
          roles.user1.address,
          delegationBlocks[i]
        )
      ).to.equal(amount.mul(ethers.BigNumber.from(i)));
    }
  });
});

describe("getDelegateAt", function () {
  context(
    "User delegates checkpoint array is not longer than 1024",
    function () {
      it("gets delegate at", async function () {
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
        const firstBlockNumber = await ethers.provider.getBlockNumber();
        // Fast forward time
        await ethers.provider.send("evm_increaseTime", [
          EPOCH_LENGTH.toNumber() + 1,
        ]);
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.randomPerson.address);
        // Fast forward time
        await ethers.provider.send("evm_increaseTime", [
          EPOCH_LENGTH.toNumber() + 1,
        ]);
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
        // Fast forward time
        await ethers.provider.send("evm_increaseTime", [
          EPOCH_LENGTH.toNumber() + 1,
        ]);
        // Check delegates
        expect(await api3Pool.userDelegateAt(roles.user1.address, 0)).to.equal(
          ethers.constants.AddressZero
        );
        expect(
          await api3Pool.userDelegateAt(roles.user1.address, firstBlockNumber)
        ).to.equal(roles.user2.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            firstBlockNumber + 1
          )
        ).to.equal(roles.randomPerson.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            firstBlockNumber + 2
          )
        ).to.equal(roles.user2.address);
      });
    }
  );
  context("User delegates checkpoint array is longer than 1024", function () {
    it("gets delegate at", async function () {
      const initialBlockNumber = await ethers.provider.getBlockNumber();
      for (let i = 0; i < 1030 / 2; i++) {
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
        await ethers.provider.send("evm_increaseTime", [
          EPOCH_LENGTH.toNumber() + 1,
        ]);
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.randomPerson.address);
        await ethers.provider.send("evm_increaseTime", [
          EPOCH_LENGTH.toNumber() + 1,
        ]);
      }
      expect(await api3Pool.userDelegateAt(roles.user1.address, 0)).to.equal(
        ethers.constants.AddressZero
      );
      for (let i = 0; i < 10 / 2; i++) {
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + i * 2 + 1
          )
        ).to.equal(roles.user2.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + i * 2 + 2
          )
        ).to.equal(roles.randomPerson.address);
      }
    });
  });
});

describe("userLocked", function () {
  context(
    "It has been more than REWARD_VESTING_PERIOD since the genesis epoch",
    function () {
      context("User has staked", function () {
        it("returns the rewards paid to the user in the last REWARD_VESTING_PERIOD", async function () {
          // Authorize pool contract to mint tokens
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have the user stake (half of this up-front, the rest in future epochs)
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool
            .connect(roles.user1)
            .depositAndStake(user1Stake.div(2));
          const genesisEpoch = await api3Pool.genesisEpoch();
          const userRewards = [];
          for (let i = 1; i < REWARD_VESTING_PERIOD.mul(2); i++) {
            const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i));
            await ethers.provider.send("evm_setNextBlockTimestamp", [
              currentEpoch.mul(EPOCH_LENGTH).toNumber(),
            ]);
            // Only pay around the half of the rewards
            if (Math.random() > 0.5) {
              const userStakeBefore = await api3Pool.userStake(
                roles.user1.address
              );
              await api3Pool.mintReward();
              const userStakeAfter = await api3Pool.userStake(
                roles.user1.address
              );
              userRewards.push(userStakeAfter.sub(userStakeBefore));
              // Stake some more
              await api3Pool
                .connect(roles.user1)
                .depositAndStake(user1Stake.div(1000));
            } else {
              userRewards.push(ethers.BigNumber.from(0));
            }
          }
          const expectedUserLocked = userRewards
            .slice(-REWARD_VESTING_PERIOD)
            .reduce((a, b) => a.add(b), ethers.BigNumber.from(0));
          const error = expectedUserLocked.sub(
            await api3Pool.userLocked(roles.user1.address)
          );
          // Tolerate rounding errors
          expect(error).to.lt(REWARD_VESTING_PERIOD);
        });
      });
      context("User has not staked", function () {
        it("returns 0", async function () {
          const genesisEpoch = await api3Pool.genesisEpoch();
          for (let i = 1; i < REWARD_VESTING_PERIOD.mul(2); i++) {
            const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i));
            await ethers.provider.send("evm_setNextBlockTimestamp", [
              currentEpoch.mul(EPOCH_LENGTH).toNumber(),
            ]);
            await api3Pool.mintReward();
          }
          const userLocked = await api3Pool.userLocked(
            roles.randomPerson.address
          );
          expect(userLocked).to.equal(0);
        });
      });
    }
  );
  context(
    "It has not been more than REWARD_VESTING_PERIOD since the genesis epoch",
    function () {
      it("returns the rewards paid to the user", async function () {
        // Authorize pool contract to mint tokens
        await api3Token
          .connect(roles.deployer)
          .updateMinterStatus(api3Pool.address, true);
        // Have the user stake (half of this up-front, the rest in future epochs)
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake.div(2));
        const genesisEpoch = await api3Pool.genesisEpoch();
        const userRewards = [];
        for (let i = 1; i < REWARD_VESTING_PERIOD.div(2); i++) {
          const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i));
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currentEpoch.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Only pay around the half of the rewards
          if (Math.random() > 0.5) {
            const userStakeBefore = await api3Pool.userStake(
              roles.user1.address
            );
            await api3Pool.mintReward();
            const userStakeAfter = await api3Pool.userStake(
              roles.user1.address
            );
            userRewards.push(userStakeAfter.sub(userStakeBefore));
            // Stake some more
            await api3Pool
              .connect(roles.user1)
              .depositAndStake(user1Stake.div(1000));
          } else {
            userRewards.push(ethers.BigNumber.from(0));
          }
        }
        const expectedUserLocked = userRewards.reduce(
          (a, b) => a.add(b),
          ethers.BigNumber.from(0)
        );
        const error = expectedUserLocked.sub(
          await api3Pool.userLocked(roles.user1.address)
        );
        // Tolerate rounding errors
        expect(error).to.lt(REWARD_VESTING_PERIOD.div(2));
      });
    }
  );
});

describe("getUser", function () {
  it("gets user", async function () {
    const userDeposit = ethers.utils.parseEther("20" + "000" + "000");
    const userVesting = ethers.utils.parseEther("5" + "000" + "000");
    const userStaked = ethers.utils.parseEther("5" + "000" + "000");
    const userUnstaked = userDeposit.add(userVesting).sub(userStaked);
    const userScheduledToUnstake = ethers.utils.parseEther("1" + "000" + "000");
    // Deposit and stake some tokens
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, userDeposit);
    await api3Token.connect(roles.user1).approve(api3Pool.address, userDeposit);
    await api3Pool.connect(roles.user1).depositRegular(userDeposit);
    await api3Pool.connect(roles.user1).stake(userStaked);
    // Vest some tokens
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.mockTimelockManager.address, userVesting);
    await api3Token
      .connect(roles.mockTimelockManager)
      .approve(api3Pool.address, userVesting);
    await api3Pool
      .connect(roles.mockTimelockManager)
      .depositWithVesting(
        roles.mockTimelockManager.address,
        userVesting,
        roles.user1.address,
        1,
        2
      );
    // Have user1 schedule an unstake
    const unstakeScheduleBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );
    const unstakeScheduledFor = ethers.BigNumber.from(
      unstakeScheduleBlock.timestamp
    )
      .add(EPOCH_LENGTH)
      .add(ethers.BigNumber.from(1));
    await api3Pool.connect(roles.user1).scheduleUnstake(userScheduledToUnstake);
    // Have user1 make a proposal
    const proposalBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      proposalBlock.timestamp + 100,
    ]);
    await api3Voting.newVote(roles.user1.address);
    // Have user1 delegate
    const delegationBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      delegationBlock.timestamp + 100,
    ]);
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    // Check values
    const user = await api3Pool.getUser(roles.user1.address);
    expect(user.unstaked).to.equal(userUnstaked);
    expect(user.vesting).to.equal(userVesting);
    expect(user.lastDelegationUpdateTimestamp).to.equal(
      delegationBlock.timestamp + 100
    );
    expect(user.unstakeScheduledFor).to.equal(unstakeScheduledFor);
    expect(user.unstakeAmount).to.equal(userScheduledToUnstake);
    expect(user.mostRecentProposalTimestamp).to.equal(
      proposalBlock.timestamp + 100
    );
  });
});
