import * as hre from 'hardhat'
import { expect } from 'chai'
import 'mocha'
import { Api3Token, Api3Pool } from '../typechain'

describe('contracts', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: Api3Pool
  let ownerAccount: Api3Token

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3Token = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3Token.deploy(accounts[0], accounts[0])) as Api3Token
    const api3Pool = await hre.ethers.getContractFactory("Api3Pool")
    pool = (await api3Pool.deploy(token.address)) as Api3Pool
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
    const staker: Api3Pool = pool.connect(signer)
    await staker.deposit(accounts[1], 100, accounts[1])
    await staker.stake(50)
    const stakerBalance = await staker.balanceOf(accounts[1])
    expect(stakerBalance).to.equal(50)
    await staker.stake(50)
    const stakerBalance2 = await staker.updateAndGetBalanceOf(accounts[1])
    console.log(stakerBalance2)
    // expect(stakerBalance2).to.equal(100)
  })
})

// async function main() {
//   const accounts = await hre.waffle.provider.listAccounts();
//   const Api3Token = await hre.ethers.getContractFactory("Api3Token");
//   const api3Token = await Api3Token.deploy(accounts[0], accounts[0]);

//   const Api3Pool = await hre.ethers.getContractFactory("Api3Pool");
//   const api3Pool = await Api3Pool.deploy(api3Token.address);
//   console.log(api3Pool.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });
