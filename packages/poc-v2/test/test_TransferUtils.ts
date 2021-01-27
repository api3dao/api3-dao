import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import {Api3Pool, Api3Token} from '../typechain'


describe('TransferUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: Api3Pool
  let ownerAccount: Api3Token

  const testValues = [1, 2, 3, 10, 100, 1000, '1000000000000000000', -1];
  let testTotal = hre.ethers.BigNumber.from(0);

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("Api3Pool")
    pool = (await api3PoolFactory.deploy(token.address)) as Api3Pool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
  })

  it('transfer tokens', async () => {
    for (let amount of testValues) {
      testTotal = testTotal.add(amount);
    }
    await ownerAccount.transfer(accounts[1], testTotal);
    const balance = await token.balanceOf(accounts[1]);
    expect(balance).to.equal(testTotal);
    const signer1 = hre.waffle.provider.getSigner(1);
    await token.connect(signer1).approve(pool.address, balance);

  })

  it('Deposit tokens', async () => {
    const tokenHolder = accounts[1]
    // initial balances
    let poolBalance = await token.balanceOf(pool.address);
    let userBalance = await token.balanceOf(tokenHolder);
    // pre-totals
    expect(poolBalance).to.equal(0);
    expect(userBalance).to.equal(testTotal);
    // deposit
    let deposited = hre.ethers.BigNumber.from(0);
    for (let amount of testValues) {
      const prePoolBalance = poolBalance;
      const preUserBalance = userBalance;
      await pool.deposit(tokenHolder, amount, tokenHolder);
      deposited = deposited.add(amount);
      // confirm pool token balance
      poolBalance = await token.balanceOf(pool.address);
      expect(poolBalance).to.equal(prePoolBalance.add(amount));
      // depositor token balance
      userBalance = await token.balanceOf(tokenHolder);
      expect(userBalance).to.equal(preUserBalance.sub(amount));
      // confirm depositor pool unstaked balance
      const unstaked = (await pool.users(tokenHolder)).unstaked
      expect(unstaked).to.equal(deposited)
    }
    // post-totals
    expect(poolBalance).to.equal(testTotal);
    expect(userBalance).to.equal(0);
  })

  it('Withdraw tokens', async () => {
    const tokenHolder = accounts[1];
    const signer1 = hre.waffle.provider.getSigner(1);
    await pool.updateUserState(tokenHolder, hre.waffle.provider.blockNumber);
    // initial balances
    let user = await pool.users(tokenHolder);
    const preUnstaked = user.unstaked;
    const preLocked = user.locked;
    let poolBalance = await token.balanceOf(pool.address);
    let userBalance = await token.balanceOf(tokenHolder);
    // pre-totals
    expect(poolBalance).to.equal(testTotal);
    expect(userBalance).to.equal(0);
    // deposit
    let withdrawn = hre.ethers.BigNumber.from(0);
    for (let amount of testValues) {
      const prePoolBalance = poolBalance;
      const preUserBalance = userBalance;
      await pool.connect(signer1).withdraw(tokenHolder, amount);
      withdrawn = withdrawn.add(amount);
      // confirm pool token balance
      poolBalance = await token.balanceOf(pool.address);
      expect(poolBalance).to.equal(prePoolBalance.sub(amount));
      // depositor token balance
      userBalance = await token.balanceOf(tokenHolder);
      expect(userBalance).to.equal(preUserBalance.add(amount));
      // confirm depositor pool balances
      user = await pool.users(tokenHolder)
      expect(user.unstaked).to.equal(preUnstaked.sub(withdrawn));
      expect(user.locked).to.equal(preLocked);
      expect(user.unstaked).to.be.gte(user.locked);
    }
    // post-totals
    expect(poolBalance).to.equal(0);
    expect(userBalance).to.equal(testTotal);
  });



})