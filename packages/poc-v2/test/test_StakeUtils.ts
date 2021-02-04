import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'
import {BigNumber} from "ethers";

const testCaseNumbers: string[] =  ['0', '6', '13', '100000000000000000000000', '10000000', '47777', '40000000', '1437589347', '10000001']
const testValues: BigNumber[] = testCaseNumbers.map((value) => BigNumber.from(value));

describe('StakeUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  let sum = BigNumber.from(0);
  let sumDeposited = BigNumber.from(0);
  let sumUnstaked = BigNumber.from(0);
  let sumStaked = BigNumber.from(0);

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
  })

  testValues.map((testValue, index) => {
    it(`transfer tokens: case ${index}`, async () => {
      await ownerAccount.transfer(accounts[1], testValue);
      sum = sum.add(testValue);
      const balance = await token.balanceOf(accounts[1]);
      expect(balance).to.equal(sum);
    })
  })

  testValues.map((testValue, index) => {
    it(`deposit and stake tokens: case ${index}`, async () => {
      // get signer
      const signer = hre.waffle.provider.getSigner(1)
      const account = token.connect(signer)
      const staker = pool.connect(signer)
      // approve transfer
      await account.approve(pool.address, testValue)
      const allowance = await token.allowance(accounts[1], pool.address)
      expect(allowance).to.equal(testValue)
      // deposit api3
      await staker.deposit(accounts[1], testValue, accounts[1])
      sumDeposited = sumDeposited.add(testValue);
      // stake api3
      const stakeAmount = testValue.div(2);
      await staker.stake(stakeAmount);
      sumStaked = sumStaked.add(stakeAmount);
      sumUnstaked = sumUnstaked.add(testValue.sub(stakeAmount));
      // check stake
      const shares = await pool.balanceOf(accounts[1]);
      const totalStaked = await pool.totalSupply();
      const totalShares = await pool.getTotalShares();
      const staked = shares.mul(totalStaked).div(totalShares);
      expect(staked).to.equal(sumStaked);
      // check unstaked
      const unstaked = await staker.getUnstaked(accounts[1]);
      expect(unstaked).to.equal(sumUnstaked);
      // check total
      expect(staked.add(unstaked)).to.equal(sumDeposited);
    })
 })

  testValues.map((testValue, index) => {
    it(`schedule unstake: case ${index}`, async () => {
      const staker = pool.connect(hre.waffle.provider.getSigner(1));
      // get current staked
      const shares = await pool.balanceOf(accounts[1]);
      const totalStaked = await pool.totalSupply();
      const totalShares = await pool.getTotalShares();
      const staked = shares.mul(totalStaked).div(totalShares);
      // schedule unstake
      if (testValue.gt(staked)) {
        await expect(staker.scheduleUnstake(testValue)).to.be.reverted;
      } else {
        await staker.scheduleUnstake(testValue);
        // check unstake request amount
        const unstakeAmount = await staker.getUnstakeAmount(accounts[1]);
        expect(unstakeAmount).to.equal(testValue);
        // check unstake request timestamp
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        const currentBlock = await hre.ethers.provider.getBlock(blockNumber);
        const now = BigNumber.from(currentBlock.timestamp);
        const unstakeScheduleAt = await staker.getScheduledUnstake(accounts[1]);
        expect(unstakeScheduleAt).to.equal(now);
      }
    })
  })

})