const { expect } = require("chai");

let roles;
let api3Token, api3Pool;

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
    timelockManagerOwner: accounts[8],
    mockTimelockManager: accounts[9],
    randomPerson: accounts[10],
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
});

describe("deposit", function () {
  context("Caller is the timelock manager", function () {
    it("deposits", async function () {
      const timelockManagerDeposit = ethers.utils.parseEther(
        "20" + "000" + "000"
      );
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.mockTimelockManager.address, timelockManagerDeposit);
      await api3Token
        .connect(roles.mockTimelockManager)
        .approve(api3Pool.address, timelockManagerDeposit);
      await expect(
        api3Pool
          .connect(roles.mockTimelockManager)
          .deposit(
            roles.mockTimelockManager.address,
            timelockManagerDeposit,
            roles.user1.address
          )
      )
        .to.emit(api3Pool, "DepositedByTimelockManager")
        .withArgs(roles.user1.address, timelockManagerDeposit);
      const user = await api3Pool.users(roles.user1.address);
      expect(user.unstaked).to.equal(timelockManagerDeposit);
    });
  });
  context("Caller is not the timelock manager", function () {
    it("reverts", async function () {
      const timelockManagerDeposit = ethers.utils.parseEther(
        "20" + "000" + "000"
      );
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .deposit(
            roles.randomPerson.address,
            timelockManagerDeposit,
            roles.randomPerson.address
          )
      ).to.be.revertedWith("Pool: Caller not TimelockManager");
    });
  });
});

describe("depositWithVesting", function () {
  context("Caller is the timelock manager", function () {
    context("User does not have an active timelock", function () {
      context("Release end is later than release start", function () {
        context("Amount is not zero", function () {
          it("deposits with vesting", async function () {
            const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
            ).to.be.revertedWith("Pool: Timelock amount zero");
          });
        });
      });
      context("Release end is not later than release start", function () {
        it("updates release start and deposits with vesting", async function () {
          const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.mockTimelockManager.address, depositAmount);
          const currentBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
          );
          await api3Token
            .connect(roles.mockTimelockManager)
            .approve(api3Pool.address, depositAmount);
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
          )
            .to.emit(api3Pool, "DepositedVesting")
            .withArgs(
              roles.user1.address,
              depositAmount,
              releaseEnd - 1,
              releaseEnd
            );
        });
      });
    });
    context("User has an active timelock", function () {
      it("reverts", async function () {
        const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
        ).to.be.revertedWith("Pool: User has active timelock");
      });
    });
  });
  context("Caller is not the timelock manager", function () {
    it("reverts", async function () {
      const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
          .connect(roles.randomPerson)
          .depositWithVesting(
            roles.mockTimelockManager.address,
            depositAmount,
            roles.user1.address,
            releaseStart,
            releaseEnd
          )
      ).to.be.revertedWith("Pool: Caller not TimelockManager");
    });
  });
});

describe("updateTimelockStatus", function () {
  context("Timelock has started releasing", function () {
    context("Timelock has remaining tokens", function () {
      context("It is past release end", function () {
        it("updates timelock status", async function () {
          const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
              .updateTimelockStatus(roles.user1.address)
          )
            .to.emit(api3Pool, "VestedTimelock")
            .withArgs(roles.user1.address, depositAmount);
        });
      });
      context("It is not past release end", function () {
        it("updates timelock status", async function () {
          const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
              .updateTimelockStatus(roles.user1.address)
          )
            .to.emit(api3Pool, "VestedTimelock")
            .withArgs(roles.user1.address, depositAmount.div(2));
        });
      });
    });
    context("Timelock does not have remaining tokens", function () {
      it("reverts", async function () {
        const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
          .updateTimelockStatus(roles.user1.address);
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .updateTimelockStatus(roles.user1.address)
        ).to.be.revertedWith("Pool: Timelock already released");
      });
    });
  });
  context("Timelock has not started releasing", function () {
    it("reverts", async function () {
      const depositAmount = ethers.utils.parseEther("20" + "000" + "000");
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
          .updateTimelockStatus(roles.user1.address)
      ).to.be.revertedWith("Pool: Release not started yet");
    });
  });
});
