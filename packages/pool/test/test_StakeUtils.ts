import * as hre from 'hardhat'
import {expect} from 'chai'
import 'mocha'
import {Api3Token, TestPool} from '../typechain'
import {BigNumber} from "ethers";
import {Test} from "mocha";

const testCaseNumbers: string[] =  ['0', '6', '13', '100000000000000000000000', '10000001', '47777', '40000000', '1437589347', '1000000000000']
const testValues: BigNumber[] = testCaseNumbers.map((value) => BigNumber.from(value));


describe('StakeUtils', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  let stakers: TestPool[]

  before(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
    stakers = await Promise.all(accounts.map(async account => {
      await ownerAccount.transfer(account, 100)
      const signer = hre.waffle.provider.getSigner(account)
      const holder = token.connect(signer)
      await holder.approve(pool.address, 100)
      return pool.connect(signer)
    }))
    await ownerAccount.updateMinterStatus(pool.address, true)
  })

  it('stakes a deposit', async () => {
    await stakers[1].deposit(accounts[1], 100, accounts[1])

    const deposited = (await pool.users(accounts[1])).unstaked
    expect(deposited).to.equal(100)

    await stakers[1].stake(50)

    const staked = await pool.balanceOf(accounts[1])
    // console.log(JSON.stringify(staked))
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
    const apr = await pool.currentApr()
    console.log(`\n\n\n\n ${apr} \n\n\n\n\n`)
  })

  it('schedules unstake', async () => {
    await stakers[1].scheduleUnstake(25)

    const unstakeAmount = (await pool.users(accounts[1])).unstakeAmount
    expect(unstakeAmount).to.equal(25)
  })

})


