/*global artifacts, web3, Promise*/
const fs = require("fs");
const { hash: namehash } = require("eth-ens-namehash");
const { getNetworkName } = require("@aragon/templates-shared/lib/network")(
  web3
);
const deployTemplate = require("@aragon/templates-shared/scripts/deploy-template");
const { getEventArgument } = require("@aragon/test-helpers/events");

const Api3Pool = artifacts.require("Api3Pool");
const Api3Token = artifacts.require("Api3Token");
const Convenience = artifacts.require("Convenience");
const TimelockManager = artifacts.require("TimelockManager");

const daoId = `api3-template-${Math.random().toString(36).substring(7)}`;
const supportRequiredPct1 = 50e16;
const minAcceptQuorumPct1 = 50e16;
const supportRequiredPct2 = 50e16;
const minAcceptQuorumPct2 = 15e16;
const epochLength = 7 * 24 * 60 * 60;

/**
 * Returns the address of the deployer
 */
const getDeployer = async () => {
  const [deployer] = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return reject(err);
      }
      resolve(accounts);
    });
  });

  return deployer;
};

/**
 * This script is used to deploy contracts DAO contracts for dashboard application.
 * For more information about how to use this script see: https://github.com/api3dao/api3-dao/issues/217
 *
 * NOTE: When making changes to this script consult the changes with DAO dashboard developers
 * as they (implicitly) depend on this script.
 */
module.exports = async (callback) => {
  try {
    const network = await getNetworkName();
    if (network === "mainnet") {
      // TODO: We should use specific daoId and do NOT create new token and pool instance
      throw new Error("This script is not yet ready for mainnet deployment!");
    }

    const deployer = await getDeployer();

    const api3Token = await Api3Token.new(deployer, deployer);
    const timelockManager = await TimelockManager.new(
      api3Token.address,
      deployer
    );
    const api3Pool = await Api3Pool.new(
      api3Token.address,
      timelockManager.address,
      epochLength
    );
    const convenience = await Convenience.new(api3Pool.address);
    const template = await deployTemplate(
      web3,
      artifacts,
      network === "rinkeby" || network === "ropsten" ? daoId + ".open" : daoId,
      "Api3Template",
      [
        { name: "agent", contractName: "Agent" },
        { name: "vault", contractName: "Vault" },
        { name: "api3voting", contractName: "Api3Voting" },
        { name: "survey", contractName: "Survey" },
        { name: "payroll", contractName: "Payroll" },
        { name: "finance", contractName: "Finance" },
        { name: "token-manager", contractName: "TokenManager" },
      ]
    );
    const api3VotingAppId =
      network === "rinkeby" || network === "mainnet" || network === "ropsten"
        ? namehash("api3voting.open.aragonpm.eth")
        : namehash("api3voting.aragonpm.eth");

    const tx = await template.newInstance(
      daoId,
      api3Pool.address,
      [supportRequiredPct1, minAcceptQuorumPct1],
      [supportRequiredPct2, minAcceptQuorumPct2],
      api3VotingAppId
    );
    const primaryVoting = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "primaryVoting"
    );
    const secondaryVoting = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryVoting"
    );
    const primaryAgent = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "primaryAgent"
    );
    const secondaryAgent = getEventArgument(
      tx,
      "Api3DaoDeployed",
      "secondaryAgent"
    );
    const set_tx = await api3Pool.setDaoApps(
      primaryAgent,
      secondaryAgent,
      primaryVoting,
      secondaryVoting,
      { from: deployer }
    );

    const deployedAddresses = {
      api3Token: api3Token.address,
      timelockManager: timelockManager.address,
      api3Pool: api3Pool.address,
      convenience: convenience.address,
      votingAppPrimary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "votingAppPrimary"
      ).toString(),
      votingAppSecondary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "votingAppSecondary"
      ).toString(),
      agentAppPrimary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "agentAppPrimary"
      ).toString(),
      agentAppSecondary: getEventArgument(
        set_tx,
        "SetDaoApps",
        "agentAppSecondary"
      ).toString(),
    };

    fs.writeFileSync(
      `${network}.deployment.json`,
      JSON.stringify(deployedAddresses, null, 2)
    );
    console.log("\nDEPLOYED ADDRESSES:");
    console.log(JSON.stringify(deployedAddresses, null, 2));
  } catch (error) {
    callback(error);
  }

  callback();
};
