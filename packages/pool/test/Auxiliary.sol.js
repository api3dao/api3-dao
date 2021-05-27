const { expect } = require("chai");

let roles;
let api3Token, api3Pool, timelockManager;

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


  const timelockManagerFactory = await ethers.getContractFactory(
    "TimelockManager",
    roles.deployer
  );
  timelockManager = await timelockManagerFactory.deploy(
    api3Token.address,
    roles.deployer.address
  );
});

describe("Api3Token tests", function () {
  context("Try to renounce ownership", function () {
    it("reverts while trying", async function () {
      await expect(
        api3Token
          .connect(roles.deployer)
          .renounceOwnership()
      ).to.be.revertedWith(
        "Ownership cannot be renounced"
      );
    });
    it("reverts mint of tokens", async function () {
      await expect(
        api3Token
          .connect(roles.deployer)
          .mint(roles.deployer.address, 10000)
      ).to.be.revertedWith(
        "Only minters are allowed to mint"
      );
    });
    it("reverts while updating minter status", async function () {
      await expect(
        api3Token
          .connect(roles.deployer)
          .updateMinterStatus(roles.deployer.address, false)
      ).to.be.revertedWith(
        "Input will not update state"
      );
    });
    it("reverts while updating burner status", async function () {
      await expect(
        api3Token
          .connect(roles.deployer)
          .updateBurnerStatus(false)
      ).to.be.revertedWith(
        "Input will not update state"
      );
    });
    it("reverts burn of tokens", async function () {
      await expect(api3Token.connect(roles.deployer).burn(10000)).to.be.revertedWith(
        "Only burners are allowed to burn"
      );
    });
    it("updates burner status", async function () {
      await api3Token.connect(roles.deployer).updateBurnerStatus(true);
      const val = await api3Token.connect(roles.deployer)
          .getBurnerStatus(roles.deployer.address);
      expect(val).to.equal(true);
    });
    it("burnes tokens", async function () {
      await api3Token.connect(roles.deployer).updateBurnerStatus(true);
      const balanceBefore = await api3Token.connect(roles.deployer).balanceOf(roles.deployer.address);
      await api3Token.connect(roles.deployer).burn(10000);
      const balanceAfter = await api3Token.connect(roles.deployer).balanceOf(roles.deployer.address);
      expect(ethers.BigNumber.from(balanceBefore)
        .sub(ethers.BigNumber.from(balanceAfter))).to
        .equal(ethers.BigNumber.from(10000));
    });
    });
});