describe('StakeUtils_MultiCase', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  let sum = BigNumber.from(0);
  let sumDeposited = BigNumber.from(0);
  let sumUnstaked = BigNumber.from(0);
  let sumStaked = BigNumber.from(0);

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

  testValues.map((testValue, index) => {
    it(`transfer tokens: case ${index}`, async () => {
      await ownerAccount.transfer(accounts[1], testValue);
      sum = sum.add(testValue);
      const balance = await token.balanceOf(accounts[1]);
      expect(balance).to.equal(sum);
    })
  })

  testValues.map((testValue, index) => {
    it(`deposit and then stake tokens: case ${index}`, async () => {
      // get signer
      const signer = hre.waffle.provider.getSigner(1)
      const account = token.connect(signer)
      const staker = pool.connect(signer)
      // approve transfer
      await account.approve(pool.address, testValue)
      const allowance = await token.allowance(accounts[1], pool.address)
      expect(allowance).to.equal(testValue)
      // deposit api3
      await staker.deposit(accounts[1], testValue, accounts[1])
      sumDeposited = sumDeposited.add(testValue);
      // stake api3
      const toStake = testValue.div(2);
      await staker.stake(toStake);
      sumStaked = sumStaked.add(toStake);
      sumUnstaked = sumUnstaked.add(testValue.sub(toStake));
      // check stake
      const staked = await pool.userStaked(accounts[1]);
      expect(staked).to.equal(sumStaked);
      // check unstaked
      const unstaked = (await pool.users(accounts[1])).unstaked;
      expect(unstaked).to.equal(sumUnstaked);
      // check total tokens
      expect(staked.add(unstaked)).to.equal(sumDeposited);
      // check shares
      const shares = await pool.shares(accounts[1]);
      const totalStaked = await pool.totalStake();
      const totalShares = await pool.totalSupply();
      expect(shares).to.equal(totalShares.mul(staked).div(totalStaked));
      // check delegated
      // TODO: ensure stake updates delegated
    })
  })

  testValues.map((testValue, index) => {
    it(`schedule unstake: case ${index}`, async () => {
      const staker = pool.connect(hre.waffle.provider.getSigner(1));
      // schedule unstake
      const userStaked = await pool.userStaked(accounts[1]);
      if (testValue.gt(userStaked)) {
        await expect(staker.scheduleUnstake(testValue)).to.be.reverted;
      } else {
        await staker.scheduleUnstake(testValue);
        // check unstake request amount
        const unstakeAmount = (await pool.users(accounts[1])).unstakeAmount;
        expect(unstakeAmount).to.equal(testValue);
        // check unstake request timestamp
        const now = await getBlockTimestamp()
        const wait = await pool.unstakeWaitPeriod();
        const unstakeScheduleAt = (await pool.users(accounts[1])).unstakeScheduledFor;
        expect(unstakeScheduleAt).to.equal(now.add(wait));
      }
    })
  })

  it('unstake all staked tokens', async () => {
    const staker = pool.connect(hre.waffle.provider.getSigner(1));
    for (let i = 0; i < 2; i++) {
      // get starting values
      const startUnstaked = (await pool.users(accounts[1])).unstaked;
      const startStaked = await pool.userStaked(accounts[1]);
      // unstake tokens
      await staker.scheduleUnstake(startStaked);
      await jumpOneEpoch(pool);
      await staker.unstake();
      // check result
      const unstaked = (await pool.users(accounts[1])).unstaked;
      expect(unstaked).to.equal(startUnstaked.add(startStaked));
    }
  })

  testValues.map((testValue, index) => {
    it(`withdraw tokens: case ${index}`, async () => {
      // const unstaked = (await pool.users(accounts[1])).unstaked
      // const locked = (await pool.users(accounts[1])).locked
      // const reward = (await pool.rewards(await pool.getCurrentEpoch())).amount
      // const staked = await pool.userStaked(accounts[1]);
      // console.log(testValues.reduce((prev, curr) => prev.add(curr)).toString())
      // console.log('locked ' + locked.toString())
      // console.log('unstaked ' + unstaked.toString())
      // console.log('reward ' + reward.toString());
      // console.log('locked ' + locked.toString())
      // console.log('staked ' + staked.toString())
      // console.log('unlocked staked ' + staked.sub(locked))
      // console.log('staked+unstaked-reward ' + staked.add(unstaked).sub(reward).toString())
      // console.log('staked+unstaked-locked ' + staked.add(unstaked).sub(locked).toString())
      // console.log('withdrawable ' + unstaked.sub(locked));
      // console.log(testValue.toString())
      const toWithdraw = testValue.div(2);
      // get signer
      const signer = hre.waffle.provider.getSigner(1)
      const staker = pool.connect(signer)
      // get starting values
      const startUserBalance = await token.balanceOf(accounts[1]);
      const startUnstaked = (await pool.users(accounts[1])).unstaked;
      // withdraw
      await staker.withdraw(accounts[1], toWithdraw);
      // get ending values
      const endUserBalance = await token.balanceOf(accounts[1]);
      const endUnstaked = (await pool.users(accounts[1])).unstaked;
      // check result
      expect(endUserBalance).to.equal(startUserBalance.add(toWithdraw));
      expect(endUnstaked).to.equal(startUnstaked.sub(toWithdraw));
    })
  })

})


