const { expect } = require("chai");

let roles;
let api3Token, api3Pool;

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    daoAgent: accounts[1],
    claimsManager: accounts[2],
    user1: accounts[3],
    user2: accounts[4],
    timelockManagerOwner: accounts[5],
    mockTimelockManager: accounts[6],
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

describe("depositWithVesting", function () {
  context("User has not received from this timelock manager", function () {
    context("Release end is later than release start", function () {
      context("Amount is not zero", function () {
        it("deposits with vesting", async function () {
          const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.mockTimelockManager.address, depositAmount);
          const currentBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
          );
          const releaseStart = currentBlock.timestamp - 100;
          const releaseEnd = currentBlock.timestamp + 100;
          await api3Token
            .connect(roles.mockTimelockManager)
            .approve(api3Pool.address, depositAmount);
          await expect(
            api3Pool
              .connect(roles.mockTimelockManager)
              .depositWithVesting(
                roles.mockTimelockManager.address,
                depositAmount,
                roles.user1.address,
                releaseStart,
                releaseEnd
              )
          )
            .to.emit(api3Pool, "DepositedVesting")
            .withArgs(
              roles.user1.address,
              depositAmount,
              releaseStart,
              releaseEnd
            );
        });
      });
      context("Amount is zero", function () {
        it("reverts", async function () {
          const depositAmount = ethers.BigNumber.from(0);
          const currentBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
          );
          const releaseStart = currentBlock.timestamp - 100;
          const releaseEnd = currentBlock.timestamp + 100;
          await expect(
            api3Pool
              .connect(roles.mockTimelockManager)
              .depositWithVesting(
                roles.mockTimelockManager.address,
                depositAmount,
                roles.user1.address,
                releaseStart,
                releaseEnd
              )
          ).to.be.revertedWith("Invalid value");
        });
      });
    });
    context("Release end is not later than release start", function () {
      it("reverts", async function () {
        const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
        const currentBlock = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
        );
        const releaseStart = currentBlock.timestamp + 100;
        const releaseEnd = currentBlock.timestamp - 100;
        await expect(
          api3Pool
            .connect(roles.mockTimelockManager)
            .depositWithVesting(
              roles.mockTimelockManager.address,
              depositAmount,
              roles.user1.address,
              releaseStart,
              releaseEnd
            )
        ).to.be.revertedWith("Invalid value");
      });
    });
  });
  context("User has received from this timelock manager before", function () {
    it("reverts", async function () {
      const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.mockTimelockManager.address, depositAmount);
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      const releaseStart = currentBlock.timestamp - 100;
      const releaseEnd = currentBlock.timestamp + 100;
      await api3Token
        .connect(roles.mockTimelockManager)
        .approve(api3Pool.address, depositAmount);
      await api3Pool
        .connect(roles.mockTimelockManager)
        .depositWithVesting(
          roles.mockTimelockManager.address,
          depositAmount,
          roles.user1.address,
          releaseStart,
          releaseEnd
        );
      await expect(
        api3Pool
          .connect(roles.mockTimelockManager)
          .depositWithVesting(
            roles.mockTimelockManager.address,
            depositAmount,
            roles.user1.address,
            releaseStart,
            releaseEnd
          )
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("updateTimelockStatus", function () {
  context("Timelock has started releasing", function () {
    context("Timelock has remaining tokens", function () {
      context("It is past release end", function () {
        it("updates timelock status", async function () {
          const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.mockTimelockManager.address, depositAmount);
          const currentBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
          );
          const releaseStart = currentBlock.timestamp - 100;
          const releaseEnd = currentBlock.timestamp - 20;
          await api3Token
            .connect(roles.mockTimelockManager)
            .approve(api3Pool.address, depositAmount);
          await api3Pool
            .connect(roles.mockTimelockManager)
            .depositWithVesting(
              roles.mockTimelockManager.address,
              depositAmount,
              roles.user1.address,
              releaseStart,
              releaseEnd
            );
          await expect(
            api3Pool
              .connect(roles.randomPerson)
              .updateTimelockStatus(
                roles.user1.address,
                roles.mockTimelockManager.address
              )
          )
            .to.emit(api3Pool, "UpdatedTimelock")
            .withArgs(
              roles.user1.address,
              roles.mockTimelockManager.address,
              ethers.BigNumber.from(0)
            );
        });
      });
      context("It is not past release end", function () {
        it("updates timelock status", async function () {
          const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.mockTimelockManager.address, depositAmount);
          await api3Token
            .connect(roles.mockTimelockManager)
            .approve(api3Pool.address, depositAmount);
          const currentBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
          );
          // Take into account the next two transactions that will have the timestamp tick twice
          const releaseStart = currentBlock.timestamp - 98;
          const releaseEnd = currentBlock.timestamp + 102;
          await api3Pool
            .connect(roles.mockTimelockManager)
            .depositWithVesting(
              roles.mockTimelockManager.address,
              depositAmount,
              roles.user1.address,
              releaseStart,
              releaseEnd
            );
          await expect(
            api3Pool
              .connect(roles.randomPerson)
              .updateTimelockStatus(
                roles.user1.address,
                roles.mockTimelockManager.address
              )
          )
            .to.emit(api3Pool, "UpdatedTimelock")
            .withArgs(
              roles.user1.address,
              roles.mockTimelockManager.address,
              depositAmount.div(2)
            );
        });
      });
    });
    context("Timelock does not have remaining tokens", function () {
      it("reverts", async function () {
        const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .transfer(roles.mockTimelockManager.address, depositAmount);
        const currentBlock = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
        );
        const releaseStart = currentBlock.timestamp - 100;
        const releaseEnd = currentBlock.timestamp - 20;
        await api3Token
          .connect(roles.mockTimelockManager)
          .approve(api3Pool.address, depositAmount);
        await api3Pool
          .connect(roles.mockTimelockManager)
          .depositWithVesting(
            roles.mockTimelockManager.address,
            depositAmount,
            roles.user1.address,
            releaseStart,
            releaseEnd
          );
        await api3Pool
          .connect(roles.randomPerson)
          .updateTimelockStatus(
            roles.user1.address,
            roles.mockTimelockManager.address
          );
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .updateTimelockStatus(
              roles.user1.address,
              roles.mockTimelockManager.address
            )
        ).to.be.revertedWith("Unauthorized");
      });
    });
  });
  context("Timelock has not started releasing", function () {
    it("reverts", async function () {
      const depositAmount = ethers.utils.parseEther("10" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.mockTimelockManager.address, depositAmount);
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      const releaseStart = currentBlock.timestamp + 100;
      const releaseEnd = currentBlock.timestamp + 120;
      await api3Token
        .connect(roles.mockTimelockManager)
        .approve(api3Pool.address, depositAmount);
      await api3Pool
        .connect(roles.mockTimelockManager)
        .depositWithVesting(
          roles.mockTimelockManager.address,
          depositAmount,
          roles.user1.address,
          releaseStart,
          releaseEnd
        );
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .updateTimelockStatus(
            roles.user1.address,
            roles.mockTimelockManager.address
          )
      ).to.be.revertedWith("Unauthorized");
    });
  });
});
