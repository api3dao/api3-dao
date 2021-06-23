// Getter methods already get tested in the tests of other methods
// We will only be testing the missing ones here
const { expect } = require("chai");

let roles;
let api3Token, api3Pool, api3Voting;
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
  EPOCH_LENGTH = await api3Pool.EPOCH_LENGTH();
  REWARD_VESTING_PERIOD = await api3Pool.REWARD_VESTING_PERIOD();
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
});

describe("userVotingPowerAt", function () {
  it("gets user voting power at the queried block", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    const stakeBlock = await ethers.provider.getBlockNumber();
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user2.address, user2Stake);
    await api3Token.connect(roles.user2).approve(api3Pool.address, user2Stake);
    await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
    await api3Pool
      .connect(roles.user2)
      .delegateVotingPower(roles.user1.address);
    const delegatedToBlock = await ethers.provider.getBlockNumber();
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    const delegatedBlock = await ethers.provider.getBlockNumber();
    expect(
      await api3Pool.userVotingPowerAt(roles.user1.address, stakeBlock - 1)
    ).to.equal(0);
    expect(
      await api3Pool.userVotingPowerAt(roles.user1.address, stakeBlock)
    ).to.equal(user1Stake);
    expect(
      await api3Pool.userVotingPowerAt(roles.user1.address, delegatedToBlock)
    ).to.equal(user1Stake.add(user2Stake));
    expect(
      await api3Pool.userVotingPowerAt(roles.user1.address, delegatedBlock)
    ).to.equal(0);
  });
});

describe("userVotingPower", function () {
  it("gets user voting power at the current block", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    expect(await api3Pool.userVotingPower(roles.user1.address)).to.equal(0);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    expect(await api3Pool.userVotingPower(roles.user1.address)).to.equal(
      user1Stake
    );
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user2.address, user2Stake);
    await api3Token.connect(roles.user2).approve(api3Pool.address, user2Stake);
    await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
    await api3Pool
      .connect(roles.user2)
      .delegateVotingPower(roles.user1.address);
    expect(await api3Pool.userVotingPower(roles.user1.address)).to.equal(
      user1Stake.add(user2Stake)
    );
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    expect(await api3Pool.userVotingPower(roles.user1.address)).to.equal(0);
  });
});

describe("totalSharesAt", function () {
  it("gets total shares at the queried block", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    const firstStakeBlock = await ethers.provider.getBlockNumber();
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user2.address, user2Stake);
    await api3Token.connect(roles.user2).approve(api3Pool.address, user2Stake);
    await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
    const secondStakeBlock = await ethers.provider.getBlockNumber();
    expect(await api3Pool.totalSharesAt(firstStakeBlock - 1)).to.equal(1);
    expect(await api3Pool.totalSharesAt(firstStakeBlock)).to.equal(
      user1Stake.add(1)
    );
    expect(await api3Pool.totalSharesAt(secondStakeBlock)).to.equal(
      user1Stake.add(user2Stake).add(1)
    );
  });
});

describe("totalSharesAt", function () {
  it("gets total shares at the current block", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    expect(await api3Pool.totalShares()).to.equal(1);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    expect(await api3Pool.totalShares()).to.equal(user1Stake.add(1));
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user2.address, user2Stake);
    await api3Token.connect(roles.user2).approve(api3Pool.address, user2Stake);
    await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
    expect(await api3Pool.totalShares()).to.equal(
      user1Stake.add(user2Stake).add(1)
    );
  });
});

describe("userSharesAt", function () {
  context("User shares checkpoint array is not longer than 1024", function () {
    it("gets user shares at the queried block", async function () {
      const user1Stake = 3;
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositRegular(user1Stake);
      await api3Pool.connect(roles.user1).stake(1);
      await api3Pool.connect(roles.user1).stake(1);
      await api3Pool.connect(roles.user1).stake(1);
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber)
      ).to.equal(3);
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 1)
      ).to.equal(2);
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 2)
      ).to.equal(1);
      expect(
        await api3Pool.userSharesAt(roles.user1.address, currentBlockNumber - 3)
      ).to.equal(0);
    });
  });
  context("User shares checkpoint array is longer than 1024", function () {
    it("gets user shares at the queried block", async function () {
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
        await api3Pool.connect(roles.user1).stake(1);
      }
      for (let i = 0; i < 10; i++) {
        expect(
          await api3Pool.userSharesAt(
            roles.user1.address,
            initialBlockNumber + i
          )
        ).to.equal(i);
      }
    });
  });
});

describe("userShares", function () {
  it("gets user shares at the current block", async function () {
    const user1Stake = 3;
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositRegular(user1Stake);
    expect(await api3Pool.userShares(roles.user1.address)).to.equal(0);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userShares(roles.user1.address)).to.equal(1);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userShares(roles.user1.address)).to.equal(2);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userShares(roles.user1.address)).to.equal(3);
  });
});

describe("userStake", function () {
  it("gets user stake at the current block", async function () {
    const user1Stake = 3;
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositRegular(user1Stake);
    expect(await api3Pool.userStake(roles.user1.address)).to.equal(0);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userStake(roles.user1.address)).to.equal(1);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userStake(roles.user1.address)).to.equal(2);
    await api3Pool.connect(roles.user1).stake(1);
    expect(await api3Pool.userStake(roles.user1.address)).to.equal(3);
  });
});

