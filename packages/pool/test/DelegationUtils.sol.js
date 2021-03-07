const { expect } = require("chai");

let roles;
let api3Token, api3Pool;
let epochLength;

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
  epochLength = await api3Pool.EPOCH_LENGTH();
});

describe("delegateVotingPower", function () {
  context("Delegate address is not zero", function () {
    context("Delegate address is not caller", function () {
      context("Delegate is not delegating", function () {
        context(
          "User has not updated their delegation status less than reward epoch ago",
          function () {
            context("User did not have the same delegate", function () {
              it("delegates voting power", async function () {
                // Have two users stake
                const user1Stake = ethers.utils.parseEther(
                  "10" + "000" + "000"
                );
                const user2Stake = ethers.utils.parseEther(
                  "30" + "000" + "000"
                );
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
                // Have user 1 delegate to someone else first
                await api3Pool
                  .connect(roles.user1)
                  .delegateVotingPower(roles.randomPerson.address);
                expect(await api3Pool.balanceOf(roles.user1.address)).to.equal(
                  ethers.BigNumber.from(0)
                );
                expect(
                  await api3Pool.balanceOf(roles.randomPerson.address)
                ).to.equal(user1Stake);
                // Fast forward time
                await ethers.provider.send("evm_increaseTime", [
                  epochLength.toNumber(),
                ]);
                // ... then have user 1 delegate to user 2
                await expect(
                  api3Pool
                    .connect(roles.user1)
                    .delegateVotingPower(roles.user2.address)
                )
                  .to.emit(api3Pool, "Delegated")
                  .withArgs(roles.user1.address, roles.user2.address);
                expect(await api3Pool.balanceOf(roles.user1.address)).to.equal(
                  ethers.BigNumber.from(0)
                );
                expect(await api3Pool.balanceOf(roles.user2.address)).to.equal(
                  user2Stake.add(user1Stake)
                );
                expect(
                  await api3Pool.userReceivedDelegation(roles.user2.address)
                ).to.equal(user1Stake);
                expect(
                  await api3Pool.userDelegate(roles.user1.address)
                ).to.equal(roles.user2.address);
              });
            });
            context("User had the same delegate", function () {
              it("does nothing", async function () {
                // Have two users stake
                const user1Stake = ethers.utils.parseEther(
                  "10" + "000" + "000"
                );
                const user2Stake = ethers.utils.parseEther(
                  "30" + "000" + "000"
                );
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
                // Have user 1 delegate to user 2
                await api3Pool
                  .connect(roles.user1)
                  .delegateVotingPower(roles.user2.address);
                // Fast forward time
                await ethers.provider.send("evm_increaseTime", [
                  epochLength.toNumber(),
                ]);
                // ... then have user 1 delegate to user 2 again
                await expect(
                  api3Pool
                    .connect(roles.user1)
                    .delegateVotingPower(roles.user2.address)
                ).to.not.emit(api3Pool, "Delegated");
                expect(await api3Pool.balanceOf(roles.user1.address)).to.equal(
                  ethers.BigNumber.from(0)
                );
                expect(await api3Pool.balanceOf(roles.user2.address)).to.equal(
                  user2Stake.add(user1Stake)
                );
              });
            });
          }
        );
        context(
          "User has updated their delegation status less than reward epoch ago",
          function () {
            it("reverts", async function () {
              // Have user 1 delegate to someone else first
              await api3Pool
                .connect(roles.user1)
                .delegateVotingPower(roles.randomPerson.address);
              // Attempt to have user 1 delegate to user 2 without waiting
              await expect(
                api3Pool
                  .connect(roles.user1)
                  .delegateVotingPower(roles.user2.address)
              ).to.be.revertedWith("Unauthorized");
            });
          }
        );
      });
      context("Delegate is delegating", function () {
        it("reverts", async function () {
          // Have user 2 delegate to someone else first
          await api3Pool
            .connect(roles.user2)
            .delegateVotingPower(roles.randomPerson.address);
          // ... then have user 1 attempt to delegate to user 2
          await expect(
            api3Pool
              .connect(roles.user1)
              .delegateVotingPower(roles.user2.address)
          ).to.be.revertedWith("Invalid address");
        });
      });
    });
    context("Delegate address is caller", function () {
      it("reverts", async function () {
        await expect(
          api3Pool.connect(roles.user1).delegateVotingPower(roles.user1.address)
        ).to.be.revertedWith("Invalid address");
      });
    });
  });
  context("Delegate address is zero", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.user1)
          .delegateVotingPower(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });
  });
});

describe("undelegateVotingPower", function () {
  context("User has delegated before", function () {
    context(
      "User has not updated their delegation status less than reward epoch ago",
      function () {
        it("undelegates voting power", async function () {
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
          // Have user 1 delegate to user 2 first
          await api3Pool
            .connect(roles.user1)
            .delegateVotingPower(roles.user2.address);
          // Fast forward time
          await ethers.provider.send("evm_increaseTime", [
            epochLength.toNumber(),
          ]);
          // Have user 1 undelegate
          await expect(api3Pool.connect(roles.user1).undelegateVotingPower())
            .to.emit(api3Pool, "Undelegated")
            .withArgs(roles.user1.address, roles.user2.address);
          expect(await api3Pool.balanceOf(roles.user1.address)).to.equal(
            user1Stake
          );
          expect(await api3Pool.balanceOf(roles.user2.address)).to.equal(
            user2Stake
          );
          expect(
            await api3Pool.userReceivedDelegation(roles.user2.address)
          ).to.equal(ethers.BigNumber.from(0));
          expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
            ethers.constants.AddressZero
          );
        });
      }
    );
    context(
      "User has updated their delegation status less than reward epoch ago",
      function () {
        it("reverts", async function () {
          // Have user 1 delegate to user 2 first
          await api3Pool
            .connect(roles.user1)
            .delegateVotingPower(roles.user2.address);
          // Attempt to have user 1 undelegate without waiting
          await expect(
            api3Pool.connect(roles.user1).undelegateVotingPower()
          ).to.be.revertedWith("Unauthorized");
        });
      }
    );
  });
  context("User has not delegated before", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).undelegateVotingPower()
      ).to.be.revertedWith("Unauthorized");
    });
  });
});