describe('StakeUtils_singleTransactionActions_and_reverts', () => {
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

  before(async () => {
    // transfer tokens
    const transferValue = 1000000000;
    await ownerAccount.transfer(accounts[1], transferValue);
  })

  it('deposit and stake in one transaction', async () => {
    const testValue = BigNumber.from(1000);
    // get signer
    const signer = hre.waffle.provider.getSigner(1)
    const staker = pool.connect(signer)
    // get starting values
    const startUserBalance = await token.balanceOf(accounts[1]);
    const startUnstaked = (await pool.users(accounts[1])).unstaked;
    const startStaked = await pool.userStaked(accounts[1]);
    // deposit and stake
    await token.connect(signer).approve(pool.address, testValue);
    await staker.depositAndStake(accounts[1], testValue, accounts[1]);
    // get ending values
    const endUserBalance = await token.balanceOf(accounts[1]);
    const endUnstaked = (await pool.users(accounts[1])).unstaked;
    const endStaked = await pool.userStaked(accounts[1]);
    // check result
    expect(endUserBalance).to.equal(startUserBalance.sub(testValue));
    expect(endUnstaked).to.equal(startUnstaked);
    expect(endStaked).to.equal(startStaked.add(testValue));
  })

  it('multi-account stake and check shares while advancing epochs', async () => {
    let expectedTotalShares = await pool.totalSupply();
    for (let i = 1; i < 6; i++) {
      const testValue = BigNumber.from(Math.ceil(Math.random() * 1000));
      await ownerAccount.transfer(accounts[i], testValue);
      // get signer
      const signer = hre.waffle.provider.getSigner(i)
      const staker = pool.connect(signer)
      // get starting values
      const startUserShares = await pool.shares(accounts[i]);
      const startUserBalance = await token.balanceOf(accounts[i]);
      const startUnstaked = (await pool.users(accounts[i])).unstaked;
      const startTotalStaked = await pool.totalStake()
      // update expected shares
      const sharesToMint = expectedTotalShares.mul(testValue).div(startTotalStaked);
      expectedTotalShares = expectedTotalShares.add(sharesToMint);
      // deposit and stake
      await token.connect(signer).approve(pool.address, testValue);
      await staker.depositAndStake(accounts[i], testValue, accounts[i]);
      // get ending values
      const endUserShares = await pool.shares(accounts[i]);
      const endUserBalance = await token.balanceOf(accounts[i]);
      const endUnstaked = (await pool.users(accounts[i])).unstaked;
      // check result
      expect(endUserBalance).to.equal(startUserBalance.sub(testValue));
      expect(endUnstaked).to.equal(startUnstaked);
      expect(endUserShares).to.equal(startUserShares.add(sharesToMint));
      // jump to next epoch and trigger epoch
      await jumpOneEpoch(pool);
      const targetEpoch = await pool.getRewardTargetEpochTest();
      await pool.updateUserLocked(accounts[i], targetEpoch);
    }
    const totalShares = await pool.totalSupply();
    expect(totalShares).to.equal(expectedTotalShares);
    for (let i = 1; i < 6; i++) {
      // start values
      const startShares = await pool.shares(accounts[i]);
      const startUserStake = await pool.userStaked(accounts[i]);
      // jump to next epoch and trigger epoch
      await jumpOneEpoch(pool);
      const targetEpoch = await pool.getRewardTargetEpochTest();
      await pool.updateUserLocked(accounts[i], targetEpoch);
      // check shares
      const endShares = await pool.shares(accounts[i]);
      const endTotalShares = await pool.totalSupply();
      const endUserStake = await pool.userStaked(accounts[i]);
      expect(endShares).to.equal(startShares);
      expect(endTotalShares).to.equal(totalShares);
      expect(endUserStake).to.be.gte(startUserStake);
    }
  })

  it('attempt to stake more tokens than are unstaked', async () => {
    const testValue = BigNumber.from(1000);
    // get signer
    const signer = hre.waffle.provider.getSigner(1);
    const staker = pool.connect(signer);
    // deposit
    await token.connect(signer).approve(pool.address, testValue);
    await staker.deposit(accounts[1], testValue, accounts[1]);
    // attempt to stake 1 too many tokens
    const startUnstaked = (await pool.users(accounts[1])).unstaked;
    const oneTooMany = startUnstaked.add(1);
    await expect(staker.stake(oneTooMany)).to.be.revertedWith("Amount exceeds user deposit");
  })

  it('attempt to schedule unstake for more tokens than are staked', async () => {
    const staker = pool.connect(hre.waffle.provider.getSigner(1));
    // get starting values
    const startStaked = await pool.userStaked(accounts[1]);
    // request unstake
    const oneTooMany = startStaked.add(1);
    await expect(staker.scheduleUnstake(oneTooMany)).to.be.reverted;
  })

  it('unstake and withdraw in one transaction', async () => {
    //
    const testValue = BigNumber.from(1000);
    // get signer
    const signer = hre.waffle.provider.getSigner(1)
    const staker = pool.connect(signer)
    // stake
    await token.connect(signer).approve(pool.address, testValue);
    await staker.depositAndStake(accounts[1], testValue, accounts[1]);
    // get starting values
    const startUserBalance = await token.balanceOf(accounts[1]);
    const startUnstaked = (await pool.users(accounts[1])).unstaked;
    const startStaked = await pool.userStaked(accounts[1]);
    expect(startStaked).to.be.gt(0);
    // request unstake
    await staker.scheduleUnstake(startStaked);
    // forward time to be within unstake time window
    const unstakeScheduleAt = (await pool.users(accounts[1])).unstakeScheduledFor;
    const inWindow = unstakeScheduleAt.add(3600).toNumber();
    await jumpTo(inWindow);
    // unstake and withdraw tokens
    await staker.unstakeAndWithdraw(accounts[1]);
    // // calculate expected remaining stake
    // get ending values
    const endUserBalance = await token.balanceOf(accounts[1]);
    const endUnstaked = (await pool.users(accounts[1])).unstaked;
    const endStaked = await pool.userStaked(accounts[1]);
    // check result
    expect(endUserBalance).to.equal(startUserBalance.add(startStaked));
    expect(endUnstaked).to.equal(startUnstaked);
    expect(endStaked).to.equal(0);
  })

})


