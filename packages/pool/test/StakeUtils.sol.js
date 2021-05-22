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
  api3Pool = await api3PoolFactory.deploy(api3Token.address);
  EPOCH_LENGTH = await api3Pool.EPOCH_LENGTH();
});

describe("stake", function () {
  context("User has enough to stake", function () {
    context("User has a delegate and has staked before", function () {
      it("stakes and updates delegated voting power", async function () {
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .approve(api3Pool.address, user1Stake);
        await api3Pool
          .connect(roles.randomPerson)
          .deposit(roles.deployer.address, user1Stake, roles.user1.address);
        // Stake the first half
        await api3Pool
          .connect(roles.user1)
          .stake(user1Stake.div(ethers.BigNumber.from(2)));
        // Delegate
        await api3Pool
          .connect(roles.user1)
          .delegateVotingPower(roles.user2.address);
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake.div(ethers.BigNumber.from(2))
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake.div(ethers.BigNumber.from(2))
        );
        expect(
          await api3Pool.userReceivedDelegation(roles.user2.address)
        ).to.equal(user1Stake.div(ethers.BigNumber.from(2)));
        expect(await api3Pool.getUserDelegate(roles.user1.address)).to.equal(
          roles.user2.address
        );
        // Stake the second half
        await expect(
          api3Pool
            .connect(roles.user1)
            .stake(user1Stake.div(ethers.BigNumber.from(2)))
        )
          .to.emit(api3Pool, "Staked")
          .withArgs(
            roles.user1.address,
            user1Stake.div(ethers.BigNumber.from(2)),
            user1Stake.add(ethers.BigNumber.from(1))
          );
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(
          await api3Pool.userReceivedDelegation(roles.user2.address)
        ).to.equal(user1Stake);
        expect(await api3Pool.getUserDelegate(roles.user1.address)).to.equal(
          roles.user2.address
        );
      });
    });
    context("User does not have a delegate", function () {
      it("stakes", async function () {
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .approve(api3Pool.address, user1Stake);
        await api3Pool
          .connect(roles.randomPerson)
          .deposit(roles.deployer.address, user1Stake, roles.user1.address);
        await expect(api3Pool.connect(roles.user1).stake(user1Stake))
          .to.emit(api3Pool, "Staked")
          .withArgs(
            roles.user1.address,
            user1Stake,
            user1Stake.add(ethers.BigNumber.from(1))
          );
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake
        );
        expect(await api3Pool.userShares(roles.user1.address)).to.equal(
          user1Stake
        );
      });
    });
  });
  context("User does not have enough to stake", function () {
    it("reverts", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await expect(
        api3Pool.connect(roles.user1).stake(user1Stake)
      ).to.be.revertedWith("API3DAO.StakeUtils: User don't have enough token to stake/unstake the provided amount");
    });
  });
});

describe("depositAndStake", function () {
  context("Caller is the beneficiary", function () {
    it("deposits and stakes", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await expect(
        api3Pool
          .connect(roles.user1)
          .depositAndStake(roles.user1.address, user1Stake)
      )
        .to.emit(api3Pool, "Staked")
        .withArgs(
          roles.user1.address,
          user1Stake,
          user1Stake.add(ethers.BigNumber.from(1))
        );
    });
  });
});

describe("scheduleUnstake", function () {
  context("User has enough staked to schedule unstake", function () {
    it("schedules unstake", async function () {
      // Have the user stake
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool
        .connect(roles.user1)
        .depositAndStake(roles.user1.address, user1Stake);
      const userShares = await api3Pool.userShares(roles.user1.address);
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      const unstakeScheduledFor = ethers.BigNumber.from(currentBlock.timestamp)
        .add(EPOCH_LENGTH)
        .add(ethers.BigNumber.from(1));
      // Schedule unstake
      await expect(api3Pool.connect(roles.user1).scheduleUnstake(user1Stake))
        .to.emit(api3Pool, "ScheduledUnstake")
        .withArgs(
          roles.user1.address,
          user1Stake,
          userShares,
          unstakeScheduledFor
        );
    });
  });
  context("User does not have enough staked to schedule unstake", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).scheduleUnstake(ethers.BigNumber.from(1))
      ).to.be.revertedWith("API3DAO.StakeUtils: User don't have enough pool shares to unstake the provided amount");
    });
  });
});

