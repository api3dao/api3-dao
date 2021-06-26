const { expect } = require("chai");

let roles;
let api3Token, api3Pool;
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
});

describe("depositRegular", function () {
  it("deposits", async function () {
    const user1Deposit = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Deposit);
    await api3Token
      .connect(roles.user1)
      .approve(api3Pool.address, user1Deposit);
    await expect(api3Pool.connect(roles.user1).depositRegular(user1Deposit))
      .to.emit(api3Pool, "Deposited")
      .withArgs(roles.user1.address, user1Deposit);
    const user = await api3Pool.users(roles.user1.address);
    expect(user.unstaked).to.equal(user1Deposit);
  });
});

describe("withdrawRegular", function () {
  context("User has enough withdrawable funds", function () {
    it("withdraws", async function () {
      // Authorize pool contract to mint tokens
      await api3Token
        .connect(roles.deployer)
        .updateMinterStatus(api3Pool.address, true);
      // Have the user stake
      const user1Stake = ethers.utils.parseEther("60" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
      // Fast forward 100 epochs to have some rewards paid out and unlocked
      let currentEpoch = await api3Pool.genesisEpoch();
      for (let i = 0; i < 100; i++) {
        currentEpoch = currentEpoch.add(1);
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentEpoch.mul(EPOCH_LENGTH).toNumber(),
        ]);
        await api3Pool.mintReward();
      }
      // Schedule unstake and execute
      await api3Pool
        .connect(roles.user1)
        .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
      currentEpoch = currentEpoch.add(1);
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        currentEpoch.mul(EPOCH_LENGTH).toNumber() + 2,
      ]);
      await api3Pool.connect(roles.randomPerson).unstake(roles.user1.address);
      const userBefore = await api3Pool.users(roles.user1.address);
      const locked = await api3Pool.userLocked(roles.user1.address);
      const unlocked = userBefore.unstaked.sub(locked);
      await expect(api3Pool.connect(roles.user1).withdrawRegular(unlocked))
        .to.emit(api3Pool, "Withdrawn")
        .withArgs(roles.user1.address, unlocked);
      const userAfter = await api3Pool.users(roles.user1.address);
      expect(locked).to.equal(userAfter.unstaked);
    });
  });
  context("User does not have enough unstaked funds", function () {
    it("reverts", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
      await expect(
        api3Pool.connect(roles.user1).withdrawRegular(1)
      ).to.be.revertedWith("Pool: Not enough unstaked funds");
    });
  });
  context("User does not have enough funds", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).withdrawRegular(1)
      ).to.be.revertedWith("Pool: Not enough unlocked funds");
    });
  });
});

describe("precalculateUserLocked", function () {
  context("Iteration window is not zero", function () {
    it("updates the user locked state", async function () {
      // Authorize pool contract to mint tokens
      await api3Token
        .connect(roles.deployer)
        .updateMinterStatus(api3Pool.address, true);
      // Have the user stake
      const user1Stake = ethers.utils.parseEther("60" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
      // Fast forward 100 epochs to have some rewards paid out and unlocked
      const noEpochsToFastForward = 100;
      const genesisEpoch = await api3Pool.genesisEpoch();
      for (let i = 0; i < noEpochsToFastForward; i++) {
        const currentEpoch = genesisEpoch.add(i + 1);
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentEpoch.mul(EPOCH_LENGTH).toNumber(),
        ]);
        if (Math.random() > 0.5) {
          await api3Pool.mintReward();
        }
      }
      const noEpochsToCalculateLockedForAtEachIteration = 10;
      for (let i = 0; i < 5; i++) {
        await expect(
          api3Pool
            .connect(roles.user1)
            .precalculateUserLocked(
              roles.user1.address,
              noEpochsToCalculateLockedForAtEachIteration
            )
        )
          .to.emit(api3Pool, "CalculatingUserLocked")
          .withArgs(
            roles.user1.address,
            genesisEpoch.add(
              noEpochsToFastForward -
                (i + 1) * noEpochsToCalculateLockedForAtEachIteration
            ),
            genesisEpoch.add(noEpochsToFastForward - REWARD_VESTING_PERIOD + 1)
          );
      }
      await expect(
        api3Pool
          .connect(roles.user1)
          .precalculateUserLocked(
            roles.user1.address,
            noEpochsToCalculateLockedForAtEachIteration
          )
      )
        .to.emit(api3Pool, "CalculatedUserLocked")
        .withArgs(
          roles.user1.address,
          await api3Pool.userLocked(roles.user1.address)
        );
    });
  });
  context("Iteration window is zero", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.user1)
          .precalculateUserLocked(roles.user1.address, 0)
      ).to.be.revertedWith("Pool: Zero iteration window");
    });
  });
});

