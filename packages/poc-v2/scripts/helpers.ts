import * as hre from 'hardhat'
import { Api3Token, TestPool } from '../typechain'
import { BigNumber } from 'ethers'
import { testCases } from '../test_config'
import { writeFile } from 'fs'

export interface ExpectedResults {
    staked: string,
    target: string,
    apr: string,
    update: string,
    calculated: string,
    expected: string
}

export const calculateExpected = async (pool: TestPool) => {
    // const accounts = await hre.waffle.provider.listAccounts()
    // const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    // const token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    // const testPoolFactory = await hre.ethers.getContractFactory("TestPool")
    // const pool = (await testPoolFactory.deploy(token.address)) as TestPool
    // const signer0 = hre.waffle.provider.getSigner(0)
    // const ownerAccount = token.connect(signer0)
    // await ownerAccount.updateMinterStatus(pool.address, true)

    const minApr = await pool.minApr()
    const maxApr = await pool.maxApr()
    const sensitivity = await pool.updateCoeff()

    // expect(await pool.currentApr()).to.equal(minApr);
    let output: ExpectedResults[] = []
    const results = await Promise.all(testCases.map(async (test, index) => {
        const { staked, target, apr } = test
        const delta = target.sub(staked)
        const deltaPercent = delta.mul(100000000).div(target)
        const aprUpdate = deltaPercent.mul(sensitivity).div(1000000)

        const nextApr = apr.mul(aprUpdate.add(100000000)).div(100000000)
        let nextExpectedApr: BigNumber = nextApr
        if (nextApr > maxApr) {
            nextExpectedApr = maxApr
        }
        else if (nextApr < minApr) { nextExpectedApr = minApr }
        const result = {
            staked: staked.toString(),
            target: target.toString(),
            apr: apr.toString(),
            update: aprUpdate.toString(),
            calculated: nextApr.toString(),
            expected: nextExpectedApr.toString()
        }
        return result
    }))
    // console.log(JSON.parse(JSON.stringify(results)))
    // writeFile('./calculated.json', JSON.stringify(output), (err) => {
    //     console.log('callback')
    //     if (err) { console.log(err) }
    // })
    return results
}

// calculateExpected()