import * as hre from 'hardhat'
import { Api3Token, TestPool } from '../typechain'
import { BigNumber } from 'ethers'
import { testCases } from '../test_config'
import { writeFile } from 'fs'

interface ExpectedResults {
    staked: BigNumber,
    target: BigNumber,
    apr: BigNumber,
    update: BigNumber,
    calculated: BigNumber,
    expected: BigNumber
}

export const calculateExpected = async () => {
    const accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    const token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const testPoolFactory = await hre.ethers.getContractFactory("TestPool")
    const pool = (await testPoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    const ownerAccount = token.connect(signer0)
    await ownerAccount.updateMinterStatus(pool.address, true)

    const minApr = await pool.minApr()
    const maxApr = await pool.maxApr()
    const sensitivity = await pool.updateCoeff()

    // expect(await pool.currentApr()).to.equal(minApr);
    let output: ExpectedResults[] = []
    testCases.forEach(async (test, index) => {
        console.log(index)
        const { staked, target, apr } = test
        const delta = target.sub(staked)
        const deltaPercent = delta.mul(100000000).div(target)
        const aprUpdate = deltaPercent.mul(sensitivity).div(1000000)
        console.log('Update ' + aprUpdate)

        const nextApr = apr.mul(aprUpdate.add(100000000)).div(100000000)
        let nextExpectedApr: BigNumber = nextApr
        if (nextApr > maxApr) {
            nextExpectedApr = maxApr
        }
        else if (nextApr < minApr) { nextExpectedApr = minApr }
        output.push({
            staked: staked,
            target: target,
            apr: apr,
            update: aprUpdate,
            calculated: nextApr,
            expected: nextExpectedApr
        })
    })
    writeFile('./calculated.json', JSON.parse(JSON.stringify(output)), (err) => {
        if (err) { console.log(err) }
    })
}