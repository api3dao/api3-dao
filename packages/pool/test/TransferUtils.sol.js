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

describe("deposit", function () {
  it("deposits", async function () {
    const user1Deposit = ethers.utils.parseEther("20" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .approve(api3Pool.address, user1Deposit);
    await expect(
      api3Pool
        .connect(roles.randomPerson)
        .deposit(roles.deployer.address, user1Deposit, roles.user1.address)
    )
      .to.emit(api3Pool, "Deposited")
      .withArgs(roles.user1.address, user1Deposit);
    const user = await api3Pool.users(roles.user1.address);
    expect(user.unstaked).to.equal(user1Deposit);
  });
});

describe("withdraw", function () {
  context("User has enough withdrawable funds", function () {
    it("updates user locked and withdraws", async function () {
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
      await api3Pool
        .connect(roles.user1)
        .depositAndStake(roles.user1.address, user1Stake, roles.user1.address);
      // Fast forward 100 epochs to have some rewards paid out and unlocked
      const genesisEpoch = await api3Pool.genesisEpoch();
      for (let i = 0; i < 100; i++) {
        const currentEpoch = genesisEpoch.add(ethers.BigNumber.from(i + 1));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentEpoch.mul(EPOCH_LENGTH).toNumber(),
        ]);
        await api3Pool.payReward();
      }
      // Schedule unstake and execute
      await api3Pool
        .connect(roles.user1)
        .scheduleUnstake(await api3Pool.userStake(roles.user1.address));
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        genesisEpoch.add(102).mul(EPOCH_LENGTH).toNumber(),
      ]);
      await api3Pool.connect(roles.user1).unstake();
      const userBefore = await api3Pool.users(roles.user1.address);
      const unlocked = userBefore.unstaked.sub(
        await api3Pool.callStatic.getUserLocked(roles.user1.address)
      );
      await expect(
        api3Pool.connect(roles.user1).withdraw(roles.user1.address, unlocked)
      )
        .to.emit(api3Pool, "Withdrawn")
        .withArgs(roles.user1.address, roles.user1.address, unlocked);
      const userAfter = await api3Pool.users(roles.user1.address);
      expect(
        await api3Pool.callStatic.getUserLocked(roles.user1.address)
      ).to.equal(userAfter.unstaked);
    });
  });
  context("User does not have enough withdrawable funds", function () {
    it("reverts", async function () {
      const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await api3Pool
        .connect(roles.user1)
        .depositAndStake(roles.user1.address, user1Stake, roles.user1.address);
      await expect(
        api3Pool
          .connect(roles.user1)
          .withdraw(roles.user1.address, ethers.BigNumber.from(1))
      ).to.be.revertedWith(
        "API3DAO.TransferUtils: Withdrawal amount should be less or equal to the unstaked tokens");
    });
  });
  context("User does not have enough funds", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.user1)
          .withdraw(roles.user1.address, ethers.BigNumber.from(1))
      ).to.be.revertedWith("API3DAO.TransferUtils: User total funds should be bigger then locked and amount to withdraw");
    });
  });
});
