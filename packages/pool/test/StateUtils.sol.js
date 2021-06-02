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
});

describe("constructor", function () {
  context("Api3Token is valid", function () {
    context("TimelockManager is valid", function () {
      it("initializes with the correct parameters", async function () {
        // Epoch length is 7 days in seconds
        expect(await api3Pool.EPOCH_LENGTH()).to.equal(
          ethers.BigNumber.from(7 * 24 * 60 * 60)
        );
        // Reward vesting period is 52 week = 1 year
        expect(await api3Pool.REWARD_VESTING_PERIOD()).to.equal(
          ethers.BigNumber.from(52)
        );
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
          ethers.BigNumber.from("50" + "000" + "000")
        );
        expect(await api3Pool.minApr()).to.equal(
          ethers.BigNumber.from("2" + "500" + "000")
        );
        expect(await api3Pool.maxApr()).to.equal(
          ethers.BigNumber.from("75" + "000" + "000")
        );
        expect(await api3Pool.aprUpdateStep()).to.equal(
          ethers.BigNumber.from("1" + "000" + "000")
        );
        expect(await api3Pool.unstakeWaitPeriod()).to.equal(
          await api3Pool.EPOCH_LENGTH()
        );
        expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
          ethers.BigNumber.from("100" + "000")
        );
        // Initialize the APR at (maxApr / minApr) / 2
        expect(await api3Pool.currentApr()).to.equal(
          (await api3Pool.maxApr()).add(await api3Pool.minApr()).div(2)
        );

        // Token address set correctly
        expect(await api3Pool.api3Token()).to.equal(api3Token.address);
        // Initialize share price at 1
        expect(await api3Pool.totalVotingPower()).to.equal(
          ethers.BigNumber.from(1)
        );
        expect(await api3Pool.totalStake()).to.equal(ethers.BigNumber.from(1));
        // Genesis epoch is the current epoch
        const currentBlock = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
        );
        const currentEpoch = ethers.BigNumber.from(currentBlock.timestamp).div(
          await api3Pool.EPOCH_LENGTH()
        );
        expect(await api3Pool.genesisEpoch()).to.equal(currentEpoch);
        // Skip the reward payment of the genesis epoch
        expect(await api3Pool.epochIndexOfLastRewardPayment()).to.equal(
          await api3Pool.genesisEpoch()
        );
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
        ).to.be.revertedWith("Invalid TimelockManager");
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
      ).to.be.revertedWith("Invalid Api3Token");
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
          ).to.be.revertedWith("Invalid address");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                ethers.constants.AddressZero,
                roles.votingAppPrimary.address,
                roles.votingAppSecondary.address
              )
          ).to.be.revertedWith("Invalid address");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                roles.agentAppSecondary.address,
                ethers.constants.AddressZero,
                roles.votingAppSecondary.address
              )
          ).to.be.revertedWith("Invalid address");
          await expect(
            api3Pool
              .connect(roles.deployer)
              .setDaoApps(
                roles.agentAppPrimary.address,
                roles.agentAppSecondary.address,
                roles.votingAppPrimary.address,
                ethers.constants.AddressZero
              )
          ).to.be.revertedWith("Invalid address");
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
        ).to.be.revertedWith("Unauthorized");
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
        ).to.be.revertedWith("Unauthorized");
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
      // Set claims manager status as true with the DAO Agent
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
      // Reset claims manager status as false with the DAO Agent
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
          .setClaimsManagerStatus(roles.claimsManager.address, false)
      ).to.be.revertedWith("Unauthorized");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setClaimsManagerStatus(roles.claimsManager.address, false)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setStakeTarget", function () {
  context("Caller is Agent", function () {
    context(
      "Stake target to be set is smaller than or equal to 100,000,000",
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
          const newStakeTarget = ethers.BigNumber.from(123);
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setStakeTarget(newStakeTarget)
          )
            .to.emit(api3Pool, "SetStakeTarget")
            .withArgs(oldStakeTarget, newStakeTarget);
          expect(await api3Pool.stakeTarget()).to.equal(newStakeTarget);
          await expect(
            api3Pool
              .connect(roles.agentAppSecondary)
              .setStakeTarget(newStakeTarget)
          )
            .to.emit(api3Pool, "SetStakeTarget")
            .withArgs(newStakeTarget, newStakeTarget);
          expect(await api3Pool.stakeTarget()).to.equal(newStakeTarget);
        });
      }
    );
    context("Stake target to be set is larger than 100,000,000", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.deployer)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        const newStakeTarget = ethers.BigNumber.from("200" + "000" + "000");
        await expect(
          api3Pool
            .connect(roles.agentAppSecondary)
            .setStakeTarget(newStakeTarget)
        ).to.be.revertedWith("Invalid value");
      });
    });
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newStakeTarget = ethers.BigNumber.from(123);
      await expect(
        api3Pool.connect(roles.randomPerson).setStakeTarget(newStakeTarget)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setMaxApr", function () {
  context("Caller is DAO Agent", function () {
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
          const newMaxApr = minApr.add(ethers.BigNumber.from(123));
          await expect(
            api3Pool.connect(roles.agentAppPrimary).setMaxApr(newMaxApr)
          )
            .to.emit(api3Pool, "SetMaxApr")
            .withArgs(oldMaxApr, newMaxApr);
          expect(await api3Pool.maxApr()).to.equal(newMaxApr);
          await expect(
            api3Pool.connect(roles.agentAppSecondary).setMaxApr(newMaxApr)
          )
            .to.emit(api3Pool, "SetMaxApr")
            .withArgs(newMaxApr, newMaxApr);
          expect(await api3Pool.maxApr()).to.equal(newMaxApr);
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
        const newMaxApr = minApr.sub(ethers.BigNumber.from(123));
        await expect(
          api3Pool.connect(roles.agentAppSecondary).setMaxApr(newMaxApr)
        ).to.be.revertedWith("Invalid value");
      });
    });
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newMaxApr = ethers.BigNumber.from(123);
      await expect(
        api3Pool.connect(roles.randomPerson).setMaxApr(newMaxApr)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setMinApr", function () {
  context("Caller is DAO Agent", function () {
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
          const newMinApr = maxApr.sub(ethers.BigNumber.from(123));
          await expect(
            api3Pool.connect(roles.agentAppPrimary).setMinApr(newMinApr)
          )
            .to.emit(api3Pool, "SetMinApr")
            .withArgs(oldMinApr, newMinApr);
          expect(await api3Pool.minApr()).to.equal(newMinApr);
          await expect(
            api3Pool.connect(roles.agentAppSecondary).setMinApr(newMinApr)
          )
            .to.emit(api3Pool, "SetMinApr")
            .withArgs(newMinApr, newMinApr);
          expect(await api3Pool.minApr()).to.equal(newMinApr);
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
        const newMinApr = maxApr.add(ethers.BigNumber.from(123));
        await expect(
          api3Pool.connect(roles.agentAppSecondary).setMinApr(newMinApr)
        ).to.be.revertedWith("Invalid value");
      });
    });
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newMinApr = ethers.BigNumber.from(123);
      await expect(
        api3Pool.connect(roles.randomPerson).setMinApr(newMinApr)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setUnstakeWaitPeriod", function () {
  context("Caller is primary DAO Agent", function () {
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
          const oldUnstakeWaitPeriod = await api3Pool.unstakeWaitPeriod();
          const epochLength = await api3Pool.EPOCH_LENGTH();
          const newUnstakeWaitPeriod = epochLength.add(
            ethers.BigNumber.from(123)
          );
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
          )
            .to.emit(api3Pool, "SetUnstakeWaitPeriod")
            .withArgs(oldUnstakeWaitPeriod, newUnstakeWaitPeriod);
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
          const epochLength = await api3Pool.EPOCH_LENGTH();
          const newUnstakeWaitPeriod = epochLength.sub(
            ethers.BigNumber.from(123)
          );
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
          ).to.be.revertedWith("Invalid value");
        });
      }
    );
  });
  context("Caller is not primary DAO Agent", function () {
    it("reverts", async function () {
      const newUnstakeWaitPeriod = ethers.BigNumber.from(123);
      await expect(
        api3Pool
          .connect(roles.agentAppSecondary)
          .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
      ).to.be.revertedWith("Unauthorized");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setAprUpdateStep", function () {
  context("Caller is DAO Agent", function () {
    it("sets APR update step", async function () {
      await api3Pool
        .connect(roles.deployer)
        .setDaoApps(
          roles.agentAppPrimary.address,
          roles.agentAppSecondary.address,
          roles.votingAppPrimary.address,
          roles.votingAppSecondary.address
        );
      const oldAprUpdateStep = await api3Pool.aprUpdateStep();
      const newAprUpdateStep = oldAprUpdateStep.div(2);
      await expect(
        api3Pool
          .connect(roles.agentAppPrimary)
          .setAprUpdateStep(newAprUpdateStep)
      )
        .to.emit(api3Pool, "SetAprUpdateStep")
        .withArgs(oldAprUpdateStep, newAprUpdateStep);
      expect(await api3Pool.aprUpdateStep()).to.equal(newAprUpdateStep);
    });
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newAprUpdateCoefficient = ethers.BigNumber.from(123);
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setAprUpdateStep(newAprUpdateCoefficient)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setProposalVotingPowerThreshold", function () {
  context("Caller is primary DAO Agent", function () {
    context(
      "Proposal voting power threshold to be set is between 100,000 (0.1%) and 10,000,000 (10%)",
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
          const oldProposalVotingPowerThreshold = await api3Pool.proposalVotingPowerThreshold();
          const firstNewProposalVotingPowerThreshold = ethers.BigNumber.from(
            "10" + "000" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                firstNewProposalVotingPowerThreshold
              )
          )
            .to.emit(api3Pool, "SetProposalVotingPowerThreshold")
            .withArgs(
              oldProposalVotingPowerThreshold,
              firstNewProposalVotingPowerThreshold
            );
          expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
            firstNewProposalVotingPowerThreshold
          );
          const secondNewProposalVotingPowerThreshold = ethers.BigNumber.from(
            "100" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                secondNewProposalVotingPowerThreshold
              )
          )
            .to.emit(api3Pool, "SetProposalVotingPowerThreshold")
            .withArgs(
              firstNewProposalVotingPowerThreshold,
              secondNewProposalVotingPowerThreshold
            );
          expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
            secondNewProposalVotingPowerThreshold
          );
        });
      }
    );
    context(
      "Proposal voting power threshold to be set is not between 100,000 (0.1%) and 10,000,000 (10%)",
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
          const firstNewProposalVotingPowerThreshold = ethers.BigNumber.from(
            "10" + "000" + "000"
          ).add(ethers.BigNumber.from(1));
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                firstNewProposalVotingPowerThreshold
              )
          ).to.be.revertedWith("Invalid value");
          const secondNewProposalVotingPowerThreshold = ethers.BigNumber.from(
            "100" + "000"
          ).sub(ethers.BigNumber.from(1));
          await expect(
            api3Pool
              .connect(roles.agentAppPrimary)
              .setProposalVotingPowerThreshold(
                secondNewProposalVotingPowerThreshold
              )
          ).to.be.revertedWith("Invalid value");
        });
      }
    );
  });
  context("Caller is not primary DAO Agent", function () {
    it("reverts", async function () {
      const newProposalVotingPowerThreshold = ethers.BigNumber.from(123);
      await expect(
        api3Pool
          .connect(roles.agentAppSecondary)
          .setProposalVotingPowerThreshold(newProposalVotingPowerThreshold)
      ).to.be.revertedWith("Unauthorized");
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setProposalVotingPowerThreshold(newProposalVotingPowerThreshold)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("publishSpecsUrl", function () {
  it("publishes specs URL", async function () {
    const proposalIndex = 123;
    const specsUrl = "www.myapi.com/specs.json";
    await expect(
      api3Pool
        .connect(roles.randomPerson)
        .publishSpecsUrl(
          roles.votingAppPrimary.address,
          proposalIndex,
          specsUrl
        )
    )
      .to.emit(api3Pool, "PublishedSpecsUrl")
      .withArgs(
        roles.votingAppPrimary.address,
        proposalIndex,
        roles.randomPerson.address,
        specsUrl
      );
    expect(
      await api3Pool.userAddressToVotingAppToProposalIndexToSpecsUrl(
        roles.randomPerson.address,
        roles.votingAppPrimary.address,
        proposalIndex
      )
    ).to.equal(specsUrl);
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
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );
      const nextBlockTimestamp = currentBlock.timestamp + 100;
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
          roles.votingAppPrimary.address,
          roles.user1.address,
          nextBlockTimestamp
        );
      expect(
        (await api3Pool.getUser(roles.user1.address))
          .lastProposalTimestamp
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
      ).to.be.revertedWith("Unauthorized");
    });
  });
});
