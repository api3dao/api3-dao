import {Api3Token, TestPool} from "../typechain";
import * as hre from "hardhat";
import {expect} from "chai";
import {getBlockTimestamp, jumpOneEpoch} from "./test_StakeUtils";

describe('ClaimUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
    await ownerAccount.updateMinterStatus(pool.address, true)
  })

  // set claims manager
  before(async () => {
    await pool.setClaimsManager(accounts[0]);
  })

  // set up accounts with stake and shares
  before(async () => {
    const testValue = 1000;
    const numAccounts = 3;
    // transfer, deposit, and stake tokens
    for (let i = 1; i <= numAccounts; i++) {
      await ownerAccount.transfer(accounts[i], testValue);
      const signer = hre.waffle.provider.getSigner(i)
      const staker = pool.connect(signer)
      await token.connect(signer).approve(pool.address, testValue);
      await staker.depositAndStake(accounts[i], testValue, accounts[i]);
    }
    // jump ahead in time and trigger epochs
    await jumpOneEpoch(pool);
    await jumpOneEpoch(pool);
    const targetEpoch = await pool.getRewardTargetEpochTest();
    for (let i = 1; i <= numAccounts; i++) {
      await pool.updateUserLocked(accounts[i], targetEpoch);
    }
  })

  it('pay out claim', async () => {
    // get start values
    const startManagerBalance = await token.balanceOf(accounts[0]);
    const startPoolBalance = await token.balanceOf(pool.address);
    const startTotalStake = await pool.totalStake();
    // pay out claim
    const currentBlockNumber = await getBlockTimestamp();
    const signer = hre.waffle.provider.getSigner(0);
    await pool.connect(signer).payOutClaim(100, currentBlockNumber);
    // get end values
    const endManagerBalance = await token.balanceOf(accounts[0]);
    const endPoolBalance = await token.balanceOf(pool.address);
    const endTotalStake = await pool.totalStake();
    // check result
    expect(endTotalStake).to.equal(startTotalStake.sub(100));
    expect(endManagerBalance).to.equal(startManagerBalance.add(100));
    expect(endPoolBalance).to.equal(startPoolBalance.sub(100));
  })

  it('attempt to pay out claim when not claims manager', async () => {
    const currentBlockNumber = await getBlockTimestamp();
    const signer = hre.waffle.provider.getSigner(1);
    await expect(pool.connect(signer).payOutClaim(100, currentBlockNumber)).to.be.reverted;
  })

})