describe("delegatedToUserAt", function () {
  it("gets user's received delegation at the queried block", async function () {
    const delegatedAmount = ethers.BigNumber.from(1000);
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
        .transfer(randomWallet.address, delegatedAmount);
      await api3Token
        .connect(randomWallet)
        .approve(api3Pool.address, delegatedAmount, { gasLimit: 1000000 });
      await api3Pool
        .connect(randomWallet)
        .depositAndStake(delegatedAmount, { gasLimit: 1000000 });
      await api3Pool
        .connect(randomWallet)
        .delegateVotingPower(roles.user1.address, { gasLimit: 1000000 });
    }
    for (let i = 0; i < noDelegations; i++) {
      expect(
        await api3Pool.delegatedToUserAt(
          roles.user1.address,
          delegationBlocks[i]
        )
      ).to.equal(delegatedAmount.mul(i));
    }
  });
});

describe("delegatedToUser", function () {
  it("gets user's received delegation at the current block", async function () {
    const delegatedAmount = ethers.BigNumber.from(1000);
    const noDelegations = 20;
    for (let i = 0; i < noDelegations; i++) {
      expect(await api3Pool.delegatedToUser(roles.user1.address)).to.equal(
        delegatedAmount.mul(i)
      );
      const randomWallet = ethers.Wallet.createRandom().connect(
        ethers.provider
      );
      await roles.deployer.sendTransaction({
        to: randomWallet.address,
        value: ethers.utils.parseEther("1"),
      });
      await api3Token
        .connect(roles.deployer)
        .transfer(randomWallet.address, delegatedAmount);
      await api3Token
        .connect(randomWallet)
        .approve(api3Pool.address, delegatedAmount, { gasLimit: 1000000 });
      await api3Pool
        .connect(randomWallet)
        .depositAndStake(delegatedAmount, { gasLimit: 1000000 });
      await api3Pool
        .connect(randomWallet)
        .delegateVotingPower(roles.user1.address, { gasLimit: 1000000 });
    }
  });
});

describe("userDelegateAt", function () {
  context(
    "User delegates checkpoint array is not longer than 1024",
    function () {
      it("gets delegate at the queried block", async function () {
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        const initialBlockNumber = await ethers.provider.getBlockNumber();
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
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
        await api3Pool.connect(roles.user1).undelegateVotingPower();
        // Check delegates
        expect(
          await api3Pool.userDelegateAt(roles.user1.address, initialBlockNumber)
        ).to.equal(ethers.constants.AddressZero);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + 1
          )
        ).to.equal(roles.user2.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + 2
          )
        ).to.equal(roles.randomPerson.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + 3
          )
        ).to.equal(roles.user2.address);
        expect(
          await api3Pool.userDelegateAt(
            roles.user1.address,
            initialBlockNumber + 4
          )
        ).to.equal(ethers.constants.AddressZero);
      });
    }
  );
  context("User delegates checkpoint array is longer than 1024", function () {
    it("gets delegate at the queried block", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
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

describe("userDelegate", function () {
  it("gets delegate at the current block", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
      ethers.constants.AddressZero
    );
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
      roles.user2.address
    );
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [
      EPOCH_LENGTH.toNumber() + 1,
    ]);
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
      roles.randomPerson.address
    );
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [
      EPOCH_LENGTH.toNumber() + 1,
    ]);
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
      roles.user2.address
    );
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [
      EPOCH_LENGTH.toNumber() + 1,
    ]);
    await api3Pool.connect(roles.user1).undelegateVotingPower();
    expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
      ethers.constants.AddressZero
    );
  });
});

describe("userLocked", function () {
  context(
    "It has been more than REWARD_VESTING_PERIOD since the genesis epoch",
    function () {
      context("User has staked", function () {
        context(
          "User has staked for the entire REWARD_VESTING_PERIOD",
          function () {
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
                const currentEpoch = genesisEpoch.add(i);
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
          }
        );
        context(
          "User has not staked for the entire REWARD_VESTING_PERIOD",
          function () {
            it("returns the rewards paid to the user", async function () {
              // Authorize pool contract to mint tokens
              await api3Token
                .connect(roles.deployer)
                .updateMinterStatus(api3Pool.address, true);
              const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
              // Wait a full `REWARD_VESTING_PERIOD` before having the user stake
              await api3Token
                .connect(roles.deployer)
                .transfer(roles.user1.address, user1Stake);
              await api3Token
                .connect(roles.user1)
                .approve(api3Pool.address, user1Stake);
              let currentEpoch = await api3Pool.genesisEpoch();
              for (let i = 1; i < REWARD_VESTING_PERIOD; i++) {
                currentEpoch = currentEpoch.add(1);
                await ethers.provider.send("evm_setNextBlockTimestamp", [
                  currentEpoch.mul(EPOCH_LENGTH).toNumber(),
                ]);
                // Only pay around the half of the rewards
                if (Math.random() > 0.5) {
                  await api3Pool.mintReward();
                }
              }
              await api3Pool
                .connect(roles.user1)
                .depositAndStake(user1Stake.div(2));
              // Have the user stake for half of `REWARD_VESTING_PERIOD`
              const userRewards = [];
              for (let i = 1; i < REWARD_VESTING_PERIOD.div(2); i++) {
                currentEpoch = currentEpoch.add(1);
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
              expect(error).to.lt(REWARD_VESTING_PERIOD);
            });
          }
        );
      });
      context("User has not staked", function () {
        it("returns 0", async function () {
          const genesisEpoch = await api3Pool.genesisEpoch();
          for (let i = 1; i < REWARD_VESTING_PERIOD.mul(2); i++) {
            const currentEpoch = genesisEpoch.add(i);
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
          const currentEpoch = genesisEpoch.add(i);
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
        expect(error).to.lt(REWARD_VESTING_PERIOD);
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
      .add(1);
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
    expect(user.unstakeShares).to.equal(userScheduledToUnstake);
    expect(user.lastProposalTimestamp).to.equal(proposalBlock.timestamp + 100);
  });
});
