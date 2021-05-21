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

describe("payOutClaim", function () {
  context("Caller is claims manager", function () {
    context("Pool has enough funds", function () {
      it("pays out claim", async function () {
        // Set the DAO Agent
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        // Set claims manager status as true with the DAO Agent
        await api3Pool
          .connect(roles.agentAppPrimary)
          .setClaimsManagerStatus(roles.claimsManager.address, true);
        // Have the user stake
        const user1Stake = ethers.utils.parseEther("20" + "000" + "000");
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
        // Pay out claim
        const claimAmount = ethers.utils.parseEther("5" + "000" + "000");
        await expect(
          api3Pool
            .connect(roles.claimsManager)
            .payOutClaim(roles.claimsManager.address, claimAmount)
        )
          .to.emit(api3Pool, "PaidOutClaim")
          .withArgs(roles.claimsManager.address, claimAmount);
        expect(await api3Pool.userStake(roles.user1.address)).to.equal(
          user1Stake.sub(claimAmount)
        );
        expect(await api3Token.balanceOf(roles.claimsManager.address)).to.equal(
          claimAmount
        );
      });
    });
    context("Pool does not have enough funds", function () {
      it("reverts", async function () {
        // Set the DAO Agent
        await api3Pool
          .connect(roles.randomPerson)
          .setDaoApps(
            roles.agentAppPrimary.address,
            roles.agentAppSecondary.address,
            roles.votingAppPrimary.address,
            roles.votingAppSecondary.address
          );
        // Set claims manager status as true with the DAO Agent
        await api3Pool
          .connect(roles.agentAppPrimary)
          .setClaimsManagerStatus(roles.claimsManager.address, true);
        await expect(
          api3Pool
            .connect(roles.claimsManager)
            .payOutClaim(roles.claimsManager.address, ethers.BigNumber.from(1))
        ).to.be.revertedWith("API3DAO.ClaimUtils: Total stake should be bigger then claim amount");
      });
    });
  });
  context("Caller is not claims manager", function () {
    it("reverts", async function () {
      await expect(
        api3Pool
          .connect(roles.randomPerson)
          .payOutClaim(roles.randomPerson.address, ethers.BigNumber.from(1))
      ).to.be.revertedWith("API3DAO.ClaimUtils: Only claim manager is allowed to perform this action");
    });
  });
});
