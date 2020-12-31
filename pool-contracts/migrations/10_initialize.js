const { scripts, ConfigManager } = require("@openzeppelin/cli")
const { add, push, create } = scripts
const {publicKey} = require("../privatekey")

const config = require("../config")

const LidToken = artifacts.require("LidToken")
const LidTeamLock = artifacts.require("LidTeamLock")
const LidStakingFund = artifacts.require("LidStakingFund")
const LidStaking = artifacts.require("LidStaking")
const LidPromoFund = artifacts.require("LidPromoFund")
const LidDaoLock = artifacts.require("LidDaoLock")
const LidCertifiedPresaleTimer = artifacts.require("LidCertifiedPresaleTimer")
const LidCertifiedPresale = artifacts.require("LidCertifiedPresale")

async function initialize(accounts,networkName) {
  let owner = accounts[0]

  const tokenParams = config.LidToken
  const teamlockParams = config.LidTeamLock
  const stakingFundParams = config.LidStakingFund
  const stakingParams = config.LidStaking
  const promoParams = config.LidPromoFund
  const daolockParams = config.LidDaoLock
  const timerParams = config.LidPresaleTimer
  const presaleParams = config.LidPresale

  const lidToken =   await LidToken.deployed()
  const lidTeamLock = await LidTeamLock.deployed()
  const lidStakingFund = await LidStakingFund.deployed()
  const lidStaking = await LidStaking.deployed()
  const lidPromoFund = await LidPromoFund.deployed()
  const lidDaoLock = await LidDaoLock.deployed()
  const lidCertifiedPresaleTimer = await LidCertifiedPresaleTimer.deployed()
  const lidCertifiedPresale = await LidCertifiedPresale.deployed()

  await Promise.all([
    lidToken.initialize(
      tokenParams.name,
      tokenParams.symbol,
      tokenParams.decimals,
      owner,
      tokenParams.taxBP,
      tokenParams.daoTaxBP,
      lidDaoLock.address,
      lidStaking.address,
      lidCertifiedPresale.address
    ),
    lidTeamLock.initialize(
      teamlockParams.releaseInterval,
      teamlockParams.releaseBP,
      teamlockParams.addresses,
      teamlockParams.basisPoints,
      lidToken.address
    ),
    lidStakingFund.initialize(
      stakingFundParams.authorizor,
      stakingFundParams.releaser,
      lidToken.address
    ),
    lidStaking.initialize(
      stakingParams.stakingTaxBP,
      stakingParams.unstakingTaxBP,
      owner,
      lidToken.address
    ),
    lidPromoFund.initialize(
      promoParams.authorizor,
      promoParams.releaser,
      lidToken.address
    ),
    lidDaoLock.initialize(
      daolockParams.releaseInterval,
      daolockParams.releaseBP,
      owner,
      lidToken.address
    ),
    lidCertifiedPresaleTimer.initialize(
      timerParams.startTime,
      timerParams.baseTimer,
      timerParams.deltaTimer,
      owner
    )
  ])
  await lidToken.addMinter(lidCertifiedPresale.address)
  await lidCertifiedPresale.initialize(
    presaleParams.maxBuyPerAddressBase,
    presaleParams.maxBuyPerAddressBP,
    presaleParams.maxBuyWithoutWhitelisting,
    presaleParams.redeemBP,
    presaleParams.redeemInterval,
    presaleParams.referralBP,
    presaleParams.startingPrice,
    presaleParams.multiplierPrice,
    owner,
    lidCertifiedPresaleTimer.address,
    lidToken.address
  )
  await Promise.all([
    lidCertifiedPresale.setEtherPools(
      [
        lidPromoFund.address,
        lidTeamLock.address
      ],
      [
        presaleParams.etherPools.promoFund,
        presaleParams.etherPools.teamFund
      ]
    ),
    lidCertifiedPresale.setTokenPools(
      [
        lidPromoFund.address,
        lidStakingFund.address,
        lidTeamLock.address,
        lidDaoLock.address
      ],
      [
        presaleParams.tokenPools.promoFund,
        presaleParams.tokenPools.stakingFund,
        presaleParams.tokenPools.teamFund,
        presaleParams.tokenPools.daoFund
      ]
    )
  ])
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    await initialize(accounts,networkName)
  })
}
