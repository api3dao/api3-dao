// Getter methods already get tested in the tests of other methods
// We will only be testing the missing ones here
const { expect } = require("chai");

let roles;
let api3Token, api3Pool, api3Voting, api3Staker;
let EPOCH_LENGTH, REWARD_VESTING_PERIOD, MAX_INTERACTION_FREQUENCY;

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
    .connect(roles.randomPerson)
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
  MAX_INTERACTION_FREQUENCY = await api3Pool.MAX_INTERACTION_FREQUENCY();
});

describe("totalSupplyOneBlockAgo", function () {
  it("gets total supply one block ago", async function () {
    expect(await api3Pool.totalSupplyOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1)
    );
    const stakeAmount = ethers.BigNumber.from(1000);
    await api3Token
      .connect(roles.deployer)
      .transfer(api3Staker.address, stakeAmount.mul(1000));
    await api3Staker.stakeTwice(stakeAmount, stakeAmount);
    expect(await api3Pool.totalSupplyOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1)
    );
    await api3Staker.stakeTwice(stakeAmount, stakeAmount);
    expect(await api3Pool.totalSupplyOneBlockAgo()).to.equal(
      ethers.BigNumber.from(1).add(stakeAmount).add(stakeAmount)
    );
  });
});

describe("userSharesAt", function () {
  it("gets user shares at", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
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

describe("userSharesAtWithBinarySearch", function () {
  it("gets user shares at", async function () {
    expect(
      await api3Pool.userSharesAtWithBinarySearch(roles.user1.address, 0)
    ).to.equal(ethers.BigNumber.from(0));
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositRegular(user1Stake);
    await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
    await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
    await api3Pool.connect(roles.user1).stake(ethers.BigNumber.from(1));
    const currentBlockNumber = await ethers.provider.getBlockNumber();
    expect(
      await api3Pool.userSharesAtWithBinarySearch(
        roles.user1.address,
        currentBlockNumber
      )
    ).to.equal(ethers.BigNumber.from(3));
    expect(
      await api3Pool.userSharesAtWithBinarySearch(
        roles.user1.address,
        currentBlockNumber - 1
      )
    ).to.equal(ethers.BigNumber.from(2));
    expect(
      await api3Pool.userSharesAtWithBinarySearch(
        roles.user1.address,
        currentBlockNumber - 2
      )
    ).to.equal(ethers.BigNumber.from(1));
    expect(
      await api3Pool.userSharesAtWithBinarySearch(
        roles.user1.address,
        currentBlockNumber - 3
      )
    ).to.equal(ethers.BigNumber.from(0));
  });
});

describe("userReceivedDelegationAt", function () {
  context("Searched block is within MAX_INTERACTION_FREQUENCY", function () {
    it("gets user's received delegation at the block", async function () {
      const genesisEpoch = await api3Pool.genesisEpoch();
      const amount = ethers.BigNumber.from(1000);
      const delegationBlocks = [];
      for (let i = 0; i < MAX_INTERACTION_FREQUENCY; i++) {
        await api3Voting.newVote();
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
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpoch.add(i).add(1).mul(EPOCH_LENGTH).toNumber(),
        ]);
      }
      for (let i = 0; i < MAX_INTERACTION_FREQUENCY; i++) {
        expect(
          await api3Pool.userReceivedDelegationAt(
            roles.user1.address,
            delegationBlocks[i]
          )
        ).to.equal(amount.mul(ethers.BigNumber.from(i + 1)));
      }
    });
  });
  context(
    "Searched block is not within MAX_INTERACTION_FREQUENCY",
    function () {
      it("reverts", async function () {
        const genesisEpoch = await api3Pool.genesisEpoch();
        const amount = ethers.BigNumber.from(1000);
        const delegationBlocks = [];
        for (
          let i = 0;
          i < MAX_INTERACTION_FREQUENCY.add(ethers.BigNumber.from(1));
          i++
        ) {
          await api3Voting.newVote();
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
          await api3Pool
            .connect(randomWallet)
            .depositAndStake(amount, { gasLimit: 500000 });
          await api3Pool
            .connect(randomWallet)
            .delegateVotingPower(roles.user1.address, { gasLimit: 500000 });
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpoch.add(i).add(1).mul(EPOCH_LENGTH).toNumber(),
          ]);
        }
        for (
          let i = 1;
          i < MAX_INTERACTION_FREQUENCY.add(ethers.BigNumber.from(1));
          i++
        ) {
          expect(
            await api3Pool.userReceivedDelegationAt(
              roles.user1.address,
              delegationBlocks[i]
            )
          ).to.equal(amount.mul(ethers.BigNumber.from(i + 1)));
        }
        await expect(
          api3Pool.userReceivedDelegationAt(
            roles.user1.address,
            delegationBlocks[0]
          )
        ).to.be.revertedWith("Invalid value");
      });
    }
  );
});

describe("getDelegateAt", function () {
  it("gets delegate at", async function () {
    const firstBlockNumber = await ethers.provider.getBlockNumber();
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [EPOCH_LENGTH.toNumber()]);
    await api3Voting.newVote();
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [EPOCH_LENGTH.toNumber()]);
    await api3Voting.newVote();
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [EPOCH_LENGTH.toNumber()]);
    // Check delegates
    expect(await api3Pool.userDelegateAt(roles.user1.address, 0)).to.equal(
      roles.user2.address
    );
    expect(
      await api3Pool.userDelegateAt(roles.user1.address, firstBlockNumber)
    ).to.equal(roles.user2.address);
    expect(
      await api3Pool.userDelegateAt(roles.user1.address, firstBlockNumber + 1)
    ).to.equal(roles.randomPerson.address);
    expect(
      await api3Pool.userDelegateAt(roles.user1.address, firstBlockNumber + 2)
    ).to.equal(roles.randomPerson.address);
    expect(
      await api3Pool.userDelegateAt(roles.user1.address, firstBlockNumber + 3)
    ).to.equal(roles.user2.address);
  });
});

describe("getUserLocked", function () {
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
              await api3Pool.payReward();
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
            await api3Pool.getUserLocked(roles.user1.address)
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
            await api3Pool.payReward();
          }
          const userLocked = await api3Pool.callStatic.getUserLocked(
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
            await api3Pool.payReward();
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
          await api3Pool.getUserLocked(roles.user1.address)
        );
        // Tolerate rounding errors
        expect(error).to.lt(REWARD_VESTING_PERIOD.div(2));
      });
    }
  );
});
