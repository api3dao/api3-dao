import {Api3Token, TestPool} from "../typechain";
import * as hre from "hardhat";
import {expect} from "chai";

describe('GovernanceUtils', () => {
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

  it('set stake target', async () => {
    const startValue = await pool.stakeTarget();
    const expectedResult = startValue.sub(10)
    await pool.setStakeTarget(expectedResult);
    const result = await pool.stakeTarget();
    expect(result).to.equal(expectedResult);
  })

  it('set max apr', async () => {
    const startValue = await pool.maxApr();
    const expectedResult = startValue.sub(10)
    await pool.setMaxApr(expectedResult);
    const result = await pool.maxApr();
    expect(result).to.equal(expectedResult);
  })

  it('set min apr', async () => {
    const startValue = await pool.minApr();
    const expectedResult = startValue.sub(10)
    await pool.setMinApr(expectedResult);
    const result = await pool.minApr();
    expect(result).to.equal(expectedResult);
  })

  it('set unstakeWaitPeriod', async () => {
    const startValue = await pool.unstakeWaitPeriod();
    const expectedResult = startValue.add(10)
    await pool.setUnstakeWaitPeriod(expectedResult);
    const result = await pool.unstakeWaitPeriod();
    expect(result).to.equal(expectedResult);
    // ensure unstake wait period is in range of days: 7 <= wait <= 90
    await expect(pool.setUnstakeWaitPeriod(604799)).to.be.reverted;
    await expect(pool.setUnstakeWaitPeriod(7776001)).to.be.reverted;
  })

  it('set update coefficient', async () => {
    const startValue = await pool.updateCoeff();
    const expectedResult = startValue.sub(10)
    await pool.setUpdateCoefficient(expectedResult);
    const result = await pool.updateCoeff();
    expect(result).to.equal(expectedResult);
    // ensure update coefficient is in range of: 0 < coeff < 1,000%
    await expect(pool.setUpdateCoefficient(0)).to.be.reverted;
    await expect(pool.setUpdateCoefficient(1000000000)).to.be.reverted;
  })

})