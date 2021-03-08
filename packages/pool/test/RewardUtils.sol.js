const { expect } = require("chai");

let roles;
let api3Token, api3Pool;

const onePercent = ethers.BigNumber.from("1" + "000" + "000");
const hundredPercent = ethers.BigNumber.from("100" + "000" + "000");

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    daoAgent: accounts[1],
    claimsManager: accounts[2],
    user1: accounts[3],
    user2: accounts[4],
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
});

describe("payReward", function () {
  context("Reward for the previous epoch has not been paid", function () {
    context("Pool contract is authorized to mint tokens", function () {
      context("Stake target is not zero", function () {
        it("updates APR and pays reward", async function () {
          // Authorize pool contract to mint tokens
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have two users stake
          const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
          const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user2.address, user2Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Token
            .connect(roles.user2)
            .approve(api3Pool.address, user2Stake);
          await api3Pool
            .connect(roles.user1)
            .depositAndStake(
              roles.user1.address,
              user1Stake,
              roles.user1.address
            );
          await api3Pool
            .connect(roles.user2)
            .depositAndStake(
              roles.user2.address,
              user2Stake,
              roles.user2.address
            );
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusOne = genesisEpoch.add(
            ethers.BigNumber.from(1)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusOne
              .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
              .toNumber(),
          ]);
          // Pay reward
          const stakeTarget = await api3Pool.stakeTarget();
          const totalStake = await api3Pool.totalStake();
          const totalStakePercentage = totalStake
            .mul(hundredPercent)
            .div(await api3Token.totalSupply());
          const aprUpdateCoefficient = await api3Pool.aprUpdateCoefficient();
          const deltaAbsolute = totalStakePercentage.sub(stakeTarget); // Over target
          const deltaPercentage = deltaAbsolute
            .mul(hundredPercent)
            .div(stakeTarget);
          const aprUpdate = deltaPercentage
            .mul(aprUpdateCoefficient)
            .div(onePercent);
          const currentApr = await api3Pool.currentApr();
          const newApr = currentApr
            .mul(hundredPercent.sub(aprUpdate))
            .div(hundredPercent);
          const rewardAmount = totalStake
            .mul(newApr)
            .div(ethers.BigNumber.from(52))
            .div(hundredPercent);
          await expect(api3Pool.connect(roles.randomPerson).payReward())
            .to.emit(api3Pool, "PaidReward")
            .withArgs(genesisEpochPlusOne, rewardAmount, newApr);
          expect(await api3Pool.totalStake()).to.equal(
            totalStake.add(rewardAmount)
          );
          expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
            genesisEpochPlusOne
          );
          expect(await api3Pool.currentApr()).to.equal(newApr);
          const reward = await api3Pool.epochIndexToReward(genesisEpochPlusOne);
          expect(reward.atBlock).to.equal(
            await ethers.provider.getBlockNumber()
          );
          expect(reward.amount).to.equal(rewardAmount);
        });
      });
      context("Stake target is zero", function () {
        it("sets APR to minimum and pays reward", async function () {
          // Set the stake target to zero
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          await api3Pool
            .connect(roles.daoAgent)
            .setStakeTarget(ethers.BigNumber.from(0));
          // Authorize pool contract to mint tokens
          await api3Token
            .connect(roles.deployer)
            .updateMinterStatus(api3Pool.address, true);
          // Have the user stake
          const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
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
              user1Stake,
              roles.user1.address
            );
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusOne = genesisEpoch.add(
            ethers.BigNumber.from(1)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusOne
              .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
              .toNumber(),
          ]);
          // Pay reward
          const totalStake = await api3Pool.totalStake();
          const newApr = await api3Pool.minApr();
          const rewardAmount = totalStake
            .mul(newApr)
            .div(ethers.BigNumber.from(52))
            .div(hundredPercent);
          await expect(api3Pool.connect(roles.randomPerson).payReward())
            .to.emit(api3Pool, "PaidReward")
            .withArgs(genesisEpochPlusOne, rewardAmount, newApr);
          expect(await api3Pool.totalStake()).to.equal(
            totalStake.add(rewardAmount)
          );
          expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
            genesisEpochPlusOne
          );
          expect(await api3Pool.currentApr()).to.equal(newApr);
          const reward = await api3Pool.epochIndexToReward(genesisEpochPlusOne);
          expect(reward.atBlock).to.equal(
            await ethers.provider.getBlockNumber()
          );
          expect(reward.amount).to.equal(rewardAmount);
        });
      });
    });
    context("Pool contract is not authorized to mint tokens", function () {
      it("skips the payment and APR update", async function () {
        // Have two users stake
        const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
        const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user2.address, user2Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Token
          .connect(roles.user2)
          .approve(api3Pool.address, user2Stake);
        await api3Pool
          .connect(roles.user1)
          .depositAndStake(
            roles.user1.address,
            user1Stake,
            roles.user1.address
          );
        await api3Pool
          .connect(roles.user2)
          .depositAndStake(
            roles.user2.address,
            user2Stake,
            roles.user2.address
          );
        // Fast forward time to one epoch into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusOne = genesisEpoch.add(ethers.BigNumber.from(1));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusOne
            .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
            .toNumber(),
        ]);
        // Pay reward
        const totalStake = await api3Pool.totalStake();
        const currentApr = await api3Pool.currentApr();
        await api3Pool.connect(roles.randomPerson).payReward();
        expect(await api3Pool.totalStake()).to.equal(totalStake);
        expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
          genesisEpochPlusOne
        );
        expect(await api3Pool.currentApr()).to.equal(currentApr);
        const reward = await api3Pool.epochIndexToReward(genesisEpochPlusOne);
        expect(reward.atBlock).to.equal(0);
        expect(reward.amount).to.equal(0);
      });
    });
  });
  context("Rewards for multiple epochs have not been paid", function () {
    context("Pool contract is authorized to mint tokens", function () {
      it("updates APR and only pays the reward for the current epoch", async function () {
        // Authorize pool contract to mint tokens
        await api3Token
          .connect(roles.deployer)
          .updateMinterStatus(api3Pool.address, true);
        // Have two users stake
        const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
        const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user2.address, user2Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Token
          .connect(roles.user2)
          .approve(api3Pool.address, user2Stake);
        await api3Pool
          .connect(roles.user1)
          .depositAndStake(
            roles.user1.address,
            user1Stake,
            roles.user1.address
          );
        await api3Pool
          .connect(roles.user2)
          .depositAndStake(
            roles.user2.address,
            user2Stake,
            roles.user2.address
          );
        // Fast forward time to one epoch into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusFive = genesisEpoch.add(ethers.BigNumber.from(5));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusFive
            .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
            .toNumber(),
        ]);
        // Pay reward
        const stakeTarget = await api3Pool.stakeTarget();
        const totalStake = await api3Pool.totalStake();
        const totalStakePercentage = totalStake
          .mul(hundredPercent)
          .div(await api3Token.totalSupply());
        const aprUpdateCoefficient = await api3Pool.aprUpdateCoefficient();
        const deltaAbsolute = totalStakePercentage.sub(stakeTarget); // Over target
        const deltaPercentage = deltaAbsolute
          .mul(hundredPercent)
          .div(stakeTarget);
        const aprUpdate = deltaPercentage
          .mul(aprUpdateCoefficient)
          .div(onePercent);
        const currentApr = await api3Pool.currentApr();
        const newApr = currentApr
          .mul(hundredPercent.sub(aprUpdate))
          .div(hundredPercent);
        const rewardAmount = totalStake
          .mul(newApr)
          .div(ethers.BigNumber.from(52))
          .div(hundredPercent);
        await expect(api3Pool.connect(roles.randomPerson).payReward())
          .to.emit(api3Pool, "PaidReward")
          .withArgs(genesisEpochPlusFive, rewardAmount, newApr);
        expect(await api3Pool.totalStake()).to.equal(
          totalStake.add(rewardAmount)
        );
        expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
          genesisEpochPlusFive
        );
        expect(await api3Pool.currentApr()).to.equal(newApr);
        const reward = await api3Pool.epochIndexToReward(genesisEpochPlusFive);
        expect(reward.atBlock).to.equal(await ethers.provider.getBlockNumber());
        expect(reward.amount).to.equal(rewardAmount);
      });
      context("Pool contract is not authorized to mint tokens", function () {
        it("skips the payment and APR update", async function () {
          // Have two users stake
          const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
          const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user2.address, user2Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Token
            .connect(roles.user2)
            .approve(api3Pool.address, user2Stake);
          await api3Pool
            .connect(roles.user1)
            .depositAndStake(
              roles.user1.address,
              user1Stake,
              roles.user1.address
            );
          await api3Pool
            .connect(roles.user2)
            .depositAndStake(
              roles.user2.address,
              user2Stake,
              roles.user2.address
            );
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusFive = genesisEpoch.add(
            ethers.BigNumber.from(5)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusFive
              .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
              .toNumber(),
          ]);
          // Pay reward
          const totalStake = await api3Pool.totalStake();
          const currentApr = await api3Pool.currentApr();
          await api3Pool.connect(roles.randomPerson).payReward();
          expect(await api3Pool.totalStake()).to.equal(totalStake);
          expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
            genesisEpochPlusFive
          );
          expect(await api3Pool.currentApr()).to.equal(currentApr);
          const reward = await api3Pool.epochIndexToReward(
            genesisEpochPlusFive
          );
          expect(reward.atBlock).to.equal(0);
          expect(reward.amount).to.equal(0);
        });
      });
    });
  });
  context("Reward for the current epoch has been paid", function () {
    it("does nothing", async function () {
      // Authorize pool contract to mint tokens
      await api3Token
        .connect(roles.deployer)
        .updateMinterStatus(api3Pool.address, true);
      // Have two users stake
      const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
      const user2Stake = ethers.utils.parseEther("30" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user2.address, user2Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Token
        .connect(roles.user2)
        .approve(api3Pool.address, user2Stake);
      await api3Pool
        .connect(roles.user1)
        .depositAndStake(roles.user1.address, user1Stake, roles.user1.address);
      await api3Pool
        .connect(roles.user2)
        .depositAndStake(roles.user2.address, user2Stake, roles.user2.address);
      // Fast forward time to one epoch into the future
      const genesisEpoch = await api3Pool.genesisEpoch();
      const genesisEpochPlusOne = genesisEpoch.add(ethers.BigNumber.from(1));
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        genesisEpochPlusOne
          .mul(ethers.BigNumber.from(7 * 24 * 60 * 60))
          .toNumber(),
      ]);
      // Pay reward
      await api3Pool.connect(roles.randomPerson).payReward();
      const totalStake = await api3Pool.totalStake();
      const epochIndexOfLastRewardPayment = await api3Pool.epochIndexOfLastRewardPayment();
      const currentApr = await api3Pool.currentApr();
      // Pay reward again
      await api3Pool.connect(roles.randomPerson).payReward();
      // Nothing should have changed
      expect(await api3Pool.totalStake()).to.equal(totalStake);
      expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
        epochIndexOfLastRewardPayment
      );
      expect(await api3Pool.currentApr()).to.equal(currentApr);
    });
  });
});

