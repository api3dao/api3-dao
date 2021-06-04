const { expect } = require("chai");

let roles;
let convenience, mockApi3Pool, mockPrimaryVoting, mockSecondaryVoting;
const VotingAppType = Object.freeze({ Primary: 0, Secondary: 1 });

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  roles = {
    deployer: accounts[0],
    randomPerson: accounts[9],
  };
  const mockApi3PoolFactory = await ethers.getContractFactory(
    "MockApi3Pool",
    roles.deployer
  );
  mockApi3Pool = await mockApi3PoolFactory.deploy();
  const mockApi3VotingFactory = await ethers.getContractFactory(
    "MockApi3Voting",
    roles.deployer
  );
  mockPrimaryVoting = await mockApi3VotingFactory.deploy();
  mockSecondaryVoting = await mockApi3VotingFactory.deploy();
  await mockApi3Pool.setDaoApps(
    mockPrimaryVoting.address,
    mockSecondaryVoting.address
  );
  const convenienceFactory = await ethers.getContractFactory(
    "Convenience",
    roles.deployer
  );
  convenience = await convenienceFactory.deploy(mockApi3Pool.address);
});

describe("getOpenVoteIds", function () {
  context("There are no open votes", function () {
    it("returns empty array", async function () {
      expect(
        await convenience.getOpenVoteIds(VotingAppType.Primary)
      ).to.deep.equal([]);
      expect(
        await convenience.getOpenVoteIds(VotingAppType.Secondary)
      ).to.deep.equal([]);
    });
  });
});
