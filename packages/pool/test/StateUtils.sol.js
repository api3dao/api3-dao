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

describe("constructor", function () {
  it("initializes with the correct parameters", async function () {
    // Token address set correctly
    expect(await api3Pool.api3Token()).to.equal(api3Token.address);
    // No DAO Agent set
    expect(await api3Pool.daoAgent()).to.equal(ethers.constants.AddressZero);
    // Claims manager statuses are false by default
    expect(
      await api3Pool.claimsManagerStatus(roles.randomPerson.address)
    ).to.equal(false);
    // Epoch length is 7 days in seconds
    expect(await api3Pool.EPOCH_LENGTH()).to.equal(
      ethers.BigNumber.from(7 * 24 * 60 * 60)
    );
    // Reward vesting period is 52 week = 1 year
    expect(await api3Pool.REWARD_VESTING_PERIOD()).to.equal(
      ethers.BigNumber.from(52)
    );
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
    // Verify the default DAO parameters
    expect(await api3Pool.stakeTarget()).to.equal(
      ethers.BigNumber.from("30" + "000" + "000")
    );
    expect(await api3Pool.minApr()).to.equal(
      ethers.BigNumber.from("2" + "500" + "000")
    );
    expect(await api3Pool.maxApr()).to.equal(
      ethers.BigNumber.from("75" + "000" + "000")
    );
    expect(await api3Pool.aprUpdateCoefficient()).to.equal(
      ethers.BigNumber.from("1" + "000" + "000")
    );
    expect(await api3Pool.unstakeWaitPeriod()).to.equal(
      ethers.BigNumber.from(7 * 24 * 60 * 60)
    );
    expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
      ethers.BigNumber.from("100" + "000")
    );
    // Initialize the APR at max APR
    expect(await api3Pool.currentApr()).to.equal(await api3Pool.maxApr());
    // Initialize share price at 1
    expect(await api3Pool.totalSupply()).to.equal(ethers.BigNumber.from(1));
    expect(await api3Pool.totalStake()).to.equal(ethers.BigNumber.from(1));
  });
});

describe("setDaoAgent", function () {
  context("DAO Agent address to be set is not zero", function () {
    context("DAO Agent adress has not been set before", function () {
      it("sets DAO Agent", async function () {
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address)
        )
          .to.emit(api3Pool, "SetDaoAgent")
          .withArgs(roles.daoAgent.address);
        expect(await api3Pool.daoAgent()).to.equal(roles.daoAgent.address);
      });
    });
    context("DAO Agent adress has been set before", function () {
      it("reverts", async function () {
        // Set the DAO Agent once
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoAgent(roles.daoAgent.address);
        // Attempt to set it again
        await expect(
          api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.randomPerson.address)
        ).to.be.revertedWith("Unauthorized");
      });
    });
  });
  context("DAO Agent address to be set is zero", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setDaoAgent(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });
  });
});

