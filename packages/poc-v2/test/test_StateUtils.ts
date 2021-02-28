import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'
import { BigNumber } from 'ethers'
import {TestCase, testCases} from '../test_config'
import {calculateExpected, ExpectedResults} from '../scripts/helpers'
import {getBlockTimestamp, jumpTo} from "./test_StakeUtils";

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

  // it('update APR', async () => {
  //   const expectedValues = await calculateExpected(pool)
  //   // console.log(JSON.parse(JSON.stringify(expectedValues)))
  //   // expect(await pool.currentApr()).to.equal(minApr);
  //
  //   Promise.all(testCases.map(async ({ staked, target, apr }, index) => {
  //     await pool.testUpdateCurrentApr(staked, target, apr)
  //     const result = await pool.currentApr()
  //     // console.log(result)
  //     const resString = result.toString()
  //     const testResults = { ...expectedValues[index], result: resString }
  //     console.log(JSON.parse(JSON.stringify(testResults)))
  //     // expect(result).to.equal(expectedValues[index])
  //   }))
  // })

  testCases.map(({ staked, target, apr }, index) => {
    it(`update APR: case ${index}`, async () => {
      // get parameters
      const minApr = await pool.minApr();
      const maxApr = await pool.maxApr();
      const sensitivity = await pool.updateCoeff();
      // calculate expected
      const expectedApr = calculateExpectedApr({ staked, target, apr}, sensitivity, minApr, maxApr);
      // function call
      await pool.testUpdateCurrentApr(staked, target, apr);
      // check result
      const result = await pool.currentApr();
      expect(result).to.equal(expectedApr);
    })
  })

  testCases.map(({ staked, target, apr}, index) => {
    it(`pay rewards: case ${index}`, async () => {
      // jump to future epoch
      const currentTimestamp = await getBlockTimestamp();
      const epochLength = await pool.rewardEpochLength();
      const epochsToJump = Math.ceil(Math.random() * 5);
      const futureEpochTimeStamp = currentTimestamp.add(epochLength.mul(epochsToJump)).toNumber()
      await jumpTo(futureEpochTimeStamp);
      // set test case
      await pool.setTestCase(staked, target, apr);
      const startPoolBalance = await token.balanceOf(pool.address);
      const startPoolStaked = await pool.totalStake();
      // epoch range
      const startEpoch = await pool.lastEpochPaid();
      const targetEpoch = await pool.getRewardTargetEpochTest();
      // calculate expected results
      const expectedReward: BigNumber[] = await calculatePayReward(startEpoch, targetEpoch, startPoolStaked, target, pool);
      // function call
      await pool.payReward(targetEpoch);
      // check reward for each epoch
      let epochToPay = startEpoch.add(1);
      let expectedStaked = startPoolStaked;
      let i = 0;
      while (epochToPay <= targetEpoch) {
        const rewardEpoch = await pool.rewards(epochToPay);
        const rewardAmount = rewardEpoch.amount;
        expect(rewardAmount).to.equal(expectedReward[i]);
        expectedStaked = expectedStaked.add(expectedReward[i]);
        i++;
        epochToPay = epochToPay.add(1);
      }
      // make sure total staked increases by total reward amount
      const poolStaked = await pool.totalStake();
      expect(poolStaked).to.equal(expectedStaked);
      // make sure pool balance increases by total reward amount
      const poolBalance = await token.balanceOf(pool.address);
      const expectedBalance = startPoolBalance.add(expectedStaked).sub(startPoolStaked);
      expect(poolBalance).to.equal(expectedBalance);
    })
  })

})


// for some reason I kept getting an exception when this was in the helpers.ts module, saying "calculateExpectedApr is not a function"
// I put it here instead because I otherwise couldn't get the exception to go away
export const calculateExpectedApr = (testCase: TestCase, sensitivity: BigNumber, minApr: BigNumber, maxApr: BigNumber): BigNumber => {
  const {staked, target, apr} = testCase;
  const delta = target.sub(staked);
  const deltaPercent = delta.mul(100000000).div(target);
  const aprUpdate = deltaPercent.mul(sensitivity).div(1000000);
  const nextApr = apr.mul(aprUpdate.add(100000000)).div(100000000);
  let nextExpectedApr = nextApr;
  if (nextApr.gt(maxApr)) {
    nextExpectedApr = maxApr;
  } else if (nextApr.lt(minApr)) {
    nextExpectedApr = minApr
  }
  return nextExpectedApr;
}

const calculatePayReward = async (startEpoch: BigNumber, targetEpoch: BigNumber, startStaked: BigNumber, stakeTarget: BigNumber, pool: TestPool): Promise<BigNumber[]> => {
  const minApr = await pool.minApr();
  const maxApr = await pool.maxApr();
  const sensitivity = await pool.updateCoeff();
  const startApr = await pool.currentApr();
  let epochToPay = startEpoch.add(1);
  let expectedStaked = startStaked;
  let expectedApr = startApr;
  const expectedReward: BigNumber[] = [];
  while (epochToPay <= targetEpoch) {
    // calc apr
    expectedApr = calculateExpectedApr({ staked: expectedStaked, target: stakeTarget, apr: expectedApr}, sensitivity, minApr, maxApr);
    // calc reward
    const reward = expectedStaked.mul(expectedApr).div(52).div(100000000);
    expectedReward.push(reward);
    // update parameters
    expectedStaked = expectedStaked.add(reward);
    epochToPay = epochToPay.add(1);
  }
  return expectedReward;
}