describe('StakeUtils_Unstake_Window', () => {
  let accounts: string[]
  let token: Api3Token
  let pool: TestPool
  let ownerAccount: Api3Token
  let staker: TestPool;

  let testValue = BigNumber.from(1000000);

  beforeEach(async () => {
    accounts = await hre.waffle.provider.listAccounts()
    const api3TokenFactory = await hre.ethers.getContractFactory("Api3Token")
    token = (await api3TokenFactory.deploy(accounts[0], accounts[0])) as Api3Token
    const api3PoolFactory = await hre.ethers.getContractFactory("TestPool")
    pool = (await api3PoolFactory.deploy(token.address)) as TestPool
    const signer0 = hre.waffle.provider.getSigner(0)
    ownerAccount = token.connect(signer0)
    staker = pool.connect(hre.waffle.provider.getSigner(1));
    await ownerAccount.updateMinterStatus(pool.address, true)
  })

  beforeEach(async () => {
    await ownerAccount.transfer(accounts[1], testValue);
    const signer = hre.waffle.provider.getSigner(1)
    const staker = pool.connect(signer)
    await token.connect(signer).approve(pool.address, testValue);
    await staker.deposit(accounts[1], testValue, accounts[1]);
  })

  it('early unstake attempt then valid unstake', async () => {
    const expectedUnstaked = (await pool.users(accounts[1])).unstaked;
    const [unstakeScheduleAt, _] = await resetUnstakeRequest(staker, accounts[1], testValue);
    // forward time by less than minWait
    const oneMinuteBeforeWindow = unstakeScheduleAt.sub(60).toNumber();
    await jumpTo(oneMinuteBeforeWindow);
    await expect(staker.unstake()).to.be.reverted;
    // forward time to be just within unstake time window
    const oneMinuteInWindow = unstakeScheduleAt.add(60).toNumber();
    await jumpTo(oneMinuteInWindow);
    // unstake tokens
    await staker.unstake();
    const unstaked = (await pool.users(accounts[1])).unstaked;
    expect(unstaked).to.equal(expectedUnstaked);
  })

  it('unstake just before invalid: case', async () => {
    const expectedUnstaked = (await pool.users(accounts[1])).unstaked;
    const [unstakeScheduleAt, _] = await resetUnstakeRequest(staker, accounts[1], testValue);
    // forward time by just before end of window
    const wait = await pool.rewardEpochLength();
    const oneMinuteBeforeWindowClose = unstakeScheduleAt.add(wait).sub(60).toNumber();
    await jumpTo(oneMinuteBeforeWindowClose);
    // unstake tokens
    await staker.unstake();
    const unstaked = (await pool.users(accounts[1])).unstaked;
    expect(unstaked).to.equal(expectedUnstaked);
  })

  it('unstake attempt after valid window: case', async () => {
    const [unstakeScheduleAt, _] = await resetUnstakeRequest(staker, accounts[1], testValue);
    // forward time by more than maxWait
    const wait = await pool.rewardEpochLength();
    const oneMinuteAfterWindow = unstakeScheduleAt.add(wait).add(60).toNumber();
    await jumpTo(oneMinuteAfterWindow);
    await expect(staker.unstake()).to.be.reverted;
  })

})


