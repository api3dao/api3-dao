const fs = require('fs')
const deployTemplate = require('@aragon/templates-shared/scripts/deploy-template')
const arappFile = require('./lib/arapp-file')(web3)
const { getNetworkName } = require('./lib/network')(web3)

const TEMPLATE_NAME = 'lid-dao-template'
const CONTRACT_NAME = 'LidDaoTemplate'

module.exports = async callback => {
  try {
    const network = await getNetworkName()

    const template = await deployTemplate(
      web3,
      artifacts,
      network === "rinkeby" ||
      network === "mainnet" ||
      network === "ropsten" ?
      TEMPLATE_NAME + ".open" :
      TEMPLATE_NAME,
      CONTRACT_NAME
    );

    const file = await arappFile.read()
    const data = file.environments[network]
    data.address = template.address
    fs.writeFileSync(await arappFile.filePath(), JSON.stringify(file, null, 2))
    console.log(template.address);
  } catch (error) {
    callback(error);
  }
  callback();
};
