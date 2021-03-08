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

describe("stake", function () {
  context("User has enough to stake", function () {
    context("User has a delegate and has staked before", function () {
      it("stakes and updates delegated voting power", async function () {
        const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
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
        expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
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
            user1Stake.div(ethers.BigNumber.from(2))
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
        expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
          roles.user2.address
        );
      });
    });
    context("User does not have a delegate", function () {
      it("stakes", async function () {
        const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
        await api3Token
          .connect(roles.deployer)
          .approve(api3Pool.address, user1Stake);
        await api3Pool
          .connect(roles.randomPerson)
          .deposit(roles.deployer.address, user1Stake, roles.user1.address);
        await expect(api3Pool.connect(roles.user1).stake(user1Stake))
          .to.emit(api3Pool, "Staked")
          .withArgs(roles.user1.address, user1Stake);
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
      const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
      await expect(
        api3Pool.connect(roles.user1).stake(user1Stake)
      ).to.be.revertedWith("Invalid value");
    });
  });
});

describe("depositAndStake", function () {
  context("Caller is the beneficiary", function () {
    it("deposits and stakes", async function () {
      const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
      await api3Token
        .connect(roles.deployer)
        .transfer(roles.user1.address, user1Stake);
      await api3Token
        .connect(roles.user1)
        .approve(api3Pool.address, user1Stake);
      await expect(
        api3Pool
          .connect(roles.user1)
          .depositAndStake(roles.user1.address, user1Stake, roles.user1.address)
      )
        .to.emit(api3Pool, "Staked")
        .withArgs(roles.user1.address, user1Stake);
    });
  });
  context("Caller is not the beneficiary", function () {
    it("reverts", async function () {
      const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .depositAndStake(roles.user1.address, user1Stake, roles.user1.address)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("scheduleUnstake", function () {
  context("User has enough staked to schedule unstake", function () {
    context(
      "User's reward for this epoch has not been revoked due to an earlier unstake scheduling",
      function () {
        context("Reward has been paid this epoch", function () {
          context("User has received the reward", function () {
            context("User still has the reward", function () {
              it("revokes this epoch's reward and schedules unstake", async function () {
                // Authorize pool contract to mint tokens
                await api3Token
                  .connect(roles.deployer)
                  .updateMinterStatus(api3Pool.address, true);
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
                // Fast forward time to one epoch into the future
                const genesisEpoch = await api3Pool.genesisEpoch();
                const genesisEpochPlusOne = genesisEpoch.add(
                  ethers.BigNumber.from(1)
                );
                await ethers.provider.send("evm_setNextBlockTimestamp", [
                  genesisEpochPlusOne.mul(epochLength).toNumber(),
                ]);
                // Pay reward
                await api3Pool.connect(roles.randomPerson).payReward();
                const userStakeAfterReward = await api3Pool.userStake(
                  roles.user1.address
                );
                // The `payReward()` above adds one tick to the timestamp
                const unstakeScheduledFor = genesisEpochPlusOne
                  .mul(epochLength)
                  .add(epochLength)
                  .add(ethers.BigNumber.from(1));
                // Schedule unstake
                await expect(
                  api3Pool.connect(roles.user1).scheduleUnstake(user1Stake)
                )
                  .to.emit(api3Pool, "ScheduledUnstake")
                  .withArgs(
                    roles.user1.address,
                    user1Stake,
                    unstakeScheduledFor
                  );
                const userStakeAfterPenalty = await api3Pool.userStake(
                  roles.user1.address
                );
                const userReward = userStakeAfterReward.sub(user1Stake);
                const userPenalty = userStakeAfterReward.sub(
                  userStakeAfterPenalty
                );
                expect(userReward).to.equal(userPenalty);
              });
            });
            context("User no longer has the reward", function () {
              it("reverts", async function () {
                // Authorize pool contract to mint tokens
                await api3Token
                  .connect(roles.deployer)
                  .updateMinterStatus(api3Pool.address, true);
                // Have the user stake
                const user1Stake = ethers.utils.parseEther(
                  "10" + "000" + "000"
                );
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
                  genesisEpochPlusOne.mul(epochLength).toNumber(),
                ]);
                // Pay reward
                await api3Pool.connect(roles.randomPerson).payReward();
                // Set the DAO Agent
                await api3Pool
                  .connect(roles.randomPerson)
                  .setDaoAgent(roles.daoAgent.address);
                // Set claims manager status as true with the DAO Agent
                await api3Pool
                  .connect(roles.daoAgent)
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
                await expect(
                  api3Pool
                    .connect(roles.user1)
                    .scheduleUnstake(
                      await api3Pool.userStake(roles.user1.address)
                    )
                ).to.be.revertedWith("Unauthorized");
              });
            });
          });
          context("User has not received the reward", function () {
            it("schedules unstake", async function () {
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
                genesisEpochPlusOne.mul(epochLength).toNumber(),
              ]);
              // Pay reward
              await api3Pool.connect(roles.randomPerson).payReward();
              // Have user 1 stake after the reward payment
              await api3Pool
                .connect(roles.user1)
                .depositAndStake(
                  roles.user1.address,
                  user1Stake,
                  roles.user1.address
                );
              // The transactions above add two ticks to the timestamp
              const unstakeScheduledFor = genesisEpochPlusOne
                .mul(epochLength)
                .add(epochLength)
                .add(ethers.BigNumber.from(2));
              // Schedule unstake
              const userStakeBeforePenalty = await api3Pool.userStake(
                roles.user1.address
              );
              await expect(
                api3Pool
                  .connect(roles.user1)
                  .scheduleUnstake(userStakeBeforePenalty)
              )
                .to.emit(api3Pool, "ScheduledUnstake")
                .withArgs(
                  roles.user1.address,
                  userStakeBeforePenalty,
                  unstakeScheduledFor
                );
              const userStakeAfterPenalty = await api3Pool.userStake(
                roles.user1.address
              );
              const userPenalty = userStakeBeforePenalty.sub(
                userStakeAfterPenalty
              );
              expect(userPenalty).to.equal(ethers.BigNumber.from(0));
            });
          });
        });
        context("Reward has not been paid this epoch", function () {
          it("schedules unstake", async function () {
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
            const genesisEpoch = await api3Pool.genesisEpoch();
            const genesisEpochPlusOne = genesisEpoch.add(
              ethers.BigNumber.from(1)
            );
            await ethers.provider.send("evm_setNextBlockTimestamp", [
              genesisEpochPlusOne.mul(epochLength).toNumber(),
            ]);
            // Skip the reward payment
            const unstakeScheduledFor = genesisEpochPlusOne
              .mul(epochLength)
              .add(epochLength);
            // Schedule unstake
            const userStakeBeforePenalty = await api3Pool.userStake(
              roles.user1.address
            );
            await expect(
              api3Pool.connect(roles.user1).scheduleUnstake(user1Stake)
            )
              .to.emit(api3Pool, "ScheduledUnstake")
              .withArgs(roles.user1.address, user1Stake, unstakeScheduledFor);
            const userStakeAfterPenalty = await api3Pool.userStake(
              roles.user1.address
            );
            const userPenalty = userStakeBeforePenalty.sub(
              userStakeAfterPenalty
            );
            expect(userPenalty).to.equal(ethers.BigNumber.from(0));
          });
        });
      }
    );
    context(
      "User's reward for this epoch has been revoked due to an earlier unstake scheduling",
      function () {
        it("schedules unstake", async function () {
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
            genesisEpochPlusOne.mul(epochLength).toNumber(),
          ]);
          // Pay reward
          await api3Pool.connect(roles.randomPerson).payReward();
          // Schedule unstake
          await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
          // The transactions above add two ticks to the timestamp
          const unstakeScheduledFor = genesisEpochPlusOne
            .mul(epochLength)
            .add(epochLength)
            .add(ethers.BigNumber.from(2));
          const userStakeBeforePenalty = await api3Pool.userStake(
            roles.user1.address
          );
          await expect(
            api3Pool
              .connect(roles.user1)
              .scheduleUnstake(userStakeBeforePenalty)
          )
            .to.emit(api3Pool, "ScheduledUnstake")
            .withArgs(
              roles.user1.address,
              userStakeBeforePenalty,
              unstakeScheduledFor
            );
          const userStakeAfterPenalty = await api3Pool.userStake(
            roles.user1.address
          );
          const userPenalty = userStakeBeforePenalty.sub(userStakeAfterPenalty);
          expect(userPenalty).to.equal(ethers.BigNumber.from(0));
        });
      }
    );
  });
  context("User does not have enough staked to schedule unstake", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.user1).scheduleUnstake(ethers.BigNumber.from(1))
      ).to.be.revertedWith("Invalid value");
    });
  });
});

