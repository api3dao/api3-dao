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
});

describe("constructor", function () {
  context("Api3Token is valid", function () {
    context("TimelockManager is valid", function () {
      it("initializes with the correct parameters", async function () {
        // Epoch length is 1 week in seconds
        expect(EPOCH_LENGTH).to.equal(7 * 24 * 60 * 60);
        // Reward vesting period is 52 week = 1 year
        expect(await api3Pool.REWARD_VESTING_PERIOD()).to.equal(52);
        // App addresses are not set
        expect(await api3Pool.agentAppPrimary()).to.equal(
          ethers.constants.AddressZero
        );
        expect(await api3Pool.agentAppSecondary()).to.equal(
          ethers.constants.AddressZero
        );
        expect(await api3Pool.votingAppPrimary()).to.equal(
          ethers.constants.AddressZero
        );
        expect(await api3Pool.votingAppSecondary()).to.equal(
          ethers.constants.AddressZero
        );
        // Claims manager statuses are false by default
        expect(
          await api3Pool.claimsManagerStatus(roles.randomPerson.address)
        ).to.equal(false);

        // Verify the default DAO parameters
        expect(await api3Pool.stakeTarget()).to.equal(
          `50${"0".repeat(16)}` // 50%
        );
        expect(await api3Pool.minApr()).to.equal(
          `25${"0".repeat(15)}` // 2.5%
        );
        expect(await api3Pool.maxApr()).to.equal(
          `75${"0".repeat(16)}` // 75%
        );
        expect(await api3Pool.aprUpdateStep()).to.equal(
          `1${"0".repeat(16)}` // 1%
        );
        expect(await api3Pool.unstakeWaitPeriod()).to.equal(
          7 * 24 * 60 * 60 // 1 week
        );
        expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
          `1${"0".repeat(15)}` // 0.1%
        );
        // Initialize the APR at (maxApr / minApr) / 2
        expect(await api3Pool.apr()).to.equal(
          `3875${"0".repeat(14)}` // 38.75%
        );

        // Token address set correctly
        expect(await api3Pool.api3Token()).to.equal(api3Token.address);
        // TimelockManager address set correctly
        expect(await api3Pool.timelockManager()).to.equal(
          roles.mockTimelockManager.address
        );
        // Initialize share price at 1
        expect(await api3Pool.totalShares()).to.equal(1);
        expect(await api3Pool.totalStake()).to.equal(1);
        // Genesis epoch is the current epoch
        const currentBlock = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
        );
        const currentEpoch = ethers.BigNumber.from(currentBlock.timestamp).div(
          EPOCH_LENGTH
        );
        expect(await api3Pool.genesisEpoch()).to.equal(currentEpoch);
        // Skip the reward payment of the genesis epoch
        expect(await api3Pool.epochIndexOfLastReward()).to.equal(currentEpoch);
      });
    });
    context("TimelockManager is invalid", function () {
      it("reverts", async function () {
        const api3PoolFactory = await ethers.getContractFactory(
          "Api3Pool",
          roles.deployer
        );
        await expect(
          api3PoolFactory.deploy(
            api3Token.address,
            ethers.constants.AddressZero
          )
        ).to.be.revertedWith("Pool: Invalid TimelockManager");
      });
    });
  });
  context("Api3Token is invalid", function () {
    it("reverts", async function () {
      const api3PoolFactory = await ethers.getContractFactory(
        "Api3Pool",
        roles.deployer
      );
      await expect(
        api3PoolFactory.deploy(
          ethers.constants.AddressZero,
          roles.mockTimelockManager.address
        )
      ).to.be.revertedWith("Pool: Invalid Api3Token");
    });
  });
});

