const { getEventArgument } = require('@aragon/test-helpers/events')

const { newLidEnv } = require('./new-lid-env')
const time = require('./helpers/time')(web3)

const LidDaoTemplate = artifacts.require("LidDaoTemplate")

const NETWORK_ARG = "--network"
const DAO_CONFIG_ARG = "--daoConfig"

const argValue = (arg, defaultValue) =>
  process.argv.includes(arg) ?
  process.argv[process.argv.indexOf(arg) + 1] :
  (typeof defaultValue === "function" ? defaultValue() : defaultValue)

const network = () => argValue(NETWORK_ARG, "rinkeby")
const daoConfig = () => argValue(DAO_CONFIG_ARG, () => `../configs/${network()}-dao-config.json`)

const lidDaoTemplateAddress = () => {
  if (network() === "rinkeby") {
    const Arapp = require("../arapp")
    return Arapp.environments.rinkeby.address
  } else if (network() === "mainnet") {
    const Arapp = require("../arapp")
    return Arapp.environments.mainnet.address
  } else if (network() === "xdai") {
    const Arapp = require("../arapp")
    return Arapp.environments.xdai.address
  } else {
    const Arapp = require("../arapp_local")
    return Arapp.environments.devnet.address
  }
}

module.exports = async (callback) => {
  try {
    const accounts = web3.currentProvider.addresses
    const config = require(daoConfig());
    let lidVotingRightsAddr;

    if (config.lidVotingRights) {
      console.log("LidVotingRights already deployed at:")
      console.log(config.lidVotingRights)
      lidVotingRightsAddr = config.lidVotingRights;
    } else {
      console.log("No lidVotingRights address found")
      console.log("Deploying new Lid environment...")

      if (accounts.length < 6) {
        throw Error("Must have at least 6 accounts to deploy the LID test environment")
      }
      const lidVotingRights = await newLidEnv(web3, accounts, true)
      lidVotingRightsAddr = lidVotingRights.options.address

      console.log("Lid Environment Deployed!")
      console.log("LidVotingRights: " + lidVotingRightsAddr)
    }

    const lidDaoTemplate = await LidDaoTemplate.at(lidDaoTemplateAddress())

    const lidDaoName = config.name ? config.name : "lid-dao-" + Math.floor(10000 * Math.random())

    const receipt = await lidDaoTemplate.newInstance(
      lidDaoName,
      lidVotingRightsAddr,
      [
        config.supportRequiredPct * 1e16,
        config.minAcceptQuorumPct * 1e16,
        time.duration.days(config.voteTimeDays).toNumber()
      ],
      accounts[0]
    )

    const dao = getEventArgument(receipt, 'DeployDao', 'dao')
    console.log("successfully deployed the LID DAO:")
    console.log(`address: ${dao}`)
    console.log(`name: ${lidDaoName}`)
    console.log(`url: https://${network()}.client.aragon.org/#/${lidDaoName}/`)
    callback()
  } catch (error) {
    console.log(error)
    callback(error)
  }
}