describe("getUserLockedAt", function () {
  it("gets locked tokens of the user at the block", async function () {
    // Authorize pool contract to mint tokens
    await api3Token
      .connect(roles.deployer)
      .updateMinterStatus(api3Pool.address, true);
    // Have the user stake
    const user1Stake = ethers.utils.parseEther("30" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool
      .connect(roles.user1)
      .depositAndStake(roles.user1.address, user1Stake, roles.user1.address);
    // In the first `REWARD_VESTING_PERIOD` epochs, all rewards starting from genesisEpoch will be locked
    const genesisEpoch = await api3Pool.genesisEpoch();
    const REWARD_VESTING_PERIOD = (
      await api3Pool.REWARD_VESTING_PERIOD()
    ).toNumber();
    for (let i = 1; i < REWARD_VESTING_PERIOD + 1; i++) {
      const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i));
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        currentEpoch.mul(ethers.BigNumber.from(7 * 24 * 60 * 60)).toNumber(),
      ]);
      await api3Pool.payReward();
      const locked = await api3Pool.callStatic.getUserLockedAt(
        roles.user1.address,
        currentEpoch
      );
      const rewards = (await api3Pool.totalStake()).sub(user1Stake);
      // Need some tolerance for rounding errors
      expect(rewards.sub(locked).lt(ethers.BigNumber.from(100))).to.be.equal(
        true
      );
    }
    // ...then, only the last `REWARD_VESTING_PERIOD` epochs will be locked
    for (
      let i = REWARD_VESTING_PERIOD + 1;
      i < 2 * REWARD_VESTING_PERIOD + 1;
      i++
    ) {
      const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i));
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        currentEpoch.mul(ethers.BigNumber.from(7 * 24 * 60 * 60)).toNumber(),
      ]);
      await api3Pool.payReward();
      const locked = await api3Pool.callStatic.getUserLockedAt(
        roles.user1.address,
        currentEpoch
      );
      const currentStake = await api3Pool.totalStake();
      const unlockEpoch = currentEpoch.sub(
        ethers.BigNumber.from(REWARD_VESTING_PERIOD)
      );
      const reward = await api3Pool.epochIndexToReward(unlockEpoch);
      const unlockEpochStake = await api3Pool.totalStakeAt(reward.atBlock);
      // Need some tolerance for rounding errors
      expect(
        currentStake
          .sub(unlockEpochStake)
          .sub(locked)
          .lt(ethers.BigNumber.from(100))
      ).to.be.equal(true);
    }
  });
});
