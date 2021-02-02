import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'

describe('StakeUtils', () => {
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
  })


  it('transfers tokens', async () => {
    await ownerAccount.transfer(accounts[1], 100)
    const balance = await token.balanceOf(accounts[1])
    expect(balance).to.equal(100)
  })

  it('deposits and stakes tokens', async () => {
    const signer = hre.waffle.provider.getSigner(1)
    const account = token.connect(signer)
    await account.approve(pool.address, 100)
    const allowance = await token.allowance(accounts[1], pool.address)
    expect(allowance).to.equal(100)
    const staker = pool.connect(signer)
    await staker.deposit(accounts[1], 100, accounts[1])
    await staker.stake(50)
    const staked = await staker.balanceOf(accounts[1])
    expect(staked).to.equal(50)
  })

  it('schedules unstake', async () => {
    const staker = pool.connect(hre.waffle.provider.getSigner(1))
    await staker.scheduleUnstake(25)
    const unstakeAmount = await staker.getUnstakeAmount(accounts[1])
    expect(unstakeAmount).to.equal(25)
  })
})