describe("timelockManager tests", function () {

  context("Update api3Pool address tests", function () {
    it("updates api3Pool address", async function () {
      await timelockManager
          .connect(roles.deployer)
          .updateApi3Pool(api3Pool.address);
      const pool = await timelockManager.connect(roles.deployer).api3Pool();
      expect(pool).to.equal(api3Pool.address)

    });
    it("reverts while trying to update api3Pool address", async function () {
      await timelockManager
        .connect(roles.deployer)
        .updateApi3Pool(api3Pool.address);
      await expect(timelockManager
        .connect(roles.deployer)
        .updateApi3Pool(api3Pool.address)).to.be.revertedWith(
        "Input will not update state"
      );

    });
  });

  context("Lock and transfer tests", function () {
    beforeEach("Approve token deposit", async function () {
      await api3Token
        .connect(roles.deployer)
        .approve(timelockManager.address, 10000000);
      });
    it("Transfers and locks API3 tokens", async function () {
      await timelockManager
        .connect(roles.deployer)
        .transferAndLock(roles.deployer.address,
          roles.user1.address,
          10000000,
          10000000000,
          20000000000);
      const timelock = await timelockManager.getTimelock(roles.user1.address);
      expect(timelock.totalAmount).to.equal(10000000);
    });
    it("Fails because of already existing timelock", async function () {
        await timelockManager
          .connect(roles.deployer)
          .transferAndLock(roles.deployer.address,
            roles.user1.address,
            5000000,
            10000000000,
            20000000000);
        const timelock = await timelockManager.getTimelock(roles.user1.address);
        expect(timelock.totalAmount).to.equal(5000000);
      await expect(timelockManager
        .connect(roles.deployer)
        .transferAndLock(roles.deployer.address,
          roles.user1.address,
          5000000,
          10000000000,
          20000000000)).to.be.revertedWith("Recipient has remaining tokens");
    });
    it("Fails because releaseEnd is before releaseStart", async function () {
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLock(roles.deployer.address,
            roles.user1.address,
            5000000,
            10000000000,
            10000000000)).to.be.revertedWith("releaseEnd not larger than releaseStart");
    });
    it("Fails because releaseStart is not in the future", async function () {
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLock(roles.deployer.address,
            roles.user1.address,
            5000000,
            1000000,
            2000000)).to.be.revertedWith("releaseStart not in the future");
    });
    it("Fails because cannot transfer tokens", async function () {
      await api3Token
        .connect(roles.user1)
        .approve(timelockManager.address, 10000000);
      await expect(
        timelockManager
          .connect(roles.deployer)
          .transferAndLock(
            roles.user1.address,
            roles.deployer.address,
            10000000,
            10000000000,
            20000000000)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  context("Multiple Lock and transfer tests", function () {
      beforeEach("Approve token deposit", async function () {
        await api3Token
          .connect(roles.deployer)
          .approve(timelockManager.address, 10000000);
      });
      it("multiple Transfers and locks API3 tokens", async function () {
        await timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 5000000],
            [10000000000,20000000000],
            [20000000000,30000000000]);
        const timelock = await timelockManager.getTimelock(roles.user1.address);
        expect(timelock.totalAmount).to.equal(5000000);
      });
      it("Fails because of already existing timelock", async function () {
        await timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [2500000, 2500000],
            [10000000000,20000000000],
            [20000000000,30000000000]);
        const timelock = await timelockManager.getTimelock(roles.user1.address);
        expect(timelock.totalAmount).to.equal(2500000);
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [2500000, 2500000],
            [10000000000,20000000000],
            [20000000000,30000000000])).to.be.revertedWith("Recipient has remaining tokens");
      });
      it("Fails because releaseEnd is before releaseStart", async function () {
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 5000000],
            [10000000000,20000000000],
            [20000000000,20000000000])).to.be.revertedWith("releaseEnd not larger than releaseStart");
      });
      it("Fails because releaseStart is not in the future", async function () {
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 5000000],
            [10000000000,200000],
            [20000000000,30000000000])).to.be.revertedWith("releaseStart not in the future");
      });
      it("Fails because cannot transfer tokens", async function () {
        await api3Token
          .connect(roles.user1)
          .approve(timelockManager.address, 10000000);
        await expect(
          timelockManager
            .connect(roles.deployer)
            .transferAndLockMultiple(roles.user1.address,
              [roles.deployer.address, roles.user2.address],
              [5000000, 5000000],
              [10000000000,20000000000],
              [20000000000,30000000000])).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });
      it("Fails because of different number of elements in the arrays", async function () {
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 50000000, 5000000000],
            [10000000000,20000000000],
            [20000000000,30000000000])).to.be.revertedWith("Parameters are of unequal length");
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 50000000],
            [10000000000,20000000000, 5000000000],
            [20000000000,30000000000])).to.be.revertedWith("Parameters are of unequal length");
        await expect(timelockManager
          .connect(roles.deployer)
          .transferAndLockMultiple(roles.deployer.address,
            [roles.user1.address, roles.user2.address],
            [5000000, 50000000],
            [10000000000,20000000000],
            [20000000000,30000000000, 5000000000])).to.be.revertedWith("Parameters are of unequal length");
      });
      it("Fails because params are too long", async function () {
        const users = Array.from({length: 31}, () => roles.user1.address);
        const params = Array.from({length: 31}, () => 10000000000);
        await expect(
          timelockManager
            .connect(roles.deployer)
            .transferAndLockMultiple(roles.user1.address,
              users,
              params,
              params,
              params)).to.be.revertedWith("Parameters are longer than 30");
      });
    });


});