describe("setClaimsManagerStatus", function () {
  context("Caller is DAO Agent", function () {
    it("sets claims manager status", async function () {
      // Set the DAO Agent
      await api3Pool
        .connect(roles.randomPerson)
        .setDaoAgent(roles.daoAgent.address);
      // Set claims manager status as true with the DAO Agent
      await expect(
        api3Pool
          .connect(roles.daoAgent)
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
          .connect(roles.daoAgent)
          .setClaimsManagerStatus(roles.claimsManager.address, false)
      )
        .to.emit(api3Pool, "SetClaimsManagerStatus")
        .withArgs(roles.claimsManager.address, false);
      expect(
        await api3Pool.claimsManagerStatus(roles.claimsManager.address)
      ).to.equal(false);
    });
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setClaimsManagerStatus(roles.claimsManager.address, false)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setStakeTarget", function () {
  context("Caller is DAO Agent", function () {
    context(
      "Stake target to be set is smaller than or equal to 100,000,000",
      function () {
        it("sets stake target", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldStakeTarget = await api3Pool.stakeTarget();
          const newStakeTarget = ethers.BigNumber.from(123);
          await expect(
            api3Pool.connect(roles.daoAgent).setStakeTarget(newStakeTarget)
          )
            .to.emit(api3Pool, "SetStakeTarget")
            .withArgs(oldStakeTarget, newStakeTarget);
          expect(await api3Pool.stakeTarget()).to.equal(newStakeTarget);
        });
      }
    );
    context("Stake target to be set is larger than 100,000,000", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoAgent(roles.daoAgent.address);
        const newStakeTarget = ethers.BigNumber.from("200" + "000" + "000");
        await expect(
          api3Pool.connect(roles.daoAgent).setStakeTarget(newStakeTarget)
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
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldMaxApr = await api3Pool.maxApr();
          const minApr = await api3Pool.minApr();
          const newMaxApr = minApr.add(ethers.BigNumber.from(123));
          await expect(api3Pool.connect(roles.daoAgent).setMaxApr(newMaxApr))
            .to.emit(api3Pool, "SetMaxApr")
            .withArgs(oldMaxApr, newMaxApr);
          expect(await api3Pool.maxApr()).to.equal(newMaxApr);
        });
      }
    );
    context("Max APR to be set is smaller than min APR", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoAgent(roles.daoAgent.address);
        const minApr = await api3Pool.minApr();
        const newMaxApr = minApr.sub(ethers.BigNumber.from(123));
        await expect(
          api3Pool.connect(roles.daoAgent).setMaxApr(newMaxApr)
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
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldMinApr = await api3Pool.minApr();
          const maxApr = await api3Pool.maxApr();
          const newMinApr = maxApr.sub(ethers.BigNumber.from(123));
          await expect(api3Pool.connect(roles.daoAgent).setMinApr(newMinApr))
            .to.emit(api3Pool, "SetMinApr")
            .withArgs(oldMinApr, newMinApr);
          expect(await api3Pool.minApr()).to.equal(newMinApr);
        });
      }
    );
    context("Min APR to be set is larger than max APR", function () {
      it("reverts", async function () {
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoAgent(roles.daoAgent.address);
        const maxApr = await api3Pool.maxApr();
        const newMinApr = maxApr.add(ethers.BigNumber.from(123));
        await expect(
          api3Pool.connect(roles.daoAgent).setMinApr(newMinApr)
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
  context("Caller is DAO Agent", function () {
    context(
      "Unstake wait period to be set is larger than or equal to epoch length",
      function () {
        it("sets unstake wait period", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldUnstakeWaitPeriod = await api3Pool.unstakeWaitPeriod();
          const epochLength = await api3Pool.EPOCH_LENGTH();
          const newUnstakeWaitPeriod = epochLength.add(
            ethers.BigNumber.from(123)
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
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
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const epochLength = await api3Pool.EPOCH_LENGTH();
          const newUnstakeWaitPeriod = epochLength.sub(
            ethers.BigNumber.from(123)
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
          ).to.be.revertedWith("Invalid value");
        });
      }
    );
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newUnstakeWaitPeriod = ethers.BigNumber.from(123);
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setUnstakeWaitPeriod(newUnstakeWaitPeriod)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setAprUpdateCoefficient", function () {
  context("Caller is DAO Agent", function () {
    context(
      "APR update coefficient to be set is larger than 0 and smaller than or equal to 1,000,000,000",
      function () {
        it("sets APR update coefficient", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldAprUpdateCoefficient = await api3Pool.aprUpdateCoefficient();
          const newAprUpdateCoefficient = ethers.BigNumber.from(
            "50" + "000" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setAprUpdateCoefficient(newAprUpdateCoefficient)
          )
            .to.emit(api3Pool, "SetAprUpdateCoefficient")
            .withArgs(oldAprUpdateCoefficient, newAprUpdateCoefficient);
          expect(await api3Pool.aprUpdateCoefficient()).to.equal(
            newAprUpdateCoefficient
          );
        });
      }
    );
    context(
      "APR update coefficient to be set is 0 or larger than 1,000,000,000",
      function () {
        it("reverts", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const newAprUpdateCoefficient1 = ethers.BigNumber.from(0);
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setAprUpdateCoefficient(newAprUpdateCoefficient1)
          ).to.be.revertedWith("Invalid value");
          const newAprUpdateCoefficient2 = ethers.BigNumber.from(
            "50" + "000" + "000" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setAprUpdateCoefficient(newAprUpdateCoefficient2)
          ).to.be.revertedWith("Invalid value");
        });
      }
    );
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newAprUpdateCoefficient = ethers.BigNumber.from(123);
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .setAprUpdateCoefficient(newAprUpdateCoefficient)
      ).to.be.revertedWith("Unauthorized");
    });
  });
});

describe("setProposalVotingPowerThreshold", function () {
  context("Caller is DAO Agent", function () {
    context(
      "Proposal voting power threshold to be set is smaller than or equal to 10,000,000",
      function () {
        it("sets proposal voting power threshold", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const oldProposalVotingPowerThreshold = await api3Pool.proposalVotingPowerThreshold();
          const newProposalVotingPowerThreshold = ethers.BigNumber.from(
            "1" + "000" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setProposalVotingPowerThreshold(newProposalVotingPowerThreshold)
          )
            .to.emit(api3Pool, "SetProposalVotingPowerThreshold")
            .withArgs(
              oldProposalVotingPowerThreshold,
              newProposalVotingPowerThreshold
            );
          expect(await api3Pool.proposalVotingPowerThreshold()).to.equal(
            newProposalVotingPowerThreshold
          );
        });
      }
    );
    context(
      "Proposal voting power threshold to be set is larger than 10,000,000",
      function () {
        it("reverts", async function () {
          await api3Pool
            .connect(roles.randomPerson)
            .setDaoAgent(roles.daoAgent.address);
          const newProposalVotingPowerThreshold = ethers.BigNumber.from(
            "50" + "000" + "000"
          );
          await expect(
            api3Pool
              .connect(roles.daoAgent)
              .setProposalVotingPowerThreshold(newProposalVotingPowerThreshold)
          ).to.be.revertedWith("Invalid value");
        });
      }
    );
  });
  context("Caller is not DAO Agent", function () {
    it("reverts", async function () {
      const newProposalVotingPowerThreshold = ethers.BigNumber.from(123);
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
        .publishSpecsUrl(proposalIndex, specsUrl)
    )
      .to.emit(api3Pool, "PublishedSpecsUrl")
      .withArgs(proposalIndex, roles.randomPerson.address, specsUrl);
  });
});