describe('StakeUtils_scheduleUnstake_Revoke_Rewards', () => {
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

  before(async () => {
    const testValue = 1000;
    const numAccounts = 3;
    // transfer, deposit, and stake tokens
    for (let i = 1; i <= numAccounts; i++) {
      await ownerAccount.transfer(accounts[i], testValue);
      const signer = hre.waffle.provider.getSigner(i)
      const staker = pool.connect(signer)
      await token.connect(signer).approve(pool.address, testValue);
      await staker.depositAndStake(accounts[i], testValue, accounts[i]);
    }
    // jump ahead in time by one epoch and trigger epoch
    await jumpOneEpoch(pool);
    await jumpOneEpoch(pool);
    const targetEpoch = await pool.getRewardTargetEpochTest();
    for (let i = 1; i <= numAccounts; i++) {
      await pool.updateUserLocked(accounts[i], targetEpoch);
    }
  })

  it('schedule unstake and check reward revocation', async () => {
    // get signer
    const signer = hre.waffle.provider.getSigner(1)
    const staker = pool.connect(signer)
    // check starting values
    const startUserLocked = (await pool.users(accounts[1])).locked;
    expect(startUserLocked).to.be.gt(0);
    const currentEpoch = await pool.getCurrentEpoch();
    const currentRewardEpoch = await pool.rewards(currentEpoch);
    expect(currentRewardEpoch.amount).to.be.gt(0);
    // request unstake
    const userStaked = await pool.userStaked(accounts[1]);
    await staker.scheduleUnstake(userStaked);
    // check ending values
    const endUserLocked = (await pool.users(accounts[1])).locked;
    const endUserShares = await pool.shares(accounts[1]);
    const endTotalShares = await pool.totalSupply();
    const expectedRevokedTokens = currentRewardEpoch.amount.mul(endUserShares).div(endTotalShares);
    const expectedEndUserLocked = startUserLocked.sub(expectedRevokedTokens);
    expect(endUserLocked).to.equal(expectedEndUserLocked);
    const revoked = await pool.getRevokedEpochReward(accounts[1], currentEpoch);
    expect(revoked).to.be.true;
  })

})


export async function getBlockTimestamp(blockNumber?: string | number | BigNumber): Promise<BigNumber> {
  let block;
  if (blockNumber) {
    block = await hre.ethers.provider.getBlock(blockNumber.toString());
  } else {
    const currentBlockNumber = await hre.ethers.provider.getBlockNumber();
    block = await hre.ethers.provider.getBlock(currentBlockNumber);
  }
  return BigNumber.from(block.timestamp);
}

export const jumpTo = async (timestamp: number) => {
  await hre.network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  await hre.network.provider.send("evm_mine");
}

export const jumpOneEpoch = async (pool: TestPool) => {
  const currentTimestamp = await getBlockTimestamp();
  const epochLength = await pool.rewardEpochLength();
  const futureEpochTimeStamp = currentTimestamp.add(epochLength).toNumber();
  await jumpTo(futureEpochTimeStamp);
}

export async function resetUnstakeRequest(staker: TestPool, address: string, amount: BigNumber) {
  const alreadyUnstaked = (await staker.users(address)).unstaked;
  if (amount.gt(alreadyUnstaked)) {
    expect(await staker.stake(amount)).to.be.reverted;
  }
  await staker.stake(amount);
  await staker.scheduleUnstake(amount);
  const user = await staker.users(address);
  return [user.unstakeScheduledFor, user.unstakeAmount];
}

export const resetUnstakedTo = async (amount: BigNumber, stakerAddress: string, ownerAddress: string, token: Api3Token, pool: TestPool) => {
  // get values
  const staker = pool.connect(hre.waffle.provider.getSigner(stakerAddress));
  const staked = await pool.userStaked(stakerAddress);
  // unstake all
  if (staked.gt(0)) {
    await staker.scheduleUnstake(staked);
    const unstakeScheduleAt = (await staker.users(stakerAddress)).unstakeScheduledFor;
    const inWindow = unstakeScheduleAt.add(3600).toNumber();
    await jumpTo(inWindow);
    await staker.unstake();
  }
  // transfer all to owner account
  const unstaked = (await staker.users(stakerAddress)).unstaked;
  if (unstaked.gt(0)) {
    await token.transfer(ownerAddress, unstaked);
  }
  // transfer amount to staker account
  await token.transfer(stakerAddress, amount);
  // deposit
  await token.connect(hre.waffle.provider.getSigner(1)).approve(pool.address, amount);
  await staker.deposit(stakerAddress, amount, stakerAddress);
}
