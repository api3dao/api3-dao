import {Api3Token, TestPool, TimelockManager} from "../typechain";
import * as hre from "hardhat";
import {expect} from "chai";
import {getBlockTimestamp, jumpOneEpoch, jumpTo} from "./test_StakeUtils";
import {BigNumber} from "ethers";

describe('TimelockUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  let timelockManager: TimelockManager

  const testValue = BigNumber.from(1000);
  const oneWeek = BigNumber.from(604800);
  const oneYear = BigNumber.from(31536000);

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
    await ownerAccount.updateMinterStatus(pool.address, true)
    const timelockManagerFactory = await hre.ethers.getContractFactory("TimelockManager")
    timelockManager = (await timelockManagerFactory.deploy(token.address, accounts[0])) as TimelockManager
  })

  // set up accounts with timelocks
  before(async () => {
    const now = (await getBlockTimestamp()).add(oneWeek.mul(2)); // vesting release beings in two weeks
    const oneYearLater = now.add(oneYear); // vesting ends one year after release start
    const signer = hre.waffle.provider.getSigner(0);
    await token.connect(signer).approve(timelockManager.address, testValue.mul(2));
    await timelockManager.connect(signer).updateApi3Pool(pool.address);
    await timelockManager.connect(signer).transferAndLock(accounts[0], accounts[1], testValue, now, oneYearLater);
    await timelockManager.connect(signer).transferAndLock(accounts[0], accounts[2], testValue, now, oneYearLater);
  })

  it('deposit with vesting before release start', async () => {
    const userAddress = accounts[1];
    // get start values
    const startUnstaked = (await pool.users(userAddress)).unstaked;
    const startVesting = (await pool.users(userAddress)).vesting;
    const startTimelockBalance = await token.balanceOf(timelockManager.address);
    const startPoolBalance = await token.balanceOf(pool.address);
    // function call by account 1
    const signer = hre.waffle.provider.getSigner(1);
    await timelockManager.connect(signer).withdrawToPool(pool.address, userAddress);
    // get end values
    const endUnstaked = (await pool.users(userAddress)).unstaked;
    const endVesting = (await pool.users(userAddress)).vesting;
    const endTimelockBalance = await token.balanceOf(timelockManager.address);
    const endPoolBalance = await token.balanceOf(pool.address);
    // check result
    expect(endUnstaked).to.equal(startUnstaked.add(testValue));
    expect(endVesting).to.equal(startVesting.add(testValue));
    expect(endTimelockBalance).to.equal(startTimelockBalance.sub(testValue));
    expect(endPoolBalance).to.equal(startPoolBalance.add(testValue));
  })

  it('deposit with vesting after release start', async () => {
    const userAddress = accounts[2];
    // jump forward in time by four weeks
    const now = await getBlockTimestamp();
    await jumpTo(now.add(oneWeek.mul(4)).toNumber());
    // get start values
    const startUnstaked = (await pool.users(userAddress)).unstaked;
    const startVesting = (await pool.users(userAddress)).vesting;
    const startTimelockBalance = await token.balanceOf(timelockManager.address);
    const startPoolBalance = await token.balanceOf(pool.address);
    // const get expected values
    const expectedReleased = testValue.mul(oneWeek).mul(2).div(oneWeek).div(52);
    // function call by account 2
    const signer = hre.waffle.provider.getSigner(2);
    await timelockManager.connect(signer).withdrawToPool(pool.address, userAddress);
    // get end values
    const endUnstaked = (await pool.users(userAddress)).unstaked;
    const endVesting = (await pool.users(userAddress)).vesting;
    const endTimelockBalance = await token.balanceOf(timelockManager.address);
    const endPoolBalance = await token.balanceOf(pool.address);
    // check result
    expect(endUnstaked).to.equal(startUnstaked.add(testValue));
    expect(endVesting).to.equal(startVesting.add(testValue).sub(expectedReleased));
    expect(endTimelockBalance).to.equal(startTimelockBalance.sub(testValue));
    expect(endPoolBalance).to.equal(startPoolBalance.add(testValue));
  })


  it('update deposited vesting from pool after time passes', async () => {
    const userAddress = accounts[2];
    const startVesting = (await pool.users(userAddress)).vesting;
    // jump forward in time by four weeks, trigger epoch, and update timelock
    const now = await getBlockTimestamp();
    await jumpTo(now.add(oneWeek.mul(4)).toNumber());
    const targetEpoch = await pool.getRewardTargetEpochTest();
    await pool.updateUserLocked(userAddress, targetEpoch);
    await pool.updateTimelockStatus(userAddress, timelockManager.address);
    // check result
    const expectedReleased = testValue.mul(oneWeek).mul(4).div(oneWeek).div(52);
    const endVesting = (await pool.users(userAddress)).vesting;
    expect(endVesting).to.equal(startVesting.sub(expectedReleased));
  })

})