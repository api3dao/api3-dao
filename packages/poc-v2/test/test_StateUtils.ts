import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'
import { BigNumber } from 'ethers'
import { testCases } from '../test_config'
import { calculateExpected, ExpectedResults } from '../scripts/helpers'

const tokenDigits = BigNumber.from('1000000000000000000')
const paramDigits = BigNumber.from('1000000')

describe('StateUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  // let expectedValues: ExpectedResults[]

  beforeEach(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const testPoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await testPoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
    await ownerAccount.updateMinterStatus(pool.address, true)
  })

  it('update APR', async () => {
    const expectedValues = await calculateExpected(pool)
    // console.log(JSON.parse(JSON.stringify(expectedValues)))
    // expect(await pool.currentApr()).to.equal(minApr);

    Promise.all(testCases.map(async ({ staked, target, apr }, index) => {
      await pool.testUpdateCurrentApr(staked, target, apr)
      const result = await pool.currentApr()
      // console.log(result)
      const resString = result.toString()
      const testResults = { ...expectedValues[index], result: resString }
      console.log(JSON.parse(JSON.stringify(testResults)))
      // expect(result).to.equal(expectedValues[index])
    }))
  })

  testCases.map(({ staked, target, apr}, index) => {
    it(`pay rewards: case ${index}`, async () => {
        // set test case
        await pool.setTestCase(staked, target, apr);
        const startPoolBalance = await token.balanceOf(pool.address);
        const startPoolStaked = await pool.totalSupply();
        // function call
        await pool.testPayReward();
        // calculate expected results
        const currentApr = await pool.currentApr();
        const expectedReward = startPoolStaked.mul(BigNumber.from(currentApr)).div(52).div(100000000);
        // get epoch index
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        const currentBlock = await hre.ethers.provider.getBlock(blockNumber);
        const rewardEpochLength = await pool.rewardEpochLength();
        const now = BigNumber.from(currentBlock.timestamp);
        const indEpoch = now.div(rewardEpochLength);

        // check results
        const rewardRecord = await pool.rewardAmounts(indEpoch);
        expect(rewardRecord).to.equal(expectedReward);

        const poolStaked = await pool.totalSupply();
        const expectedStaked = startPoolStaked.add(expectedReward);
        expect(poolStaked).to.equal(expectedStaked);

        const locked = await pool.getLockedAt(blockNumber);
        expect(locked).to.equal(expectedReward);

        const rewardVestingPeriod = await pool.rewardVestingPeriod();
        const rewardReleaseBlock = BigNumber.from(blockNumber).add(rewardVestingPeriod)
        const rewardRelease = await pool.getRewardReleaseAt(rewardReleaseBlock);
        expect(rewardRelease).to.equal(expectedReward);

        const poolBalance = await token.balanceOf(pool.address);
        const expectedBalance = startPoolBalance.add(expectedReward);
        expect(poolBalance).to.equal(expectedBalance);
    })
  })

})