describe("setDaoApps", function () {
  context("DAO apps are not set before", function () {
    context("Caller is deployer", function () {
      context("DAO app addresses to be set are not zero", function () {
        it("sets DAO apps", async function () {
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                roles.agentAppSecondary.address,
                roles.votingAppPrimary.address,
                roles.votingAppSecondary.address
              )
          )
            .to.emit(api3Pool, "SetDaoApps")
            .withArgs(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          expect(await api3Pool.agentAppPrimary()).to.equal(
            roles.agentAppPrimary.address
          );
          expect(await api3Pool.agentAppSecondary()).to.equal(
            roles.agentAppSecondary.address
          );
          expect(await api3Pool.votingAppPrimary()).to.equal(
            roles.votingAppPrimary.address
          );
          expect(await api3Pool.votingAppSecondary()).to.equal(
            roles.votingAppSecondary.address
          );
        });
      });
      context("DAO app addresses to be set are zero", function () {
        it("reverts", async function () {
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                ethers.constants.AddressZero,
                roles.agentAppSecondary.address,
                roles.votingAppPrimary.address,
                roles.votingAppSecondary.address
              )
          ).to.be.revertedWith("Pool: Invalid DAO apps");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                ethers.constants.AddressZero,
                roles.votingAppPrimary.address,
                roles.votingAppSecondary.address
              )
          ).to.be.revertedWith("Pool: Invalid DAO apps");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                roles.agentAppSecondary.address,
                ethers.constants.AddressZero,
                roles.votingAppSecondary.address
              )
          ).to.be.revertedWith("Pool: Invalid DAO apps");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                roles.agentAppSecondary.address,
                roles.votingAppPrimary.address,
                ethers.constants.AddressZero
              )
          ).to.be.revertedWith("Pool: Invalid DAO apps");
        });
      });
    });
    context("Caller is not deployer", function () {
      it("reverts", async function () {
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            )
        ).to.be.revertedWith(
          "Pool: Caller not primary agent or deployer initializing values"
        );
      });
    });
  });
  context("DAO apps are set before", function () {
    context("Caller is primary Agent", function () {
      it("sets DAO apps", async function () {
        // Set the apps beforehand
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.randomPerson.address,
            roles.randomPerson.address,
            roles.randomPerson.address
          );
        // Set the apps again as the primary Agent
        await expect(
          api3Pool
            .connect(roles.agentAppPrimary)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            )
        )
          .to.emit(api3Pool, "SetDaoApps")
          .withArgs(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        expect(await api3Pool.agentAppPrimary()).to.equal(
          roles.agentAppPrimary.address
        );
        expect(await api3Pool.agentAppSecondary()).to.equal(
          roles.agentAppSecondary.address
        );
        expect(await api3Pool.votingAppPrimary()).to.equal(
          roles.votingAppPrimary.address
        );
        expect(await api3Pool.votingAppSecondary()).to.equal(
          roles.votingAppSecondary.address
        );
      });
    });
    context("Caller is a random person", function () {
      it("reverts", async function () {
        // Set the apps beforehand
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.randomPerson.address,
            roles.randomPerson.address,
            roles.randomPerson.address
          );
        // Attempt to set the apps again as the deployer
        await expect(
          api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            )
        ).to.be.revertedWith(
          "Pool: Caller not primary agent or deployer initializing values"
        );
        // Attempt to set the apps again as the secondary agent
        await expect(
          api3Pool
            .connect(roles.agentAppSecondary)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            )
        ).to.be.revertedWith(
          "Pool: Caller not primary agent or deployer initializing values"
        );
        // Attempt to set the apps again as a random person
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            )
        ).to.be.revertedWith(
          "Pool: Caller not primary agent or deployer initializing values"
        );
      });
    });
  });
});

