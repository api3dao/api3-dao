const { expect } = require("chai");

let roles;
let api3Token, api3Pool;
let EPOCH_LENGTH;

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
});

describe("stake", function () {
  context("User has enough to stake", function () {
    context("User has a delegate and has staked before", function () {
      it("stakes and updates delegated voting power", async function () {
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositRegular(user1Stake);
        // Stake the first half
        await api3Pool.connect(roles.user1).stake(user1Stake.div(2));
        // Delegate
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake.div(2)
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake.div(2)
        );
        expect(await api3Pool.delegatedToUser(roles.user2.address)).to.equal(
          user1Stake.div(2)
        );
        expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
          roles.user2.address
        );
        expect(await api3Pool.totalStake()).to.equal(user1Stake.div(2).add(1));
        expect(await api3Pool.totalShares()).to.equal(user1Stake.div(2).add(1));
        // Stake the second half
        await expect(api3Pool.connect(roles.user1).stake(user1Stake.div(2)))
          .to.emit(api3Pool, "Staked")
          .withArgs(
            roles.user1.address,
            user1Stake.div(2),
            user1Stake.div(2),
            user1Stake,
            user1Stake.add(1)
          );
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.delegatedToUser(roles.user2.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
          roles.user2.address
        );
        expect(await api3Pool.totalStake()).to.equal(user1Stake.add(1));
        expect(await api3Pool.totalShares()).to.equal(user1Stake.add(1));
      });
    });
    context("User does not have a delegate", function () {
      it("stakes", async function () {
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositRegular(user1Stake);
        await expect(api3Pool.connect(roles.user1).stake(user1Stake))
          .to.emit(api3Pool, "Staked")
          .withArgs(
            roles.user1.address,
            user1Stake,
            user1Stake,
            user1Stake,
            user1Stake.add(1)
          );
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.totalStake()).to.equal(user1Stake.add(1));
        expect(await api3Pool.totalShares()).to.equal(user1Stake.add(1));
      });
    });
  });
  context("User does not have enough to stake", function () {
    it("reverts", async function () {
      await expect(api3Pool.connect(roles.user1).stake(1)).to.be.revertedWith(
        "Pool: Amount exceeds unstaked"
      );
    });
  });
});

describe("depositAndStake", function () {
  it("deposits and stakes", async function () {
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await expect(api3Pool.connect(roles.user1).depositAndStake(user1Stake))
      .to.emit(api3Pool, "Staked")
      .withArgs(
        roles.user1.address,
        user1Stake,
        user1Stake,
        user1Stake,
        user1Stake.add(1)
      );
  });
});

describe("scheduleUnstake", function () {
  context("User has enough staked to schedule unstake", function () {
    context("User does not already have a scheduled unstake", function () {
      context("Amount to be unstaked is not too small", function () {
        context("User has a delegate", function () {
          it("schedules unstake and updates delegated voting power", async function () {
            // Have the user stake
            const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
            await api3Token
              .connect(roles.deployer)
              .transfer(roles.user1.address, user1Stake);
            await api3Token
              .connect(roles.user1)
              .approve(api3Pool.address, user1Stake);
            await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
            // Have the user delegate
            await api3Pool
              .connect(roles.user1)
              .delegateVotingPower(roles.user2.address);
            expect(
              await api3Pool.delegatedToUser(roles.user2.address)
            ).to.equal(user1Stake);
            expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
              roles.user2.address
            );
            const currentBlock = await ethers.provider.getBlock(
              await ethers.provider.getBlockNumber()
            );
            const unstakeScheduledFor = ethers.BigNumber.from(
              currentBlock.timestamp
            )
              .add(EPOCH_LENGTH)
              .add(1);
            // Schedule unstake
            const user1Shares = await api3Pool.userShares(roles.user1.address);
            await expect(
              api3Pool.connect(roles.user1).scheduleUnstake(user1Stake)
            )
              .to.emit(api3Pool, "ScheduledUnstake")
              .withArgs(
                roles.user1.address,
                user1Stake,
                user1Shares,
                unstakeScheduledFor,
                0
              );
            expect(await api3Pool.userShares(roles.user1.address)).to.equal(0);
            expect(await api3Pool.totalShares()).to.equal(user1Shares.add(1));
            expect(
              await api3Pool.delegatedToUser(roles.user2.address)
            ).to.equal(0);
            expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
              roles.user2.address
            );
          });
        });
        context("User does not have a delegate", function () {
          it("schedules unstake", async function () {
            // Have the user stake
            const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
            await api3Token
              .connect(roles.deployer)
              .transfer(roles.user1.address, user1Stake);
            await api3Token
              .connect(roles.user1)
              .approve(api3Pool.address, user1Stake);
            await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
            const currentBlock = await ethers.provider.getBlock(
              await ethers.provider.getBlockNumber()
            );
            const unstakeScheduledFor = ethers.BigNumber.from(
              currentBlock.timestamp
            )
              .add(EPOCH_LENGTH)
              .add(1);
            // Schedule unstake
            const user1Shares = await api3Pool.userShares(roles.user1.address);
            await expect(
              api3Pool.connect(roles.user1).scheduleUnstake(user1Stake)
            )
              .to.emit(api3Pool, "ScheduledUnstake")
              .withArgs(
                roles.user1.address,
                user1Stake,
                user1Shares,
                unstakeScheduledFor,
                0
              );
            expect(await api3Pool.userShares(roles.user1.address)).to.equal(0);
            expect(await api3Pool.totalShares()).to.equal(user1Shares.add(1));
          });
        });
      });
      context("Amount to be unstaked is not too small", function () {
        it("reverts", async function () {
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have the user stake
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
          await expect(
            api3Pool.connect(roles.user1).scheduleUnstake(0)
          ).to.be.revertedWith("Pool: Unstake amount too small");
          // Pay out rewards so that share price > 1
          await ethers.provider.send("evm_increaseTime", [
            EPOCH_LENGTH.toNumber() + 1,
          ]);
          await api3Pool.mintReward();
          // This will revert because 1 token is not even worth 1 share
          await expect(
            api3Pool.connect(roles.user1).scheduleUnstake(1)
          ).to.be.revertedWith("Pool: Unstake amount too small");
        });
      });
    });
    context("User already has a scheduled unstake", function () {
      it("reverts", async function () {
        // Have the user stake
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        // Schedule unstake for half of the tokens
        await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake.div(2));
        // Attempt to schedule again
        await expect(
          api3Pool.connect(roles.user1).scheduleUnstake(1)
        ).to.be.revertedWith("Pool: Unexecuted unstake exists");
      });
    });
  });
  context("User does not have enough staked to schedule unstake", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).scheduleUnstake(1)
      ).to.be.revertedWith("Pool: Amount exceeds staked");
    });
  });
});

