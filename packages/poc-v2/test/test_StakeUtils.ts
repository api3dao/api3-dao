import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'

describe('StakeUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let stakers: TestPool[]

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    const ownerAccount = token.connect(signer0)
    stakers = await Promise.all(accounts.map(async account => {
      await ownerAccount.transfer(account, 100)
      const signer = hre.waffle.provider.getSigner(account)
      const holder = token.connect(signer)
      await holder.approve(pool.address, 100)
      return pool.connect(signer)
    }))
  })

  it('stakes a deposit', async () => {
    await stakers[1].deposit(accounts[1], 100, accounts[1])

    const deposited = (await pool.users(accounts[1])).unstaked
    expect(deposited).to.equal(100)

    await stakers[1].stake(50)

    const staked = await pool.balanceOf(accounts[1])
    expect(staked).to.equal(50)
    const unstaked = (await pool.users(accounts[1])).unstaked
    expect(unstaked).to.equal(50)
  })

  it('deposits and stakes in one tx', async () => {
    await stakers[2].depositAndStake(accounts[2], 100, accounts[2])

    const staked = await pool.balanceOf(accounts[2])
    expect(staked).to.equal(100)
    const unstaked = (await pool.users(accounts[2])).unstaked
    expect(unstaked).to.equal(0)
    const unpooled = await token.balanceOf(accounts[2])
    expect(unpooled).to.equal(0)
  })

  it('schedules unstake', async () => {
    await stakers[1].scheduleUnstake(25)

    const unstakeAmount = (await pool.users(accounts[1])).unstakeAmount
    expect(unstakeAmount).to.equal(25)
  })
})