describe("setClaimsManagerStatus", function () {
  context("Caller is primary Agent", function () {
    it("sets claims manager status", async function () {
      await api3Pool
        .connect(roles.deployer)
        .setDaoApps(
          roles.agentAppPrimary.address,
          roles.agentAppSecondary.address,
          roles.votingAppPrimary.address,
          roles.votingAppSecondary.address
        );
      // Set claims manager status as true with the primary DAO Agent
      await expect(
        api3Pool
          .connect(roles.agentAppPrimary)
          .setClaimsManagerStatus(roles.claimsManager.address, true)
      )
        .to.emit(api3Pool, "SetClaimsManagerStatus")
        .withArgs(roles.claimsManager.address, true);
      expect(
        await api3Pool.claimsManagerStatus(roles.claimsManager.address)
      ).to.equal(true);
      // Reset claims manager status as false with the primary DAO Agent
      await expect(
        api3Pool
          .connect(roles.agentAppPrimary)
          .setClaimsManagerStatus(roles.claimsManager.address, false)
      )
        .to.emit(api3Pool, "SetClaimsManagerStatus")
        .withArgs(roles.claimsManager.address, false);
      expect(
        await api3Pool.claimsManagerStatus(roles.claimsManager.address)
      ).to.equal(false);
    });
  });
  context("Caller is not primary Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.agentAppSecondary)
          .setClaimsManagerStatus(roles.claimsManager.address, true)
      ).to.be.revertedWith("Pool: Caller not primary agent");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setClaimsManagerStatus(roles.claimsManager.address, true)
      ).to.be.revertedWith("Pool: Caller not primary agent");
    });
  });
});

describe("setStakeTarget", function () {
  context("Caller is Agent", function () {
    context(
      "Stake target to be set is smaller than or equal to 100%",
      function () {
        it("sets stake target", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const oldStakeTarget = await api3Pool.stakeTarget();
          const newStakeTarget = `100${"0".repeat(16)}`;
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setStakeTarget(newStakeTarget)
          )
            .to.emit(api3Pool, "SetStakeTarget")
            .withArgs(newStakeTarget);
          expect(await api3Pool.stakeTarget()).to.equal(newStakeTarget);
          await expect(
            api3Pool
              .connect(roles.agentAppSecondary)
              .setStakeTarget(oldStakeTarget)
          )
            .to.emit(api3Pool, "SetStakeTarget")
            .withArgs(oldStakeTarget);
          expect(await api3Pool.stakeTarget()).to.equal(oldStakeTarget);
        });
      }
    );
    context("Stake target to be set is larger than 100%", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        const newStakeTarget = ethers.BigNumber.from(
          `100${"0".repeat(16)}`
        ).add(1);
        await expect(
          api3Pool
            .connect(roles.agentAppSecondary)
            .setStakeTarget(newStakeTarget)
        ).to.be.revertedWith("Pool: Invalid percentage value");
      });
    });
  });
  context("Caller is not Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.randomPerson).setStakeTarget(123)
      ).to.be.revertedWith("Pool: Caller not agent");
    });
  });
});

describe("setMaxApr", function () {
  context("Caller is Agent", function () {
    context(
      "Max APR to be set is larger than or equal to min APR",
      function () {
        it("sets max APR", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const oldMaxApr = await api3Pool.maxApr();
          const minApr = await api3Pool.minApr();
          await expect(
            api3Pool.connect(roles.agentAppPrimary).setMaxApr(minApr)
          )
            .to.emit(api3Pool, "SetMaxApr")
            .withArgs(minApr);
          expect(await api3Pool.maxApr()).to.equal(minApr);
          await expect(
            api3Pool.connect(roles.agentAppSecondary).setMaxApr(oldMaxApr)
          )
            .to.emit(api3Pool, "SetMaxApr")
            .withArgs(oldMaxApr);
          expect(await api3Pool.maxApr()).to.equal(oldMaxApr);
        });
      }
    );
    context("Max APR to be set is smaller than min APR", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        const minApr = await api3Pool.minApr();
        const newMaxApr = minApr.sub(1);
        await expect(
          api3Pool.connect(roles.agentAppSecondary).setMaxApr(newMaxApr)
        ).to.be.revertedWith("Pool: Max APR smaller than min");
      });
    });
  });
  context("Caller is not Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.randomPerson).setMaxApr(123)
      ).to.be.revertedWith("Pool: Caller not agent");
    });
  });
});