describe("unstake", function () {
  context("Enough time has passed since the unstake scheduling", function () {
    context("User still has the tokens to unstake", function () {
      context("User has a delegate", function () {
        it("unstakes and updates delegated voting power", async function () {
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
          await api3Pool
            .connect(roles.user1)
            .depositAndStake(
              roles.user1.address,
              user1Stake
            );
          // Have the user delegate
          await api3Pool
            .connect(roles.user1)
            .delegateVotingPower(roles.user2.address);
          expect(
            await api3Pool.userReceivedDelegation(roles.user2.address)
          ).to.equal(ethers.BigNumber.from(user1Stake));
          expect(await api3Pool.getUserDelegate(roles.user1.address)).to.equal(
            roles.user2.address
          );
          // Schedule unstake
          await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusTwo = genesisEpoch.add(
            ethers.BigNumber.from(2)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Unstake
          await api3Pool.payReward();
          await expect(api3Pool.unstake(roles.user1.address))
            .to.emit(api3Pool, "Unstaked")
            .withArgs(roles.user1.address, user1Stake);
          // Delegation remains
          expect(
            await api3Pool.userReceivedDelegation(roles.user2.address)
          ).to.equal(await api3Pool.userShares(roles.user1.address));
          // This epoch's reward remains as being delegated
          expect(await api3Pool.getUserDelegate(roles.user1.address)).to.equal(
            roles.user2.address
          );
          const user = await api3Pool.users(roles.user1.address);
          expect(user.unstaked).to.equal(user1Stake);
        });
      });
      context("User does not have a delegate", function () {
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
          await api3Pool
            .connect(roles.user1)
            .depositAndStake(
              roles.user1.address,
              user1Stake
            );
          // Schedule unstake
          await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusTwo = genesisEpoch.add(
            ethers.BigNumber.from(2)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Unstake
          await api3Pool.payReward();
          await expect(api3Pool.unstake(roles.user1.address))
            .to.emit(api3Pool, "Unstaked")
            .withArgs(roles.user1.address, user1Stake);
          const user = await api3Pool.users(roles.user1.address);
          expect(user.unstaked).to.equal(user1Stake);
        });
      });
    });
    context("User no longer has the tokens to unstake", function () {
      it("unstakes as much as possible", async function () {
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
        await api3Pool
          .connect(roles.user1)
          .depositAndStake(
            roles.user1.address,
            user1Stake
          );
        // Schedule unstake
        await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
        // Set the DAO Agent
        await api3Pool
          .connect(roles.randomPerson)
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
        // Pay out the entire pool for a claim
        await api3Pool
          .connect(roles.claimsManager)
          .payOutClaim(
            roles.claimsManager.address,
            (await api3Token.balanceOf(api3Pool.address)).sub(
              ethers.BigNumber.from(1)
            )
          );
        // Fast forward time to one epoch into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusTwo = genesisEpoch.add(ethers.BigNumber.from(2));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
        ]);
        // Unstake
        await expect(api3Pool.unstake(roles.user1.address))
          .to.emit(api3Pool, "Unstaked")
          .withArgs(roles.user1.address, 1);
        const userStakedAfterUnstake = await api3Pool.userStake(
          roles.user1.address
        );
        const user = await api3Pool.users(roles.user1.address);
        expect(user.unstaked).to.equal(1);
        expect(userStakedAfterUnstake).to.equal(ethers.BigNumber.from(0));
      });
    });
  });
  context(
    "Not enough time has passed since the unstake scheduling",
    function () {
      it("reverts", async function () {
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
        await api3Pool
          .connect(roles.user1)
          .depositAndStake(
            roles.user1.address,
            user1Stake
          );
        // Schedule unstake
        await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
        // Attempt to unstake
        await expect(api3Pool.unstake(roles.user1.address)).to.be.revertedWith(
          "API3DAO.StakeUtils: Scheduled unstake has not matured yet"
        );
      });
    }
  );
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
    await api3Pool
      .connect(roles.user1)
      .depositAndStake(roles.user1.address, user1Stake);
    // Schedule unstake
    const user1Unstake = user1Stake.div(ethers.BigNumber.from(2));
    await api3Pool.connect(roles.user1).scheduleUnstake(user1Unstake);
    // Fast forward time to one epoch into the future
    const genesisEpoch = await api3Pool.genesisEpoch();
    const genesisEpochPlusTwo = genesisEpoch.add(ethers.BigNumber.from(2));
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      genesisEpochPlusTwo.mul(EPOCH_LENGTH).toNumber(),
    ]);
    // Unstake and withdraw
    await api3Pool.connect(roles.user1).unstakeAndWithdraw(roles.user1.address);
    const user = await api3Pool.users(roles.user1.address);
    expect(user.unstaked).to.equal(ethers.BigNumber.from(0));
    expect(await api3Token.balanceOf(roles.user1.address)).to.equal(
      user1Unstake
    );
  });
});
