const { BN } = require("web3-utils");

const AdminUpgradeabilityProxyABI = require("@openzeppelin/upgrades/build/contracts/AdminUpgradeabilityProxy.json");
const ProxyAdminABI = require("@openzeppelin/upgrades/build/contracts/ProxyAdmin.json");
const LidTokenABI = require("lid-contracts/build/contracts/LidToken.json");
const LidStakingABI = require("lid-contracts/build/contracts/LidStaking.json");
const LidStakingV2ABI = require("lid-contracts/build/contracts/LidStakingV2.json");
const LidCertifiedPresaleABI = require("lid-contracts/build/contracts/LidCertifiedPresale.json");
const LidDaoFundABI = require("lid-contracts/build/contracts/LidDaoLock.json");
const LidVotingRightABI = require("lid-contracts/build/contracts/LidVotingRights.json");

const newLidEnv = async (web3, accounts, liveNetwork = false) => {

  const Contract = require('web3-eth-contract');
  Contract.setProvider(web3.currentProvider);

  const { toWei } = require("web3-utils");

  const ether = (value) =>
    new BN(toWei(value, 'ether'))

  const getContract = (abi, bytecode) =>
    new Contract(abi, { data: bytecode })

  const opts = (sender) => ({ from: sender, gas: '6721975' })

  const AdminUpgradeabilityProxy = getContract(AdminUpgradeabilityProxyABI.abi, AdminUpgradeabilityProxyABI.bytecode);
  const ProxyAdmin = getContract(ProxyAdminABI.abi, ProxyAdminABI.bytecode);

  const LidToken = getContract(LidTokenABI.abi, LidTokenABI.bytecode);
  const LidStaking = getContract(LidStakingABI.abi, LidStakingABI.bytecode);
  const LidStakingV2 = getContract(LidStakingV2ABI.abi, LidStakingV2ABI.bytecode);
  const LidCertifiedPresale = getContract(LidCertifiedPresaleABI.abi, LidCertifiedPresaleABI.bytecode);
  const LidDaoFund = getContract(LidDaoFundABI.abi, LidDaoFundABI.bytecode);
  const LidVotingRight = getContract(LidVotingRightABI.abi, LidVotingRightABI.bytecode);

  const tokenParams = {
    name: "Lidbar Network",
    symbol: "LID",
    decimals: 18,
    taxBP: 190,
    daoTaxBP: 10
  };

  const stakingParams = {
    stakingTaxBP: 0,
    unstakingTaxBP: 200,
    startTime: 1596322800,
    registrationFeeWithReferrer: ether("400"),
    registrationFeeWithoutReferrer: ether("200")
  };

  const owner = accounts[0];
  const stakers = [accounts[1], accounts[2], accounts[3]];
  const nonstaker = accounts[4];
  const distributionAccount = accounts[5];

  // Create the token instance
  let lidToken = await LidToken.deploy().send(opts(owner));

  // Stand up an upgradeable LidStaking instance
  let lidStakingLogic = await LidStaking.deploy().send(opts(owner));
  let lidStakingAdmin = await ProxyAdmin.deploy().send(opts(owner));
  let lidStaking = await AdminUpgradeabilityProxy.deploy({
    arguments: [
      lidStakingLogic.options.address,
      lidStakingAdmin.options.address,
      lidStakingLogic.methods.initialize(
        stakingParams.stakingTaxBP.toString(),
        stakingParams.unstakingTaxBP.toString(),
        stakingParams.registrationFeeWithReferrer.toString(),
        stakingParams.registrationFeeWithoutReferrer.toString(),
        owner,
        lidToken.options.address
      ).encodeABI()
    ]
  }).send(opts(owner));

  // "cast" lidStaking to a LidStaking contract
  lidStaking = new Contract(LidStakingABI.abi, lidStaking.options.address);

  lidCertifiedPresale = await LidCertifiedPresale.deploy().send(opts(owner));
  lidDaoFund = await LidDaoFund.deploy().send(opts(owner));

  await lidToken.methods.initialize(
    tokenParams.name,
    tokenParams.symbol,
    tokenParams.decimals,
    owner,
    tokenParams.taxBP,
    tokenParams.daoTaxBP,
    lidDaoFund.options.address,
    lidStaking.options.address,
    lidCertifiedPresale.options.address
  ).send(opts(owner));

  const initEth = ether("100000").toString()

  await Promise.all([
    await lidToken.methods.mint(stakers[0], initEth).send(opts(owner)),
    await lidToken.methods.mint(stakers[1], initEth).send(opts(owner)),
    await lidToken.methods.mint(stakers[2], initEth).send(opts(owner)),
    await lidToken.methods.mint(nonstaker, initEth).send(opts(owner)),
    await lidToken.methods.mint(distributionAccount, initEth).send(opts(owner))
  ]);

  await lidToken.methods.setIsTransfersActive(true).send(opts(owner));
  await lidToken.methods.setIsTaxActive(true).send(opts(owner));

  if (!liveNetwork) {
    const time = require('./helpers/time')(web3)
    await time.advanceBlock();
    let latest = await time.latest();

    // Set staking to start in 1 day
    await lidStaking.methods.setStartTime(
      latest.add(time.duration.days(1)).toString()
    ).send(opts(owner));

    // Start the staking period
    await time.advanceBlock();
    latest = await time.latest();
    await time.increase(time.duration.days(30));
  } else {
    await lidStaking.methods.setStartTime(
      stakingParams.startTime
    ).send(opts(owner))
  }

  // Have all the stakers send an initial stake + registration
  for (const staker of stakers) {
    const value = ether("21000");
    await lidStaking.methods.registerAndStake(
      value.toString()
    ).send(opts(staker));
  }

  const lidStakingLogicV2 = await LidStakingV2.deploy().send(opts(owner));
  await lidStakingAdmin.methods.upgrade(lidStaking.options.address, lidStakingLogicV2.options.address).send(opts(owner));
  lidStaking = new Contract(LidStakingV2ABI.abi, lidStaking.options.address);
  await lidStaking.methods.v2Initialize(lidToken.options.address).send(opts(owner));

  const lidVotingRight = await LidVotingRight.deploy().send(opts(owner));
  await lidVotingRight.methods.initialize(lidStaking.options.address, lidToken.options.address).send(opts(owner));
  return lidVotingRight;
}

module.exports = {
  newLidEnv
};