describe("setMinApr", function () {
  context("Caller is Agent", function () {
    context(
      "Min APR to be set is smaller than or equal to max APR",
      function () {
        it("sets min APR", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const oldMinApr = await api3Pool.minApr();
          const maxApr = await api3Pool.maxApr();
          await expect(
            api3Pool.connect(roles.agentAppPrimary).setMinApr(maxApr)
          )
            .to.emit(api3Pool, "SetMinApr")
            .withArgs(maxApr);
          expect(await api3Pool.minApr()).to.equal(maxApr);
          await expect(
            api3Pool.connect(roles.agentAppSecondary).setMinApr(oldMinApr)
          )
            .to.emit(api3Pool, "SetMinApr")
            .withArgs(oldMinApr);
          expect(await api3Pool.minApr()).to.equal(oldMinApr);
        });
      }
    );
    context("Min APR to be set is larger than max APR", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        const maxApr = await api3Pool.maxApr();
        const newMinApr = maxApr.add(1);
        await expect(
          api3Pool.connect(roles.agentAppSecondary).setMinApr(newMinApr)
        ).to.be.revertedWith("Pool: Min APR larger than max");
      });
    });
  });
  context("Caller is not Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.randomPerson).setMinApr(123)
      ).to.be.revertedWith("Pool: Caller not agent");
    });
  });
});

describe("setUnstakeWaitPeriod", function () {
  context("Caller is primary Agent", function () {
    context(
      "Unstake wait period to be set is larger than or equal to epoch length",
      function () {
        it("sets unstake wait period", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const newUnstakeWaitPeriod = EPOCH_LENGTH.add(1);
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
          )
            .to.emit(api3Pool, "SetUnstakeWaitPeriod")
            .withArgs(newUnstakeWaitPeriod);
          expect(await api3Pool.unstakeWaitPeriod()).to.equal(
            newUnstakeWaitPeriod
          );
        });
      }
    );
    context(
      "Unstake wait period to be set is smaller than epoch length",
      function () {
        it("reverts", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const newUnstakeWaitPeriod = EPOCH_LENGTH.sub(1);
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
          ).to.be.revertedWith("Pool: Period shorter than epoch");
        });
      }
    );
  });
  context("Caller is not primary Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.agentAppSecondary).setUnstakeWaitPeriod(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
      await expect(
        api3Pool.connect(roles.randomPerson).setUnstakeWaitPeriod(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
    });
  });
});

describe("setAprUpdateStep", function () {
  context("Caller is primary Agent", function () {
    it("sets APR update step", async function () {
      await api3Pool
        .connect(roles.deployer)
        .setDaoApps(
          roles.agentAppPrimary.address,
          roles.agentAppSecondary.address,
          roles.votingAppPrimary.address,
          roles.votingAppSecondary.address
        );
      const zero = 0;
      const twoHundredPercent = `200${"0".repeat(16)}`;
      await expect(
        api3Pool.connect(roles.agentAppPrimary).setAprUpdateStep(zero)
      )
        .to.emit(api3Pool, "SetAprUpdateStep")
        .withArgs(zero);
      expect(await api3Pool.aprUpdateStep()).to.equal(zero);
      await expect(
        api3Pool
          .connect(roles.agentAppPrimary)
          .setAprUpdateStep(twoHundredPercent)
      )
        .to.emit(api3Pool, "SetAprUpdateStep")
        .withArgs(twoHundredPercent);
      expect(await api3Pool.aprUpdateStep()).to.equal(twoHundredPercent);
    });
  });
  context("Caller is not primary Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool.connect(roles.agentAppSecondary).setAprUpdateStep(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
      await expect(
        api3Pool.connect(roles.randomPerson).setAprUpdateStep(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
    });
  });
});

