// Getter methods already get tested in the tests of other methods
// We will only be testing the missing ones here
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

describe("userSharesAt", function () {
  it("gets user shares at", async function () {
    const user1Stake = ethers.utils.parseEther("10" + "000" + "000");
    await api3Token
      .connect(roles.deployer)
      .approve(api3Pool.address, user1Stake);
    await api3Pool
      .connect(roles.randomPerson)
      .deposit(roles.deployer.address, user1Stake, roles.user1.address);
    await api3Pool
      .connect(roles.user1)
      .stake(ethers.BigNumber.from(1));
    await api3Pool
      .connect(roles.user1)
      .stake(ethers.BigNumber.from(1));
    await api3Pool
      .connect(roles.user1)
      .stake(ethers.BigNumber.from(1));
    const currentBlockNumber = await ethers.provider.getBlockNumber();
    expect(
      await api3Pool.userSharesAt(currentBlockNumber, roles.user1.address)
    ).to.equal(ethers.BigNumber.from(3));
    expect(
      await api3Pool.userSharesAt(currentBlockNumber - 1, roles.user1.address)
    ).to.equal(ethers.BigNumber.from(2));
    expect(
      await api3Pool.userSharesAt(currentBlockNumber - 2, roles.user1.address)
    ).to.equal(ethers.BigNumber.from(1));
    expect(
      await api3Pool.userSharesAt(currentBlockNumber - 3, roles.user1.address)
    ).to.equal(ethers.BigNumber.from(0));
  });
});


describe("getDelegateAt", function () {
  it("gets delegate at", async function () {
    const firstBlockNumber = await ethers.provider.getBlockNumber();
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber, roles.user1.address)
    ).to.equal(ethers.constants.AddressZero);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 1, roles.user1.address)
    ).to.equal(roles.user2.address);
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [epochLength.toNumber()]);
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.randomPerson.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber, roles.user1.address)
    ).to.equal(ethers.constants.AddressZero);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 1, roles.user1.address)
    ).to.equal(roles.user2.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 2, roles.user1.address)
    ).to.equal(roles.randomPerson.address);
    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [epochLength.toNumber()]);
    await api3Pool
      .connect(roles.user1)
      .delegateVotingPower(roles.user2.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber, roles.user1.address)
    ).to.equal(ethers.constants.AddressZero);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 1, roles.user1.address)
    ).to.equal(roles.user2.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 2, roles.user1.address)
    ).to.equal(roles.randomPerson.address);
    expect(
      await api3Pool.userDelegateAt(firstBlockNumber + 3, roles.user1.address)
    ).to.equal(roles.user2.address);
  });
});