describe("unstake", function () {
  context("Enough time has passed since the unstake scheduling", function () {
    context("The unstake has not expired", function () {
      context("User still has the tokens to unstake", function () {
        context("User has a delegate", function () {
          it("unstakes and updates delegated voting power", async function () {
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
            // Have the user delegate
            await api3Pool
              .connect(roles.user1)
              .delegateVotingPower(roles.user2.address);
            expect(
              await api3Pool.userReceivedDelegation(roles.user2.address)
            ).to.equal(ethers.BigNumber.from(user1Stake));
            expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
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
              genesisEpochPlusTwo.mul(epochLength).toNumber(),
            ]);
            // Unstake
            await expect(api3Pool.connect(roles.user1).unstake())
              .to.emit(api3Pool, "Unstaked")
              .withArgs(roles.user1.address, user1Stake);
            // Delegation remains
            expect(
              await api3Pool.userReceivedDelegation(roles.user2.address)
            ).to.equal(await api3Pool.userShares(roles.user1.address));
            // This epoch's reward remains as being delegated
            expect(await api3Pool.userDelegate(roles.user1.address)).to.equal(
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
            // Schedule unstake
            await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
            // Fast forward time to one epoch into the future
            const genesisEpoch = await api3Pool.genesisEpoch();
            const genesisEpochPlusTwo = genesisEpoch.add(
              ethers.BigNumber.from(2)
            );
            await ethers.provider.send("evm_setNextBlockTimestamp", [
              genesisEpochPlusTwo.mul(epochLength).toNumber(),
            ]);
            // Unstake
            await expect(api3Pool.connect(roles.user1).unstake())
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
          // Schedule unstake
          await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
          // Set the DAO Agent
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          // Set claims manager status as true with the DAO Agent
          await api3Pool
            .connect(roles.daoAgent)
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
          const genesisEpochPlusTwo = genesisEpoch.add(
            ethers.BigNumber.from(2)
          );
          await ethers.provider.send("evm_setNextBlockTimestamp", [
            genesisEpochPlusTwo.mul(epochLength).toNumber(),
          ]);
          // Unstake
          const userStakedBeforeUnstake = await api3Pool.userStake(
            roles.user1.address
          );
          await expect(api3Pool.connect(roles.user1).unstake())
            .to.emit(api3Pool, "Unstaked")
            .withArgs(roles.user1.address, userStakedBeforeUnstake);
          const userStakedAfterUnstake = await api3Pool.userStake(
            roles.user1.address
          );
          const user = await api3Pool.users(roles.user1.address);
          expect(user.unstaked).to.equal(userStakedBeforeUnstake);
          expect(userStakedAfterUnstake).to.equal(ethers.BigNumber.from(0));
        });
      });
    });
    context("The unstake has expired", function () {
      it("reverts", async function () {
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
        // Schedule unstake
        await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
        // Fast forward time to one epoch into the future
        const genesisEpoch = await api3Pool.genesisEpoch();
        const genesisEpochPlusFive = genesisEpoch.add(ethers.BigNumber.from(5));
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          genesisEpochPlusFive.mul(epochLength).toNumber(),
        ]);
        // Attempt to unstake
        await expect(
          api3Pool.connect(roles.user1).unstake()
        ).to.be.revertedWith("Unauthorized");
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
        // Schedule unstake
        await api3Pool.connect(roles.user1).scheduleUnstake(user1Stake);
        // Attempt to unstake
        await expect(
          api3Pool.connect(roles.user1).unstake()
        ).to.be.revertedWith("Unauthorized");
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
    const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .transfer(roles.user1.address, user1Stake);
    await api3Token.connect(roles.user1).approve(api3Pool.address, user1Stake);
    await api3Pool
      .connect(roles.user1)
      .depositAndStake(roles.user1.address, user1Stake, roles.user1.address);
    // Schedule unstake
    const user1Unstake = user1Stake.div(ethers.BigNumber.from(2));
    await api3Pool.connect(roles.user1).scheduleUnstake(user1Unstake);
    // Fast forward time to one epoch into the future
    const genesisEpoch = await api3Pool.genesisEpoch();
    const genesisEpochPlusTwo = genesisEpoch.add(ethers.BigNumber.from(2));
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      genesisEpochPlusTwo.mul(epochLength).toNumber(),
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