describe("withdrawPrecalculated", function () {
  context("Locked amount is calculated this epoch", function () {
    context("Calculation is complete", function () {
      it("withdraws", async function () {
        // Authorize pool contract to mint tokens
        await api3Token
          .connect(roles.deployer)
          .updateMinterStatus(api3Pool.address, true);
        // Have the user stake
        const user1Stake = ethers.utils.parseEther("60" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        // Fast forward 100 epochs to have some rewards paid out and unlocked
        const noEpochsToFastForward = 100;
        const genesisEpoch = await api3Pool.genesisEpoch();
        for (let i = 0; i < noEpochsToFastForward; i++) {
          const currentEpoch = genesisEpoch.add(i + 1);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currentEpoch.mul(EPOCH_LENGTH).toNumber(),
          ]);
          await api3Pool.mintReward();
        }
        // Schedule unstake and execute
        await api3Pool
          .connect(roles.user1)
          .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpoch.add(102).mul(EPOCH_LENGTH).toNumber(),
        ]);
        await api3Pool.connect(roles.randomPerson).unstake(roles.user1.address);
        await api3Pool
          .connect(roles.user1)
          .precalculateUserLocked(roles.user1.address, 30);
        await api3Pool
          .connect(roles.user1)
          .precalculateUserLocked(roles.user1.address, 30);
        await expect(
          api3Pool.connect(roles.user1).withdrawPrecalculated(user1Stake)
        )
          .to.emit(api3Pool, "Withdrawn")
          .withArgs(roles.user1.address, user1Stake);
      });
    });
    context("Calculation is not complete", function () {
      it("reverts", async function () {
        // Authorize pool contract to mint tokens
        await api3Token
          .connect(roles.deployer)
          .updateMinterStatus(api3Pool.address, true);
        // Have the user stake
        const user1Stake = ethers.utils.parseEther("60" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.user1.address, user1Stake);
        await api3Token
          .connect(roles.user1)
          .approve(api3Pool.address, user1Stake);
        await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
        // Fast forward 100 epochs to have some rewards paid out and unlocked
        const noEpochsToFastForward = 100;
        const genesisEpoch = await api3Pool.genesisEpoch();
        for (let i = 0; i < noEpochsToFastForward; i++) {
          const currentEpoch = genesisEpoch.add(i + 1);
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            currentEpoch.mul(EPOCH_LENGTH).toNumber(),
          ]);
          await api3Pool.mintReward();
        }
        // Schedule unstake and execute
        await api3Pool
          .connect(roles.user1)
          .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpoch.add(102).mul(EPOCH_LENGTH).toNumber(),
        ]);
        await api3Pool.connect(roles.randomPerson).unstake(roles.user1.address);
        await api3Pool
          .connect(roles.user1)
          .precalculateUserLocked(roles.user1.address, 30);
        await expect(
          api3Pool.connect(roles.user1).withdrawPrecalculated(1)
        ).to.be.revertedWith("Pool: Calculation not complete");
      });
    });
  });
  context("Locked amount is not calculated this epoch", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).withdrawPrecalculated(1)
      ).to.be.revertedWith("Pool: Calculation not up to date");
    });
  });
});
