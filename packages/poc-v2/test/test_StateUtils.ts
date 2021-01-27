import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, Api3Pool } from '../typechain'


describe('StateUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: Api3Pool
  let ownerAccount: Api3Token

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("Api3Pool")
    pool = (await api3PoolFactory.deploy(token.address)) as Api3Pool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
  })

  it('Update APR with default parameters', async () => {
    expect(await pool.currentApr()).to.equal(await pool.minApr());
    const stakeValues = new Map<number, number>([
      [10e24, 2500000],
      [1e24, 4750000],
      [15e24, 7125000],
      [19e24, 2500000]
    ])
    // @ts-ignore
    for (let [staked, expectedApr] of stakeValues.entries()) {
      await pool.testUpdateCurrentApr(hre.ethers.BigNumber.from(staked));
      expect(await pool.currentApr()).to.be.gte(await pool.minApr());
      expect(await pool.currentApr()).to.be.lte(await pool.maxApr());
      expect(await pool.currentApr()).to.equal(expectedApr);
    }
  })



})