describe("setProposalVotingPowerThreshold", function () {
  context("Caller is primary Agent", function () {
    context(
      "Proposal voting power threshold to be set is between 0.1% and 10%",
      function () {
        it("sets proposal voting power threshold", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const tenPercent = `10${"0".repeat(16)}`;
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(tenPercent)
          )
            .to.emit(api3Pool, "SetProposalVotingPowerThreshold")
            .withArgs(tenPercent);
          expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
            tenPercent
          );
          const pointOnePercent = `1${"0".repeat(15)}`;
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(pointOnePercent)
          )
            .to.emit(api3Pool, "SetProposalVotingPowerThreshold")
            .withArgs(pointOnePercent);
          expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
            pointOnePercent
          );
        });
      }
    );
    context(
      "Proposal voting power threshold to be set is not between 0.1% and 10%",
      function () {
        it("reverts", async function () {
          await api3Pool
            .connect(roles.deployer)
            .setDaoApps(
              roles.agentAppPrimary.address,
              roles.agentAppSecondary.address,
              roles.votingAppPrimary.address,
              roles.votingAppSecondary.address
            );
          const tenPercent = ethers.BigNumber.from(`10${"0".repeat(16)}`);
          const firstNewProposalVotingPowerThreshold = tenPercent.add(1);
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                firstNewProposalVotingPowerThreshold
              )
          ).to.be.revertedWith("Pool: Threshold outside limits");
          const pointOnePercent = ethers.BigNumber.from(`1${"0".repeat(15)}`);
          const secondNewProposalVotingPowerThreshold = pointOnePercent.sub(1);
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                secondNewProposalVotingPowerThreshold
              )
          ).to.be.revertedWith("Pool: Threshold outside limits");
        });
      }
    );
  });
  context("Caller is not primary Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.agentAppSecondary)
          .setProposalVotingPowerThreshold(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setProposalVotingPowerThreshold(123)
      ).to.be.revertedWith("Pool: Caller not primary agent");
    });
  });
});

describe("updateLastProposalTimestamp", function () {
  context("Caller is a Voting app", function () {
    it("updates lastProposalTimestamp", async function () {
      await api3Pool
        .connect(roles.deployer)
        .setDaoApps(
          roles.agentAppPrimary.address,
          roles.agentAppSecondary.address,
          roles.votingAppPrimary.address,
          roles.votingAppSecondary.address
        );
      let currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      let nextBlockTimestamp = currentBlock.timestamp + 100;
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        nextBlockTimestamp,
      ]);
      await expect(
        api3Pool
          .connect(roles.votingAppPrimary)
          .updateLastProposalTimestamp(roles.user1.address)
      )
        .to.emit(api3Pool, "UpdatedLastProposalTimestamp")
        .withArgs(
          roles.user1.address,
          nextBlockTimestamp,
          roles.votingAppPrimary.address
        );
      expect(
        (await api3Pool.getUser(roles.user1.address)).lastProposalTimestamp
      ).to.equal(nextBlockTimestamp);
      currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      nextBlockTimestamp = currentBlock.timestamp + 100;
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        nextBlockTimestamp,
      ]);
      await expect(
        api3Pool
          .connect(roles.votingAppSecondary)
          .updateLastProposalTimestamp(roles.user1.address)
      )
        .to.emit(api3Pool, "UpdatedLastProposalTimestamp")
        .withArgs(
          roles.user1.address,
          nextBlockTimestamp,
          roles.votingAppSecondary.address
        );
      expect(
        (await api3Pool.getUser(roles.user1.address)).lastProposalTimestamp
      ).to.equal(nextBlockTimestamp);
    });
  });
  context("Caller is not an authorized Api3Voting app", function () {
    it("reverts", async function () {
      await api3Pool
        .connect(roles.deployer)
        .setDaoApps(
          roles.agentAppPrimary.address,
          roles.agentAppSecondary.address,
          roles.votingAppPrimary.address,
          roles.votingAppSecondary.address
        );
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .updateLastProposalTimestamp(roles.user1.address)
      ).to.be.revertedWith("Pool: Caller not voting app");
    });
  });
});

describe("isGenesisEpoch", function () {
  context("Is genesis epoch", function () {
    it("returns true", async function () {
      expect(await api3Pool.isGenesisEpoch()).to.equal(true);
    });
  });
  context("Is not genesis epoch", function () {
    it("returns false", async function () {
      await ethers.provider.send("evm_increaseTime", [
        EPOCH_LENGTH.toNumber() + 1,
      ]);
      await ethers.provider.send("evm_mine");
      expect(await api3Pool.isGenesisEpoch()).to.equal(false);
    });
  });
});
