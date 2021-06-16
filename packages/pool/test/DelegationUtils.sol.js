const { expect } = require("chai");

let roles;
let api3Token, api3Pool, api3Voting;
const epochLength = 7 * 24 * 60 * 60;

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
    roles.mockTimelockManager.address,
    epochLength
  );
  const api3VotingFactory = await ethers.getContractFactory(
    "MockApi3Voting",
    roles.deployer
  );
  api3Voting = await api3VotingFactory.deploy(api3Pool.address);
  await api3Pool
    .connect(roles.deployer)
    .setDaoApps(
      roles.agentAppPrimary.address,
      roles.agentAppSecondary.address,
      api3Voting.address,
      roles.votingAppSecondary.address
    );
});

describe("delegateVotingPower", function () {
  context("Delegate address is not zero", function () {
    context("Delegate address is not caller", function () {
      context("Delegate is not delegating", function () {
        context(
          "User has not updated their delegation status less than reward epoch ago",
          function () {
            context("User did not have the same delegate", function () {
              context("User has voting power to delegate", function () {
                it("delegates voting power", async function () {
                  // Have two users stake
                  const user1Stake = ethers.utils.parseEther(
                    "20" + "000" + "000"
                  );
                  const user2Stake = ethers.utils.parseEther(
                    "60" + "000" + "000"
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
                    .depositAndStake(user1Stake);
                  await api3Pool
                    .connect(roles.user2)
                    .depositAndStake(user2Stake);
                  // Have user 1 delegate to someone else first
                  await api3Pool
                    .connect(roles.user1)
                    .delegateVotingPower(roles.randomPerson.address);
                  expect(
                    await api3Pool.userVotingPower(roles.user1.address)
                  ).to.equal(ethers.BigNumber.from(0));
                  expect(
                    await api3Pool.userVotingPower(roles.randomPerson.address)
                  ).to.equal(user1Stake);
                  // Fast forward time
                  await ethers.provider.send("evm_increaseTime", [
                    epochLength + 1,
                  ]);
                  // ... then have user 1 delegate to user 2
                  await expect(
                    api3Pool
                      .connect(roles.user1)
                      .delegateVotingPower(roles.user2.address)
                  )
                    .to.emit(api3Pool, "Delegated")
                    .withArgs(roles.user1.address, roles.user2.address);
                  expect(
                    await api3Pool.userVotingPower(roles.user1.address)
                  ).to.equal(ethers.BigNumber.from(0));
                  expect(
                    await api3Pool.userVotingPower(roles.user2.address)
                  ).to.equal(user2Stake.add(user1Stake));
                  expect(
                    await api3Pool.delegatedToUser(roles.user2.address)
                  ).to.equal(user1Stake);
                  expect(
                    await api3Pool.userDelegate(roles.user1.address)
                  ).to.equal(roles.user2.address);
                });
              });
              context(
                "User does not have voting power to delegate",
                function () {
                  it("reverts", async function () {
                    // Attempt to have user 1 delegate to user 2 without staking first
                    await expect(
                      api3Pool
                        .connect(roles.user1)
                        .delegateVotingPower(roles.user2.address)
                    ).to.be.revertedWith("Pool: Have no shares to delegate");
                  });
                }
              );
            });
            context("User had the same delegate", function () {
              it("reverts", async function () {
                // Have two users stake
                const user1Stake = ethers.utils.parseEther(
                  "20" + "000" + "000"
                );
                const user2Stake = ethers.utils.parseEther(
                  "60" + "000" + "000"
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
                await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
                await api3Pool.connect(roles.user2).depositAndStake(user2Stake);
                // Have user 1 delegate to user 2
                await api3Pool
                  .connect(roles.user1)
                  .delegateVotingPower(roles.user2.address);
                // Fast forward time
                await ethers.provider.send("evm_increaseTime", [
                  epochLength + 1,
                ]);
                // ... then have user 1 delegate to user 2 again
                await expect(
                  api3Pool
                    .connect(roles.user1)
                    .delegateVotingPower(roles.user2.address)
                ).to.be.revertedWith("Pool: Already delegated");

                expect(
                  await api3Pool.userVotingPower(roles.user1.address)
                ).to.equal(ethers.BigNumber.from(0));
                expect(
                  await api3Pool.userVotingPower(roles.user2.address)
                ).to.equal(user2Stake.add(user1Stake));
              });
            });
          }
        );
        context(
          "User has updated their delegation status less than reward epoch ago",
          function () {
            it("reverts", async function () {
              const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
              await api3Token
                .connect(roles.deployer)
                .transfer(roles.user1.address, user1Stake);
              await api3Token
                .connect(roles.user1)
                .approve(api3Pool.address, user1Stake);
              await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
              // Have user 1 delegate to someone else first
              await api3Pool
                .connect(roles.user1)
                .delegateVotingPower(roles.randomPerson.address);
              // Attempt to have user 1 delegate to user 2 without waiting
              await expect(
                api3Pool
                  .connect(roles.user1)
                  .delegateVotingPower(roles.user2.address)
              ).to.be.revertedWith("Pool: Updated delegate recently");
            });
          }
        );
      });
      context("Delegate is delegating", function () {
        it("reverts", async function () {
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
          // Have user 2 delegate to someone else first
          await api3Pool
            .connect(roles.user2)
            .delegateVotingPower(roles.randomPerson.address);
          // ... then have user 1 attempt to delegate to user 2
          await expect(
            api3Pool
              .connect(roles.user1)
              .delegateVotingPower(roles.user2.address)
          ).to.be.revertedWith("Pool: Delegate is delegating");
        });
      });
    });
    context("Delegate address is caller", function () {
      it("reverts", async function () {
        await expect(
          api3Pool.connect(roles.user1).delegateVotingPower(roles.user1.address)
        ).to.be.revertedWith("Pool: Invalid delegate");
      });
    });
  });
  context("Delegate address is zero", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.user1)
          .delegateVotingPower(ethers.constants.AddressZero)
      ).to.be.revertedWith("Pool: Invalid delegate");
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
          // Have user 1 delegate to user 2 first
          await api3Pool
            .connect(roles.user1)
            .delegateVotingPower(roles.user2.address);
          // Fast forward time
          await ethers.provider.send("evm_increaseTime", [epochLength + 1]);
          // Have user 1 undelegate
          await expect(api3Pool.connect(roles.user1).undelegateVotingPower())
            .to.emit(api3Pool, "Undelegated")
            .withArgs(roles.user1.address, roles.user2.address);
          expect(await api3Pool.userVotingPower(roles.user1.address)).to.equal(
            user1Stake
          );
          expect(await api3Pool.userVotingPower(roles.user2.address)).to.equal(
            user2Stake
          );
          expect(await api3Pool.delegatedToUser(roles.user2.address)).to.equal(
            ethers.BigNumber.from(0)
          );
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
          const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
          await api3Token
            .connect(roles.deployer)
            .transfer(roles.user1.address, user1Stake);
          await api3Token
            .connect(roles.user1)
            .approve(api3Pool.address, user1Stake);
          await api3Pool.connect(roles.user1).depositAndStake(user1Stake);
          // Have user 1 delegate to user 2 first
          await api3Pool
            .connect(roles.user1)
            .delegateVotingPower(roles.user2.address);
          // Attempt to have user 1 undelegate without waiting
          await expect(
            api3Pool.connect(roles.user1).undelegateVotingPower()
          ).to.be.revertedWith("Pool: Updated delegate recently");
        });
      }
    );
  });
  context("User has not delegated before", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).undelegateVotingPower()
      ).to.be.revertedWith("Pool: Not delegated");
    });
  });
});
