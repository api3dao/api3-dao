const { expect } = require("chai");

let roles;
let api3Token, api3Pool;
let EPOCH_LENGTH, REWARD_VESTING_PERIOD;

const onePercent = ethers.BigNumber.from("1" + "000" + "000");
const hundredPercent = ethers.BigNumber.from("100" + "000" + "000");

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
});

describe("mintReward", function () {
  context("Reward for the previous epoch has not been paid", function () {
    context("Pool contract is authorized to mint tokens", function () {
      context("Stake target is not zero", function () {
        context("Total stake is above target", function () {
          it("updates APR and pays reward", async function () {
            // Authorize pool contract to mint tokens
            await api3Token
              .connect(roles.deployer)
              .updateMinterStatus(api3Pool.address, true);
            // Have two users stake
            const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
            const user2Stake = ethers.utils.parseEther("60" + "000" + "000");
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
            await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
            await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
            // Fast forward time to one epoch into the future
            const genesisEpoch = await api3Pool.genesisEpoch();
            let nextEpoch = genesisEpoch;
            // Pay rewards until APR is clipped at its minimum value
            for (let ind = 0; ind < 5; ind++) {
              nextEpoch = nextEpoch.add(ethers.BigNumber.from(1));
              await ethers.provider.send("evm_setNextBlockTimestamp", [
                nextEpoch.mul(EPOCH_LENGTH).toNumber(),
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
              let newApr = currentApr
                .mul(hundredPercent.sub(aprUpdate))
                .div(hundredPercent);
              if (newApr.lt(await api3Pool.minApr())) {
                newApr = await api3Pool.minApr();
              }
              const rewardAmount = totalStake
                .mul(newApr)
                .div(REWARD_VESTING_PERIOD)
                .div(hundredPercent);
              await expect(api3Pool.connect(roles.randomPerson).mintReward())
                .to.emit(api3Pool, "MintedReward")
                .withArgs(nextEpoch, rewardAmount, newApr);
              expect(await api3Pool.totalStake()).to.equal(
                totalStake.add(rewardAmount)
              );
              expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
                nextEpoch
              );
              expect(await api3Pool.currentApr()).to.equal(newApr);
              const reward = await api3Pool.epochIndexToReward(nextEpoch);
              expect(reward.atBlock).to.equal(
                await ethers.provider.getBlockNumber()
              );
              expect(reward.amount).to.equal(rewardAmount);
            }
          });
        });
        context("Total stake is below target", function () {
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
            await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
            await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
            // Fast forward time to one epoch into the future
            const genesisEpoch = await api3Pool.genesisEpoch();
            const genesisEpochPlusOne = genesisEpoch.add(
              ethers.BigNumber.from(1)
            );
            await ethers.provider.send("evm_setNextBlockTimestamp", [
              genesisEpochPlusOne.mul(EPOCH_LENGTH).toNumber(),
            ]);
            // Pay reward
            const stakeTarget = await api3Pool.stakeTarget();
            const totalStake = await api3Pool.totalStake();
            const totalStakePercentage = totalStake
              .mul(hundredPercent)
              .div(await api3Token.totalSupply());
            const aprUpdateCoefficient = await api3Pool.aprUpdateCoefficient();
            const deltaAbsolute = stakeTarget.sub(totalStakePercentage); // Under target
            const deltaPercentage = deltaAbsolute
              .mul(hundredPercent)
              .div(stakeTarget);
            const aprUpdate = deltaPercentage
              .mul(aprUpdateCoefficient)
              .div(onePercent);
            const currentApr = await api3Pool.currentApr();
            let newApr = currentApr
              .mul(hundredPercent.add(aprUpdate))
              .div(hundredPercent);
            if (newApr.gt(await api3Pool.maxApr())) {
              newApr = await api3Pool.maxApr();
            }
            const rewardAmount = totalStake
              .mul(newApr)
              .div(REWARD_VESTING_PERIOD)
              .div(hundredPercent);
            await expect(api3Pool.connect(roles.randomPerson).mintReward())
              .to.emit(api3Pool, "MintedReward")
              .withArgs(genesisEpochPlusOne, rewardAmount, newApr);
            expect(await api3Pool.totalStake()).to.equal(
              totalStake.add(rewardAmount)
            );
            expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
              genesisEpochPlusOne
            );
            expect(await api3Pool.currentApr()).to.equal(newApr);
            const reward = await api3Pool.epochIndexToReward(
              genesisEpochPlusOne
            );
            expect(reward.atBlock).to.equal(
              await ethers.provider.getBlockNumber()
            );
            expect(reward.amount).to.equal(rewardAmount);
          });
        });
      });
      context("Stake target is zero", function () {
        it("sets APR to minimum and pays reward", async function () {
          // Set the stake target to zero
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          await api3Pool
            .connect(roles.agentAppSecondary)
            .setStakeTarget(ethers.BigNumber.from(0));
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
          // Fast forward time to one epoch into the future
          const genesisEpoch = await api3Pool.genesisEpoch();
          const genesisEpochPlusOne = genesisEpoch.add(
            ethers.BigNumber.from(1)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusOne.mul(EPOCH_LENGTH).toNumber(),
          ]);
          // Pay reward
          const totalStake = await api3Pool.totalStake();
          const newApr = await api3Pool.minApr();
          const rewardAmount = totalStake
            .mul(newApr)
            .div(REWARD_VESTING_PERIOD)
            .div(hundredPercent);
          await expect(api3Pool.connect(roles.randomPerson).mintReward())
            .to.emit(api3Pool, "MintedReward")
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
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        const user2Stake = ethers.utils.parseEther("60" + "000" + "000");
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
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
        // Fast forward time to one epoch into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusOne = genesisEpoch.add(ethers.BigNumber.from(1));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusOne.mul(EPOCH_LENGTH).toNumber(),
        ]);
        // Pay reward
        const totalStake = await api3Pool.totalStake();
        const currentApr = await api3Pool.currentApr();
        await api3Pool.connect(roles.randomPerson).mintReward();
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
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        const user2Stake = ethers.utils.parseEther("60" + "000" + "000");
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
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
        // Fast forward time to five epochs into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusFive = genesisEpoch.add(ethers.BigNumber.from(5));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusFive.mul(EPOCH_LENGTH).toNumber(),
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
          .div(REWARD_VESTING_PERIOD)
          .div(hundredPercent);
        await expect(api3Pool.connect(roles.randomPerson).mintReward())
          .to.emit(api3Pool, "MintedReward")
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
    });
    context("Pool contract is not authorized to mint tokens", function () {
      it("skips the payment and APR update", async function () {
        // Have two users stake
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
        const user2Stake = ethers.utils.parseEther("60" + "000" + "000");
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
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
        // Fast forward time to five epochs into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusFive = genesisEpoch.add(ethers.BigNumber.from(5));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusFive.mul(EPOCH_LENGTH).toNumber(),
        ]);
        // Pay reward
        const totalStake = await api3Pool.totalStake();
        const currentApr = await api3Pool.currentApr();
        await api3Pool.connect(roles.randomPerson).mintReward();
        expect(await api3Pool.totalStake()).to.equal(totalStake);
        expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
          genesisEpochPlusFive
        );
        expect(await api3Pool.currentApr()).to.equal(currentApr);
        const reward = await api3Pool.epochIndexToReward(genesisEpochPlusFive);
        expect(reward.atBlock).to.equal(0);
        expect(reward.amount).to.equal(0);
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
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      const user2Stake = ethers.utils.parseEther("60" + "000" + "000");
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
      await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
      await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
      // Fast forward time to one epoch into the future
      const genesisEpoch = await api3Pool.genesisEpoch();
      const genesisEpochPlusOne = genesisEpoch.add(ethers.BigNumber.from(1));
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        genesisEpochPlusOne.mul(EPOCH_LENGTH).toNumber(),
      ]);
      // Pay reward
      await api3Pool.connect(roles.randomPerson).mintReward();
      const totalStake = await api3Pool.totalStake();
      const epochIndexOfLastRewardPayment = await api3Pool.epochIndexOfLastRewardPayment();
      const currentApr = await api3Pool.currentApr();
      // Pay reward again
      await api3Pool.connect(roles.randomPerson).mintReward();
      // Nothing should have changed
      expect(await api3Pool.totalStake()).to.equal(totalStake);
      expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
        epochIndexOfLastRewardPayment
      );
      expect(await api3Pool.currentApr()).to.equal(currentApr);
    });
  });
});
