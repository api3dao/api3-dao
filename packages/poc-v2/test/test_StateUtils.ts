import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, TestPool } from '../typechain'
import { BigNumber } from 'ethers'
import { testCases } from '../test_config'

const tokenDigits = BigNumber.from('1000000000000000000')
const paramDigits = BigNumber.from('1000000')

describe('StateUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token

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
    const minApr = await pool.minApr()
    const maxApr = await pool.maxApr()
    const sensitivity = await pool.updateCoeff()

    // expect(await pool.currentApr()).to.equal(minApr);

    testCases.forEach(async (test, index) => {
      console.log(index)
      const { staked, target, apr } = test
      const delta = target.sub(staked)
      const deltaPercent = delta.mul(100000000).div(target)
      const aprUpdate = deltaPercent.mul(sensitivity).div(paramDigits)
      console.log('Update ' + aprUpdate)

      let nextExpectedApr = apr.mul(aprUpdate.add(100000000)).div(100000000)
      console.log('Next ' + nextExpectedApr)
      if (nextExpectedApr > maxApr) {
        console.log(nextExpectedApr > maxApr)
        nextExpectedApr = maxApr
      }
      else if (nextExpectedApr < minApr) { nextExpectedApr = minApr }
      console.log('Expected ' + nextExpectedApr)
      await pool.testUpdateCurrentApr(staked, target, apr)
      const waitForApr = async () => {
        const result = await pool.currentApr()
        console.log('Result ' + result + '/n/n')
        return result
      }
      setTimeout(async () => {
        const result = await waitForApr()
        console.log(result)
      }, 5000)
      // const string = `Result ${result}`
      // console.log(string)
      // 7600000
      // 75000000
      // 75000000
      // 7600000
      // expect(result).to.equal(nextExpectedApr)
    })
    // const stakeValues = new Map<string, number>([
    //   ['10000000000000000000000000', 2500000],
    //   ['1000000000000000000000000', 4750000],
    //   ['1500000000000000000000000', 8787500],
    //   ['15000000000000000000000000', 13181250],
    //   ['70000000000000000000000000', 75000000]
    // ])

    // // @ts-ignore
    // for (let [staked, expectedApr] of stakeValues.entries()) {
    //   await pool.testUpdateCurrentApr(hre.ethers.BigNumber.from(staked));
    //   expect(await pool.currentApr()).to.be.gte(await pool.minApr());
    //   expect(await pool.currentApr()).to.be.lte(await pool.maxApr());
    //   expect(await pool.currentApr()).to.equal(expectedApr);
    // }
  })

  // it('test payReward() function', async () => {
  //   const stakeValues = [
  //     // [oldStaked, expectedReward, newStaked]
  //     ['10000000000000000000000000', '4807692307692310000000', '10004807692307700000000000'],
  //     ['1000000000000000000000000', '913461538461539000000', '1000913461538460000000000'],
  //     ['1500000000000000000000000', '2534855769230770000000', '1502534855769230000000000'],
  //     ['15000000000000000000000000', '38022836538461500000000', '15038022836538500000000000']
  //   ]
  //   const roundingError = hre.ethers.BigNumber.from('10000000000000000'); // 10^16
  //   for (let [oldStaked, expectedReward, newStaked] of stakeValues) {
  //     const oldPoolBalance = await token.balanceOf(pool.address);
  //     await pool.testPayReward(hre.ethers.BigNumber.from(oldStaked));
  //     // check new total staked value
  //     const realStakedNow = await pool.getTotalStakedNow();
  //     const newStakedBN = hre.ethers.BigNumber.from(newStaked);
  //     const stakeDifference = realStakedNow.sub(newStakedBN).abs();
  //     expect(stakeDifference).to.be.lte(roundingError);
  //     // check that pool balance increased by expected reward amount
  //     const newPoolBalance = await token.balanceOf(pool.address);
  //     const balanceDifference = newPoolBalance.sub(oldPoolBalance);
  //     const expectedRewardBN = hre.ethers.BigNumber.from(expectedReward);
  //     const rewardDifference = balanceDifference.sub(expectedRewardBN).abs();
  //     expect(rewardDifference).to.be.lte(roundingError);
  //   }
  // })

})