describe("unstake", function () {
  context("An unstake is scheduled for the user", function () {
    context("Enough time has passed since the unstake scheduling", function () {
      context("No claim payout has been made", function () {
        it("unstakes", async function () {
          // Authorize pool contract to mint tokens
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have the user stake
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
          // Schedule unstake
          await api3Pool
            .connect(roles.user1)
            .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusTwo = genesisEpoch.add(2);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Unstake
          await api3Pool.mintReward();
          await expect(
            api3Pool.connect(roles.randomPerson).unstake(roles.user1.address)
          )
            .to.emit(api3Pool, "Unstaked")
            .withArgs(roles.user1.address, user1Stake, 1);
          const user = await api3Pool.users(roles.user1.address);
          expect(user.unstaked).to.equal(user1Stake);
        });
      });
      context("A claim has been paid out", function () {
        it("unstakes what is left from the scheduled amount", async function () {
          // Authorize pool contract to mint tokens
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have the user stake
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
          // Schedule unstake half of the tokens
          await api3Pool
            .connect(roles.user1)
            .scheduleUnstake(user1Stake.div(2));
          // Set the DAO Agent
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          // Set claims manager status as true with the DAO Agent
          await api3Pool
            .connect(roles.agentAppPrimary)
            .setClaimsManagerStatus(roles.claimsManager.address, true);
          // Pay out half of the pool for a claim
          await api3Pool
            .connect(roles.claimsManager)
            .payOutClaim(
              roles.claimsManager.address,
              (await api3Token.balanceOf(api3Pool.address)).div(2)
            );
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusTwo = genesisEpoch.add(2);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Unstake
          await api3Pool.mintReward();
          const user = await api3Pool.getUser(roles.user1.address);
          const unstakeShares = user.unstakeShares;
          const actualUnstakeAmount = unstakeShares
            .mul(await api3Pool.totalStake())
            .div(await api3Pool.totalShares());
          await expect(
            api3Pool.connect(roles.randomPerson).unstake(roles.user1.address)
          )
            .to.emit(api3Pool, "Unstaked")
            .withArgs(
              roles.user1.address,
              actualUnstakeAmount,
              user1Stake.div(2).add(1)
            );
        });
      });
    });
    context(
      "Enough time has not passed since the unstake scheduling",
      function () {
        it("reverts", async function () {
          // Have the user stake
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
          // Schedule unstake
          await api3Pool
            .connect(roles.user1)
            .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
          // Attempt to unstake
          await expect(
            api3Pool.connect(roles.randomPerson).unstake(roles.user1.address)
          ).to.be.revertedWith("Pool: Unstake not mature yet");
        });
      }
    );
  });
  context("No unstake scheduled for the user", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.randomPerson).unstake(roles.user1.address)
      ).to.be.revertedWith("Pool: No unstake scheduled");
    });
  });
});

describe("unstakeAndWithdraw", function () {
  it("unstakes and withdraws", async function () {
    // Authorize pool contract to mint tokens
    await api3Token
      .connect(roles.deployer)
      .updateMinterStatus(api3Pool.address, true);
    // Have the user stake
    const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
    // Schedule unstake
    const user1Unstake = user1Stake.div(2);
    await api3Pool.connect(roles.user1).scheduleUnstake(user1Unstake);
    // Fast forward time to one epoch into the future
    const genesisEpoch = await api3Pool.genesisEpoch();
    const genesisEpochPlusTwo = genesisEpoch.add(2);
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
    ]);
    // Unstake and withdraw
    await api3Pool.connect(roles.user1).unstakeAndWithdraw();
    const user = await api3Pool.users(roles.user1.address);
    expect(user.unstaked).to.equal(0);
    expect(await api3Token.balanceOf(roles.user1.address)).to.equal(
      user1Unstake
    );
  });
});
